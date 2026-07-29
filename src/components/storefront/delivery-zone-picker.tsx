"use client";

import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import {
  DELIVERY_ZONES,
  DELIVERY_ZONE_LABELS,
  calculateDeliveryCharge,
  type DeliveryZone,
} from "@/lib/delivery";

/**
 * Inside/Outside Dhaka toggle. Each option previews what it would cost for the
 * current cart weight, so the customer can see the difference before choosing.
 */
export function DeliveryZonePicker({
  value,
  onChange,
  weightKg,
  className,
}: {
  value: DeliveryZone;
  onChange: (zone: DeliveryZone) => void;
  weightKg: number;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      {DELIVERY_ZONES.map((zone) => {
        const active = zone === value;
        return (
          <button
            key={zone}
            type="button"
            onClick={() => onChange(zone)}
            aria-pressed={active}
            className={cn(
              "rounded-xl border px-3 py-2 text-left transition",
              active
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "hover:bg-muted",
            )}
          >
            <span className="block text-sm font-medium">
              {DELIVERY_ZONE_LABELS[zone]}
            </span>
            <span className="block text-xs text-muted-foreground tabular-nums">
              {formatPrice(calculateDeliveryCharge(weightKg, zone))}
            </span>
          </button>
        );
      })}
    </div>
  );
}
