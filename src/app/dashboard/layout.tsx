import Sidebar from '@/components/Sidebar';
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar />
      <main className="pl-64"><div className="p-8">{children}</div></main>
    </div>
  );
}