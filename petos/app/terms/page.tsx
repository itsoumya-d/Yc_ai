import Link from 'next/link';

export const dynamic = 'force-static';

export const metadata = { title: 'Terms of Service | Petos' };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: March 2026</p>
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">By accessing or using Petos, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-3">2. Use of Service</h2>
            <p className="text-muted-foreground">You may use Petos only for lawful purposes and in accordance with these Terms. You agree not to use Petos in any way that violates any applicable federal, state, local, or international law or regulation.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-3">3. Account Registration</h2>
            <p className="text-muted-foreground">To access certain features, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-3">4. Intellectual Property</h2>
            <p className="text-muted-foreground">Petos and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-3">5. Limitation of Liability</h2>
            <p className="text-muted-foreground">To the fullest extent permitted by law, Petos shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-3">6. Termination</h2>
            <p className="text-muted-foreground">We may terminate or suspend your account at any time, without prior notice or liability, for any reason, including if you breach these Terms.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-3">7. Changes to Terms</h2>
            <p className="text-muted-foreground">We reserve the right to modify these terms at any time. We will notify you of significant changes by posting a notice on our platform or sending you an email.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-3">8. Contact</h2>
            <p className="text-muted-foreground">For questions about these Terms, contact us at <a href="mailto:legal@petos.com" className="text-primary hover:underline">legal@petos.com</a>.</p>
          </section>
        </div>
        <div className="mt-12 pt-8 border-t border-border">
          <Link href="/" className="text-primary hover:underline text-sm">← Back to Home</Link>
          <span className="text-muted-foreground mx-3">·</span>
          <Link href="/privacy" className="text-primary hover:underline text-sm">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
