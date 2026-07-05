"use client";

import { useRouter } from "nextjs-toploader/app";
import { useSearchParams } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import type { ListingKind } from "@/app/(app)/create-listing/create-listing-wizard-data";
import type { WizardStepSegment } from "@/app/(app)/create-listing/create-listing-wizard-data";
import { createListingWizardHref } from "@/lib/property-wizard/paths";
import { usePropertyWizardPaths } from "@/contexts/property-wizard-scope";
import type { SaveWizardDraftRequest } from "@/lib/api/admin-property.types";
import {
  useScopedCreatePropertyDraftMutation,
  useScopedProperty,
  useScopedSavePropertyDraftMutation,
} from "@/lib/property-wizard/use-scoped-property-api";
import { isPropertyEditable } from "@/lib/property-wizard/mappers";
import { segmentToSectionKey } from "@/lib/property-wizard/section-keys";

type PropertyWizardContextValue = {
  propertyId: string | null;
  property: ReturnType<typeof useScopedProperty>["data"];
  isLoading: boolean;
  isEditable: boolean;
  isSaving: boolean;
  createDraft: (listingKind: ListingKind) => Promise<string>;
  saveStep: (
    segment: WizardStepSegment,
    sections: Record<string, unknown>,
    listingKind: ListingKind,
  ) => Promise<void>;
  saveDraft: (
    segment: WizardStepSegment,
    sections: Record<string, unknown>,
    listingKind: ListingKind,
  ) => Promise<void>;
  getSectionData: <T>(sectionKey: string) => T | undefined;
};

const PropertyWizardContext = createContext<PropertyWizardContextValue | null>(
  null,
);

type PropertyWizardProviderProps = {
  children: ReactNode;
};

export function PropertyWizardProvider({
  children,
}: PropertyWizardProviderProps) {
  const paths = usePropertyWizardPaths();
  const searchParams = useSearchParams();
  const router = useRouter();
  const propertyId = searchParams.get("propertyId");

  const { data: property, isLoading } = useScopedProperty(
    propertyId ?? undefined,
  );
  const createDraftMutation = useScopedCreatePropertyDraftMutation();
  const saveDraftMutation = useScopedSavePropertyDraftMutation();

  const isEditable = property ? isPropertyEditable(property.status) : true;

  const createDraft = useCallback(
    async (listingKind: ListingKind) => {
      const created = await createDraftMutation.mutateAsync({
        listingKind,
        currentStep: "basicPropertyInformation",
        sections: {
          basicPropertyInformation: {},
        },
      });

      router.replace(
        createListingWizardHref(
          paths,
          listingKind,
          "basic-property-information",
          created.id,
        ),
      );

      return created.id;
    },
    [createDraftMutation, paths, router],
  );

  const persistStep = useCallback(
    async (
      segment: WizardStepSegment,
      sections: Record<string, unknown>,
      listingKind: ListingKind,
    ) => {
      if (!propertyId) {
        throw new Error("Property draft not created yet");
      }

      const sectionKey = segmentToSectionKey(segment);
      const body: SaveWizardDraftRequest = {
        listingKind,
        currentStep: sectionKey,
        sections,
      };

      await saveDraftMutation.mutateAsync({ id: propertyId, body });
    },
    [propertyId, saveDraftMutation],
  );

  const saveStep = useCallback(
    async (
      segment: WizardStepSegment,
      sections: Record<string, unknown>,
      listingKind: ListingKind,
    ) => {
      await persistStep(segment, sections, listingKind);
    },
    [persistStep],
  );

  const saveDraft = useCallback(
    async (
      segment: WizardStepSegment,
      sections: Record<string, unknown>,
      listingKind: ListingKind,
    ) => {
      await persistStep(segment, sections, listingKind);
    },
    [persistStep],
  );

  const getSectionData = useCallback(
    <T,>(sectionKey: string): T | undefined => {
      const sections = property?.metadata?.sections;
      if (!sections || !(sectionKey in sections)) return undefined;
      return sections[sectionKey] as T;
    },
    [property?.metadata?.sections],
  );

  const value = useMemo(
    () => ({
      propertyId,
      property,
      isLoading,
      isEditable,
      isSaving: createDraftMutation.isPending || saveDraftMutation.isPending,
      createDraft,
      saveStep,
      saveDraft,
      getSectionData,
    }),
    [
      propertyId,
      property,
      isLoading,
      isEditable,
      createDraftMutation.isPending,
      saveDraftMutation.isPending,
      createDraft,
      saveStep,
      saveDraft,
      getSectionData,
    ],
  );

  return (
    <PropertyWizardContext.Provider value={value}>
      {children}
    </PropertyWizardContext.Provider>
  );
}

export function usePropertyWizard() {
  const context = useContext(PropertyWizardContext);
  if (!context) {
    throw new Error(
      "usePropertyWizard must be used within PropertyWizardProvider",
    );
  }
  return context;
}

export function useOptionalPropertyWizard() {
  return useContext(PropertyWizardContext);
}
