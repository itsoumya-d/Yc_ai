import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Shield, LayoutDashboard, CheckSquare, FileText, Upload, ListTodo, Settings, LogOut } from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/controls", icon: CheckSquare, label: "Controls" },
  { href: "/policies", icon: FileText, label: "Policies" },
  { href: "/evidence", icon: Upload, label: "Evidence" },
  { href: "/tasks", icon: ListTodo, label: "Tasks" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("user_profiles").select("full_name, org_id, orgs(name)").eq("id", user.id).single();
  const orgName = (profile?.orgs as { name?: string } | null)?.name ?? "Your Organization";

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      <aside className="w-64 flex-shrink-0 border-r flex flex-col" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="p-6 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-6 w-6" style={{ color: "var(--primary)" }} />
            <span className="font-bold text-lg">CompliBot</span>
          </div>
          <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>{orgName}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-slate-100" style={{ color: "var(--foreground)" }}>
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>{profile?.full_name ?? user.email}</p>
            <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>{user.email}</p>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm hover:bg-slate-100 transition-colors" style={{ color: "var(--muted-foreground)" }}>
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}