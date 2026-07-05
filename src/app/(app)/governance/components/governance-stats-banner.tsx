type GovernanceStatsBannerProps = {
  votingPower: number;
  activeCount: number;
  passedCount: number;
  votedCount: number;
};

function StatColumn({
  value,
  suffix,
  label,
}: {
  value: string | number;
  suffix?: string;
  label: string;
}) {
  return (
    <div className="flex min-h-px min-w-0 flex-1 flex-col items-center gap-2 leading-normal">
      <div className="flex items-center justify-center gap-2">
        <span className="text-[24px] font-medium text-[#050a0e]">{value}</span>
        {suffix ? (
          <span className="text-[14px] font-light text-[#919191]">
            {suffix}
          </span>
        ) : null}
      </div>
      <p className="text-center text-[14px] font-light text-[#050a0e]">
        {label}
      </p>
    </div>
  );
}

function StatDivider() {
  return (
    <div className="hidden h-[69px] w-px shrink-0 items-center lg:flex">
      <div className="h-full w-px bg-[#BDBFEA]" />
    </div>
  );
}

export function GovernanceStatsBanner({
  votingPower,
  activeCount,
  passedCount,
  votedCount,
}: GovernanceStatsBannerProps) {
  return (
    <div className="flex min-h-[123px] w-full flex-col gap-6 rounded-[16px] bg-[#dcddf4] px-6 py-6 sm:px-12 lg:flex-row lg:items-center lg:justify-between lg:gap-0">
      <StatColumn
        label="Your voting power"
        suffix="Votes"
        value={votingPower}
      />
      <StatDivider />
      <StatColumn label="Active proposals" value={activeCount} />
      <StatDivider />
      <StatColumn label="Proposals passed" value={passedCount} />
      <StatDivider />
      <StatColumn label="Proposals voted" value={votedCount} />
    </div>
  );
}
