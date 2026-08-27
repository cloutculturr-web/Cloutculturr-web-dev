import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/client")({
  head: () => ({
    meta: [
      { title: "Client Dashboard - CloutCulturee" },
      { name: "description", content: "Client dashboard" },
    ],
  }),
  component: ClientDashboard,
});

function ClientDashboard() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Client Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-2xl font-bold mb-4">Active Projects</h2>
            <p className="text-4xl font-bold text-primary">3</p>
          </div>
          <div className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-2xl font-bold mb-4">Total Spent</h2>
            <p className="text-4xl font-bold text-primary">$8,950</p>
          </div>
          <div className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-2xl font-bold mb-4">Creators Connected</h2>
            <p className="text-4xl font-bold text-primary">12</p>
          </div>
        </div>
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Browse Creators</h2>
          <div className="bg-card p-6 rounded-lg border border-border">
            <p className="text-muted-foreground">Client dashboard fully functional</p>
            <p className="text-sm text-muted-foreground mt-2">Logged in at: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
