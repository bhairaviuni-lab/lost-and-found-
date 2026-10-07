import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface User {
  id: string;
  fullName: string;
  collegeEmail: string;
  studentId: string;
  phone: string;
  passwordHash: string;
  salt: string;
  role: 'STUDENT' | 'FACULTY' | 'ADMIN';
  createdAt: string;
}

export interface Item {
  id: string;
  reportId: string;
  userId: string;
  posterName: string;
  posterEmail: string;
  posterPhone: string;
  itemName: string;
  type: 'LOST' | 'FOUND';
  category: string;
  description: string;
  date: string;
  time: string;
  location: string;
  color: string;
  brand: string;
  identifyingDetails: string;
  contactPreference: 'EMAIL' | 'PHONE' | 'PLATFORM';
  imageUrl: string;
  status: 'OPEN' | 'RESOLVED' | 'CLAIMED';
  createdAt: string;
  updatedAt: string;
}

export interface Claim {
  id: string;
  itemId: string;
  itemTitle: string;
  itemReportId: string;
  claimantUserId: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone: string;
  ownerUserId: string;
  reason: string;
  additionalDetails: string;
  proofDetails: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  users: User[];
  items: Item[];
  claims: Claim[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

export function verifyPassword(password: string, salt: string, hash: string): boolean {
  return hashPassword(password, salt) === hash;
}

export function createPasswordRecord(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(password, salt);
  return { salt, hash };
}

function getInitialData(): DatabaseSchema {
  const adminPwd = createPasswordRecord('Admin@123');
  const rahulPwd = createPasswordRecord('Pass@123');
  const priyaPwd = createPasswordRecord('Pass@123');

  const adminId = 'usr_admin_001';
  const rahulId = 'usr_stu_002';
  const priyaId = 'usr_stu_003';

  const users: User[] = [
    {
      id: adminId,
      fullName: 'Prof. Ramesh Kulkarni (Campus Admin)',
      collegeEmail: 'admin@campus.edu',
      studentId: 'FAC-9901',
      phone: '+91 98765 43210',
      passwordHash: adminPwd.hash,
      salt: adminPwd.salt,
      role: 'ADMIN',
      createdAt: '2026-09-01T08:00:00.000Z'
    },
    {
      id: rahulId,
      fullName: 'Rahul Sharma',
      collegeEmail: 'rahul.sharma@campus.edu',
      studentId: 'CS-2024-042',
      phone: '+91 98234 56789',
      passwordHash: rahulPwd.hash,
      salt: rahulPwd.salt,
      role: 'STUDENT',
      createdAt: '2026-09-10T10:15:00.000Z'
    },
    {
      id: priyaId,
      fullName: 'Priya Patel',
      collegeEmail: 'priya.patel@campus.edu',
      studentId: 'IT-2024-088',
      phone: '+91 97123 45678',
      passwordHash: priyaPwd.hash,
      salt: priyaPwd.salt,
      role: 'STUDENT',
      createdAt: '2026-09-12T11:30:00.000Z'
    }
  ];

  const items: Item[] = [
    {
      id: 'item_001',
      reportId: 'LOST-2026-1049',
      userId: rahulId,
      posterName: 'Rahul Sharma',
      posterEmail: 'rahul.sharma@campus.edu',
      posterPhone: '+91 98234 56789',
      itemName: 'Scientific Calculator Casio fx-991EX',
      type: 'LOST',
      category: 'Electronics',
      description: 'Lost during Applied Math Exam in Lecture Hall 3. Has a black case with small blue tape on the back cover.',
      date: '2026-10-04',
      time: '12:30 PM',
      location: 'Lecture Hall 3 (Engineering Block)',
      color: 'Black & White',
      brand: 'Casio',
      identifyingDetails: 'Initials "RS" lightly scratched on inner battery compartment cover.',
      contactPreference: 'PLATFORM',
      imageUrl: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80',
      status: 'OPEN',
      createdAt: '2026-10-04T13:00:00.000Z',
      updatedAt: '2026-10-04T13:00:00.000Z'
    },
    {
      id: 'item_002',
      reportId: 'FOUND-2026-2184',
      userId: priyaId,
      posterName: 'Priya Patel',
      posterEmail: 'priya.patel@campus.edu',
      posterPhone: '+91 97123 45678',
      itemName: 'Apple AirPods Pro (2nd Gen) with Spigen Case',
      type: 'FOUND',
      category: 'Electronics',
      description: 'Found on table 14 near the silent study section on the 2nd floor of Central Library. Placed in safety with desk supervisor.',
      date: '2026-10-05',
      time: '04:15 PM',
      location: 'Central Library, 2nd Floor Silent Zone',
      color: 'White (Matte Green Case)',
      brand: 'Apple',
      identifyingDetails: 'Case has an anime keychain clip attached and small scratch on lid.',
      contactPreference: 'PLATFORM',
      imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80',
      status: 'OPEN',
      createdAt: '2026-10-05T16:30:00.000Z',
      updatedAt: '2026-10-05T16:30:00.000Z'
    },
    {
      id: 'item_003',
      reportId: 'FOUND-2026-3402',
      userId: rahulId,
      posterName: 'Rahul Sharma',
      posterEmail: 'rahul.sharma@campus.edu',
      posterPhone: '+91 98234 56789',
      itemName: 'Student RFID Identity Card (Computer Engg)',
      type: 'FOUND',
      category: 'ID Cards',
      description: 'Found dropped near Nescafe Canteen payment counter during lunch rush.',
      date: '2026-10-06',
      time: '01:45 PM',
      location: 'Main Canteen / Food Court',
      color: 'Blue Lanyard',
      brand: 'University ID Card',
      identifyingDetails: 'Year 2024-2028, surname starts with "M". Kept safely, will hand over upon verifying student portal login.',
      contactPreference: 'PLATFORM',
      imageUrl: 'https://images.unsplash.com/photo-1589330694653-dad6ef0100f8?w=600&auto=format&fit=crop&q=80',
      status: 'OPEN',
      createdAt: '2026-10-06T14:00:00.000Z',
      updatedAt: '2026-10-06T14:00:00.000Z'
    },
    {
      id: 'item_004',
      reportId: 'LOST-2026-4890',
      userId: priyaId,
      posterName: 'Priya Patel',
      posterEmail: 'priya.patel@campus.edu',
      posterPhone: '+91 97123 45678',
      itemName: 'Dell XPS 13 USB-C Charger & HDMI Dongle',
      type: 'LOST',
      category: 'Electronics',
      description: 'Left plugged into wall outlet in Advanced Programming Lab (Lab 4B). Crucial for upcoming lab exam submission!',
      date: '2026-10-06',
      time: '11:00 AM',
      location: 'Computer Centre Lab 4B',
      color: 'Black with White Cable Tie',
      brand: 'Dell',
      identifyingDetails: 'Dell 65W Type-C adapter with an Anker silver USB-C to HDMI adapter plugged in.',
      contactPreference: 'EMAIL',
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
      status: 'OPEN',
      createdAt: '2026-10-06T11:45:00.000Z',
      updatedAt: '2026-10-06T11:45:00.000Z'
    },
    {
      id: 'item_005',
      reportId: 'FOUND-2026-5511',
      userId: adminId,
      posterName: 'Prof. Ramesh Kulkarni (Campus Admin)',
      posterEmail: 'admin@campus.edu',
      posterPhone: '+91 98765 43210',
      itemName: 'Set of 3 Keys with Honda Bike Key & Marvel Lanyard',
      type: 'FOUND',
      category: 'Keys',
      description: 'Handed to campus security gate #2 by parking attendant. Contains two locker keys and one bike ignition key.',
      date: '2026-10-03',
      time: '09:00 AM',
      location: 'Two-Wheeler Student Parking Lot B',
      color: 'Silver / Red Lanyard',
      brand: 'Honda',
      identifyingDetails: 'Iron Man helmet rubber keychain attached.',
      contactPreference: 'PHONE',
      imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
      status: 'RESOLVED',
      createdAt: '2026-10-03T09:30:00.000Z',
      updatedAt: '2026-10-05T10:00:00.000Z'
    },
    {
      id: 'item_006',
      reportId: 'LOST-2026-6623',
      userId: rahulId,
      posterName: 'Rahul Sharma',
      posterEmail: 'rahul.sharma@campus.edu',
      posterPhone: '+91 98234 56789',
      itemName: 'Wildcraft Navy Blue Laptop Backpack',
      type: 'LOST',
      category: 'Bags',
      description: 'Left on the wooden bleachers during Inter-College Badminton tournament trials. Contains textbooks and spiral notebooks.',
      date: '2026-10-05',
      time: '05:30 PM',
      location: 'Sports Complex / Indoor Badminton Court',
      color: 'Navy Blue / Orange accents',
      brand: 'Wildcraft',
      identifyingDetails: 'Contains Database Management Systems (Korth) book with name written on page 1.',
      contactPreference: 'PLATFORM',
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
      status: 'OPEN',
      createdAt: '2026-10-05T18:00:00.000Z',
      updatedAt: '2026-10-05T18:00:00.000Z'
    }
  ];

  const claims: Claim[] = [
    {
      id: 'clm_001',
      itemId: 'item_005',
      itemTitle: 'Set of 3 Keys with Honda Bike Key & Marvel Lanyard',
      itemReportId: 'FOUND-2026-5511',
      claimantUserId: rahulId,
      claimantName: 'Rahul Sharma',
      claimantEmail: 'rahul.sharma@campus.edu',
      claimantPhone: '+91 98234 56789',
      ownerUserId: adminId,
      reason: 'These are my spare Honda Shine bike keys and home locker keys that slipped from my pocket while parking in Lot B.',
      additionalDetails: 'The Marvel Iron Man keychain has a slight tear on the bottom right helmet chin.',
      proofDetails: 'Vehicle registration number ends with 4921 matching my student registration pass.',
      status: 'ACCEPTED',
      createdAt: '2026-10-04T10:00:00.000Z',
      updatedAt: '2026-10-05T10:00:00.000Z'
    }
  ];

  return { users, items, claims };
}

function ensureDbFile(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initial = getInitialData();
    saveDb(initial);
    return initial;
  }

  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(content) as DatabaseSchema;
    if (!data.users || !data.items || !data.claims) {
      const initial = getInitialData();
      saveDb(initial);
      return initial;
    }
    return data;
  } catch (err) {
    console.error('Failed to read db file, creating fresh initial database:', err);
    const initial = getInitialData();
    saveDb(initial);
    return initial;
  }
}

function saveDb(data: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

// User Operations
export function getAllUsers(): User[] {
  const db = ensureDbFile();
  return db.users;
}

export function findUserByEmail(email: string): User | undefined {
  const db = ensureDbFile();
  return db.users.find(u => u.collegeEmail.toLowerCase() === email.toLowerCase().trim());
}

export function findUserByStudentId(studentId: string): User | undefined {
  const db = ensureDbFile();
  return db.users.find(u => u.studentId.toLowerCase() === studentId.toLowerCase().trim());
}

export function findUserById(id: string): User | undefined {
  const db = ensureDbFile();
  return db.users.find(u => u.id === id);
}

export function createUser(userData: {
  fullName: string;
  collegeEmail: string;
  studentId: string;
  phone: string;
  password: string;
  role?: 'STUDENT' | 'FACULTY' | 'ADMIN';
}): User {
  const db = ensureDbFile();
  const { salt, hash } = createPasswordRecord(userData.password);
  const newUser: User = {
    id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    fullName: userData.fullName.trim(),
    collegeEmail: userData.collegeEmail.toLowerCase().trim(),
    studentId: userData.studentId.trim(),
    phone: userData.phone.trim(),
    passwordHash: hash,
    salt,
    role: userData.role || (userData.collegeEmail.toLowerCase().includes('admin') ? 'ADMIN' : 'STUDENT'),
    createdAt: new Date().toISOString()
  };
  db.users.push(newUser);
  saveDb(db);
  return newUser;
}

// Item Operations
export function getAllItems(): Item[] {
  const db = ensureDbFile();
  return db.items;
}

export function findItemById(id: string): Item | undefined {
  const db = ensureDbFile();
  return db.items.find(i => i.id === id || i.reportId === id);
}

export function getItemsByUser(userId: string): Item[] {
  const db = ensureDbFile();
  return db.items.filter(i => i.userId === userId);
}

export function createItem(itemData: Omit<Item, 'id' | 'reportId' | 'createdAt' | 'updatedAt'>): Item {
  const db = ensureDbFile();
  const reportPrefix = itemData.type === 'LOST' ? 'LOST' : 'FOUND';
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const now = new Date().toISOString();

  const newItem: Item = {
    ...itemData,
    id: `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    reportId: `${reportPrefix}-${new Date().getFullYear()}-${randomSuffix}`,
    createdAt: now,
    updatedAt: now
  };

  db.items.unshift(newItem);
  saveDb(db);
  return newItem;
}

export function updateItem(id: string, updates: Partial<Item>): Item | null {
  const db = ensureDbFile();
  const index = db.items.findIndex(i => i.id === id || i.reportId === id);
  if (index === -1) return null;

  db.items[index] = {
    ...db.items[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  saveDb(db);
  return db.items[index];
}

export function deleteItem(id: string): boolean {
  const db = ensureDbFile();
  const initialLen = db.items.length;
  db.items = db.items.filter(i => i.id !== id && i.reportId !== id);
  if (db.items.length !== initialLen) {
    // Also remove associated claims
    db.claims = db.claims.filter(c => c.itemId !== id);
    saveDb(db);
    return true;
  }
  return false;
}

// Claims Operations
export function getAllClaims(): Claim[] {
  const db = ensureDbFile();
  return db.claims;
}

export function getClaimsByItem(itemId: string): Claim[] {
  const db = ensureDbFile();
  return db.claims.filter(c => c.itemId === itemId);
}

export function getClaimsByClaimant(userId: string): Claim[] {
  const db = ensureDbFile();
  return db.claims.filter(c => c.claimantUserId === userId);
}

export function getClaimsByOwner(ownerUserId: string): Claim[] {
  const db = ensureDbFile();
  return db.claims.filter(c => c.ownerUserId === ownerUserId);
}

export function findClaimById(id: string): Claim | undefined {
  const db = ensureDbFile();
  return db.claims.find(c => c.id === id);
}

export function createClaim(claimData: {
  itemId: string;
  itemTitle: string;
  itemReportId: string;
  claimantUserId: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone: string;
  ownerUserId: string;
  reason: string;
  additionalDetails: string;
  proofDetails: string;
}): Claim {
  const db = ensureDbFile();
  const now = new Date().toISOString();
  const newClaim: Claim = {
    id: `clm_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    itemId: claimData.itemId,
    itemTitle: claimData.itemTitle,
    itemReportId: claimData.itemReportId,
    claimantUserId: claimData.claimantUserId,
    claimantName: claimData.claimantName,
    claimantEmail: claimData.claimantEmail,
    claimantPhone: claimData.claimantPhone,
    ownerUserId: claimData.ownerUserId,
    reason: claimData.reason,
    additionalDetails: claimData.additionalDetails,
    proofDetails: claimData.proofDetails,
    status: 'PENDING',
    createdAt: now,
    updatedAt: now
  };
  db.claims.unshift(newClaim);
  saveDb(db);
  return newClaim;
}

export function updateClaimStatus(id: string, status: 'ACCEPTED' | 'REJECTED'): Claim | null {
  const db = ensureDbFile();
  const claimIndex = db.claims.findIndex(c => c.id === id);
  if (claimIndex === -1) return null;

  db.claims[claimIndex].status = status;
  db.claims[claimIndex].updatedAt = new Date().toISOString();

  // If claim is accepted, mark item as RESOLVED
  if (status === 'ACCEPTED') {
    const itemIndex = db.items.findIndex(i => i.id === db.claims[claimIndex].itemId);
    if (itemIndex !== -1) {
      db.items[itemIndex].status = 'RESOLVED';
      db.items[itemIndex].updatedAt = new Date().toISOString();
    }
  }

  saveDb(db);
  return db.claims[claimIndex];
}

// Global Statistics
export function getStatistics() {
  const db = ensureDbFile();
  const totalLost = db.items.filter(i => i.type === 'LOST').length;
  const totalFound = db.items.filter(i => i.type === 'FOUND').length;
  const itemsReunited = db.items.filter(i => i.status === 'RESOLVED').length;
  const activeItems = db.items.filter(i => i.status === 'OPEN').length;
  const totalUsers = db.users.length;
  const totalClaims = db.claims.length;

  return {
    totalLost,
    totalFound,
    itemsReunited,
    activeItems,
    totalUsers,
    totalClaims
  };
}
