export default function OrganizationCompliancePage() {
  return (
    <div className="rounded-[16px] bg-white p-6 shadow-[0_1px_4px_rgba(12,12,13,0.05)]">
      <h2 className="text-[16px] font-medium text-[#050a0e]">Compliance log</h2>
      <p className="mt-2 text-[12px] text-[#919191]">
        Fetch audit events from{" "}
        <code className="text-[11px]">
          GET /v1/organizations/compliance/logs
        </code>
        . API integration is in progress.
      </p>
    </div>
  );
}
