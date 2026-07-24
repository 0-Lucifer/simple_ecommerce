"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";
import { updateOrderStatus } from "@/lib/actions/orders";

export function OrderStatusSelect({
  id,
  status,
}: {
  id: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as OrderStatus;
    startTransition(async () => {
      const res = await updateOrderStatus(id, next);
      if (res.ok) {
        toast.success("Status updated");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <select
      value={status}
      onChange={onChange}
      disabled={pending}
      className="h-9 rounded-md border border-input bg-background px-3 text-sm capitalize outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-60"
    >
      {ORDER_STATUSES.map((s) => (
        <option key={s} value={s} className="capitalize">
          {s}
        </option>
      ))}
    </select>
  );
}
