import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";

import { getAdminOrder } from "@/lib/data/admin";
import { formatPrice, whatsappUrl } from "@/lib/format";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Order" };

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) notFound();

  const hasPhone = order.customer_phone.replace(/\D/g, "").length > 0;
  const waLink = hasPhone
    ? whatsappUrl(
        order.customer_phone,
        `Hi ${order.customer_name}, regarding your order ${order.order_number} —`,
      )
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          render={<Link href="/admin/orders" />}
          aria-label="Back to orders"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-semibold">
            {order.order_number}
          </h1>
          <p className="text-sm text-muted-foreground">
            Placed {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border bg-card">
            <div className="border-b p-4 font-medium">Items</div>
            <ul className="divide-y">
              {order.items.map((it) => (
                <li
                  key={it.id}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <div>
                    <div className="font-medium">{it.product_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatPrice(Number(it.unit_price))} × {it.quantity}
                    </div>
                  </div>
                  <div className="font-medium tabular-nums">
                    {formatPrice(Number(it.unit_price) * it.quantity)}
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t p-4 font-semibold">
              <span>Total</span>
              <span className="tabular-nums">
                {formatPrice(Number(order.total))}
              </span>
            </div>
          </div>

          {order.note && (
            <div className="rounded-2xl border bg-card p-4">
              <div className="text-sm font-medium">Customer note</div>
              <p className="mt-1 text-sm text-muted-foreground">{order.note}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-3 rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <OrderStatusBadge status={order.status} />
            </div>
            <OrderStatusSelect id={order.id} status={order.status} />
            <p className="text-xs text-muted-foreground">
              Payment is handled manually — update the status as you confirm,
              take payment and ship.
            </p>
          </div>

          <div className="space-y-1.5 rounded-2xl border bg-card p-5 text-sm">
            <div className="font-medium">Customer</div>
            <div>{order.customer_name}</div>
            <div className="text-muted-foreground">{order.customer_phone}</div>
            {order.customer_email && (
              <div className="text-muted-foreground">{order.customer_email}</div>
            )}
            <div className="whitespace-pre-line pt-2 text-muted-foreground">
              {order.shipping_address}
            </div>
            {waLink && (
              <Button
                variant="outline"
                className="mt-3 w-full"
                render={
                  <a href={waLink} target="_blank" rel="noopener noreferrer" />
                }
              >
                <MessageCircle className="size-4" /> Message on WhatsApp
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
