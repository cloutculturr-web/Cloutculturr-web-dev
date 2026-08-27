import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Download, RefreshCw, Trash2, Lock, Unlock, AlertCircle } from "lucide-react";
import { useClients, useCreators } from "@/hooks/useAdminAPI";
import { adminAPI } from "@/services/api";
import { exportToCSV } from "@/lib/csvExport";

export const Route = createFileRoute("/admin/clients/")({
  component: ClientManagement,
});

function ClientManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [membership, setMembership] = useState("");
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, loading, error, refetch } = useClients({
    page,
    limit: 10,
    ...(search ? { search } : {}),
    ...(membership ? { membership } : {}),
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const handleSuspend = async (clientId: string) => {
    try {
      setActionLoading(clientId);
      setActionError(null);
      await adminAPI.suspendClient(clientId, 'Suspended by admin');
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to suspend client');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivate = async (clientId: string) => {
    try {
      setActionLoading(clientId);
      setActionError(null);
      await adminAPI.reactivateClient(clientId);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to reactivate client');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client? This action cannot be undone.')) return;
    try {
      setActionLoading(clientId);
      setActionError(null);
      await adminAPI.deleteClient(clientId);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete client');
    } finally {
      setActionLoading(null);
    }
  };

  const clients = data?.clients || [];
  const pagination = data?.pagination || {};

  const handleExport = () => {
    exportToCSV(
      `clients-${new Date().toISOString().slice(0, 10)}.csv`,
      clients.map((c: any) => ({
        Name: `${c.userId?.firstName || ""} ${c.userId?.lastName || ""}`.trim(),
        Email: c.userId?.email || "",
        Company: c.companyName || "",
        Membership: c.membership?.status || "",
        Status: c.userId?.status || "",
        "Created At": c.createdAt ? new Date(c.createdAt).toISOString() : "",
      }))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground mt-1">Manage all registered clients</p>
        </div>
      </div>

      {actionError && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-500">Error</p>
            <p className="text-sm text-red-500/80">{actionError}</p>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg"
          />
        </div>
        <select
          value={membership}
          onChange={(e) => {
            setMembership(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 bg-card border border-border rounded-lg"
        >
          <option value="">All Memberships</option>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
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
          disabled={clients.length === 0}
          className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-background flex items-center gap-2 disabled:opacity-50"
          title={clients.length === 0 ? "No clients to export" : "Export current results to CSV"}
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Loading State */}
      {loading && !data && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading clients...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-500">Error loading clients</p>
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
                  <th className="px-6 py-3 text-left text-sm font-semibold">Membership</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {clients.length > 0 ? (
                  clients.map((client: any) => (
                    <tr key={client._id} className="hover:bg-background/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium">
                        {client.userId?.firstName} {client.userId?.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{client.userId?.email}</td>
                      <td className="px-6 py-4 text-sm">{client.companyName}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          client.membership?.status === 'premium' 
                            ? 'bg-purple-500/20 text-purple-500' 
                            : 'bg-blue-500/20 text-blue-500'
                        }`}>
                          {client.membership?.status || 'free'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          client.userId?.status === 'active'
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-red-500/20 text-red-500'
                        }`}>
                          {client.userId?.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          {client.userId?.status === 'active' ? (
                            <button
                              onClick={() => handleSuspend(client._id)}
                              disabled={actionLoading === client._id}
                              className="p-2 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                              title="Suspend client"
                            >
                              <Lock className="w-4 h-4 text-red-500" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivate(client._id)}
                              disabled={actionLoading === client._id}
                              className="p-2 hover:bg-green-500/10 rounded transition-colors disabled:opacity-50"
                              title="Reactivate client"
                            >
                              <Unlock className="w-4 h-4 text-green-500" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(client._id)}
                            disabled={actionLoading === client._id}
                            className="p-2 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                            title="Delete client"
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
                      No clients found
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
                Showing {clients.length} of {pagination.total} clients
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
