import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/auth";
import { siteConfig } from "@/lib/site";
import { LoginForm } from "@/components/admin/login-form";

export const metadata = { title: "Owner login" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  if (await getAdminSession()) redirect("/admin");

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image
            src="/logo.jpeg"
            alt={siteConfig.name}
            width={56}
            height={56}
            className="size-14 rounded-xl ring-1 ring-border"
          />
          <h1 className="mt-4 font-heading text-2xl font-semibold">
            {siteConfig.name}
          </h1>
          <p className="text-sm text-muted-foreground">Owner dashboard</p>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          {error === "not-admin" && (
            <p className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              Please sign in with an owner (admin) account.
            </p>
          )}
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            ← Back to store
          </Link>
        </p>
      </div>
    </div>
  );
}
