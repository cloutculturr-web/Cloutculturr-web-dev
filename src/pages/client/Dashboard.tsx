import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

// TODO: Replace with your API endpoint
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ClientStats {
  profile: any;
  stats: {
    savedCreators: number;
    recentlyViewed: number;
    membershipStatus: 'free' | 'premium';
    membershipExpiry: string;
  };
}

export default function ClientDashboard() {
  const [data, setData] = useState<ClientStats | null>(null);
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

      const response = await fetch(`${API_URL}/client/dashboard`, {
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
        <h1 className="text-3xl font-bold">Client Dashboard</h1>
        <Button>Edit Profile</Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Membership Status */}
      <Card className={data?.stats.membershipStatus === 'premium' ? 'bg-yellow-50 border-yellow-200' : ''}>
        <CardHeader>
          <CardTitle>Membership Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-semibold capitalize">
                {data?.stats.membershipStatus} Plan
              </p>
              {/* TODO: Show expiry date for premium */}
              {data?.stats.membershipStatus === 'premium' && (
                <p className="text-sm text-gray-600 mt-1">
                  Expires: {new Date(data.stats.membershipExpiry).toLocaleDateString()}
                </p>
              )}
            </div>
            {data?.stats.membershipStatus === 'free' && (
              <Button onClick={() => window.location.href = '/client/membership/upgrade'}>
                Upgrade to Premium
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Saved Creators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data?.stats.savedCreators || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recently Viewed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data?.stats.recentlyViewed || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            {/* TODO: Fetch active projects */}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="/client/marketplace"
          className="p-6 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
        >
          <h3 className="font-semibold text-blue-900">Browse Creators</h3>
          <p className="text-sm text-blue-700 mt-1">
            {data?.stats.membershipStatus === 'premium' ? 'Unlimited' : '8 limited'} creators available
          </p>
        </a>
        <a
          href="/client/saved-creators"
          className="p-6 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition"
        >
          <h3 className="font-semibold text-green-900">Saved Creators</h3>
          <p className="text-sm text-green-700 mt-1">
            {data?.stats.savedCreators || 0} saved
          </p>
        </a>
        <a
          href="/client/projects"
          className="p-6 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition"
        >
          <h3 className="font-semibold text-purple-900">My Projects</h3>
          <p className="text-sm text-purple-700 mt-1">Manage your projects</p>
        </a>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Creators</CardTitle>
        </CardHeader>
        <CardContent>
          {/* TODO: Fetch and display recommended creators */}
          <p className="text-gray-500 text-sm">Loading recommendations...</p>
        </CardContent>
      </Card>

      {/* TODO: Add refresh button and notifications */}
      <button
        onClick={fetchDashboard}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Refresh
      </button>
    </div>
  );
}
