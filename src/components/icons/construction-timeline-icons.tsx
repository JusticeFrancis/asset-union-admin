import type { JSX, SVGProps } from "react";

export type ConstructionTimelineIconProps = SVGProps<SVGSVGElement>;
export type ConstructionTimelineIconKey =
  | "planning"
  | "foundation"
  | "structure"
  | "finishing"
  | "complete";

function TimelineIcon(props: ConstructionTimelineIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="m8.5 12 2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const CONSTRUCTION_TIMELINE_ICON_MAP: Record<
  ConstructionTimelineIconKey,
  (props: ConstructionTimelineIconProps) => JSX.Element
> = {
  planning: TimelineIcon,
  foundation: TimelineIcon,
  structure: TimelineIcon,
  finishing: TimelineIcon,
  complete: TimelineIcon,
};

export function DashboardTimelineConnectorIcon(props: ConstructionTimelineIconProps) {
  return (
    <svg viewBox="0 0 8 40" fill="none" aria-hidden="true" {...props}>
      <path d="M4 0v40" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
    </svg>
  );
}
