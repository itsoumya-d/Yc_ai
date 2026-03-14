import Link from "next/link";
import { ArrowRight, Brain, Target, BookOpen, Check } from "lucide-react";

const pricingPlans = [
  { name: "Free", price: "$0", period: "forever", description: "Get started with basic career exploration.", features: ["Skills assessment (10 questions)", "Up to 3 career matches", "Basic learning resources", "Community access"], cta: "Get Started", href: "/signup", highlighted: false },
  { name: "Navigator", price: "$29", period: "per month", description: "Everything you need for a focused career transition.", features: ["Full skills assessment + resume upload", "Unlimited career matches", "AI-powered learning plans", "Job matching and alerts", "Priority support"], cta: "Start Free Trial", href: "/signup?plan=navigator", highlighted: true },
  { name: "Pro", price: "$99", period: "per month", description: "For teams and career coaches at scale.", features: ["Everything in Navigator", "Up to 10 team members", "Coach dashboard and analytics", "White-label reports", "Dedicated account manager", "API access"], cta: "Contact Sales", href: "/signup?plan=pro", highlighted: false },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <nav className="border-b px-6 py-4 flex items-center justify-between" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: "var(--primary)" }}>S</div>
          <span className="font-bold text-lg" style={{ color: "var(--foreground)" }}>SkillBridge</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>Sign In</Link>
          <Link href="/signup" className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "var(--primary)" }}>Get Started Free</Link>
        </div>
      </nav>
      <section className="px-6 py-24 text-center max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold leading-tight mb-6" style={{ color: "var(--foreground)" }}>
          Find your path to a{" "}
          <span style={{ background: "linear-gradient(135deg, #0d9488, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            career you love
          </span>
        </h1>
        <p className="text-xl max-w-2xl mx-auto mb-10" style={{ color: "var(--muted-foreground)" }}>
          SkillBridge helps displaced workers discover transferable skills, explore new careers, and get a personalized plan to get there in weeks, not years.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-lg" style={{ background: "linear-gradient(135deg, #0d9488, #10b981)", boxShadow: "0 4px 24px rgba(13,148,136,0.3)" }}>
            Start Free Assessment <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="#pricing" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg border" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
            View Pricing
          </Link>
        </div>
        <p className="text-sm mt-6" style={{ color: "var(--muted-foreground)" }}>Free forever - no credit card required</p>
      </section>
      <section id="pricing" className="px-6 py-20" style={{ backgroundColor: "var(--card)" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-14" style={{ color: "var(--foreground)" }}>Simple, transparent pricing</h2>
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {pricingPlans.map((plan) => (
              <div key={plan.name} className="p-8 rounded-2xl border relative" style={{ borderColor: plan.highlighted ? "var(--primary)" : "var(--border)", backgroundColor: "var(--background)", boxShadow: plan.highlighted ? "0 8px 32px rgba(13,148,136,0.15)" : undefined }}>
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: "var(--primary)" }}>Most Popular</div>
                )}
                <h3 className="text-xl font-bold mb-1" style={{ color: "var(--foreground)" }}>{plan.name}</h3>
                <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>{plan.description}</p>
                <div className="text-4xl font-bold mb-6" style={{ color: "var(--foreground)" }}>{plan.price}<span className="text-base font-normal" style={{ color: "var(--muted-foreground)" }}>/{plan.period}</span></div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--primary)" }} />
                      <span className="text-sm" style={{ color: "var(--foreground)" }}>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className="block w-full text-center py-3 rounded-xl font-semibold text-sm" style={{ backgroundColor: plan.highlighted ? "var(--primary)" : "var(--muted)", color: plan.highlighted ? "var(--primary-foreground)" : "var(--foreground)" }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      <footer className="border-t px-6 py-10 text-center" style={{ borderColor: "var(--border)" }}>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>&copy; {new Date().getFullYear()} SkillBridge. Built to empower career changers.</p>
      </footer>
    </div>
  );
}
