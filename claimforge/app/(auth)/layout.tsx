import { Shield } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-root p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="legal-heading text-2xl text-text-primary">ClaimForge</span>
          </div>
          <p className="mt-2 text-sm text-text-secondary">False Claims Act Intelligence Platform</p>
        </div>
        {children}
      </div>
    </div>
  );
}
