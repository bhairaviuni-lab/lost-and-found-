import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  getAllUsers,
  findUserByEmail,
  findUserByStudentId,
  findUserById,
  createUser,
  verifyPassword,
  getAllItems,
  findItemById,
  getItemsByUser,
  createItem,
  updateItem,
  deleteItem,
  getAllClaims,
  getClaimsByClaimant,
  getClaimsByOwner,
  createClaim,
  updateClaimStatus,
  getStatistics,
  User,
  Item
} from './src/server/db.ts';
import {
  saveItemToSupabase,
  deleteItemFromSupabase,
  saveClaimToSupabase,
  testSupabaseConnection,
  SUPABASE_PROJECT_ID,
  SUPABASE_URL,
  SUPABASE_SQL_SETUP
} from './src/server/supabase.ts';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Increase body parser limit for base64 images
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Helper to sanitize user object (exclude passwordHash & salt)
function sanitizeUser(user: User) {
  const { passwordHash, salt, ...safe } = user;
  return safe;
}

// Token helper (simple bearer token using user ID + timestamp for the runtime)
function generateToken(user: User): string {
  return Buffer.from(JSON.stringify({ id: user.id, email: user.collegeEmail, role: user.role, t: Date.now() })).toString('base64');
}

function getUserFromToken(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    if (!decoded.id) return null;
    return findUserById(decoded.id) || null;
  } catch (e) {
    return null;
  }
}

// Middleware: Require Auth
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = getUserFromToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required. Please login.' });
  }
  (req as any).user = user;
  next();
}

// ==========================================
// REST APIs
// ==========================================

// 1. Dynamic Campus Statistics
app.get('/api/stats', (_req: Request, res: Response) => {
  const stats = getStatistics();
  res.json(stats);
});

// 2. Auth: Register
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { fullName, collegeEmail, studentId, phone, password, confirmPassword } = req.body;

    // Validation
    if (!fullName || !collegeEmail || !studentId || !phone || !password) {
      return res.status(400).json({ error: 'Please fill all required fields.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Password confirmation does not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(collegeEmail)) {
      return res.status(400).json({ error: 'Invalid college email format.' });
    }

    // Uniqueness checks
    if (findUserByEmail(collegeEmail)) {
      return res.status(409).json({ error: 'This college email is already registered.' });
    }

    if (findUserByStudentId(studentId)) {
      return res.status(409).json({ error: 'This Student ID is already registered.' });
    }

    const newUser = createUser({
      fullName,
      collegeEmail,
      studentId,
      phone,
      password
    });

    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Account created successfully. Please login.',
      user: sanitizeUser(newUser),
      token
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// 3. Auth: Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { collegeEmail, password } = req.body;

    if (!collegeEmail || !password) {
      return res.status(400).json({ error: 'Please provide both college email and password.' });
    }

    const user = findUserByEmail(collegeEmail);
    if (!user) {
      return res.status(404).json({ error: 'User not found with this college email.' });
    }

    const isValid = verifyPassword(password, user.salt, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
    }

    const token = generateToken(user);
    res.json({
      message: 'Login successful.',
      user: sanitizeUser(user),
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed due to a server error.' });
  }
});

// 4. Auth: Get Current User Profile
app.get('/api/auth/me', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  res.json({ user: sanitizeUser(user) });
});

// 5. Items: Browse / Search with Filters
app.get('/api/items', (req: Request, res: Response) => {
  try {
    let items = getAllItems();

    const { search, type, category, location, status } = req.query as Record<string, string>;

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      items = items.filter(
        i =>
          i.itemName.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.brand.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q) ||
          i.reportId.toLowerCase().includes(q) ||
          i.identifyingDetails.toLowerCase().includes(q)
      );
    }

    if (type && type !== 'ALL') {
      items = items.filter(i => i.type.toUpperCase() === type.toUpperCase());
    }

    if (category && category !== 'ALL') {
      items = items.filter(i => i.category.toLowerCase() === category.toLowerCase());
    }

    if (location && location !== 'ALL') {
      items = items.filter(i => i.location.toLowerCase().includes(location.toLowerCase()));
    }

    if (status && status !== 'ALL') {
      items = items.filter(i => i.status.toUpperCase() === status.toUpperCase());
    }

    // Protect sensitive personal contact details in public list if contactPreference is PLATFORM
    const publicItems = items.map(item => {
      const isPlatformOnly = item.contactPreference === 'PLATFORM';
      return {
        ...item,
        posterEmail: isPlatformOnly ? 'Available via campus match request' : item.posterEmail,
        posterPhone: isPlatformOnly ? 'Secured via platform' : item.posterPhone
      };
    });

    res.json(publicItems);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch items.' });
  }
});

// 6. Items: Get Single Item
app.get('/api/items/:id', (req: Request, res: Response) => {
  const item = findItemById(req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Item report not found.' });
  }
  res.json(item);
});

// 7. Items: Report Lost or Found Item
app.post('/api/items', requireAuth, (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const {
      itemName,
      type,
      category,
      description,
      date,
      time,
      location,
      color,
      brand,
      identifyingDetails,
      contactPreference,
      imageUrl
    } = req.body;

    if (!itemName || !type || !category || !description || !date || !location) {
      return res.status(400).json({ error: 'Please fill all required item details.' });
    }

    const defaultImage = type === 'LOST'
      ? 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80';

    const newItem = createItem({
      userId: user.id,
      posterName: user.fullName,
      posterEmail: user.collegeEmail,
      posterPhone: user.phone,
      itemName,
      type: type === 'LOST' ? 'LOST' : 'FOUND',
      category: category || 'Other',
      description,
      date,
      time: time || 'Unknown',
      location,
      color: color || 'Not specified',
      brand: brand || 'Not specified',
      identifyingDetails: identifyingDetails || '',
      contactPreference: contactPreference || 'PLATFORM',
      imageUrl: imageUrl && imageUrl.trim() !== '' ? imageUrl : defaultImage,
      status: 'OPEN'
    });

    // Asynchronously sync newly reported item to Supabase backend table
    saveItemToSupabase(newItem).catch((err) => {
      console.warn('Background Supabase sync notice:', err.message);
    });

    res.status(201).json({
      message: `${type === 'LOST' ? 'Lost item' : 'Found item'} reported successfully!`,
      item: newItem,
      supabaseProject: SUPABASE_PROJECT_ID
    });
  } catch (err) {
    console.error('Error creating item:', err);
    res.status(500).json({ error: 'Could not create item report. Please try again.' });
  }
});

// 8. Items: Update Item (Author or Admin)
app.put('/api/items/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const item = findItemById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    if (item.userId !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized. You can only edit your own reports.' });
    }

    const updated = updateItem(item.id, req.body);
    if (updated) {
      saveItemToSupabase(updated).catch(() => {});
    }
    res.json({ message: 'Report updated successfully.', item: updated });
  } catch (err) {
    res.status(500).json({ error: 'Could not update item.' });
  }
});

// 9. Items: Delete Item (Author or Admin)
app.delete('/api/items/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const item = findItemById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    if (item.userId !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized. You can only delete your own reports.' });
    }

    const deleted = deleteItem(item.id);
    if (deleted) {
      deleteItemFromSupabase(item.id).catch(() => {});
      res.json({ message: 'Report deleted successfully.' });
    } else {
      res.status(404).json({ error: 'Could not delete item.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item.' });
  }
});

// 10. Items: User's items
app.get('/api/users/:id/items', requireAuth, (req: Request, res: Response) => {
  const items = getItemsByUser(req.params.id);
  res.json(items);
});

// 11. Claims: Submit a Claim
app.post('/api/items/:id/claims', requireAuth, (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const item = findItemById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    if (item.userId === user.id) {
      return res.status(400).json({ error: 'You cannot claim an item you reported yourself.' });
    }

    const { reason, additionalDetails, proofDetails } = req.body;
    if (!reason || reason.trim() === '') {
      return res.status(400).json({ error: 'Please explain why you think this item belongs to you.' });
    }

    const claim = createClaim({
      itemId: item.id,
      itemTitle: item.itemName,
      itemReportId: item.reportId,
      claimantUserId: user.id,
      claimantName: user.fullName,
      claimantEmail: user.collegeEmail,
      claimantPhone: user.phone,
      ownerUserId: item.userId,
      reason,
      additionalDetails: additionalDetails || '',
      proofDetails: proofDetails || ''
    });

    saveClaimToSupabase(claim).catch(() => {});

    res.status(201).json({
      message: 'Claim submitted successfully! The person who posted will be notified.',
      claim
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit claim.' });
  }
});

// 12. Claims: My Claims (Both submitted by me and received on my items)
app.get('/api/claims/my', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const submitted = getClaimsByClaimant(user.id);
  const received = getClaimsByOwner(user.id);
  res.json({ submitted, received });
});

// 13. Claims: Accept Claim
app.put('/api/claims/:id/accept', requireAuth, (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const claims = getAllClaims();
    const claim = claims.find(c => c.id === req.params.id);

    if (!claim) {
      return res.status(404).json({ error: 'Claim not found.' });
    }

    if (claim.ownerUserId !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only the reporter can accept claims.' });
    }

    const updated = updateClaimStatus(claim.id, 'ACCEPTED');
    if (updated) {
      saveClaimToSupabase(updated).catch(() => {});
      const resolvedItem = findItemById(claim.itemId);
      if (resolvedItem) {
        saveItemToSupabase(resolvedItem).catch(() => {});
      }
    }
    res.json({
      message: 'Claim accepted! Item marked as Resolved / Returned.',
      claim: updated
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to accept claim.' });
  }
});

// 14. Claims: Reject Claim
app.put('/api/claims/:id/reject', requireAuth, (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const claims = getAllClaims();
    const claim = claims.find(c => c.id === req.params.id);

    if (!claim) {
      return res.status(404).json({ error: 'Claim not found.' });
    }

    if (claim.ownerUserId !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only the reporter can reject claims.' });
    }

    const updated = updateClaimStatus(claim.id, 'REJECTED');
    res.json({
      message: 'Claim rejected.',
      claim: updated
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject claim.' });
  }
});

// 15. Admin: Users and stats
app.get('/api/admin/users', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  const users = getAllUsers().map(sanitizeUser);
  res.json(users);
});

app.get('/api/admin/claims', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  const claims = getAllClaims();
  res.json(claims);
});

// Toggle status as admin
app.put('/api/admin/items/:id/status', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  const { status } = req.body;
  if (!['OPEN', 'RESOLVED', 'CLAIMED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }
  const updated = updateItem(req.params.id, { status });
  if (!updated) return res.status(404).json({ error: 'Item not found.' });
  res.json({ message: 'Item status updated.', item: updated });
});

// 16. Supabase Integration Status & Diagnostics
app.get('/api/supabase/status', async (_req: Request, res: Response) => {
  const result = await testSupabaseConnection();
  res.json({
    projectId: SUPABASE_PROJECT_ID,
    url: SUPABASE_URL,
    ...result,
    sqlSetupScript: SUPABASE_SQL_SETUP,
    dashboardSqlUrl: `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql`
  });
});

// 17. Push All Existing Items to Supabase
app.post('/api/supabase/sync-all', async (_req: Request, res: Response) => {
  try {
    const allItems = getAllItems();
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const item of allItems) {
      const resSync = await saveItemToSupabase(item);
      if (resSync.success) {
        successCount++;
      } else {
        failCount++;
        if (resSync.error && !errors.includes(resSync.error)) {
          errors.push(resSync.error);
        }
      }
    }

    res.json({
      message: `Processed ${allItems.length} items. Successfully synced: ${successCount}. Failures: ${failCount}.`,
      successCount,
      failCount,
      errors: errors.slice(0, 3)
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Bulk sync failed: ' + err.message });
  }
});

// 18. Download complete project archive (.tar.gz)
app.get('/api/download-project', (_req: Request, res: Response) => {
  const archivePath = path.resolve(process.cwd(), 'campus-lost-and-found.tar.gz');
  if (fs.existsSync(archivePath)) {
    res.download(archivePath, 'campus-lost-and-found.tar.gz');
  } else {
    res.status(404).send('Archive not found');
  }
});

// Serve frontend in Dev vs Production
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Campus Lost & Found server listening on port ${PORT}`);
  });
}

startServer();
