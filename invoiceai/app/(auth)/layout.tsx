
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-secondary px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-2xl font-bold text-brand-600">
            InvoiceAI
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Get paid faster with AI-powered invoicing
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
