import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Filter, RefreshCw, AlertCircle } from "lucide-react";
import { useProjects } from "@/hooks/useAdminAPI";
import { adminAPI } from "@/services/api";

export const Route = createFileRoute("/admin/projects/")({
  component: ProjectManagement,
});

const PROJECT_STATUSES = [
  'enquiry',
  'requirements',
  'review',
  'quoted',
  'approved',
  'active',
  'completed',
  'archived'
];

function ProjectManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, loading, error, refetch } = useProjects({
    page,
    limit: 10,
    ...(search ? { search } : {}),
    ...(status ? { status } : {}),
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    try {
      setActionLoading(projectId);
      setActionError(null);
      await adminAPI.updateProjectStatus(
        projectId,
        newStatus as any
      );
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update project status');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      enquiry: 'bg-gray-500/20 text-gray-500',
      requirements: 'bg-blue-500/20 text-blue-500',
      review: 'bg-yellow-500/20 text-yellow-500',
      quoted: 'bg-purple-500/20 text-purple-500',
      approved: 'bg-cyan-500/20 text-cyan-500',
      active: 'bg-green-500/20 text-green-500',
      completed: 'bg-emerald-500/20 text-emerald-500',
      archived: 'bg-slate-500/20 text-slate-500',
    };
    return colors[status] ?? 'bg-gray-500/20 text-gray-500';
  };

  const projects = data?.projects || [];
  const pagination = data?.pagination || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage all platform projects</p>
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
            placeholder="Search projects..."
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
          <option value="">All Statuses</option>
          {PROJECT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <button
          onClick={() => refetch()}
          disabled={loading}
          className="p-2 hover:bg-card rounded-lg transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Loading State */}
      {loading && !data && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-500">Error loading projects</p>
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
                  <th className="px-6 py-3 text-left text-sm font-semibold">Project Code</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Client</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Creator</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Budget</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projects.length > 0 ? (
                  projects.map((project: any) => (
                    <tr key={project._id} className="hover:bg-background/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium">{project.projectCode}</td>
                      <td className="px-6 py-4 text-sm">
                        <p className="font-medium">{project.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{project.description}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {project.clientId?.firstName} {project.clientId?.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {project.creatorId?.firstName} {project.creatorId?.lastName || 'Not Assigned'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        ${project.budget?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <select
                          value={project.status}
                          onChange={(e) => handleStatusChange(project._id, e.target.value)}
                          disabled={actionLoading === project._id}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)} bg-transparent border-0 cursor-pointer disabled:opacity-50`}
                        >
                          {PROJECT_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-background rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${project.execution?.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-xs">{project.execution?.progress || 0}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      No projects found
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
                Showing {projects.length} of {pagination.total} projects
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
