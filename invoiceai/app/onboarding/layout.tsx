export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const steps = ['Business Type', 'Business Info', 'Invoice Defaults', 'First Client', 'Payments'];

  return (
    <div className="min-h-screen bg-surface-secondary flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-2xl font-bold text-brand-600">InvoiceAI</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">Let's get you set up</p>
      </div>
      <div className="mb-6 flex items-center gap-2">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted-foreground)] font-medium">{step}</span>
            {i < steps.length - 1 && <span className="text-[var(--muted-foreground)] text-xs">›</span>}
          </div>
        ))}
      </div>
      <div className="w-full max-w-lg">{children}</div>
    </div>
  );
}
