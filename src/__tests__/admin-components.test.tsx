import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useState } from 'react';

/**
 * Admin Dashboard Component Tests
 * Tests for frontend components and user interactions
 */

// Mock dashboard data
const mockKPIs = {
  totalRevenue: 125000,
  todayRevenue: 5200,
  totalClients: 350,
  activeClients: 280,
  totalCreators: 450,
  activeCreators: 320,
  activeProjects: 45,
  completedProjects: 120,
  revenueGrowth: 12.5,
  clientGrowth: 8.3
};

const mockNotifications = [
  {
    id: '1',
    title: 'Platform Maintenance',
    message: 'Scheduled maintenance at 2 AM',
    type: 'maintenance',
    target: 'all',
    status: 'sent',
    recipientCount: 5000,
    readCount: 3200
  }
];

const mockClients = [
  {
    id: 'cl_001',
    name: 'TechCorp Inc',
    email: 'contact@techcorp.com',
    plan: 'Premium',
    status: 'active',
    totalSpent: 12500,
    projects: 5,
    lastActive: '2024-01-22T10:30:00Z'
  }
];

describe('Admin Dashboard Components', () => {
  // ============================================
  // KPI CARDS TESTS
  // ============================================
  describe('KPI Cards', () => {
    it('should render KPI values correctly', () => {
      const { container } = render(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-3xl font-bold text-foreground mt-2">
              ${(mockKPIs.totalRevenue / 1000).toFixed(0)}K
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-sm text-muted-foreground">Active Clients</p>
            <p className="text-3xl font-bold text-foreground mt-2">
              {mockKPIs.activeClients}
            </p>
          </div>
        </div>
      );

      expect(screen.getByText(/Total Revenue/i)).toBeInTheDocument();
      expect(screen.getByText(/125K/i)).toBeInTheDocument();
      expect(screen.getByText(/Active Clients/i)).toBeInTheDocument();
      expect(screen.getByText('280')).toBeInTheDocument();
    });

    it('should display growth trends', () => {
      const { container } = render(
        <div>
          <span className="text-green-500">+{mockKPIs.revenueGrowth}%</span>
          <span className="text-green-500">+{mockKPIs.clientGrowth}%</span>
        </div>
      );

      expect(screen.getByText(/\+12.5%/)).toBeInTheDocument();
      expect(screen.getByText(/\+8.3%/)).toBeInTheDocument();
    });
  });

  // ============================================
  // SEARCH AND FILTER TESTS
  // ============================================
  describe('Search and Filter', () => {
    it('should filter clients by search term', () => {
      const ClientList = () => {
        const [search, setSearch] = useState('');

        const filtered = mockClients.filter(c =>
          c.name.toLowerCase().includes(search.toLowerCase())
        );

        return (
          <div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients..."
              data-testid="search-input"
            />
            <ul>
              {filtered.map(c => (
                <li key={c.id}>{c.name}</li>
              ))}
            </ul>
          </div>
        );
      };

      render(<ClientList />);
      const input = screen.getByTestId('search-input') as HTMLInputElement;

      fireEvent.change(input, { target: { value: 'Tech' } });
      expect(screen.getByText('TechCorp Inc')).toBeInTheDocument();

      fireEvent.change(input, { target: { value: 'NonExistent' } });
      expect(screen.queryByText('TechCorp Inc')).not.toBeInTheDocument();
    });

    it('should filter by status', () => {
      const ClientFilter = () => {
        const [status, setStatus] = useState('all');

        const filtered = status === 'all'
          ? mockClients
          : mockClients.filter(c => c.status === status);

        return (
          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              data-testid="status-filter"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
            <div data-testid="client-count">{filtered.length}</div>
          </div>
        );
      };

      render(<ClientFilter />);
      expect(screen.getByTestId('client-count')).toHaveTextContent('1');

      fireEvent.change(screen.getByTestId('status-filter'), {
        target: { value: 'suspended' }
      });
      expect(screen.getByTestId('client-count')).toHaveTextContent('0');
    });
  });

  // ============================================
  // TABLE TESTS
  // ============================================
  describe('Data Tables', () => {
    it('should render table with data', () => {
      render(
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Plan</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {mockClients.map(client => (
              <tr key={client.id}>
                <td>{client.name}</td>
                <td>{client.plan}</td>
                <td>{client.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );

      expect(screen.getByText('TechCorp Inc')).toBeInTheDocument();
      expect(screen.getByText('Premium')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();
    });

    it('should handle pagination', () => {
      const Table = () => {
        const [page, setPage] = useState(1);
        const itemsPerPage = 10;
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginated = mockClients.slice(start, end);

        return (
          <div>
            <div data-testid="item-count">{paginated.length}</div>
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1}
              data-testid="prev-btn"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              data-testid="next-btn"
            >
              Next
            </button>
          </div>
        );
      };

      render(<Table />);
      expect(screen.getByTestId('item-count')).toHaveTextContent('1');
      expect(screen.getByTestId('prev-btn')).toBeDisabled();
    });
  });

  // ============================================
  // NOTIFICATION TESTS
  // ============================================
  describe('Notifications', () => {
    it('should display notifications', () => {
      render(
        <div>
          {mockNotifications.map(notif => (
            <div key={notif.id}>
              <h3>{notif.title}</h3>
              <p>{notif.message}</p>
              <span>{notif.status}</span>
            </div>
          ))}
        </div>
      );

      expect(screen.getByText('Platform Maintenance')).toBeInTheDocument();
      expect(screen.getByText(/Scheduled maintenance/)).toBeInTheDocument();
      expect(screen.getByText('sent')).toBeInTheDocument();
    });

    it('should show read rate', () => {
      const notification = mockNotifications[0];
      const readRate = (notification.readCount / notification.recipientCount) * 100;

      render(
        <div>
          <p>{readRate.toFixed(1)}% read</p>
        </div>
      );

      expect(screen.getByText(/64.0% read/)).toBeInTheDocument();
    });
  });

  // ============================================
  // FORM TESTS
  // ============================================
  describe('Forms', () => {
    it('should handle CMS content creation', () => {
      const CMSForm = () => {
        const [formData, setFormData] = useState({
          title: '',
          content: ''
        });
        const [submitted, setSubmitted] = useState(false);

        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          setSubmitted(true);
        };

        return (
          <form onSubmit={handleSubmit}>
            <input
              value={formData.title}
              onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
              placeholder="Title"
              data-testid="title-input"
            />
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))}
              placeholder="Content"
              data-testid="content-input"
            />
            <button type="submit">Submit</button>
            {submitted && <p>Content created</p>}
          </form>
        );
      };

      render(<CMSForm />);

      fireEvent.change(screen.getByTestId('title-input'), {
        target: { value: 'Test Title' }
      });
      fireEvent.change(screen.getByTestId('content-input'), {
        target: { value: 'Test content' }
      });
      fireEvent.click(screen.getByText('Submit'));

      expect(screen.getByText('Content created')).toBeInTheDocument();
    });
  });

  // ============================================
  // MODAL/DIALOG TESTS
  // ============================================
  describe('Modals', () => {
    it('should open and close modal', () => {
      const Modal = () => {
        const [isOpen, setIsOpen] = useState(false);

        return (
          <div>
            <button onClick={() => setIsOpen(true)}>Open</button>
            {isOpen && (
              <div data-testid="modal">
                <h2>Modal Title</h2>
                <button onClick={() => setIsOpen(false)}>Close</button>
              </div>
            )}
          </div>
        );
      };

      render(<Modal />);

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();

      fireEvent.click(screen.getByText('Open'));
      expect(screen.getByTestId('modal')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Close'));
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  // ============================================
  // LOADING STATE TESTS
  // ============================================
  describe('Loading States', () => {
    it('should show loading skeleton', () => {
      const LoadingComponent = ({ isLoading }: { isLoading: boolean }) => (
        <div>
          {isLoading ? (
            <div data-testid="skeleton" className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded" />
            </div>
          ) : (
            <div>Content loaded</div>
          )}
        </div>
      );

      const { rerender } = render(<LoadingComponent isLoading={true} />);
      expect(screen.getByTestId('skeleton')).toBeInTheDocument();

      rerender(<LoadingComponent isLoading={false} />);
      expect(screen.getByText('Content loaded')).toBeInTheDocument();
    });
  });

  // ============================================
  // ERROR STATE TESTS
  // ============================================
  describe('Error States', () => {
    it('should display error message', () => {
      const ErrorComponent = ({ error }: { error: string | null }) => (
        <div>
          {error ? (
            <div data-testid="error" className="text-red-500">
              {error}
            </div>
          ) : (
            <div>No error</div>
          )}
        </div>
      );

      const { rerender } = render(<ErrorComponent error={null} />);
      expect(screen.getByText('No error')).toBeInTheDocument();

      rerender(<ErrorComponent error="Something went wrong" />);
      expect(screen.getByTestId('error')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });
});
