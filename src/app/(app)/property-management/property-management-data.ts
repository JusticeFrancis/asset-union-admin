export type PropertyStatus =
  | "Active"
  | "Rejected"
  | "Paused"
  | "Submitted"
  | "Draft";
export type PropertyType = "Rental" | "Construction";

export type PropertyRow = {
  id: string;
  propertyName: string;
  location: string;
  currentStage: string;
  manager: string;
  role: string;
  funding: string;
  fundingPercent: string;
  type: PropertyType;
  date: string;
  status: PropertyStatus;
};

/** Sidebar steps — Card - 5 (node 878:38275). `badge: "alt"` matches Property Details row in Figma. */
export const PROPERTY_DETAIL_STEPS = [
  {
    title: "Basic Property Information",
    subtitle: "Enter basic details",
    badge: "default" as const,
  },
  {
    title: "Legal & Documentation",
    subtitle: "Submit legal documents",
    badge: "default" as const,
  },
  {
    title: "Funding Structure",
    subtitle: "Set funding timeline",
    badge: "default" as const,
  },
  {
    title: "Construction Timeline",
    subtitle: "Enter construction details",
    badge: "default" as const,
  },
  {
    title: "Project Timeline",
    subtitle: "Enter project details",
    badge: "default" as const,
  },
  {
    title: "Property Details",
    subtitle: "Enter property details",
    badge: "alt" as const,
  },
  {
    title: "Review Check",
    subtitle: "Double check and submit",
    badge: "default" as const,
  },
] as const;
