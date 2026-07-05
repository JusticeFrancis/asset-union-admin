"use client";

import { useCallback, useEffect, useState } from "react";

import {
  orgAuthErrorClassName,
  orgAuthInputClassName,
} from "@/app/organizations/components/org-auth-styles";
import { Button } from "@/components/ui/button";
import type { OrganizationMemberRole } from "@/lib/api/organization-auth.types";
import type { OrganizationMember } from "@/lib/api/organization.types";
import {
  inviteOrganizationMember,
  listOrganizationMembers,
  removeOrganizationMember,
} from "@/lib/api/requests/organization";
import { getOrgAuthErrorMessage } from "@/lib/auth/org-errors";

const INVITE_ROLES: OrganizationMemberRole[] = [
  "organization_admin",
  "asset_manager",
  "viewer",
];

export default function OrganizationMembersPage() {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<OrganizationMemberRole>("asset_manager");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await listOrganizationMembers();
      setMembers(response.items);
    } catch (error) {
      setErrorMessage(
        getOrgAuthErrorMessage(error, "Unable to load team members."),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await inviteOrganizationMember({
        email: email.trim(),
        fullName: fullName.trim(),
        role,
      });
      setEmail("");
      setFullName("");
      await loadMembers();
    } catch (error) {
      setErrorMessage(getOrgAuthErrorMessage(error, "Unable to send invite."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    setErrorMessage(null);
    try {
      await removeOrganizationMember(memberId);
      await loadMembers();
    } catch (error) {
      setErrorMessage(
        getOrgAuthErrorMessage(error, "Unable to remove member."),
      );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-[16px] bg-white p-6 shadow-[0_1px_4px_rgba(12,12,13,0.05)]">
        <h2 className="text-[16px] font-medium text-[#050a0e]">Team</h2>
        <p className="mt-1 text-[12px] text-[#919191]">
          Invite colleagues (max 10 members per organization).
        </p>

        <form
          className="mt-6 grid gap-4 sm:grid-cols-2"
          onSubmit={handleInvite}
        >
          {errorMessage ? (
            <p className={orgAuthErrorClassName} role="alert">
              {errorMessage}
            </p>
          ) : null}

          <input
            required
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={orgAuthInputClassName}
          />
          <input
            required
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={orgAuthInputClassName}
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as OrganizationMemberRole)}
            className={orgAuthInputClassName}
          >
            {INVITE_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Inviting…" : "Invite member"}
          </Button>
        </form>
      </div>

      <div className="rounded-[16px] bg-white p-6 shadow-[0_1px_4px_rgba(12,12,13,0.05)]">
        <h3 className="text-[14px] font-medium text-[#050a0e]">Members</h3>
        {isLoading ? (
          <p className="mt-4 text-[12px] text-[#919191]">Loading…</p>
        ) : (
          <ul className="mt-4 divide-y divide-[#eef2f6]">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between gap-4 py-3 text-[12px]"
              >
                <div>
                  <p className="font-medium text-[#050a0e]">
                    {member.fullName}
                  </p>
                  <p className="text-[#919191]">
                    {member.email} · {member.role}
                  </p>
                </div>
                {member.role !== "organization_owner" ? (
                  <button
                    type="button"
                    className="text-[#b91c1c] hover:underline"
                    onClick={() => void handleRemove(member.id)}
                  >
                    Remove
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
