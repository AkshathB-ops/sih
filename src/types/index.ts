// Shared domain types used across the application boundary.

export type Permission =
  | "challenge:create"
  | "challenge:viewOwn"
  | "challenge:viewAll"
  | "challenge:review"
  | "challenge:assign"
  | "challenge:transition"
  | "challenge:submitOwn"
  | "challenge:comment"
  | "project:create"
  | "project:manage"
  | "project:viewAll"
  | "industry:expressInterest"
  | "dashboard:gov"
  | "dashboard:university"
  | "dashboard:industry"
  | "notifications:viewOwn";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  district?: string | null;
}