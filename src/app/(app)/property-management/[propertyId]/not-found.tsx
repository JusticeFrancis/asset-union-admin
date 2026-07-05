import Link from "next/link";

export default function PropertyNotFound() {
  return (
    <div className="rounded-[20px] bg-white p-8 text-center shadow-sm">
      <p className="text-[14px] font-medium text-[#050A0E]">
        Property not found
      </p>
      <p className="mt-2 text-[12px] text-[#919191]">
        This listing may have been removed or the link is invalid.
      </p>
      <Link
        className="mt-6 inline-block text-[12px] font-medium text-[#5C60CC] hover:underline"
        href="/property-management"
      >
        Back to Property Management
      </Link>
    </div>
  );
}
