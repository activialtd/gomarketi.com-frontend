export type OnboardingStep =
  | "account_created"
  | "business_details"
  | "store_profile"
  | "location_set"
  | "kyc_submitted"
  | "completed"; //

export type BusinessType =
  | "sole_trader"
  | "partnership"
  | "limited_company"
  | "ngo"; //
export type EmployeeRange = "1" | "2-5" | "6-20" | "21-50" | "50+"; //[cite: 1]

export interface Vendor {
  id: string;
  user_id: string;
  business_name: string; //[cite: 1]
  business_type: BusinessType; //[cite: 1]
  employee_range?: EmployeeRange; //[cite: 1]
  year_established?: number; //[cite: 1]
  onboarding_step: OnboardingStep; //[cite: 1]
  kyc_status: "pending" | "verified" | "rejected"; //[cite: 1]
}

export interface Store {
  id: string;
  vendor_id: string;
  name: string; //[cite: 1]
  slug: string; //[cite: 1]
  logo_url: string; //[cite: 1]
  address: string; //[cite: 1]
  city: string; //[cite: 1]
  state: string; //[cite: 1]
  coordinates: { lat: number; lng: number }; //[cite: 1]
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";
export type PaymentMethod = "card" | "transfer" | "paystack" | "cash" | "ussd";
export type ShippingMethod = "pickup" | "delivery" | "express";

export type BankAccount = {
  id: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
  verifiedAt: string;
};
