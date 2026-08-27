import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

// TODO: Replace with your API endpoint
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface CreatorStats {
  profile: any;
  stats: {
    portfolioItems: number;
    activePackages: number;
    totalRevenue: number;
    completedProjects: number;
    averageRating: number;
  };
}

export default function CreatorDashboard() {
  const [data, setData] = useState<CreatorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      // TODO: Get token from storage
      const token = localStorage.getItem('accessToken') || '';

      // TODO: Add your API key if needed
      const apiKey = ''; // PLACEHOLDER - ADD YOUR API KEY

      const response = await fetch(`${API_URL}/creator/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          ...(apiKey && { 'X-API-Key': apiKey }),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Creator Dashboard</h1>
        <Button>Edit Profile</Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* TODO: Add profile header section */}
      {data?.profile && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <h2 className="text-xl font-semibold">{data.profile.companyName}</h2>
              <p className="text-gray-600 mt-1">{data.profile.bio}</p>
              {/* TODO: Add social media links */}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Portfolio Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data?.stats.portfolioItems || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Packages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data?.stats.activePackages || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{data?.stats.totalRevenue || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Completed Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data?.stats.completedProjects || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Avg Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">⭐ {data?.stats.averageRating?.toFixed(1) || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="/creator/portfolio"
          className="p-6 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
        >
          <h3 className="font-semibold text-blue-900">Portfolio</h3>
          <p className="text-sm text-blue-700 mt-1">
            {data?.stats.portfolioItems || 0} items
          </p>
        </a>
        <a
          href="/creator/packages"
          className="p-6 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition"
        >
          <h3 className="font-semibold text-green-900">Packages</h3>
          <p className="text-sm text-green-700 mt-1">
            {data?.stats.activePackages || 0} active
          </p>
        </a>
        <a
          href="/creator/projects"
          className="p-6 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition"
        >
          <h3 className="font-semibold text-purple-900">Projects</h3>
          <p className="text-sm text-purple-700 mt-1">Manage your projects</p>
        </a>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {/* TODO: Add activity log */}
          <p className="text-gray-500 text-sm">No recent activity</p>
        </CardContent>
      </Card>

      {/* TODO: Add refresh button */}
      <button
        onClick={fetchDashboard}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Refresh
      </button>
    </div>
  );
}
