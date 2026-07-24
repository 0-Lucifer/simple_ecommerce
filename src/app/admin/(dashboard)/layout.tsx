import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata = {
  title: { default: "Dashboard", template: "%s · Dashboard" },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireAdmin();
  return (
    <AdminShell userName={profile.full_name ?? "Owner"}>{children}</AdminShell>
  );
}
