import { User, Item, Claim, Stats } from '../types';

const TOKEN_KEY = 'campus_lf_auth_token';
const USER_KEY = 'campus_lf_auth_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveAuthSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Stats
  async getStats(): Promise<Stats> {
    return fetchJson<Stats>('/api/stats');
  },

  // Auth
  async register(payload: {
    fullName: string;
    collegeEmail: string;
    studentId: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }): Promise<{ message: string; user: User; token: string }> {
    return fetchJson('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async login(payload: {
    collegeEmail: string;
    password: string;
  }): Promise<{ message: string; user: User; token: string }> {
    return fetchJson('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getMe(): Promise<{ user: User }> {
    return fetchJson('/api/auth/me');
  },

  // Items
  async getItems(filters: {
    search?: string;
    type?: string;
    category?: string;
    location?: string;
    status?: string;
  } = {}): Promise<Item[]> {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.type && filters.type !== 'ALL') params.set('type', filters.type);
    if (filters.category && filters.category !== 'ALL') params.set('category', filters.category);
    if (filters.location && filters.location !== 'ALL') params.set('location', filters.location);
    if (filters.status && filters.status !== 'ALL') params.set('status', filters.status);

    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<Item[]>(`/api/items${query}`);
  },

  async getItem(id: string): Promise<Item> {
    return fetchJson<Item>(`/api/items/${id}`);
  },

  async createItem(payload: Partial<Item>): Promise<{ message: string; item: Item }> {
    return fetchJson('/api/items', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateItem(id: string, payload: Partial<Item>): Promise<{ message: string; item: Item }> {
    return fetchJson(`/api/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async deleteItem(id: string): Promise<{ message: string }> {
    return fetchJson(`/api/items/${id}`, {
      method: 'DELETE'
    });
  },

  // Claims
  async submitClaim(itemId: string, payload: {
    reason: string;
    additionalDetails?: string;
    proofDetails?: string;
  }): Promise<{ message: string; claim: Claim }> {
    return fetchJson(`/api/items/${itemId}/claims`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getMyClaims(): Promise<{ submitted: Claim[]; received: Claim[] }> {
    return fetchJson('/api/claims/my');
  },

  async acceptClaim(claimId: string): Promise<{ message: string; claim: Claim }> {
    return fetchJson(`/api/claims/${claimId}/accept`, {
      method: 'PUT'
    });
  },

  async rejectClaim(claimId: string): Promise<{ message: string; claim: Claim }> {
    return fetchJson(`/api/claims/${claimId}/reject`, {
      method: 'PUT'
    });
  },

  // Admin
  async getAdminUsers(): Promise<User[]> {
    return fetchJson('/api/admin/users');
  },

  async getAdminClaims(): Promise<Claim[]> {
    return fetchJson('/api/admin/claims');
  },

  async updateItemStatusAdmin(id: string, status: string): Promise<{ message: string; item: Item }> {
    return fetchJson(`/api/admin/items/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  // Supabase
  async getSupabaseStatus(): Promise<{
    projectId: string;
    url: string;
    connected: boolean;
    tableExists: boolean;
    message: string;
    error?: string;
    sqlSetupScript: string;
    dashboardSqlUrl: string;
  }> {
    return fetchJson('/api/supabase/status');
  },

  async syncAllToSupabase(): Promise<{
    message: string;
    successCount: number;
    failCount: number;
    errors: string[];
  }> {
    return fetchJson('/api/supabase/sync-all', {
      method: 'POST'
    });
  }
};
