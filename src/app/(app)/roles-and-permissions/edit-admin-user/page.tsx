import { RolesPermissionsForm } from "@/app/components/roles-permissions-form";
export default async function EditAdminUserPage({searchParams}:{searchParams:Promise<{id?:string}>}){const p=await searchParams;return <RolesPermissionsForm mode="edit" adminId={p.id}/>;}
