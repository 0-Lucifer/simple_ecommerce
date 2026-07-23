export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <section className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center px-4 py-24 text-center">
      <span className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
        Coming soon
      </span>
      <h1 className="mt-6 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="mt-3 max-w-md text-muted-foreground">{description}</p>
      )}
    </section>
  );
}
