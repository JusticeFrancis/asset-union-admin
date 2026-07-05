export type GovernanceProposalStatus = "active" | "closed";

export type GovernanceVoteChoice = "for" | "against" | "abstain";

export type GovernanceVoteTally = {
  for: { count: number; pct: number };
  against: { count: number; pct: number };
  abstain: { count: number; pct: number };
};

export type GovernanceProposalRecord = {
  slug: string;
  /** Shown in breadcrumb and vote modal summary */
  breadcrumbLabel: string;
  title: string;
  propertyLine: string;
  propertyShort: string;
  categoryLabel: string;
  status: GovernanceProposalStatus;
  forPct: number;
  againstPct: number;
  listUserVoteLabel?: string;
  proposerNote: string;
  eligibleVotes: number;
  daysLeft?: string;
  locationDetail: string;
  description: string;
  proposedBy: string;
  dateSubmitted: string;
  votingCloses: string;
  cost: string;
  quorumRequired: string;
  voteTally: GovernanceVoteTally;
  castSummary: string;
  quorumMessage: string;
  userVotingPower: number;
  /** Detail page loads with vote UI hidden (after-vote state) */
  seedHasVoted?: boolean;
  userVoteSummary?: {
    choice: GovernanceVoteChoice;
    votes: number;
    dateLabel: string;
  };
  voteBlurbs: Record<GovernanceVoteChoice, string>;
};

const HVAC_DESCRIPTION =
  "The current HVAC system has been assessed by a certified engineer as beyond repair. The unit is 14 years old, runs at 38% efficiency, and has failed two consecutive service inspections. This proposal requests approval to replace the full system at a cost of $18,400 from the maintenance reserve fund. No capital call required.";

const tally: GovernanceVoteTally = {
  for: { count: 1141, pct: 62 },
  against: { count: 515, pct: 28 },
  abstain: { count: 184, pct: 10 },
};

const GOVERNANCE_PROPOSALS: GovernanceProposalRecord[] = [
  {
    slug: "emergency-hvac-replacement",
    breadcrumbLabel: "Emergency HVAC replacement",
    title: "Emergency HVAC Replacement — Full System Overhaul",
    propertyLine: "La Casa Espanola Villa 9 · Indonesia",
    propertyShort: "La Casa Espanola Villa 9",
    categoryLabel: "$ Rental Price / Terms",
    status: "active",
    forPct: 67,
    againstPct: 28,
    proposerNote: "Property Manager",
    eligibleVotes: 478,
    daysLeft: "3 days left",
    locationDetail: "La Casa Espanola Villa 9 · Indonesia, Bingin, Uluwatu",
    description: HVAC_DESCRIPTION,
    proposedBy: "Property manager",
    dateSubmitted: "18 Jan 2026",
    votingCloses: "21 Jan 2026 · 3 days remaining",
    cost: "$18,400 (maintenance reserve)",
    quorumRequired: "51% of eligible votes",
    voteTally: tally,
    castSummary: "1,840 of 3,200 cast · 57.5%",
    quorumMessage: "Quorum reached - 57.5% exceeds the 51% threshold.",
    userVotingPower: 478,
    seedHasVoted: false,
    voteBlurbs: {
      for: "Approve the HVAC replacement",
      against: "Reject this proposal",
      abstain: "Count toward quorum only",
    },
  },
  {
    slug: "increase-monthly-rent-8-percent",
    breadcrumbLabel: "Increase monthly rent 8%",
    title: "Increase Monthly Rent by 8% — Market Rate A",
    propertyLine: "La Casa Espanola Villa 9 · Indonesia",
    propertyShort: "La Casa Espanola Villa 9",
    categoryLabel: "$ Rental Price / Terms",
    status: "active",
    forPct: 67,
    againstPct: 28,
    listUserVoteLabel: "You voted: For",
    proposerNote: "Property Manager",
    eligibleVotes: 478,
    daysLeft: "3 days left",
    locationDetail: "La Casa Espanola Villa 9 · Indonesia, Bingin, Uluwatu",
    description:
      "Align recurring rent with current market comparables in Bingin while preserving occupancy incentives for existing tenants.",
    proposedBy: "Property manager",
    dateSubmitted: "12 Jan 2026",
    votingCloses: "25 Jan 2026 · 7 days remaining",
    cost: "—",
    quorumRequired: "51% of eligible votes",
    voteTally: {
      for: { count: 890, pct: 55 },
      against: { count: 420, pct: 26 },
      abstain: { count: 310, pct: 19 },
    },
    castSummary: "1,680 of 3,200 cast · 52.5%",
    quorumMessage: "Quorum reached - 52.5% exceeds the 51% threshold.",
    userVotingPower: 478,
    seedHasVoted: true,
    userVoteSummary: {
      choice: "for",
      votes: 97,
      dateLabel: "20 Jan 2026",
    },
    voteBlurbs: {
      for: "Approve the rent adjustment",
      against: "Reject this proposal",
      abstain: "Count toward quorum only",
    },
  },
  {
    slug: "pool-resurfacing-closed",
    breadcrumbLabel: "Pool resurfacing",
    title: "Pool resurfacing and deck sealing",
    propertyLine: "La Casa Espanola Villa 9 · Indonesia",
    propertyShort: "La Casa Espanola Villa 9",
    categoryLabel: "Major Repair / CapEx",
    status: "closed",
    forPct: 81,
    againstPct: 14,
    listUserVoteLabel: "You voted: For",
    proposerNote: "Property Manager",
    eligibleVotes: 478,
    locationDetail: "La Casa Espanola Villa 9 · Indonesia, Bingin, Uluwatu",
    description:
      "Seasonal maintenance package for the shared pool shell and surrounding deck, completed after successful vote.",
    proposedBy: "Property manager",
    dateSubmitted: "2 Dec 2025",
    votingCloses: "Closed · 15 Dec 2025",
    cost: "$12,200 (maintenance reserve)",
    quorumRequired: "51% of eligible votes",
    voteTally: {
      for: { count: 2100, pct: 81 },
      against: { count: 360, pct: 14 },
      abstain: { count: 130, pct: 5 },
    },
    castSummary: "2,590 of 3,200 cast · 80.9%",
    quorumMessage: "Quorum reached - proposal passed.",
    userVotingPower: 478,
    seedHasVoted: true,
    userVoteSummary: {
      choice: "for",
      votes: 478,
      dateLabel: "10 Dec 2025",
    },
    voteBlurbs: {
      for: "Approve pool works",
      against: "Reject this proposal",
      abstain: "Count toward quorum only",
    },
  },
];

export function getGovernanceProposals(): GovernanceProposalRecord[] {
  return GOVERNANCE_PROPOSALS;
}

export function getGovernanceProposalBySlug(
  slug: string,
): GovernanceProposalRecord | undefined {
  return GOVERNANCE_PROPOSALS.find((p) => p.slug === slug);
}
