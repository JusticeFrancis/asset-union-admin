"use client";
import { useEffect, useRef, useState } from "react";
import { SettingsTabs } from "@/app/components/settings-tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminAuth } from "@/contexts/admin-auth-provider";
import { apiRequest } from "@/lib/api/client";

export default function AccountInformationPage(){
  const {admin,setAdmin}=useAdminAuth(); const [fullName,setFullName]=useState(admin?.fullName||"");const[email,setEmail]=useState(admin?.email||"");const[avatar,setAvatar]=useState<File|null>(null);const[preview,setPreview]=useState(admin?.avatarUrl||"");const[saving,setSaving]=useState(false);const[message,setMessage]=useState("");const inputRef=useRef<HTMLInputElement>(null);
  useEffect(()=>{if(admin){setFullName(admin.fullName);setEmail(admin.email);setPreview(admin.avatarUrl||"");}},[admin]);
  async function save(){setSaving(true);setMessage("");try{const form=new FormData();form.set("fullName",fullName);form.set("email",email);if(avatar)form.set("avatar",avatar);const response=await apiRequest<{admin:any}>("admin/profile",{method:"PATCH",body:form,auth:true});setAdmin(response.admin);setMessage("Account information updated.");}catch(e:any){setMessage(e.message||"Unable to save changes.");}finally{setSaving(false);}}
  const roleLabel=admin?.roleLabel||admin?.role?.split("_").map((v)=>v[0]?.toUpperCase()+v.slice(1)).join(" ")||"";
  return <Card className="mx-auto w-full max-w-[604px] rounded-[20px] border border-[#edf4f8] bg-white"><CardContent className="space-y-6 p-4 sm:space-y-7 sm:p-6 md:space-y-8 md:p-10 lg:p-12"><div className="flex justify-center"><SettingsTabs/></div><div className="flex flex-col items-center gap-5 sm:gap-6">
    <button type="button" onClick={()=>inputRef.current?.click()} className="relative size-[140px] shrink-0 overflow-hidden rounded-full bg-[#edf4f8] sm:size-[160px] md:size-[177px]"><img alt="Profile" className="size-full object-cover" src={preview||"/images/admin/avatar.svg"}/><span className="absolute inset-x-0 bottom-0 flex justify-center bg-[rgba(0,0,0,0.49)] py-2 text-[11px] font-medium text-white backdrop-blur-[3px]">Upload</span></button>
    <input ref={inputRef} hidden type="file" accept="image/*" onChange={(e)=>{const file=e.target.files?.[0]||null;setAvatar(file);if(file)setPreview(URL.createObjectURL(file));}}/>
    {message?<p className="w-full rounded-[12px] bg-[#edf4f8] px-3 py-2 text-[12px] text-[#050a0e]">{message}</p>:null}
    <div className="grid w-full gap-4 sm:gap-5 md:grid-cols-2">{[{label:"Full Name",value:fullName,set:setFullName,type:"text"},{label:"Email Address",value:email,set:setEmail,type:"email"}].map((f)=><label key={f.label} className="space-y-2"><span className="text-[12px] font-medium text-[#050a0e]">{f.label}</span><input type={f.type} value={f.value} onChange={(e)=>f.set(e.target.value)} className="h-10 w-full rounded-[12px] border border-[#cfe2ec] px-4 text-[12px] font-medium outline-none focus:border-[#5c60cc]"/></label>)}</div>
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end"><div className="min-w-0 flex-1 space-y-2"><p className="text-[12px] font-medium text-[#050a0e]">Admin Type</p><div className="flex h-10 items-center rounded-[12px] border border-[#cfe2ec] bg-[#f5f7f8] px-4 text-[12px] font-medium text-[#050a0e]">{roleLabel}</div></div><button onClick={save} disabled={saving} className="h-10 rounded-[12px] bg-[#5c60cc] px-5 text-[12px] font-medium text-white disabled:opacity-60">{saving?"Saving…":"Save Changes"}</button></div>
  </div></CardContent></Card>;
}
