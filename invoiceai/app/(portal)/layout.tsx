export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-4">
          <span className="font-heading text-lg font-bold text-brand-600">
            InvoiceAI
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
      <footer className="border-t border-[var(--border)] bg-[var(--card)] py-4">
        <div className="mx-auto max-w-3xl px-4 text-center text-xs text-[var(--muted-foreground)]">
          Powered by InvoiceAI &middot; Secure payments via Stripe
        </div>
      </footer>
    </div>
  );
}
