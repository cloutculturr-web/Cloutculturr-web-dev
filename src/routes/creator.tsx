import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Briefcase,
  UserCircle,
  Image,
  Package,
  Wallet,
  Bell,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/creator")({
  head: () => ({
    meta: [
      { title: "Creator Dashboard - Cloutculturr" },
      { name: "description", content: "Your Cloutculturr creator workspace" },
    ],
  }),
  component: CreatorLayout,
});

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

// Only sections with real, working functionality are listed here — no dead
// links for Opportunities/Milestones/Deliverables/Meetings/Agreements/Reviews,
// which don't exist in the backend yet (see the project roadmap).
const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", path: "/creator", icon: <LayoutDashboard className="w-5 h-5" /> }],
  },
  {
    label: "Work",
    items: [{ label: "My Projects", path: "/creator/projects", icon: <Briefcase className="w-5 h-5" /> }],
  },
  {
    label: "Profile",
    items: [
      { label: "My Profile", path: "/creator/profile", icon: <UserCircle className="w-5 h-5" /> },
      { label: "Portfolio", path: "/creator/portfolio", icon: <Image className="w-5 h-5" /> },
      { label: "Services", path: "/creator/services", icon: <Package className="w-5 h-5" /> },
    ],
  },
  {
    label: "Finance",
    items: [{ label: "Earnings", path: "/creator/earnings", icon: <Wallet className="w-5 h-5" /> }],
  },
  {
    label: "Communication",
    items: [{ label: "Notifications", path: "/creator/notifications", icon: <Bell className="w-5 h-5" /> }],
  },
];

function CreatorLayout() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  const currentPath = routerState.location.pathname;

  useEffect(() => {
    if (user.role !== "creator") {
      // A hard redirect, not router navigate() — client-side navigate() can
      // race with TanStack Router's own hydration and get silently discarded
      // (the same issue solved in services/api.ts's session-expiry redirect).
      window.location.href = "/login";
    }
  }, [user.role]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen bg-card border-r border-border transition-all duration-300 z-40",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Logo */}
        <div className="h-16 border-b border-border flex items-center justify-between px-4">
          {sidebarOpen && (
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-brand-gradient bg-clip-text text-transparent">
              Cloutculturr
            </h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-background rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-5 overflow-y-auto h-[calc(100vh-16rem)]">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              {sidebarOpen && (
                <p className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                const isActive =
                  item.path === "/creator"
                    ? currentPath === "/creator" || currentPath === "/creator/"
                    : currentPath.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path as any}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-background hover:text-foreground"
                    )}
                    title={!sidebarOpen ? item.label : ""}
                  >
                    {item.icon}
                    {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4 bg-card">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.firstName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-background rounded-lg transition-colors text-muted-foreground hover:text-destructive"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn("transition-all duration-300", sidebarOpen ? "ml-64" : "ml-20")}>
        {/* Top Bar */}
        <div className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
          <div className="h-full px-8 flex items-center justify-between">
            <div />
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-brand-gradient flex items-center justify-center text-primary-foreground font-bold">
                {user.firstName?.[0] ?? "C"}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
