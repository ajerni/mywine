export function PageHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-10 text-center">
      <h1 className="font-display text-3xl font-semibold text-balance sm:text-5xl">{title}</h1>
      {description && (
        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg text-pretty">
          {description}
        </p>
      )}
    </header>
  );
}
