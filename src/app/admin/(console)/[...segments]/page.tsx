import { AdminModulePage } from "@/components/admin/admin-module-page";

export default async function AdminModuleRoute({ params }: { params: Promise<{ segments: string[] }> }) {
  const { segments } = await params;
  return <AdminModulePage pathname={`/admin/${segments.join("/")}`} />;
}
