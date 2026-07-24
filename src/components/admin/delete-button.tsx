"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function DeleteButton({
  action,
  id,
  label = "Delete",
  confirmText = "Are you sure? This can't be undone.",
}: {
  action: (id: string) => Promise<{ ok: boolean; error?: string }>;
  id: string;
  label?: string;
  confirmText?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!window.confirm(confirmText)) return;
    startTransition(async () => {
      const res = await action(id);
      if (res.ok) {
        toast.success("Deleted");
        router.refresh();
      } else {
        toast.error(res.error ?? "Could not delete");
      }
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      disabled={pending}
      aria-label={label}
      className="text-muted-foreground hover:text-destructive"
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
