const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function authHeaders(token: string | null): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export const api = {
  async getReports() {
    const res = await fetch(`${API_BASE}/api/reports`);
    const data = await res.json();
    return data.issues || [];
  },

  async getMapContext(bounds: { west: number; south: number; east: number; north: number }) {
    const params = new URLSearchParams({
      west: bounds.west.toString(),
      south: bounds.south.toString(),
      east: bounds.east.toString(),
      north: bounds.north.toString(),
    });
    const res = await fetch(`${API_BASE}/api/map/context?${params}`);
    const data = await res.json();
    return data.issues || [];
  },

  async submitReport(report: {
    title: string;
    category: string;
    customCategory?: string;
    latitude: number;
    longitude: number;
    severity?: string;
    creatorId?: string;
  }, token?: string | null) {
    const res = await fetch(`${API_BASE}/api/reports`, {
      method: 'POST',
      headers: authHeaders(token || null),
      body: JSON.stringify(report),
    });
    return res.json();
  },

  async upvoteReport(reportId: string, userId: string, token?: string | null) {
    const res = await fetch(`${API_BASE}/api/reports/${reportId}/upvote`, {
      method: 'POST',
      headers: authHeaders(token || null),
      body: JSON.stringify({ userId }),
    });
    return res.json();
  },

  async verifyReport(reportId: string, userId: string, isValid: boolean, token?: string | null) {
    const res = await fetch(`${API_BASE}/api/reports/${reportId}/verify`, {
      method: 'POST',
      headers: authHeaders(token || null),
      body: JSON.stringify({ userId, isValid }),
    });
    return res.json();
  },

  async getCitizenLeaderboard() {
    const res = await fetch(`${API_BASE}/api/leaderboard/citizens`);
    const data = await res.json();
    return data.citizens || [];
  },

  async getShameLeaderboard() {
    const res = await fetch(`${API_BASE}/api/leaderboard/shame`);
    const data = await res.json();
    return data.mlas || [];
  },

  async getTrendingNews() {
    const res = await fetch(`${API_BASE}/api/news/trending`);
    const data = await res.json();
    return data.news || [];
  },

  // ─── Clerk User Sync ────────────────────────
  async syncClerkUser(profile: {
    clerkId: string;
    displayName: string;
    avatarUrl?: string;
    email?: string;
  }, token?: string | null) {
    const res = await fetch(`${API_BASE}/api/users/sync`, {
      method: 'POST',
      headers: authHeaders(token || null),
      body: JSON.stringify(profile),
    });
    return res.json();
  },

  async getUserByClerkId(clerkId: string) {
    const res = await fetch(`${API_BASE}/api/users/clerk/${clerkId}`);
    return res.json();
  },

  async updateUserByClerkId(clerkId: string, profile: {
    jobTitle?: string;
    socials?: Record<string, string>;
  }) {
    const res = await fetch(`${API_BASE}/api/users/clerk/${clerkId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    return res.json();
  },

  async createUser(profile: { displayName?: string; jobTitle?: string; socials?: Record<string, string> }) {
    const res = await fetch(`${API_BASE}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    return res.json();
  },

  async updateUser(userId: string, profile: { displayName?: string; jobTitle?: string; socials?: Record<string, string>; avatarUrl?: string }) {
    const res = await fetch(`${API_BASE}/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    return res.json();
  },
};
