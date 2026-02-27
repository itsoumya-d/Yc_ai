"use client";
import{useState}from"react";
import{useRouter}from"next/navigation";
import{Shield,ArrowRight,ArrowLeft,Check}from"lucide-react";
import{completeOnboarding}from"@/lib/actions/onboarding";
import type{Framework}from"@/types/database";

const INDUSTRIES=["Technology","Healthcare","Finance","Legal","Education","Retail","Manufacturing","Other"];
const SIZES=["1-10","11-50","51-200","201-500","500+"];
const FRAMEWORKS:Framework[]=["soc2","gdpr","hipaa","iso27001"];
const FW_LABELS:Record<string,string>={soc2:"SOC 2",gdpr:"GDPR",hipaa:"HIPAA",iso27001:"ISO 27001"};
const FW_DESC:Record<string,string>={soc2:"Trust Services Criteria for security",gdpr:"EU data protection regulation",hipaa:"US healthcare data protection",iso27001:"International security standard"};
const TECH_STACK=["AWS","GCP","Azure","GitHub","GitLab","Kubernetes","Docker","PostgreSQL","MongoDB","Stripe","Twilio","Vercel","Cloudflare"];

export default function OnboardingPage(){
  const router=useRouter();
  const[step,setStep]=useState(1);
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState("");
  const[form,setForm]=useState({orgName:"",industry:"Technology",size:"1-10",frameworks:[] as Framework[],techStack:[] as string[],targetAuditDate:""});

  const toggleFw=(fw:Framework)=>setForm((p)=>({...p,frameworks:p.frameworks.includes(fw)?p.frameworks.filter((f)=>f!==fw):[...p.frameworks,fw]}));
  const toggleTech=(t:string)=>setForm((p)=>({...p,techStack:p.techStack.includes(t)?p.techStack.filter((s)=>s!==t):[...p.techStack,t]}));

  const handleComplete=async()=>{
    if(!form.orgName.trim()){setError("Company name is required.");return;}
    if(form.frameworks.length===0){setError("Select at least one framework.");return;}
    setLoading(true);setError("");
    const{orgId,error:err}=await completeOnboarding({orgName:form.orgName,industry:form.industry,size:form.size,frameworks:form.frameworks,techStack:form.techStack,targetAuditDate:form.targetAuditDate||null});
    if(err){setError(err);setLoading(false);return;}
    router.push("/dashboard");
  };

  const steps=[{n:1,label:"Company"},{n:2,label:"Frameworks"},{n:3,label:"Tech Stack"},{n:4,label:"Timeline"}];
  return(
    <div className="min-h-screen flex items-center justify-center py-12" style={{background:"var(--background)"}}>
      <div className="w-full max-w-lg px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4"><Shield className="h-7 w-7" style={{color:"var(--primary)"}}/><span className="text-xl font-bold">CompliBot</span></div>
          <h1 className="text-2xl font-bold mb-1">Set up your organization</h1>
          <p style={{color:"var(--muted-foreground)"}}>Tell us about your company so we can configure the right controls</p>
        </div>
        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((s,i)=>(
            <div key={s.n} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={"w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium "+(step>s.n?"text-white":"step===s.n?"text-white":"")} style={{background:step>s.n?"var(--success)":step===s.n?"var(--primary)":"var(--muted)",color:step<=s.n?"#fff":"var(--muted-foreground)"}}>
                  {step>s.n?<Check className="h-4 w-4"/>:s.n}
                </div>
                <span className="text-xs mt-1" style={{color:step===s.n?"var(--foreground)":"var(--muted-foreground)"}}>{s.label}</span>
              </div>
              {i<steps.length-1&&<div className="flex-1 h-px mx-2" style={{background:"var(--border)"}}/>}
            </div>
          ))}
        </div>
        <div className="rounded-2xl border p-8" style={{background:"var(--card)",borderColor:"var(--border)"}}>
          {error&&<div className="p-3 rounded-lg mb-4 text-sm" style={{background:"#fef2f2",color:"var(--danger)"}}>{error}</div>}
          {/* Step 1: Company details */}
          {step===1&&(
            <div className="space-y-4">
              <h2 className="font-semibold text-lg mb-4">Company details</h2>
              <div><label className="block text-sm font-medium mb-1.5">Company name *</label><input type="text" value={form.orgName} onChange={(e)=>setForm((p)=>({...p,orgName:e.target.value}))} className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={{borderColor:"var(--border)",background:"var(--background)"}} placeholder="Acme Inc."/></div>
              <div><label className="block text-sm font-medium mb-1.5">Industry</label><select value={form.industry} onChange={(e)=>setForm((p)=>({...p,industry:e.target.value}))} className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={{borderColor:"var(--border)",background:"var(--background)"}}>{INDUSTRIES.map((i)=><option key={i} value={i}>{i}</option>)}</select></div>
              <div><label className="block text-sm font-medium mb-1.5">Company size</label><div className="grid grid-cols-5 gap-2">{SIZES.map((s)=>(<button key={s} type="button" onClick={()=>setForm((p)=>({...p,size:s}))} className={"py-2 rounded-lg border text-sm font-medium transition-colors "+(form.size===s?"":"border-transparent")} style={{background:form.size===s?"var(--primary)":"var(--muted)",color:form.size===s?"#fff":"var(--foreground)"}}>{s}</button>))}</div></div>
            </div>
          )}
          {/* Step 2: Frameworks */}
          {step===2&&(
            <div>
              <h2 className="font-semibold text-lg mb-2">Select compliance frameworks</h2>
              <p className="text-sm mb-4" style={{color:"var(--muted-foreground)"}}>Choose all frameworks relevant to your business</p>
              <div className="space-y-3">
                {FRAMEWORKS.map((fw)=>(
                  <button key={fw} type="button" onClick={()=>toggleFw(fw)} className={"w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-colors "+(form.frameworks.includes(fw)?"":"border-transparent")} style={{background:"var(--background)",borderColor:form.frameworks.includes(fw)?"var(--primary)":"var(--border)"}}>
                    <div className={"w-5 h-5 rounded flex items-center justify-center mt-0.5 flex-shrink-0 "+(form.frameworks.includes(fw)?"text-white":"")} style={{background:form.frameworks.includes(fw)?"var(--primary)":"var(--muted)"}}>{form.frameworks.includes(fw)&&<Check className="h-3 w-3"/>}</div>
                    <div><p className="font-semibold text-sm">{FW_LABELS[fw]}</p><p className="text-xs" style={{color:"var(--muted-foreground)"}}>{FW_DESC[fw]}</p></div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Step 3: Tech Stack */}
          {step===3&&(
            <div>
              <h2 className="font-semibold text-lg mb-2">Tech stack</h2>
              <p className="text-sm mb-4" style={{color:"var(--muted-foreground)"}}>Select the technologies you use (helps customize controls)</p>
              <div className="flex flex-wrap gap-2">
                {TECH_STACK.map((t)=>(
                  <button key={t} type="button" onClick={()=>toggleTech(t)} className="px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors" style={{background:form.techStack.includes(t)?"var(--primary)":"var(--background)",borderColor:form.techStack.includes(t)?"var(--primary)":"var(--border)",color:form.techStack.includes(t)?"#fff":"var(--foreground)"}}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Step 4: Timeline */}
          {step===4&&(
            <div>
              <h2 className="font-semibold text-lg mb-2">Target audit date</h2>
              <p className="text-sm mb-4" style={{color:"var(--muted-foreground)"}}>When do you plan to complete your compliance audit? (optional)</p>
              <input type="date" value={form.targetAuditDate} onChange={(e)=>setForm((p)=>({...p,targetAuditDate:e.target.value}))} className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={{borderColor:"var(--border)",background:"var(--background)"}} min={new Date().toISOString().split("T")[0]}/>
              <p className="text-xs mt-3" style={{color:"var(--muted-foreground)"}}>CompliBot will use this date to prioritize controls and send reminders.</p>
            </div>
          )}
          {/* Nav buttons */}
          <div className="flex gap-3 mt-6">
            {step>1&&<button type="button" onClick={()=>setStep((s)=>s-1)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium" style={{borderColor:"var(--border)"}}><ArrowLeft className="h-4 w-4"/>Back</button>}
            {step<4?(<button type="button" onClick={()=>setStep((s)=>s+1)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white" style={{background:"var(--primary)"}}>Next<ArrowRight className="h-4 w-4"/></button>
            ):(<button type="button" onClick={handleComplete} disabled={loading} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50" style={{background:"var(--primary)"}}>{loading?"Setting up...":"Complete Setup"}<ArrowRight className="h-4 w-4"/></button>)}
          </div>
        </div>
      </div>
    </div>
  );
}