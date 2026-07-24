import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="font-heading text-lg font-semibold tracking-tight">
              {siteConfig.name}
            </div>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>
          <div>
            <div className="text-sm font-medium">Shop</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {siteConfig.nav.map((i) => (
                <li key={i.href}>
                  <Link href={i.href} className="transition-colors hover:text-foreground">
                    {i.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-sm font-medium">Support</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/cart" className="transition-colors hover:text-foreground">
                  Cart
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition-colors hover:text-foreground">
                  About
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p>Made with care.</p>
        </div>
      </div>
    </footer>
  );
}
