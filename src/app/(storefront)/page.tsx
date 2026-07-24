import Link from "next/link";
import {
  ArrowRight,
  Headphones,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";
import { whatsappUrl } from "@/lib/format";
import { getFeaturedProducts } from "@/lib/data/products";
import { ProductCard } from "@/components/storefront/product-card";

// Cache the page; refreshes every 5 min and instantly when the owner edits
// products (admin actions call revalidatePath).
export const revalidate = 300;

const featurePlaceholders = [
  "from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900",
  "from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-900",
  "from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900",
  "from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900",
];

const valueProps = [
  { icon: ShieldCheck, title: "Premium quality", desc: "Clean-burning wax, pure oils and reliable wicks." },
  { icon: Truck, title: "Fast delivery", desc: "Quick dispatch for retail and bulk orders." },
  { icon: Headphones, title: "Maker support", desc: "Guidance on wax, wicks and fragrance ratios." },
];

export default async function HomePage() {
  const featured = await getFeaturedProducts(4);
  const waLink = siteConfig.whatsappNumber
    ? whatsappUrl(
        siteConfig.whatsappNumber,
        `Hi ${siteConfig.name}! I'd like to place an order.`,
      )
    : null;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_50%_0%,var(--accent),transparent_70%)] opacity-70" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center py-24 text-center sm:py-32">
            <span className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur">
              <Sparkles className="size-3.5" /> Premium candle-making supplies
            </span>
            <h1 className="mt-6 max-w-3xl text-balance font-heading text-4xl font-semibold tracking-tight sm:text-6xl">
              Everything you need to craft the perfect candle
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-lg text-muted-foreground">
              Wax, wicks, fragrance oils, jars and more — sourced for makers, at
              retail and wholesale. Add to cart and check out in seconds, or
              order directly on WhatsApp.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="h-11 rounded-full px-6 text-base"
                render={<Link href="/products" />}
              >
                Shop the collection <ArrowRight className="size-4" />
              </Button>
              {waLink && (
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 rounded-full px-6 text-base"
                  render={
                    <a href={waLink} target="_blank" rel="noopener noreferrer" />
                  }
                >
                  Order on WhatsApp
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6 lg:px-8">
          {valueProps.map((f) => (
            <div key={f.title} className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-background shadow-sm ring-1 ring-border">
                <f.icon className="size-5" />
              </div>
              <div>
                <div className="font-medium">{f.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured preview */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Featured
            </h2>
            <p className="mt-1 text-muted-foreground">
              {featured.length > 0
                ? "Handpicked favorites from the collection."
                : "Real products appear here once added in the dashboard."}
            </p>
          </div>
          <Button
            variant="ghost"
            className="hidden sm:inline-flex"
            render={<Link href="/products" />}
          >
            View all <ArrowRight className="size-4" />
          </Button>
        </div>
        {featured.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {featurePlaceholders.map((gradient, i) => (
              <div key={i} className="group">
                <div
                  className={`aspect-[4/5] w-full rounded-2xl bg-gradient-to-br ${gradient} transition-transform duration-300 group-hover:-translate-y-1`}
                />
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm font-medium text-muted-foreground">
                    Product name
                  </div>
                  <div className="text-sm text-muted-foreground">—</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground sm:px-16">
          <h2 className="mx-auto max-w-2xl text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready to start pouring?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-primary-foreground/80">
            Stock up on premium wax, wicks and fragrance — delivered fast, retail
            or wholesale.
          </p>
          <div className="mt-8 flex justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="h-11 rounded-full px-6 text-base"
              render={<Link href="/products" />}
            >
              Start shopping <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
