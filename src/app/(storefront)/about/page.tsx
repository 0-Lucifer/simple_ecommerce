import { ComingSoon } from "@/components/storefront/coming-soon";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <ComingSoon
      title="About the store"
      description="The store's story and contact details will live here."
    />
  );
}
