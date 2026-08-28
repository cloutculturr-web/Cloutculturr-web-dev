/**
 * Admin API Service
 * Handles all API calls to the admin backend
 */

// Defaults to a relative path so the same build works unmodified wherever
// the backend is same-origin (e.g. deployed together on Vercel under
// /api/*) — set VITE_API_URL explicitly only when the backend lives on a
// different origin than the frontend.
const API_URL = (import.meta.env['VITE_API_URL'] as string | undefined) || '/api';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
  timestamp: string;
}

interface ApiError {
  success: false;
  error: string;
  statusCode: number;
  timestamp: string;
}

/**
 * Get JWT token from localStorage
 */
function getAuthToken(): string | null {
  return localStorage.getItem('accessToken');
}

/**
 * Silently exchanges the stored refresh token for a new access/refresh pair.
 * Concurrent callers share a single in-flight request instead of each firing
 * their own refresh call.
 */
let refreshPromise: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Refresh token rejected');
    }

    const body = await response.json();
    const { accessToken, refreshToken: newRefreshToken } = body.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    // Keep the cached `user` blob's token fields in sync too, since some
    // code paths read tokens back out of it.
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...user, accessToken, refreshToken: newRefreshToken }));
    } catch {
      // ignore malformed cache — accessToken/refreshToken keys are already updated
    }

    return accessToken;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

function clearSessionAndRedirect() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

/**
 * Make authenticated API request. On a 401 (expired access token), silently
 * refreshes once via the refresh token and retries — the admin is never
 * bounced to a "session expired" screen just because 15 minutes passed.
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<ApiResponse<T>> {
  const token = getAuthToken();

  if (!token) {
    throw new Error('No authentication token found. Please login first.');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401 && !isRetry) {
        try {
          await refreshAccessToken();
          return apiRequest<T>(endpoint, options, true);
        } catch {
          clearSessionAndRedirect();
          throw new Error('Your session has expired. Please log in again.');
        }
      }

      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || `API Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API Request Failed: ${endpoint}`, error);
    throw error;
  }
}

/**
 * Admin API Service
 */
export const adminAPI = {
  /**
   * ============ DASHBOARD & ANALYTICS ============
   */
  
  /**
   * Get dashboard overview with KPIs
   */
  getDashboard: async (period: 'day' | 'week' | 'month' | 'year' = 'month') => {
    return apiRequest<any>(`/admin/dashboard?period=${period}`);
  },

  /**
   * Get detailed analytics data
   */
  getAnalytics: async (
    period: 'day' | 'week' | 'month' | 'year' = 'month',
    startDate?: string,
    endDate?: string
  ) => {
    let url = `/admin/analytics?period=${period}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    return apiRequest<any>(url);
  },

  /**
   * Get platform statistics
   */
  getStats: async () => {
    return apiRequest<any>('/admin/stats');
  },

  /**
   * Get audit logs
   */
  getAuditLogs: async (page = 1, limit = 20, resource?: string, action?: string) => {
    let url = `/admin/audit-logs?page=${page}&limit=${limit}`;
    if (resource) url += `&resource=${resource}`;
    if (action) url += `&action=${action}`;
    return apiRequest<any>(url);
  },

  /**
   * ============ CLIENT MANAGEMENT ============
   */

  /**
   * Get all clients with pagination and filtering
   */
  getClients: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    membership?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', String(params.page));
    if (params.limit) queryParams.set('limit', String(params.limit));
    if (params.search) queryParams.set('search', params.search);
    if (params.status) queryParams.set('status', params.status);
    if (params.membership) queryParams.set('membership', params.membership);
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);
    
    const queryString = queryParams.toString();
    const url = `/admin/clients${queryString ? `?${queryString}` : ''}`;
    return apiRequest<any>(url);
  },

  /**
   * Get single client details
   */
  getClient: async (clientId: string) => {
    return apiRequest<any>(`/admin/clients/${clientId}`);
  },

  /**
   * Update client information
   */
  updateClient: async (clientId: string, data: Partial<any>) => {
    return apiRequest<any>(`/admin/clients/${clientId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Suspend client account
   */
  suspendClient: async (clientId: string, reason?: string) => {
    return apiRequest<any>(`/admin/clients/${clientId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason: reason || 'Administrative suspension' }),
    });
  },

  /**
   * Reactivate client account
   */
  reactivateClient: async (clientId: string) => {
    return apiRequest<any>(`/admin/clients/${clientId}/reactivate`, {
      method: 'POST',
    });
  },

  /**
   * Delete client account
   */
  deleteClient: async (clientId: string) => {
    return apiRequest<any>(`/admin/clients/${clientId}`, {
      method: 'DELETE',
    });
  },

  /**
   * ============ CREATOR MANAGEMENT ============
   */

  /**
   * Create new creator account
   */
  createCreator: async (data: {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    companyName?: string;
  }) => {
    return apiRequest<any>('/admin/creators', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get all creators with pagination and filtering
   */
  getCreators: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    verification?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', String(params.page));
    if (params.limit) queryParams.set('limit', String(params.limit));
    if (params.search) queryParams.set('search', params.search);
    if (params.verification) queryParams.set('verification', params.verification);
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);
    
    const queryString = queryParams.toString();
    const url = `/admin/creators${queryString ? `?${queryString}` : ''}`;
    return apiRequest<any>(url);
  },

  /**
   * Get single creator details
   */
  getCreator: async (creatorId: string) => {
    return apiRequest<any>(`/admin/creators/${creatorId}`);
  },

  /**
   * Verify creator profile
   */
  verifyCreator: async (creatorId: string) => {
    return apiRequest<any>(`/admin/creators/${creatorId}/verify`, {
      method: 'POST',
    });
  },

  /**
   * Reject creator profile
   */
  rejectCreator: async (creatorId: string, reason?: string) => {
    return apiRequest<any>(`/admin/creators/${creatorId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason: reason || 'Rejected by admin' }),
    });
  },

  /**
   * Suspend creator account
   */
  suspendCreator: async (creatorId: string, reason?: string) => {
    return apiRequest<any>(`/admin/creators/${creatorId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason: reason || 'Administrative suspension' }),
    });
  },

  /**
   * Delete creator account
   */
  deleteCreator: async (creatorId: string) => {
    return apiRequest<any>(`/admin/creators/${creatorId}`, {
      method: 'DELETE',
    });
  },

  /**
   * ============ PROJECT MANAGEMENT ============
   */

  /**
   * Get all projects with pagination and filtering
   */
  getProjects: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', String(params.page));
    if (params.limit) queryParams.set('limit', String(params.limit));
    if (params.search) queryParams.set('search', params.search);
    if (params.status) queryParams.set('status', params.status);
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);
    
    const queryString = queryParams.toString();
    const url = `/admin/projects${queryString ? `?${queryString}` : ''}`;
    return apiRequest<any>(url);
  },

  /**
   * Update project status
   */
  updateProjectStatus: async (
    projectId: string,
    status: 'enquiry' | 'requirements' | 'review' | 'quoted' | 'approved' | 'active' | 'completed' | 'archived'
  ) => {
    return apiRequest<any>(`/admin/projects/${projectId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  /**
   * Get single creator details (profile, tier, pricing, stats)
   */
  getCreator: async (creatorId: string) => {
    return apiRequest<any>(`/admin/creators/${creatorId}`);
  },

  /**
   * ============ CREATOR APPLICATIONS ============
   */

  getCreatorApplications: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', String(params.page));
    if (params.limit) queryParams.set('limit', String(params.limit));
    if (params.search) queryParams.set('search', params.search);
    if (params.status) queryParams.set('status', params.status);
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);
    const queryString = queryParams.toString();
    return apiRequest<any>(`/admin/creator-applications${queryString ? `?${queryString}` : ''}`);
  },

  getCreatorApplication: async (id: string) => {
    return apiRequest<any>(`/admin/creator-applications/${id}`);
  },

  approveCreatorApplication: async (id: string, data: { tierId: string; approvedAmount: number; availability?: string }) => {
    return apiRequest<any>(`/admin/creator-applications/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  rejectCreatorApplication: async (id: string, reason: string) => {
    return apiRequest<any>(`/admin/creator-applications/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  requestCreatorApplicationChanges: async (id: string, notes: string) => {
    return apiRequest<any>(`/admin/creator-applications/${id}/request-changes`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  },

  /**
   * Downloads an application file as a Blob (auth header can't be sent via
   * plain <a href>, so this fetches it manually).
   */
  downloadCreatorApplicationFile: async (applicationId: string, fileId: string, filename: string) => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found. Please login first.');
    const response = await fetch(`${API_URL}/admin/creator-applications/${applicationId}/files/${fileId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status}`);
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * ============ CREATOR TIERS ============
   */

  getCreatorTiers: async () => {
    return apiRequest<any>('/admin/creator-tiers');
  },

  createCreatorTier: async (data: { name: string; level: 1 | 2 | 3; description?: string; pricingGuidance?: { min?: number; max?: number; currency?: string }; eligibilityCriteria?: string; status?: 'active' | 'inactive' }) => {
    return apiRequest<any>('/admin/creator-tiers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateCreatorTier: async (id: string, data: Partial<{ name: string; description: string; pricingGuidance: { min?: number; max?: number; currency?: string }; eligibilityCriteria: string; status: 'active' | 'inactive' }>) => {
    return apiRequest<any>(`/admin/creator-tiers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * ============ CREATOR PRICING & TIER ASSIGNMENT ============
   */

  getCreatorPricingHistory: async (creatorId: string) => {
    return apiRequest<any>(`/admin/creators/${creatorId}/pricing-history`);
  },

  approveCreatorPricing: async (creatorId: string, data: { approvedAmount: number; reason: string }) => {
    return apiRequest<any>(`/admin/creators/${creatorId}/pricing`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  rejectCreatorPricing: async (creatorId: string, reason: string) => {
    return apiRequest<any>(`/admin/creators/${creatorId}/pricing/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  changeCreatorTier: async (creatorId: string, data: { tierId: string; reason: string }) => {
    return apiRequest<any>(`/admin/creators/${creatorId}/tier`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * ============ AUDIT LOGS ============
   */

  getAuditLogsList: async (params: { page?: number; limit?: number; resource?: string; action?: string } = {}) => {
    return adminAPI.getAuditLogs(params.page, params.limit, params.resource, params.action);
  },
};

export default adminAPI;

/**
 * Public creator-application submission — unauthenticated, multipart form.
 */
export const creatorApplicationAPI = {
  submit: async (formData: FormData) => {
    const response = await fetch(`${API_URL}/creator-applications`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      const message = data?.errors?.[0]?.message || data?.message || `Submission failed: ${response.status}`;
      throw new Error(message);
    }
    return data;
  },
};

/**
 * Creator API Service — the authenticated creator's own workspace.
 * Every endpoint is scoped server-side to the authenticated creator; no ID
 * is ever passed from the client to select whose data to fetch/mutate.
 */
export const creatorAPI = {
  getDashboard: async () => apiRequest<any>('/creator/dashboard'),

  getProfile: async () => apiRequest<any>('/creator/profile'),

  updateProfile: async (data: {
    companyName?: string;
    bio?: string;
    profilePhoto?: string;
    banner?: string;
    location?: string;
    experience?: number;
    languages?: string[];
    skills?: string[];
    website?: string;
    socialMedia?: { instagram?: string; linkedin?: string; twitter?: string };
  }) => apiRequest<any>('/creator/profile', { method: 'PUT', body: JSON.stringify(data) }),

  updateAvailability: async (availability: 'available' | 'busy' | 'unavailable') =>
    apiRequest<any>('/creator/availability', { method: 'PUT', body: JSON.stringify({ availability }) }),

  getPortfolio: async () => apiRequest<any>('/creator/portfolio'),

  addPortfolioItem: async (data: {
    title: string;
    description: string;
    category: string;
    media: { type: 'image' | 'video'; url: string; thumbnail?: string };
    projectDetails?: { clientName: string; challenge: string; solution: string; results: string };
  }) => apiRequest<any>('/creator/portfolio', { method: 'POST', body: JSON.stringify(data) }),

  updatePortfolioItem: async (id: string, data: Partial<{ title: string; description: string; category: string; media: any; projectDetails: any }>) =>
    apiRequest<any>(`/creator/portfolio/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deletePortfolioItem: async (id: string) => apiRequest<any>(`/creator/portfolio/${id}`, { method: 'DELETE' }),

  getPackages: async () => apiRequest<any>('/creator/packages'),

  createPackage: async (data: {
    name: string;
    description: string;
    price: number;
    deliverables: { reels?: number; posts?: number; stories?: number; photography?: boolean; editing?: boolean; contentStrategy?: boolean; monthlySupport?: boolean; revisions?: number };
    timeline: number;
    additionalServices?: string[];
  }) => apiRequest<any>('/creator/packages', { method: 'POST', body: JSON.stringify(data) }),

  updatePackage: async (id: string, data: Partial<{ name: string; description: string; price: number; deliverables: any; timeline: number; additionalServices: string[]; status: 'active' | 'disabled' }>) =>
    apiRequest<any>(`/creator/packages/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deletePackage: async (id: string) => apiRequest<any>(`/creator/packages/${id}`, { method: 'DELETE' }),

  getRevenue: async () => apiRequest<any>('/creator/revenue'),

  getProjects: async (status?: string) => apiRequest<any>(`/creator/projects${status ? `?status=${status}` : ''}`),
};

/**
 * Client API Service — the authenticated client's own workspace.
 * Every endpoint under /client/... is scoped server-side to the
 * authenticated client; no client-supplied id ever selects whose data is
 * read/mutated (creator ids are inherently cross-entity — read-only lookups
 * of a creator's own public profile — and are never used to select the
 * caller's own records).
 */
export const clientAPI = {
  getDashboard: async () => apiRequest<any>('/client/dashboard'),

  getProfile: async () => apiRequest<any>('/client/profile'),

  updateProfile: async (data: {
    companyName?: string;
    industry?: string;
    location?: string;
    websiteUrl?: string;
    description?: string;
  }) => apiRequest<any>('/client/profile', { method: 'PUT', body: JSON.stringify(data) }),

  getMarketplace: async (page = 1, limit = 10) =>
    apiRequest<any>(`/client/marketplace?page=${page}&limit=${limit}`),

  getCreatorDetails: async (creatorId: string) => apiRequest<any>(`/client/marketplace/${creatorId}`),

  saveCreator: async (creatorId: string) =>
    apiRequest<any>(`/client/save-creator/${creatorId}`, { method: 'POST' }),

  unsaveCreator: async (creatorId: string) =>
    apiRequest<any>(`/client/save-creator/${creatorId}`, { method: 'DELETE' }),

  getSavedCreators: async () => apiRequest<any>('/client/saved-creators'),

  getRecentlyViewed: async () => apiRequest<any>('/client/recently-viewed'),

  getMembership: async () => apiRequest<any>('/client/membership'),

  createMembershipOrder: async () => apiRequest<any>('/client/membership/order', { method: 'POST' }),

  verifyMembershipPayment: async (data: { orderId: string; paymentId: string; signature: string }) =>
    apiRequest<any>('/client/membership/verify', { method: 'POST', body: JSON.stringify(data) }),

  cancelMembership: async () => apiRequest<any>('/client/membership/cancel', { method: 'POST' }),

  createProject: async (data: {
    title: string;
    description: string;
    budget: number;
    requirements: string;
    timeline: string;
    creatorId?: string;
  }) => apiRequest<any>('/client/projects', { method: 'POST', body: JSON.stringify(data) }),

  getProjects: async (status?: string) => apiRequest<any>(`/client/projects${status ? `?status=${status}` : ''}`),

  getProject: async (id: string) => apiRequest<any>(`/client/projects/${id}`),

  updateProject: async (id: string, data: { action?: 'approve_quotation' | 'reject_quotation'; description?: string }) =>
    apiRequest<any>(`/client/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  submitProjectReview: async (id: string, data: { rating: number; feedback?: string }) =>
    apiRequest<any>(`/client/projects/${id}/review`, { method: 'POST', body: JSON.stringify(data) }),
};

/**
 * Notifications API — shared across roles, always scoped server-side to
 * the authenticated user.
 */
export const notificationsAPI = {
  list: async (params: { limit?: number; includeRead?: boolean } = {}) => {
    const q = new URLSearchParams();
    if (params.limit) q.set('limit', String(params.limit));
    if (params.includeRead) q.set('includeRead', 'true');
    const qs = q.toString();
    return apiRequest<any>(`/notifications${qs ? `?${qs}` : ''}`);
  },
  unreadCount: async () => apiRequest<any>('/notifications/unread-count'),
  markAsRead: async (id: string) => apiRequest<any>(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllAsRead: async () => apiRequest<any>('/notifications/read-all', { method: 'PUT' }),
};
