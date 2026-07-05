import { RentSubmissionDetailClient } from "./rent-submission-detail-client";
export default async function RentSubmissionDetailPage({params}:{params:Promise<{id:string}>}){const{id}=await params;return <RentSubmissionDetailClient id={id}/>;}
