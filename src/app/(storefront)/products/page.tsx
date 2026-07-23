import { ComingSoon } from "@/components/storefront/coming-soon";

export const metadata = { title: "Shop" };

export default function ProductsPage() {
  return (
    <ComingSoon
      title="The shop is being stocked"
      description="Product catalog with filtering and search is coming in the next phase, powered by the owner dashboard."
    />
  );
}
