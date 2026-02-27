import{createClient}from"@/lib/supabase/server";
import{Shield,Users,CreditCard,CheckCircle}from"lucide-react";
import type{Org,Subscription}from"@/types/database";

const plans=[
  {name:"Starter",price:"$999",period:"/month",features:["1 framework","5 team members","10 AI policies/mo","Evidence collection","Email support"],planKey:"starter"},
  {name:"Growth",price:"$4,999",period:"/month",features:["All 4 frameworks","Unlimited members","Unlimited policies","Audit reports","Priority support"],planKey:"growth",highlighted:true},
  {name:"Enterprise",price:"Custom",period:"",features:["Everything in Growth","Custom integrations","SSO/SAML","Custom branding","Dedicated advisor"],planKey:"enterprise"},
];

export default async function SettingsPage(){
  const supabase=await createClient();
  const{data:{user}}=await supabase.auth.getUser();
  const{data:profile}=await supabase.from("user_profiles").select("full_name,org_id,orgs(*)").eq("id",user!.id).single();
  const org=(profile?.orgs as Org|null);
  const{data:sub}=await supabase.from("subscriptions").select("*").eq("org_id",org?.id??"").single();
  const subscription=sub as Subscription|null;

  return(
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">Settings</h1>
      <p className="mb-8" style={{color:"var(--muted-foreground)"}}>Manage your organization, team, and billing settings</p>

      {/* Org Settings */}
      <div className="p-6 rounded-2xl border mb-6" style={{background:"var(--card)",borderColor:"var(--border)"}}>
        <div className="flex items-center gap-2 mb-4"><Shield className="h-5 w-5" style={{color:"var(--primary)"}}/><h2 className="font-semibold">Organization</h2></div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="font-medium mb-0.5" style={{color:"var(--muted-foreground)"}}>Name</p><p>{org?.name??"—"}</p></div>
          <div><p className="font-medium mb-0.5" style={{color:"var(--muted-foreground)"}}>Industry</p><p className="capitalize">{org?.industry??"—"}</p></div>
          <div><p className="font-medium mb-0.5" style={{color:"var(--muted-foreground)"}}>Size</p><p className="capitalize">{org?.size??"—"}</p></div>
          <div><p className="font-medium mb-0.5" style={{color:"var(--muted-foreground)"}}>Target Audit Date</p><p>{org?.target_audit_date?new Date(org.target_audit_date).toLocaleDateString():"Not set"}</p></div>
          <div className="col-span-2"><p className="font-medium mb-0.5" style={{color:"var(--muted-foreground)"}}>Active Frameworks</p><div className="flex flex-wrap gap-2 mt-1">{(org?.frameworks??[]).map((f)=>(<span key={f} className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">{f.toUpperCase()}</span>))}</div></div>
        </div>
      </div>

      {/* Team */}
      <div className="p-6 rounded-2xl border mb-6" style={{background:"var(--card)",borderColor:"var(--border)"}}>
        <div className="flex items-center gap-2 mb-4"><Users className="h-5 w-5" style={{color:"var(--primary)"}}/><h2 className="font-semibold">Team Members</h2></div>
        <p className="text-sm" style={{color:"var(--muted-foreground)"}}>You are signed in as <strong style={{color:"var(--foreground)"}}>{user?.email}</strong> with owner access.</p>
        <p className="text-sm mt-2" style={{color:"var(--muted-foreground)"}}>Team member management is coming soon. Contact support to add team members.</p>
      </div>

      {/* Billing */}
      <div className="p-6 rounded-2xl border" style={{background:"var(--card)",borderColor:"var(--border)"}}>
        <div className="flex items-center gap-2 mb-4"><CreditCard className="h-5 w-5" style={{color:"var(--primary)"}}/><h2 className="font-semibold">Billing & Plan</h2></div>
        {subscription&&(<div className="mb-4 p-3 rounded-lg text-sm" style={{background:"var(--muted)"}}><span className="font-medium capitalize">{subscription.plan}</span> plan &bull; Status: <span className="capitalize">{subscription.status}</span></div>)}
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan)=>(
            <div key={plan.name} className="p-4 rounded-xl border relative" style={{background:plan.highlighted?"#1d4ed8":"var(--background)",borderColor:plan.highlighted?"#1d4ed8":"var(--border)"}}>
              {plan.highlighted&&<div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-0.5 rounded-full">POPULAR</div>}
              <h3 className="font-bold mb-1" style={{color:plan.highlighted?"#fff":"var(--foreground)"}}>{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-3"><span className="text-2xl font-bold" style={{color:plan.highlighted?"#fff":"var(--foreground)"}}>{plan.price}</span><span className="text-xs" style={{color:plan.highlighted?"#bfdbfe":"var(--muted-foreground)"}}>{plan.period}</span></div>
              <ul className="space-y-1.5 mb-4">{plan.features.map((f)=>(<li key={f} className="flex items-start gap-1.5 text-xs"><CheckCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{color:plan.highlighted?"#86efac":"var(--success)"}}/><span style={{color:plan.highlighted?"#e0f2fe":"var(--foreground)"}}>{f}</span></li>))}</ul>
              {plan.planKey==="enterprise"?(
                <a href="mailto:sales@complibot.ai" className="block text-center py-2 rounded-lg text-xs font-medium" style={plan.highlighted?{background:"#fff",color:"#1d4ed8"}:{background:"var(--primary)",color:"#fff"}}>Contact sales</a>
              ):(
                <form action="/api/stripe/checkout" method="POST"><input type="hidden" name="plan" value={plan.planKey}/><button type="submit" className="w-full py-2 rounded-lg text-xs font-medium" style={plan.highlighted?{background:"#fff",color:"#1d4ed8"}:{background:"var(--primary)",color:"#fff"}}>{subscription?.plan===plan.planKey?"Current plan":"Upgrade"}</button></form>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}