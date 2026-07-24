import Link from "next/link";
import { ArrowRight, Banknote, Clock, Package, ShoppingCart } from "lucide-react";

import { getAdminOrders, getDashboardStats } from "@/lib/data/admin";
import { formatPrice } from "@/lib/format";
import { StatCard } from "@/components/admin/stat-card";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Dashboard" };

export default async function AdminHome() {
  const [stats, orders] = await Promise.all([
    getDashboardStats(),
    getAdminOrders(),
  ]);
  const recent = orders.slice(0, 6);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">A quick look at your store.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Package} label="Products" value={stats.productCount} />
        <StatCard icon={ShoppingCart} label="Orders" value={stats.orderCount} />
        <StatCard icon={Clock} label="Pending orders" value={stats.pendingCount} />
        <StatCard
          icon={Banknote}
          label="Revenue (paid)"
          value={formatPrice(stats.revenue)}
        />
      </div>

      <div className="rounded-2xl border bg-card">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-medium">Recent orders</h2>
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/admin/orders" />}
          >
            View all <ArrowRight className="size-4" />
          </Button>
        </div>
        {recent.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No orders yet.
          </div>
        ) : (
          <ul className="divide-y">
            {recent.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/admin/orders/${o.id}`}
                  className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <div className="font-medium">{o.order_number}</div>
                    <div className="truncate text-sm text-muted-foreground">
                      {o.customer_name}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium tabular-nums">
                      {formatPrice(Number(o.total))}
                    </span>
                    <OrderStatusBadge status={o.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
