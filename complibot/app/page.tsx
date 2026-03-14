import Link from "next/link";
import { Shield, CheckCircle, FileText, Upload, ArrowRight, Star } from "lucide-react";

const features = [
  { icon: FileText, title: "AI Policy Generator", description: "Generate audit-ready compliance policies using GPT-4o." },
  { icon: CheckCircle, title: "Controls Checklist", description: "Track every control across frameworks with real-time status updates." },
  { icon: Upload, title: "Evidence Collection", description: "Collect, organize, and track evidence with automatic expiry alerts." },
];
const frameworks = [
  { name: "SOC 2", description: "Trust Services Criteria", color: "bg-blue-100 text-blue-800" },
  { name: "GDPR", description: "EU Data Protection", color: "bg-purple-100 text-purple-800" },
  { name: "HIPAA", description: "Healthcare Compliance", color: "bg-green-100 text-green-800" },
  { name: "ISO 27001", description: "Security Management", color: "bg-orange-100 text-orange-800" },
];
const plans = [
  { name: "Starter", price: "$999", period: "/month", description: "For early-stage startups.", features: ["SOC 2 or GDPR","Up to 5 members","10 AI policies/mo","Evidence collection","Email support"], cta: "Start free trial", highlighted: false },
  { name: "Growth", price: "$4,999", period: "/month", description: "For scaling companies.", features: ["All 4 frameworks","Unlimited members","Unlimited AI policies","Audit reports","Priority support"], cta: "Start free trial", highlighted: true },
  { name: "Enterprise", price: "Custom", period: "", description: "Custom integrations.", features: ["Everything in Growth","Custom integrations","SSO / SAML","Custom branding","Dedicated advisor"], cta: "Contact sales", highlighted: false },
];
const testimonials = [
  { quote: "CompliBot helped us achieve SOC 2 in under 3 months.", author: "Sarah Chen", title: "CTO, DataFlow Inc." },
  { quote: "The controls checklist made our GDPR project manageable.", author: "Marcus Rodriguez", title: "Head of Engineering, HealthTech EU" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <nav className="border-b" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-7 w-7" style={{ color: "var(--primary)" }} />
            <span className="text-xl font-bold">CompliBot</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-lg border" style={{ borderColor: "var(--border)" }}>Sign in</Link>
            <Link href="/signup" className="text-sm font-medium px-4 py-2 rounded-lg text-white" style={{ background: "var(--primary)" }}>Start free trial</Link>
          </div>
        </div>
      </nav>
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 -z-10" style={{ background: "linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 50%,#3b82f6 100%)" }} />
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">SOC 2 in weeks,<br /><span style={{ color: "#93c5fd" }}>not months</span></h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">CompliBot automates your compliance with AI-generated policies, controls checklists, and evidence collection.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-8 py-4 rounded-xl text-lg">Start free trial <ArrowRight className="h-5 w-5" /></Link>
            <a href="#features" className="border border-blue-300 text-white font-semibold px-8 py-4 rounded-xl text-lg">See how it works</a>
          </div>
          <p className="text-blue-300 text-sm mt-4">14-day free trial. No credit card required.</p>
        </div>
      </section>
      <section id="frameworks" className="py-12 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {frameworks.map((f) => (<div key={f.name} className={"flex items-center gap-2 px-5 py-3 rounded-xl font-medium " + f.color}><Shield className="h-4 w-4" /><span className="font-semibold">{f.name}</span><span className="text-sm opacity-75">{f.description}</span></div>))}
          </div>
        </div>
      </section>
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: "var(--foreground)" }}>Everything you need to get certified</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => { const Icon = feature.icon; return (
              <div key={feature.title} className="p-8 rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: "#eff6ff" }}><Icon className="h-6 w-6" style={{ color: "var(--primary)" }} /></div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p style={{ color: "var(--muted-foreground)" }}>{feature.description}</p>
              </div>
            );})}
          </div>
        </div>
      </section>
      <section className="py-24" style={{ background: "var(--muted)" }}>
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Trusted by compliance-conscious teams</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((t) => (<div key={t.author} className="p-8 rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex gap-1 mb-4">{[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />)}</div>
              <p className="text-lg mb-4" style={{ lineHeight: "1.7" }}>&ldquo;{t.quote}&rdquo;</p>
              <p className="font-semibold">{t.author}</p><p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{t.title}</p>
            </div>))}
          </div>
        </div>
      </section>
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Simple, predictable pricing</h2>
          <p className="text-center mb-12" style={{ color: "var(--muted-foreground)" }}>14-day free trial. No credit card required.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (<div key={plan.name} className="p-8 rounded-2xl relative" style={{ background: plan.highlighted ? "#1d4ed8" : "var(--card)", border: plan.highlighted ? "2px solid #1d4ed8" : "1px solid var(--border)" }}>
              {plan.highlighted && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1 rounded-full">MOST POPULAR</div>}
              <h3 className="text-xl font-bold mb-1" style={{ color: plan.highlighted ? "#fff" : "var(--foreground)" }}>{plan.name}</h3>
              <p className="text-sm mb-4" style={{ color: plan.highlighted ? "#bfdbfe" : "var(--muted-foreground)" }}>{plan.description}</p>
              <div className="flex items-baseline gap-1 mb-6"><span className="text-4xl font-bold" style={{ color: plan.highlighted ? "#fff" : "var(--foreground)" }}>{plan.price}</span><span className="text-sm" style={{ color: plan.highlighted ? "#bfdbfe" : "var(--muted-foreground)" }}>{plan.period}</span></div>
              <ul className="space-y-3 mb-8">{plan.features.map((f) => (<li key={f} className="flex items-start gap-2 text-sm"><CheckCircle className="h-4 w-4 mt-0.5" style={{ color: plan.highlighted ? "#86efac" : "var(--success)" }} /><span style={{ color: plan.highlighted ? "#e0f2fe" : "var(--foreground)" }}>{f}</span></li>))}</ul>
              <Link href={plan.name === "Enterprise" ? "mailto:sales@complibot.ai" : "/signup"} className="block text-center font-semibold py-3 rounded-xl" style={plan.highlighted ? { background: "#fff", color: "#1d4ed8" } : { background: "var(--primary)", color: "#fff" }}>{plan.cta}</Link>
            </div>))}
          </div>
        </div>
      </section>
      <footer className="border-t py-8" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2"><Shield className="h-5 w-5" style={{ color: "var(--primary)" }} /><span className="font-bold">CompliBot</span></div>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>&copy; 2026 CompliBot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}