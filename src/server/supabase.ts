import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Item, User, Claim } from './db.ts';

export const SUPABASE_PROJECT_ID = 'nldzgkhjrhztwipecdnb';
export const SUPABASE_URL = 'https://nldzgkhjrhztwipecdnb.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_AbFAQJef63ZH5N27fym0sQ_HRU49Hf5';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

export const SUPABASE_SQL_SETUP = `-- ========================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/nldzgkhjrhztwipecdnb/sql
-- ========================================================

-- 1. Create items table for Lost & Found reports
CREATE TABLE IF NOT EXISTS public.items (
    id TEXT PRIMARY KEY,
    report_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    poster_name TEXT NOT NULL,
    poster_email TEXT NOT NULL,
    poster_phone TEXT,
    item_name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('LOST', 'FOUND')),
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT,
    location TEXT NOT NULL,
    color TEXT,
    brand TEXT,
    identifying_details TEXT,
    contact_preference TEXT DEFAULT 'PLATFORM',
    image_url TEXT,
    status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'RESOLVED', 'CLAIMED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and allow public access for student reporting
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on items" 
ON public.items FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert on items" 
ON public.items FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update on items" 
ON public.items FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete on items" 
ON public.items FOR DELETE 
USING (true);

-- 2. Optional: users table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    college_email TEXT UNIQUE NOT NULL,
    student_id TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'STUDENT',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access on users" ON public.users FOR ALL USING (true);

-- 3. Optional: claims table
CREATE TABLE IF NOT EXISTS public.claims (
    id TEXT PRIMARY KEY,
    item_id TEXT REFERENCES public.items(id) ON DELETE CASCADE,
    item_title TEXT,
    item_report_id TEXT,
    claimant_user_id TEXT,
    claimant_name TEXT,
    claimant_email TEXT,
    claimant_phone TEXT,
    owner_user_id TEXT,
    reason TEXT NOT NULL,
    additional_details TEXT,
    proof_details TEXT,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access on claims" ON public.claims FOR ALL USING (true);
`;

/**
 * Check connection to Supabase and see if the items table exists
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  tableExists: boolean;
  message: string;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.from('items').select('id').limit(1);

    if (error) {
      if (error.code === 'PGRST205' || error.message.includes('Could not find the table')) {
        return {
          connected: true,
          tableExists: false,
          message: 'Connected to Supabase project, but the "items" table is not created yet. Please execute the provided SQL setup script in your Supabase SQL editor.',
          error: error.message
        };
      }
      return {
        connected: false,
        tableExists: false,
        message: `Supabase returned an error: ${error.message}`,
        error: error.message
      };
    }

    return {
      connected: true,
      tableExists: true,
      message: 'Successfully connected to Supabase backend! "items" table is active and receiving reports.'
    };
  } catch (err: any) {
    return {
      connected: false,
      tableExists: false,
      message: 'Could not connect to Supabase: ' + (err.message || String(err)),
      error: err.message
    };
  }
}

/**
 * Save an item to Supabase items table
 */
export async function saveItemToSupabase(item: Item): Promise<{ success: boolean; error?: string }> {
  try {
    const row = {
      id: item.id,
      report_id: item.reportId,
      user_id: item.userId,
      poster_name: item.posterName,
      poster_email: item.posterEmail,
      poster_phone: item.posterPhone,
      item_name: item.itemName,
      type: item.type,
      category: item.category,
      description: item.description,
      date: item.date,
      time: item.time,
      location: item.location,
      color: item.color,
      brand: item.brand,
      identifying_details: item.identifyingDetails,
      contact_preference: item.contactPreference,
      image_url: item.imageUrl,
      status: item.status,
      created_at: item.createdAt,
      updated_at: item.updatedAt
    };

    const { error } = await supabase.from('items').upsert(row, { onConflict: 'id' });

    if (error) {
      console.warn(`[Supabase Sync Warning] Failed to insert report #${item.reportId} into Supabase:`, error.message);
      return { success: false, error: error.message };
    }

    console.log(`[Supabase Sync Success] Report #${item.reportId} (${item.itemName}) saved to Supabase table 'items'!`);
    return { success: true };
  } catch (err: any) {
    console.warn('[Supabase Sync Error]', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Delete an item from Supabase
 */
export async function deleteItemFromSupabase(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Save claim to Supabase
 */
export async function saveClaimToSupabase(claim: Claim): Promise<{ success: boolean; error?: string }> {
  try {
    const row = {
      id: claim.id,
      item_id: claim.itemId,
      item_title: claim.itemTitle,
      item_report_id: claim.itemReportId,
      claimant_user_id: claim.claimantUserId,
      claimant_name: claim.claimantName,
      claimant_email: claim.claimantEmail,
      claimant_phone: claim.claimantPhone,
      owner_user_id: claim.ownerUserId,
      reason: claim.reason,
      additional_details: claim.additionalDetails,
      proof_details: claim.proofDetails,
      status: claim.status,
      created_at: claim.createdAt
    };

    const { error } = await supabase.from('claims').upsert(row, { onConflict: 'id' });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
