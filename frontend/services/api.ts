const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('meme_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('meme_token');
      localStorage.removeItem('meme_user');
      window.location.href = '/login';
    }
    throw new Error(data.error || 'Something went wrong');
  }

  return data as T;
}

export const api = {
  auth: {
    signup: (body: { name: string; email: string; password: string; role: string }) =>
      request<any>('/api/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: { email: string; password: string }) =>
      request<any>('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  },
  campaigns: {
    create: (body: any) =>
      request<any>('/api/campaigns', { method: 'POST', body: JSON.stringify(body) }),
    listMy: () => request<any>('/api/campaigns/my'),
    listLive: () => request<any>('/api/campaigns/live'),
    getDetail: (id: string) => request<any>(`/api/campaigns/${id}`),
  },
  submissions: {
    create: (body: { campaignId: string; postLink: string }) =>
      request<any>('/api/submissions', { method: 'POST', body: JSON.stringify(body) }),
    myEarnings: () => request<any>('/api/submissions/my-earnings'),
    updateViews: (id: string, views: number) =>
      request<any>(`/api/submissions/${id}/views`, { method: 'PATCH', body: JSON.stringify({ views }) }),
  },
};
