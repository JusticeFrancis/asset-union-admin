import { GovernanceProposalClient } from "./governance-proposal-client";
export default async function GovernanceProposalPage({params}:{params:Promise<{slug:string}>}){const{slug}=await params;return <GovernanceProposalClient slug={slug}/>;}
