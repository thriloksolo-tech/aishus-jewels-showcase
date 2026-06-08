import { useAuth } from '@/lib/auth-context';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';

export const Route = {
  component: AdminDashboard,
};

function AdminDashboard() {
  const { loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your jewels showcase</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <DashboardCard title="Total Products" value="0" />
            <DashboardCard title="Total Orders" value="0" />
            <DashboardCard title="Total Revenue" value="$0" />
            <DashboardCard title="Active Users" value="0" />
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

const DashboardCard = ({ title, value }: { title: string; value: string }) => (
  <div className="bg-white p-6 rounded-lg border">
    <p className="text-gray-600 text-sm">{title}</p>
    <p className="text-2xl font-bold mt-2">{value}</p>
  </div>
);