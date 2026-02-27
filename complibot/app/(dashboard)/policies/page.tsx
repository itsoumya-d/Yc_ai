"use client";
import { useState, useEffect } from "react";
import { getPolicies } from "@/lib/actions/policies";
import { getStatusColor, formatDate } from "@/lib/utils";
import { Plus, FileText, X } from "lucide-react";
import type { Policy } from "@/types/database";
const PT=["Information Security Policy","Access Control Policy","Incident Response Policy","Data Classification Policy","Change Management Policy","Business Continuity Policy","Acceptable Use Policy","GDPR Privacy Notice","Data Retention Policy","Vendor Management Policy"];
export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selType, setSelType] = useState(PT[0]);
  const [selPolicy, setSelPolicy] = useState<Policy | null>(null);
  const [err, setErr] = useState("");
  const load=async()=>{setLoading(true);const{policies:d}=await getPolicies();setPolicies(d as Policy[]);setLoading(false);};
  useEffect(()=>{load();},[]);
  const gen=async()=>{
    setGenerating(true);setErr("");
    try{const r=await fetch("/api/policies/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:selType})});
    if(!r.ok)throw new Error("Failed");const d=await r.json();if(d.error)throw new Error(d.error);setShowModal(false);await load();}
    catch(e){setErr(e instanceof Error?e.message:"Error");}finally{setGenerating(false);}
  };
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold mb-1">Policy Library</h1><p style={{color:"var(--muted-foreground)"}}>AI-generated compliance policies</p></div>
        <button onClick={()=>setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white" style={{background:"var(--primary)"}}><Plus className="h-4 w-4"/> Generate Policy</button>
      </div>
      {loading?(<p className="text-center py-12" style={{color:"var(--muted-foreground)"}}>Loading...</p>
      ):policies.length===0?(
        <div className="text-center py-16 border rounded-2xl" style={{borderColor:"var(--border)",background:"var(--card)"}}>
          <FileText className="h-12 w-12 mx-auto mb-4" style={{color:"var(--muted-foreground)"}}/>
          <h3 className="font-semibold mb-2">No policies yet</h3>
          <p className="text-sm mb-4" style={{color:"var(--muted-foreground)"}}>Generate your first AI-powered compliance policy</p>
          <button onClick={()=>setShowModal(true)} className="px-4 py-2 rounded-xl text-sm font-medium text-white" style={{background:"var(--primary)"}}>Generate Policy</button>
        </div>
      ):(<div className="grid gap-3">{policies.map((pol)=>(
          <div key={pol.id} className="flex items-center gap-4 p-4 rounded-xl border cursor-pointer" style={{background:"var(--card)",borderColor:"var(--border)"}} onClick={()=>setSelPolicy(pol)}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:"#eff6ff"}}><FileText className="h-5 w-5" style={{color:"var(--primary)"}}/></div>
            <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{pol.title}</p><p className="text-xs" style={{color:"var(--muted-foreground)"}}>v{pol.version} &bull; {formatDate(pol.updated_at)}</p></div>
            <span className={"text-xs px-2 py-1 rounded-full font-medium "+getStatusColor(pol.status)}>{pol.status}</span>
          </div>
        ))}</div>
      )}
      {showModal&&(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-2xl p-6" style={{background:"var(--card)"}}>
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold">Generate Policy</h2><button onClick={()=>setShowModal(false)}><X className="h-5 w-5"/></button></div>
            {err&&<div className="p-3 rounded-lg mb-4 text-sm" style={{background:"#fef2f2",color:"var(--danger)"}}>{err}</div>}
            <div className="mb-4"><label className="block text-sm font-medium mb-1.5">Policy type</label>
              <select value={selType} onChange={(e)=>setSelType(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={{borderColor:"var(--border)",background:"var(--background)"}}>
                {PT.map((t)=><option key={t} value={t}>{t}</option>)}
              </select></div>
            <p className="text-xs mb-4" style={{color:"var(--muted-foreground)"}}>GPT-4o will generate a comprehensive policy tailored to your organization.</p>
            <div className="flex gap-3">
              <button onClick={()=>setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium" style={{borderColor:"var(--border)"}}>Cancel</button>
              <button onClick={gen} disabled={generating} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50" style={{background:"var(--primary)"}}>{generating?"Generating...":"Generate"}</button>
            </div>
          </div>
        </div>
      )}
      {selPolicy&&(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-[80vh] rounded-2xl flex flex-col" style={{background:"var(--card)"}}>
            <div className="flex items-center justify-between p-6 border-b" style={{borderColor:"var(--border)"}}>
              <div><h2 className="font-semibold">{selPolicy.title}</h2><span className={"text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block "+getStatusColor(selPolicy.status)}>{selPolicy.status}</span></div>
              <button onClick={()=>setSelPolicy(null)}><X className="h-5 w-5"/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <pre className="text-sm whitespace-pre-wrap font-sans" style={{color:"var(--foreground)",lineHeight:"1.7"}}>{selPolicy.content||"Policy content will appear here."}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}