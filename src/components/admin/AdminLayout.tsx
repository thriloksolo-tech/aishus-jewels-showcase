import { useAuth } from '@/lib/auth-context';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate({ to: '/admin/login' });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-gray-800 text-white transition-all duration-300`}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold">Aishus Admin</h2>
        </div>
        <nav className="space-y-2 px-4">
          <NavLink href="/admin/dashboard" label="Dashboard" />
          <NavLink href="/admin/products" label="Products" />
          <NavLink href="/admin/orders" label="Orders" />
          <NavLink href="/admin/customers" label="Customers" />
          <NavLink href="/admin/settings" label="Settings" />
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{admin?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
};

const NavLink = ({ href, label }: { href: string; label: string }) => (
  <a
    href={href}
    className="block px-4 py-2 rounded hover:bg-gray-700 transition-colors"
  >
    {label}
  </a>
);