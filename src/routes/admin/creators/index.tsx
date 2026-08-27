import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Download, Plus, Filter, RefreshCw, Trash2, Lock, Check, X, AlertCircle, Eye } from "lucide-react";
import { useCreators } from "@/hooks/useAdminAPI";
import { adminAPI } from "@/services/api";
import { exportToCSV } from "@/lib/csvExport";

export const Route = createFileRoute("/admin/creators/")({
  component: CreatorManagement,
});

interface CreateCreatorForm {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  companyName?: string;
}

function CreatorManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [verification, setVerification] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CreateCreatorForm>({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    companyName: '',
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data, loading, error, refetch } = useCreators({
    page,
    limit: 10,
    ...(search ? { search } : {}),
    ...(verification ? { verification } : {}),
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const handleCreateCreator = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormError(null);
      setSuccessMessage(null);
      
      if (!formData.email || !formData.firstName || !formData.lastName) {
        setFormError('Please fill in all required fields');
        return;
      }

      await adminAPI.createCreator(formData);
      setSuccessMessage('Creator account created successfully!');
      setFormData({ email: '', firstName: '', lastName: '', phoneNumber: '', companyName: '' });
      setIsCreating(false);
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create creator');
    }
  };

  const handleVerify = async (creatorId: string) => {
    try {
      setActionLoading(creatorId);
      setActionError(null);
      await adminAPI.verifyCreator(creatorId);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to verify creator');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (creatorId: string) => {
    try {
      setActionLoading(creatorId);
      setActionError(null);
      await adminAPI.rejectCreator(creatorId, 'Rejected by admin');
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to reject creator');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (creatorId: string) => {
    try {
      setActionLoading(creatorId);
      setActionError(null);
      await adminAPI.suspendCreator(creatorId, 'Suspended by admin');
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to suspend creator');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (creatorId: string) => {
    if (!confirm('Are you sure you want to delete this creator? This action cannot be undone.')) return;
    try {
      setActionLoading(creatorId);
      setActionError(null);
      await adminAPI.deleteCreator(creatorId);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete creator');
    } finally {
      setActionLoading(null);
    }
  };

  const creators = data?.creators || [];
  const pagination = data?.pagination || {};

  const handleExport = () => {
    exportToCSV(
      `creators-${new Date().toISOString().slice(0, 10)}.csv`,
      creators.map((c: any) => ({
        Name: `${c.userId?.firstName || ""} ${c.userId?.lastName || ""}`.trim(),
        Email: c.userId?.email || "",
        Company: c.companyName || "",
        Verification: c.verification?.status || "",
        Rating: c.performance?.averageRating ?? 0,
        "Created At": c.createdAt ? new Date(c.createdAt).toISOString() : "",
      }))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Creators</h1>
          <p className="text-muted-foreground mt-1">Manage creator accounts and profiles</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Creator
        </button>
      </div>

      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4">
          <p className="text-green-500">{successMessage}</p>
        </div>
      )}

      {actionError && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-500">Error</p>
            <p className="text-sm text-red-500/80">{actionError}</p>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Create Creator Account</h2>
            
            {formError && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4">
                <p className="text-red-500 text-sm">{formError}</p>
              </div>
            )}

            <form onSubmit={handleCreateCreator} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Company Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 px-4 py-2 bg-card border border-border rounded-lg hover:bg-background"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search creators..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg"
          />
        </div>
        <select
          value={verification}
          onChange={(e) => {
            setVerification(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 bg-card border border-border rounded-lg"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
        <button
          onClick={() => refetch()}
          disabled={loading}
          className="p-2 hover:bg-card rounded-lg transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
        <button
          onClick={handleExport}
          disabled={creators.length === 0}
          className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-background flex items-center gap-2 disabled:opacity-50"
          title={creators.length === 0 ? "No creators to export" : "Export current results to CSV"}
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Loading State */}
      {loading && !data && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading creators...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-500">Error loading creators</p>
            <p className="text-sm text-red-500/80">{error}</p>
          </div>
        </div>
      )}

      {/* Table */}
      {data && (
        <>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Company</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Verification</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Rating</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {creators.length > 0 ? (
                  creators.map((creator: any) => (
                    <tr key={creator._id} className="hover:bg-background/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium">
                        {creator.userId?.firstName} {creator.userId?.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{creator.userId?.email}</td>
                      <td className="px-6 py-4 text-sm">{creator.companyName}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          creator.verification?.status === 'verified' 
                            ? 'bg-green-500/20 text-green-500' 
                            : creator.verification?.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : 'bg-red-500/20 text-red-500'
                        }`}>
                          {creator.verification?.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">{creator.performance?.averageRating?.toFixed(1) || 0}/5</td>
                      <td className="px-6 py-4 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to="/admin/creators/$id"
                            params={{ id: creator._id }}
                            className="p-2 hover:bg-primary/10 rounded transition-colors"
                            title="View profile"
                          >
                            <Eye className="w-4 h-4 text-primary" />
                          </Link>
                          {creator.verification?.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleVerify(creator._id)}
                                disabled={actionLoading === creator._id}
                                className="p-2 hover:bg-green-500/10 rounded transition-colors disabled:opacity-50"
                                title="Verify creator"
                              >
                                <Check className="w-4 h-4 text-green-500" />
                              </button>
                              <button
                                onClick={() => handleReject(creator._id)}
                                disabled={actionLoading === creator._id}
                                className="p-2 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                                title="Reject creator"
                              >
                                <X className="w-4 h-4 text-red-500" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleSuspend(creator._id)}
                            disabled={actionLoading === creator._id}
                            className="p-2 hover:bg-yellow-500/10 rounded transition-colors disabled:opacity-50"
                            title="Suspend creator"
                          >
                            <Lock className="w-4 h-4 text-yellow-500" />
                          </button>
                          <button
                            onClick={() => handleDelete(creator._id)}
                            disabled={actionLoading === creator._id}
                            className="p-2 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                            title="Delete creator"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No creators found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages && pagination.pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {creators.length} of {pagination.total} creators
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-background disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-4 py-2 rounded-lg ${
                      p === page
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border hover:bg-background'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-background disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
