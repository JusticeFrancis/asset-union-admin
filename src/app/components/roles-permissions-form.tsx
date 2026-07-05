"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/api/client";
import { cn } from "@/lib/utils";

type Mode="add"|"view"|"edit";
type Props={mode:Mode;adminId?:string};
const roles=[{value:"property_manager",label:"Property Manager"},{value:"user_manager",label:"User Manager"},{value:"rent_manager",label:"Rent Manager"},{value:"super_admin",label:"Super Admin"},{value:"custom",label:"Custom Role"}];
const permissionGroups=[
 {title:"Properties",items:["properties.view","properties.create","properties.update","properties.delete","properties.approve"]},
 {title:"Rent",items:["rents.view","rents.create","rents.update","rents.delete","rents.approve"]},
 {title:"Users",items:["users.view","users.create","users.update","users.delete"]},
 {title:"Governance",items:["governance.view","governance.create","governance.update","governance.delete","governance.vote"]},
 {title:"Platform",items:["dashboard.view","compliance.view","notifications.view","notifications.create","notifications.update","notifications.delete"]},
 {title:"Administration",items:["admins.view","admins.create","admins.update","admins.delete","settings.view","settings.update","platform_settings.view","platform_settings.update","integrations.manage"]},
];
const labels:Record<string,string>={view:"View",create:"Create",update:"Update",delete:"Delete",approve:"Approve",vote:"Vote",manage:"Manage"};
const presetPermissions:Record<string,string[]>={
 super_admin:permissionGroups.flatMap(group=>group.items),
 property_manager:["dashboard.view","properties.view","properties.create","properties.update","properties.delete","properties.approve","settings.view","settings.update","integrations.manage"],
 user_manager:["dashboard.view","users.view","users.create","users.update","users.delete","settings.view","settings.update"],
 rent_manager:["dashboard.view","rents.view","rents.create","rents.update","rents.delete","rents.approve","properties.view","settings.view","settings.update"],
 custom:[],
};
export function RolesPermissionsForm({mode,adminId}:Props){
 const router=useRouter();const[fullName,setFullName]=useState("");const[email,setEmail]=useState("");const[role,setRole]=useState("property_manager");const[customRoleName,setCustomRoleName]=useState("");const[permissions,setPermissions]=useState<string[]>([]);const[status,setStatus]=useState("active");const[inviteAccepted,setInviteAccepted]=useState(true);const[loading,setLoading]=useState(Boolean(adminId));const[saving,setSaving]=useState(false);const[message,setMessage]=useState("");const readonly=mode==="view";
 useEffect(()=>{if(!adminId)return;void apiRequest<any>(`admin/admins/${adminId}`,{auth:true}).then(r=>{const a=r.admin;setFullName(a.fullName);setEmail(a.email);setRole(a.role);setCustomRoleName(a.roleLabel||"");setPermissions(a.permissions||[]);setStatus(a.status);setInviteAccepted(Boolean(a.inviteAccepted));}).catch((e:any)=>setMessage(e.message)).finally(()=>setLoading(false));},[adminId]);
 const allPermissions=useMemo(()=>permissionGroups.flatMap(g=>g.items),[]);
 const displayedPermissions=role==="custom"?permissions:(presetPermissions[role]||[]);
 function toggle(p:string){setPermissions(v=>v.includes(p)?v.filter(x=>x!==p):[...v,p]);}
 async function submit(){setSaving(true);setMessage("");try{const body={fullName,email,role,customRoleName:role==="custom"?customRoleName:"",customPermissions:role==="custom"?permissions:[],...(mode==="edit"&&inviteAccepted?{status}:{})};if(mode==="add"){const r=await apiRequest<any>("admin/admins",{method:"POST",json:body,auth:true});setMessage(r.emailDelivery==="sent"?"Invitation sent successfully.":`Admin created, but email delivery failed: ${r.emailDelivery}`);setTimeout(()=>router.push("/roles-and-permissions"),700);}else if(adminId){await apiRequest(`admin/admins/${adminId}`,{method:"PATCH",json:body,auth:true});setMessage("Admin role updated.");}}catch(e:any){setMessage(e.message||"Unable to save admin.");}finally{setSaving(false);}}
 if(loading)return <Card className="rounded-[20px] border-0"><CardContent className="p-8 text-center text-[12px] text-[#919191]">Loading admin…</CardContent></Card>;
 return <Card className="w-full rounded-[20px] border-0 bg-white shadow-sm"><CardContent className="space-y-6 p-4 sm:p-6">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-[18px] font-medium text-[#050a0e]">{mode==="add"?"Add Admin User":mode==="edit"?"Edit Admin User":"Admin User Details"}</h2><p className="mt-1 text-[12px] text-[#919191]">Assign a preset role or configure precise permissions.</p></div>{!readonly?<button onClick={submit} disabled={saving} className="h-10 rounded-[12px] bg-[#5c60cc] px-5 text-[12px] font-medium text-white disabled:opacity-60">{saving?"Saving…":mode==="add"?"Send Invite Request":"Update Role"}</button>:null}</div>
  {message?<p className="rounded-[12px] bg-[#edf4f8] px-3 py-2 text-[12px]">{message}</p>:null}
  <div className="grid gap-4 md:grid-cols-3"><Field label="Full Name"><input disabled={readonly} value={fullName} onChange={e=>setFullName(e.target.value)} className="h-10 w-full rounded-[12px] border border-[#cfe2ec] bg-white px-3 text-[12px] disabled:bg-[#f5f7f8]"/></Field><Field label="Email Address"><input disabled={readonly||mode==="edit"} type="email" value={email} onChange={e=>setEmail(e.target.value)} className="h-10 w-full rounded-[12px] border border-[#cfe2ec] bg-white px-3 text-[12px] disabled:bg-[#f5f7f8]"/></Field><Field label="Role"><select disabled={readonly} value={role} onChange={e=>setRole(e.target.value)} className="h-10 w-full rounded-[12px] border border-[#cfe2ec] bg-white px-3 text-[12px] disabled:bg-[#f5f7f8]">{roles.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}</select></Field></div>
  {role==="custom"?<Field label="Custom Role Name"><input disabled={readonly} value={customRoleName} onChange={e=>setCustomRoleName(e.target.value)} className="h-10 w-full rounded-[12px] border border-[#cfe2ec] px-3 text-[12px] disabled:bg-[#f5f7f8]"/></Field>:null}
  {mode==="edit"?<Field label="Account Status">{inviteAccepted?<select disabled={readonly} value={status} onChange={e=>setStatus(e.target.value)} className="h-10 w-full max-w-xs rounded-[12px] border border-[#cfe2ec] bg-white px-3 text-[12px]"><option value="active">Active</option><option value="suspended">Suspended</option></select>:<div className="flex h-10 w-full max-w-xs items-center rounded-[12px] border border-[#cfe2ec] bg-[#f5f7f8] px-3 text-[12px]">Invited — awaiting acceptance</div>}</Field>:null}
  <div className="overflow-hidden rounded-[20px] border border-[#edf4f8]"><div className="flex items-center justify-between bg-[#f5f7f8] px-4 py-3"><h3 className="text-[15px] font-medium">Permissions</h3>{role==="custom"&&!readonly?<button onClick={()=>setPermissions(permissions.length===allPermissions.length?[]:allPermissions)} className="text-[12px] font-medium text-[#5c60cc]">{permissions.length===allPermissions.length?"Clear all":"Select all"}</button>:null}</div><div className="grid gap-0 md:grid-cols-2">{permissionGroups.map(group=><div key={group.title} className="border-b border-[#edf4f8] p-4 md:border-r"><p className="mb-3 text-[12px] font-medium">{group.title}</p><div className="grid gap-2 sm:grid-cols-2">{group.items.map(p=>{const checked=displayedPermissions.includes(p);return <label key={p} className={cn("flex items-center gap-2 rounded-[10px] border px-3 py-2 text-[11px]",checked?"border-[#5c60cc] bg-[#f2f2ff]":"border-[#edf4f8]")}> <input type="checkbox" disabled={readonly||role!=="custom"} checked={checked} onChange={()=>toggle(p)}/><span>{p.split(".")[0].replaceAll("_"," ")} · {labels[p.split(".")[1]]||p.split(".")[1]}</span></label>})}</div></div>)}</div>{role!=="custom"?<p className="border-t border-[#edf4f8] px-4 py-3 text-[11px] text-[#919191]">Preset role permissions are enforced by the server. Choose Custom Role to select individual permissions.</p>:null}</div>
 </CardContent></Card>;
}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="block space-y-1.5"><span className="text-[12px] font-medium text-[#050a0e]">{label}</span>{children}</label>}
