import { StaffMember } from "@/components/merchant/staffs/helpers";

export const MOCK_STAFF: StaffMember[] = [
  {
    id: "s-001",
    name: "Akachi Ezekiel",
    email: "hello@ekofashion.ng",
    role: "admin",
    status: "active",
    joinedAt: "2026-01-15T00:00:00Z",
    lastActive: "2026-06-28T10:30:00Z",
    avatarColor: "#0A2E1A",
  },
  {
    id: "s-002",
    name: "Chidinma Okafor",
    email: "chidinma@ekofashion.ng",
    role: "staff",
    status: "active",
    joinedAt: "2026-03-01T00:00:00Z",
    lastActive: "2026-06-27T14:15:00Z",
    avatarColor: "#0369a1",
  },
  {
    id: "s-003",
    name: "Emeka Nwosu",
    email: "emeka@ekofashion.ng",
    role: "staff",
    status: "active",
    joinedAt: "2026-04-10T00:00:00Z",
    lastActive: "2026-06-26T09:00:00Z",
    avatarColor: "#1A7A42",
  },
  {
    id: "s-004",
    name: "Fatima Al-Hassan",
    email: "fatima@ekofashion.ng",
    role: "staff",
    status: "invited",
    invitedAt: "2026-06-25T00:00:00Z",
    avatarColor: "#7c3aed",
  },
];
