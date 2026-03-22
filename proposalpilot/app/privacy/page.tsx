import Link from 'next/link';

export const dynamic = 'force-static';

export const metadata = { title: 'Privacy Policy | ProposalPilot' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: March 2026</p>
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
            <p className="text-muted-foreground">We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This includes your name, email address, and any other information you choose to provide.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
            <p className="text-muted-foreground">We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices, and respond to your comments and questions.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-3">3. Information Sharing</h2>
            <p className="text-muted-foreground">We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our platform, subject to confidentiality agreements.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
            <p className="text-muted-foreground">We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
            <p className="text-muted-foreground">You have the right to access, correct, or delete your personal information. You may also object to or restrict certain processing of your data. To exercise these rights, please contact us at privacy@proposalpilot.com.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-3">6. Cookies</h2>
            <p className="text-muted-foreground">We use cookies and similar tracking technologies to track activity on our service and hold certain information to improve your experience.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-3">7. Contact Us</h2>
            <p className="text-muted-foreground">If you have questions about this Privacy Policy, please contact us at <a href="mailto:privacy@proposalpilot.com" className="text-primary hover:underline">privacy@proposalpilot.com</a>.</p>
          </section>
        </div>
        <div className="mt-12 pt-8 border-t border-border">
          <Link href="/" className="text-primary hover:underline text-sm">← Back to Home</Link>
          <span className="text-muted-foreground mx-3">·</span>
          <Link href="/terms" className="text-primary hover:underline text-sm">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
}
