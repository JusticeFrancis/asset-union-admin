"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ADMIN_ASSETS } from "@/app/components/admin-assets";
import { apiRequest } from "@/lib/api/client";

export function AcceptAdminInviteContent(){
  const params=useSearchParams(); const token=params.get("token")||"";
  const [invite,setInvite]=useState<any>(null); const [fullName,setFullName]=useState(""); const [password,setPassword]=useState(""); const [confirm,setConfirm]=useState(""); const [loading,setLoading]=useState(true); const [submitting,setSubmitting]=useState(false); const [error,setError]=useState(""); const [done,setDone]=useState(false);
  useEffect(()=>{if(!token){setError("This invitation link is invalid.");setLoading(false);return;}void apiRequest<any>(`admin/invites/verify?token=${encodeURIComponent(token)}`).then((r)=>{setInvite(r.invite);setFullName(r.invite.fullName||"");}).catch((e)=>setError(e.message||"This invitation is invalid or expired.")).finally(()=>setLoading(false));},[token]);
  async function submit(e:React.FormEvent){e.preventDefault();setError("");if(password.length<8){setError("Password must contain at least 8 characters.");return;}if(password!==confirm){setError("Passwords do not match.");return;}setSubmitting(true);try{await apiRequest("admin/invites/accept",{method:"POST",json:{token,fullName,password}});setDone(true);}catch(e:any){setError(e.message||"Unable to accept invitation.");}finally{setSubmitting(false);}}
  return <main className="flex min-h-screen items-center justify-center bg-[#edf4f8] px-4 py-8"><div className="w-full max-w-[430px] rounded-[20px] bg-white p-6 shadow-[0_1px_4px_rgba(12,12,13,0.05)] sm:p-8">
    <div className="mb-7 flex flex-col items-center gap-4 text-center"><img src={ADMIN_ASSETS.branding.logoFull} alt="Asset Union" className="h-11 w-auto"/><div><h1 className="text-[20px] font-medium text-[#050a0e]">Accept admin invitation</h1><p className="mt-1 text-[12px] text-[#919191]">Create your password to access the dashboard.</p></div></div>
    {loading?<p className="text-center text-[12px] text-[#919191]">Validating invitation…</p>:done?<div className="space-y-4 text-center"><p className="rounded-[12px] bg-[#edf9f2] p-4 text-[13px] text-[#16834d]">Invitation accepted successfully.</p><Link href="/sign-in" className="inline-flex h-10 items-center justify-center rounded-[12px] bg-[#5c60cc] px-6 text-[12px] font-medium text-white">Sign in</Link></div>:error&&!invite?<div className="space-y-4 text-center"><p className="rounded-[12px] border border-[#fecaca] bg-[#fef2f2] p-4 text-[12px] text-[#b91c1c]">{error}</p><Link href="/sign-in" className="text-[12px] font-medium text-[#5c60cc]">Return to sign in</Link></div>:<form onSubmit={submit} className="space-y-4">
      <div className="rounded-[12px] border border-[#cfe2ec] bg-[#f8fbfc] p-3 text-[12px]"><p className="font-medium text-[#050a0e]">{invite?.email}</p><p className="mt-1 text-[#919191]">Role: {invite?.roleLabel}</p></div>
      {error?<p className="rounded-[12px] border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12px] text-[#b91c1c]">{error}</p>:null}
      {[{label:"Full name",value:fullName,set:setFullName,type:"text"},{label:"Password",value:password,set:setPassword,type:"password"},{label:"Confirm password",value:confirm,set:setConfirm,type:"password"}].map((f)=><label key={f.label} className="block space-y-1.5"><span className="text-[12px] font-medium text-[#050a0e]">{f.label}</span><input type={f.type} value={f.value} onChange={(e)=>f.set(e.target.value)} required className="h-10 w-full rounded-[12px] border border-[#cfe2ec] px-3 text-[12px] outline-none focus:border-[#5c60cc]"/></label>)}
      <button disabled={submitting} className="h-10 w-full rounded-[12px] bg-[#5c60cc] text-[12px] font-medium text-white disabled:opacity-60">{submitting?"Accepting…":"Accept invitation"}</button>
    </form>}
  </div></main>;
}
