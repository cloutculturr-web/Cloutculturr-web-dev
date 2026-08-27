import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

// TODO: Replace with your API endpoint
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Creator {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  // TODO: Add profile fields
}

export default function Marketplace() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [savedCreators, setSavedCreators] = useState<Set<string>>(new Set());

  // TODO: Add your API key if needed
  const apiKey = ''; // PLACEHOLDER - ADD YOUR API KEY

  useEffect(() => {
    fetchCreators();
  }, [page]);

  const fetchCreators = async () => {
    try {
      const token = localStorage.getItem('accessToken') || '';

      const response = await fetch(
        `${API_URL}/client/marketplace?page=${page}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            ...(apiKey && { 'X-API-Key': apiKey }),
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch creators');
      }

      const result = await response.json();
      setCreators(result.data.creators);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSaveCreator = async (creatorId: string) => {
    try {
      const token = localStorage.getItem('accessToken') || '';
      const isSaved = savedCreators.has(creatorId);
      const method = isSaved ? 'DELETE' : 'POST';
      const endpoint = isSaved ? `/client/save-creator/${creatorId}` : `/client/save-creator/${creatorId}`;

      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          ...(apiKey && { 'X-API-Key': apiKey }),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to save creator');
      }

      if (isSaved) {
        savedCreators.delete(creatorId);
      } else {
        savedCreators.add(creatorId);
      }
      setSavedCreators(new Set(savedCreators));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // TODO: Implement search filtering
  };

  if (loading) return <div className="p-8">Loading creators...</div>;

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Creator Marketplace</h1>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search Bar */}
      <div className="flex gap-2">
        <Input
          type="search"
          placeholder="Search creators..."
          value={searchQuery}
          onChange={handleSearch}
          className="flex-1"
        />
        <Button>Search</Button>
      </div>

      {/* Membership Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          {/* TODO: Show membership status and upgrade option */}
          <p className="text-sm text-blue-900">
            Premium members get unlimited creator access and advanced filters
          </p>
        </CardContent>
      </Card>

      {/* Creators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creators.map((creator) => (
          <Card key={creator._id} className="hover:shadow-lg transition">
            <CardHeader>
              <CardTitle className="text-lg">
                {creator.firstName} {creator.lastName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* TODO: Add creator profile image and details */}
              <div>
                <p className="text-sm text-gray-600">{creator.email}</p>
                {/* TODO: Show rating, projects completed, etc */}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => window.location.href = `/client/marketplace/${creator._id}`}
                  className="flex-1"
                >
                  View Profile
                </Button>
                <Button
                  onClick={() => toggleSaveCreator(creator._id)}
                  variant={savedCreators.has(creator._id) ? 'default' : 'outline'}
                  className="flex-1"
                >
                  {savedCreators.has(creator._id) ? '❤️ Saved' : '🤍 Save'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        {/* TODO: Add pagination controls */}
        <Button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="px-4 py-2">Page {page}</span>
        <Button onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </div>

      {/* Empty State */}
      {creators.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No creators found</p>
          {/* TODO: Show upgrade prompt if free tier */}
        </div>
      )}
    </div>
  );
}
