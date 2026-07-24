import { CartView } from "@/components/storefront/cart-view";

export const metadata = { title: "Cart" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        Your cart
      </h1>
      <div className="mt-8">
        <CartView />
      </div>
    </div>
  );
}
