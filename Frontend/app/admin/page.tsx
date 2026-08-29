import type { Metadata } from 'next';
import AdminDashboard from './admin-dashboard';

export const metadata: Metadata = {
  title: 'Panel de confirmaciones | Graduación de Adela',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminDashboard />;
}
