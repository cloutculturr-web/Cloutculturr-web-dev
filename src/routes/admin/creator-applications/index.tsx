import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, RefreshCw, AlertCircle, ArrowRight } from "lucide-react";
import { useCreatorApplications } from "@/hooks/useAdminAPI";

export const Route = createFileRoute("/admin/creator-applications/")({
  component: CreatorApplicationsList,
});

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-500",
  under_review: "bg-blue-500/20 text-blue-500",
  approved: "bg-green-500/20 text-green-500",
  rejected: "bg-red-500/20 text-red-500",
  changes_requested: "bg-orange-500/20 text-orange-500",
};

function CreatorApplicationsList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const { data, loading, error, refetch } = useCreatorApplications({
    page,
    limit: 10,
    ...(search ? { search } : {}),
    ...(status ? { status } : {}),
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const applications = data?.applications || [];
  const pagination = data?.pagination || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Creator Applications</h1>
        <p className="text-muted-foreground mt-1">Review and process new creator applications</p>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search applicants..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 bg-card border border-border rounded-lg"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="changes_requested">Changes Requested</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button
          onClick={() => refetch()}
          disabled={loading}
          className="p-2 hover:bg-card rounded-lg transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading && !data && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-500">Error loading applications</p>
            <p className="text-sm text-red-500/80">{error}</p>
          </div>
        </div>
      )}

      {data && (
        <>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Brand</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Submitted</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {applications.length > 0 ? (
                  applications.map((app: any) => (
                    <tr key={app._id} className="hover:bg-background/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium">
                        {app.firstName} {app.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{app.email}</td>
                      <td className="px-6 py-4 text-sm">{app.companyName}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[app.status] || ""}`}>
                          {app.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <Link
                          to="/admin/creator-applications/$id"
                          params={{ id: app._id }}
                          className="inline-flex items-center gap-1 text-primary hover:text-primary/80 font-medium"
                        >
                          Review <ArrowRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No creator applications yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pagination.pages && pagination.pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {applications.length} of {pagination.total} applications
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-background disabled:opacity-50"
                >
                  Previous
                </button>
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
