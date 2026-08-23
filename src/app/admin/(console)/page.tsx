import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default function AdminPage({ searchParams }: { searchParams: Promise<{ range?: string; from?: string; to?: string }> }) {
  return <AdminDashboard searchParams={searchParams} />;
}
