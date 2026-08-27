/**
 * Custom hook for admin API calls with loading and error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '@/services/api';

interface UseAdminAPIState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseDashboardState extends UseAdminAPIState<any> {
  lastUpdated: Date | null;
}

/**
 * Hook for dashboard data
 */
export function useDashboard(period: 'day' | 'week' | 'month' | 'year' = 'month'): UseDashboardState {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getDashboard(period);
      setData(response.data);
      setLastUpdated(new Date(response.timestamp));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, lastUpdated, refetch: fetchData };
}

/**
 * Hook for analytics data
 */
export function useAnalytics(
  period: 'day' | 'week' | 'month' | 'year' = 'month',
  startDate?: string,
  endDate?: string
): UseAdminAPIState<any> {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getAnalytics(period, startDate, endDate);
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [period, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for clients list
 */
export function useClients(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  membership?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = {}): UseAdminAPIState<any> {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getClients(params);
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients');
      setData({ clients: [], pagination: { total: 0, page: 1, limit: 10, pages: 0 } });
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]); // Use JSON.stringify for dependency tracking

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for creators list
 */
export function useCreators(params: {
  page?: number;
  limit?: number;
  search?: string;
  verification?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = {}): UseAdminAPIState<any> {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getCreators(params);
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch creators');
      setData({ creators: [], pagination: { total: 0, page: 1, limit: 10, pages: 0 } });
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for projects list
 */
export function useProjects(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = {}): UseAdminAPIState<any> {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getProjects(params);
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      setData({ projects: [], pagination: { total: 0, page: 1, limit: 10, pages: 0 } });
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for audit logs
 */
export function useAuditLogs(params: {
  page?: number;
  limit?: number;
  resource?: string;
  action?: string;
} = {}): UseAdminAPIState<any> {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getAuditLogs(
        params.page,
        params.limit,
        params.resource,
        params.action
      );
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for a single creator's full detail
 */
export function useCreator(creatorId: string | undefined): UseAdminAPIState<any> {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!creatorId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getCreator(creatorId);
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch creator');
    } finally {
      setLoading(false);
    }
  }, [creatorId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for creator applications list
 */
export function useCreatorApplications(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = {}): UseAdminAPIState<any> {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getCreatorApplications(params);
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch creator applications');
      setData({ applications: [], pagination: { total: 0, page: 1, limit: 10, pages: 0 } });
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for a single creator application
 */
export function useCreatorApplication(id: string | undefined): UseAdminAPIState<any> {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getCreatorApplication(id);
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch application');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for creator tiers
 */
export function useCreatorTiers(): UseAdminAPIState<any> {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getCreatorTiers();
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch creator tiers');
      setData({ tiers: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for a creator's pricing history
 */
export function useCreatorPricingHistory(creatorId: string | undefined): UseAdminAPIState<any> {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!creatorId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getCreatorPricingHistory(creatorId);
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pricing history');
    } finally {
      setLoading(false);
    }
  }, [creatorId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export default {
  useDashboard,
  useAnalytics,
  useClients,
  useCreators,
  useCreator,
  useProjects,
  useAuditLogs,
  useCreatorApplications,
  useCreatorApplication,
  useCreatorTiers,
  useCreatorPricingHistory,
};
