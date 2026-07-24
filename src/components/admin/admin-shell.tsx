"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Menu,
  Package,
  ShoppingCart,
  Store,
  Tags,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { siteConfig } from "@/lib/site";
import { SignOutButton } from "./sign-out-button";

const nav = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { title: "Products", href: "/admin/products", icon: Package },
  { title: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { title: "Categories", href: "/admin/categories", icon: Tags },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 p-3">
      {nav.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="size-4" /> {item.title}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-muted/20">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r bg-card md:flex">
        <div className="flex h-16 items-center gap-2.5 border-b px-5">
          <Image
            src="/logo.jpeg"
            alt={siteConfig.name}
            width={32}
            height={32}
            className="size-8 rounded-md ring-1 ring-border"
          />
          <span className="font-heading text-lg font-semibold">
            {siteConfig.name}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>
        <div className="border-t p-3">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground"
            render={<Link href="/" target="_blank" />}
          >
            <Store className="size-4" /> View store
          </Button>
          <SignOutButton />
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-card/80 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label="Open menu"
                  />
                }
              >
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Image
                      src="/logo.jpeg"
                      alt=""
                      width={28}
                      height={28}
                      className="size-7 rounded-md"
                    />
                    {siteConfig.name}
                  </SheetTitle>
                </SheetHeader>
                <NavLinks onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
            <span className="font-heading font-semibold md:hidden">
              {siteConfig.name}
            </span>
          </div>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            Hi, {userName}
          </span>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
