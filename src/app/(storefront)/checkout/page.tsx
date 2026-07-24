import { CheckoutForm } from "@/components/storefront/checkout-form";

export const metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        Checkout
      </h1>
      <p className="mt-1 text-muted-foreground">
        Enter your details and we&apos;ll take care of the rest.
      </p>
      <div className="mt-8">
        <CheckoutForm />
      </div>
    </div>
  );
}
