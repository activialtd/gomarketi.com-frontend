import { create } from "zustand";
import { BusinessType, EmployeeRange } from "@gomarket/shared-types";

export interface OnboardingState {
  // Step 1: Business Draft State
  businessName: string;
  businessType: BusinessType | null;
  employeeRange: EmployeeRange | null;
  yearEstablished?: number;

  // Step 2: Store Draft State
  storeName: string;
  storeSlug: string;
  storeTagline: string;
  supportPhone: string;
  logoUrl: string | null;

  // Actions
  updateData: (data: Partial<OnboardingState>) => void;
  resetStore: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  businessName: "",
  businessType: null,
  employeeRange: null,

  storeName: "",
  storeSlug: "",
  storeTagline: "",
  supportPhone: "",
  logoUrl: null,

  updateData: (data) => set((state) => ({ ...state, ...data })),

  resetStore: () =>
    set({
      businessName: "",
      businessType: null,
      employeeRange: null,
      storeName: "",
      storeSlug: "",
      storeTagline: "",
      supportPhone: "",
      logoUrl: null,
    }),
}));
