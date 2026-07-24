import Link from "next/link";
import { CheckCircle2, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";
import { whatsappUrl } from "@/lib/format";

export const metadata = { title: "Order confirmed" };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  const waLink =
    siteConfig.whatsappNumber && order
      ? whatsappUrl(
          siteConfig.whatsappNumber,
          `Hi ${siteConfig.name}! I just placed order ${order}. I'd like to confirm payment and delivery.`,
        )
      : null;

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-500">
        <CheckCircle2 className="size-8" />
      </div>
      <h1 className="mt-6 font-heading text-3xl font-semibold tracking-tight">
        Thank you for your order!
      </h1>
      {order && (
        <p className="mt-2 text-muted-foreground">
          Your order number is{" "}
          <span className="font-semibold text-foreground">{order}</span>
        </p>
      )}
      <p className="mt-4 max-w-md text-muted-foreground">
        We&apos;ve received your order and will contact you shortly to confirm
        payment and arrange delivery.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {waLink && (
          <Button
            className="h-11 rounded-full"
            render={<a href={waLink} target="_blank" rel="noopener noreferrer" />}
          >
            <MessageCircle className="size-4" /> Confirm on WhatsApp
          </Button>
        )}
        <Button
          variant="outline"
          className="h-11 rounded-full"
          render={<Link href="/products" />}
        >
          Continue shopping
        </Button>
      </div>
    </div>
  );
}
