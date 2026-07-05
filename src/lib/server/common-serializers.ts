export function userJson(item: any) {
  return { id: String(item._id), fullName: item.fullName, email: item.email, phone: item.phone || "", avatarUrl: item.avatarUrl || "", country: item.country || "", status: item.status, kycStatus: item.kycStatus, accountType: item.accountType, acceptedTermsAt: item.acceptedTermsAt, lastLoginAt: item.lastLoginAt, metadata: item.metadata || {}, createdAt: item.createdAt, updatedAt: item.updatedAt };
}
export function rentJson(item: any) {
  const property = item.propertyId && typeof item.propertyId === "object" ? item.propertyId : null;
  return { id: String(item._id), propertyId: property ? String(property._id) : String(item.propertyId), propertyName: property?.name || "", propertyLocation: property?.location || "", periodStart: item.periodStart, periodEnd: item.periodEnd, grossRent: item.grossRent, expenses: item.expenses, managementFee: item.managementFee, netDistributable: item.netDistributable, distributionDate: item.distributionDate, status: item.status, notes: item.notes || "", documents: (item.documents || []).map((d: any) => ({ id: String(d._id), type: d.type, title: d.title, url: d.url, storageKey: d.storageKey })), submittedBy: item.submittedBy, approvedBy: item.approvedBy, createdAt: item.createdAt, updatedAt: item.updatedAt };
}
export function proposalJson(item: any, voteStats?: any, currentVote?: any) {
  const property = item.propertyId && typeof item.propertyId === "object" ? item.propertyId : null;
  return { id: String(item._id), slug: item.slug, title: item.title, propertyId: property ? String(property._id) : String(item.propertyId), propertyName: property?.name || "", category: item.category, description: item.description, estimatedCost: item.estimatedCost, closesAt: item.closesAt, status: item.status, quorumPercent: item.quorumPercent, eligibleVotes: item.eligibleVotes, proposedBy: item.proposedBy, voteStats: voteStats || { for: 0, against: 0, abstain: 0, total: 0 }, currentVote: currentVote || null, createdAt: item.createdAt, updatedAt: item.updatedAt };
}
export function notificationJson(item: any) {
  return { id: String(item._id), title: item.title, message: item.message, audience: item.audience, channels: item.channels || [], sendOption: item.sendOption, scheduledFor: item.scheduledFor, sentAt: item.sentAt, status: item.status, type: item.type, origin: item.origin, entityType: item.entityType, entityId: item.entityId, recipientsCount: item.recipientsCount, emailSentCount: item.emailSentCount, read: false, error: item.error || "", createdAt: item.createdAt };
}
