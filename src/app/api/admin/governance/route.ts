import { NextRequest } from "next/server";
import { GovernanceProposal, GovernanceVote, Property } from "@/models";
import { requireAdmin } from "@/lib/server/auth";
import { connectDb } from "@/lib/server/db";
import { handleRouteError, HttpError, ok, positiveInt, readJson } from "@/lib/server/http";
import { proposalJson } from "@/lib/server/common-serializers";
import { recordActivity } from "@/lib/server/activity";

function slugify(value: string) { return `${value.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}-${Date.now().toString(36)}`; }
export async function GET(request: NextRequest) {
  try { const { admin } = await requireAdmin(request, "governance.view"); await connectDb(); const page=Math.max(1,positiveInt(request.nextUrl.searchParams.get("page"),1,100000)); const limit=Math.max(1,positiveInt(request.nextUrl.searchParams.get("limit"),20,100)); const status=request.nextUrl.searchParams.get("status"); const filter:any={}; if(status&&status!=="all")filter.status=status;
    await GovernanceProposal.updateMany({ status:"active", closesAt:{ $lte:new Date() } },{$set:{status:"closed"}});
    const [items,total] = await Promise.all([GovernanceProposal.find(filter).populate("propertyId","name").populate("proposedBy","fullName email").sort({createdAt:-1}).skip((page-1)*limit).limit(limit).lean(), GovernanceProposal.countDocuments(filter)]);
    const ids=items.map((i:any)=>i._id); const votes=await GovernanceVote.find({proposalId:{$in:ids}}).lean(); const stats=new Map<string,any>(); const mine=new Map<string,string>();
    for(const vote of votes as any[]){const id=String(vote.proposalId);const s=stats.get(id)||{for:0,against:0,abstain:0,total:0};s[vote.choice]+=vote.votingPower;s.total+=vote.votingPower;stats.set(id,s);if(String(vote.voterAdminId)===String(admin._id))mine.set(id,vote.choice);}
    return ok({items:items.map((i:any)=>proposalJson(i,stats.get(String(i._id)),mine.get(String(i._id)))),pagination:{page,limit,total,pages:Math.ceil(total/limit)}});
  } catch(error){return handleRouteError(error);}
}
export async function POST(request: NextRequest) {
  try { const {admin}=await requireAdmin(request,"governance.create"); await connectDb(); const body=await readJson<any>(request); if(!body.title?.trim()||!body.propertyId||!body.category||!body.description?.trim()||!body.closesAt)throw new HttpError(400,"VALIDATION_ERROR","Title, property, category, description and closing date are required."); if(!(await Property.exists({_id:body.propertyId})))throw new HttpError(404,"PROPERTY_NOT_FOUND","Property not found."); const proposal=await GovernanceProposal.create({slug:slugify(body.title),title:body.title.trim(),propertyId:body.propertyId,category:body.category,description:body.description.trim(),estimatedCost:Number(body.estimatedCost||0),closesAt:body.closesAt,status:body.status||"active",quorumPercent:Number(body.quorumPercent||51),eligibleVotes:Number(body.eligibleVotes||0),proposedBy:admin._id}); await proposal.populate("propertyId","name"); await recordActivity({request,admin,action:"Created governance proposal",operation:"create",resourceType:"governance_proposal",resourceId:String(proposal._id),resourceName:proposal.title}); return ok(proposalJson(proposal),201);
  } catch(error){return handleRouteError(error);}
}
