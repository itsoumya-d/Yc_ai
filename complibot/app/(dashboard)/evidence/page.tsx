"use client";
import{useState,useEffect}from"react";
import{getEvidence,addEvidence}from"@/lib/actions/evidence";
import{getControls}from"@/lib/actions/controls";
import{formatDate,getEvidenceAge,getEvidenceAgeColor}from"@/lib/utils";
import{Plus,X,FileText,Image,File,AlertCircle}from"lucide-react";
import type{EvidenceItem,Control}from"@/types/database";
function FileIcon({name}:{name:string|null}){
  if(!name)return<File className="h-5 w-5" style={{color:"var(--muted-foreground)"}}/>;
  if(name.endsWith(".pdf"))return<FileText className="h-5 w-5 text-red-500"/>;
  if(/.(png|jpg|jpeg)$/i.test(name))return<Image className="h-5 w-5 text-blue-500"/>;
  return<File className="h-5 w-5" style={{color:"var(--muted-foreground)"}}/>;
}
export default function EvidencePage(){
  const[evidence,setEvidence]=useState<EvidenceItem[]>([]);
  const[controls,setControls]=useState<Control[]>([]);
  const[loading,setLoading]=useState(true);
  const[showModal,setShowModal]=useState(false);
  const[sub,setSub]=useState(false);
  const[form,setForm]=useState({title:"",description:"",controlId:"",expiresAt:""});
  const[fe,setFe]=useState("");
  const load=async()=>{setLoading(true);const[{evidence:ev},{controls:ctrl}]=await Promise.all([getEvidence(),getControls()]);setEvidence(ev as EvidenceItem[]);setControls(ctrl as Control[]);setLoading(false);};
  useEffect(()=>{load();},[]);
  const handleAdd=async(e:React.FormEvent)=>{e.preventDefault();
    if(!form.title){setFe("Title is required.");return;}
    setSub(true);setFe("");
    const{error}=await addEvidence(form.title,form.description,form.controlId||undefined,undefined,undefined,form.expiresAt||undefined);
    if(error){setFe(error);setSub(false);return;}
    setShowModal(false);setForm({title:"",description:"",controlId:"",expiresAt:""});await load();setSub(false);
  };
  return(
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold mb-1">Evidence Collection</h1><p style={{color:"var(--muted-foreground)"}}>Track compliance evidence artifacts</p></div>
        <button onClick={()=>setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white" style={{background:"var(--primary)"}}><Plus className="h-4 w-4"/>Add Evidence</button>
      </div>
      {loading?(<p className="text-center py-12" style={{color:"var(--muted-foreground)"}}>Loading...</p>
      ):evidence.length===0?(
        <div className="text-center py-16 border rounded-2xl" style={{borderColor:"var(--border)",background:"var(--card)"}}>
          <AlertCircle className="h-12 w-12 mx-auto mb-4" style={{color:"var(--muted-foreground)"}}/>
          <h3 className="font-semibold mb-2">No evidence yet</h3>
          <p className="text-sm mb-4" style={{color:"var(--muted-foreground)"}}>Start collecting evidence for your compliance controls</p>
          <button onClick={()=>setShowModal(true)} className="px-4 py-2 rounded-xl text-sm font-medium text-white" style={{background:"var(--primary)"}}>Add Evidence</button>
        </div>
      ):(<div className="grid gap-3">
          {evidence.map((ev)=>{
            const age=getEvidenceAge(ev.collected_at);const ac=getEvidenceAgeColor(age);
            return(
              <div key={ev.id} className="flex items-center gap-4 p-4 rounded-xl border" style={{background:"var(--card)",borderColor:"var(--border)"}}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:"var(--muted)"}}><FileIcon name={ev.file_name}/></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{ev.title}</p>
                  {ev.description&&<p className="text-xs truncate" style={{color:"var(--muted-foreground)"}}>{ev.description}</p>}
                  <div className="flex items-center gap-3 mt-1">
                    <span className={"text-xs font-medium "+ac}>{age==="fresh"?"Fresh":age==="stale"?"Stale (30-90d)":"Expired (>90d)"}</span>
                    <span className="text-xs" style={{color:"var(--muted-foreground)"}}>Collected {formatDate(ev.collected_at)}</span>
                    {ev.expires_at&&<span className="text-xs" style={{color:"var(--muted-foreground)"}}>Expires {formatDate(ev.expires_at)}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {showModal&&(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-2xl p-6" style={{background:"var(--card)"}}>
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold">Add Evidence</h2><button onClick={()=>setShowModal(false)}><X className="h-5 w-5"/></button></div>
            {fe&&<div className="p-3 rounded-lg mb-4 text-sm" style={{background:"#fef2f2",color:"var(--danger)"}}>{fe}</div>}
            <form onSubmit={handleAdd} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1.5">Title *</label><input type="text" value={form.title} onChange={(e)=>setForm((p)=>({...p,title:e.target.value}))} required className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={{borderColor:"var(--border)",background:"var(--background)"}} placeholder="e.g. penetration test report"/></div>
              <div><label className="block text-sm font-medium mb-1.5">Description</label><textarea value={form.description} onChange={(e)=>setForm((p)=>({...p,description:e.target.value}))} rows={2} className="w-full px-3 py-2 text-sm rounded-lg border outline-none resize-none" style={{borderColor:"var(--border)",background:"var(--background)"}}/></div>
              <div><label className="block text-sm font-medium mb-1.5">Link to control</label><select value={form.controlId} onChange={(e)=>setForm((p)=>({...p,controlId:e.target.value}))} className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={{borderColor:"var(--border)",background:"var(--background)"}}><option value="">None</option>{controls.map((c)=><option key={c.id} value={c.id}>{c.control_id}: {c.title}</option>)}</select></div>
              <div><label className="block text-sm font-medium mb-1.5">Expiry date</label><input type="date" value={form.expiresAt} onChange={(e)=>setForm((p)=>({...p,expiresAt:e.target.value}))} className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={{borderColor:"var(--border)",background:"var(--background)"}}/></div>
              <div className="flex gap-3">
                <button type="button" onClick={()=>setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium" style={{borderColor:"var(--border)"}}>Cancel</button>
                <button type="submit" disabled={sub} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50" style={{background:"var(--primary)"}}>{sub?"Adding...":"Add Evidence"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}