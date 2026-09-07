import {
  ChallengeDomain,
  ChallengePriority,
  ChallengeStatus,
  OrganizationType,
  UserRole,
} from "@/generated/prisma/enums";

export const CHALLENGE_DOMAIN_LABELS: Record<ChallengeDomain, string> = {
  [ChallengeDomain.EDUCATION]: "Education",
  [ChallengeDomain.HEALTHCARE]: "Healthcare",
  [ChallengeDomain.AGRICULTURE]: "Agriculture",
  [ChallengeDomain.WATER_RESOURCES]: "Water Resources",
  [ChallengeDomain.SANITATION]: "Sanitation",
  [ChallengeDomain.ENVIRONMENT]: "Environment",
  [ChallengeDomain.ENERGY]: "Energy",
  [ChallengeDomain.URBAN_DEVELOPMENT]: "Urban Development",
  [ChallengeDomain.ACCESSIBILITY]: "Accessibility",
  [ChallengeDomain.PUBLIC_ADMINISTRATION]: "Public Administration",
  [ChallengeDomain.RURAL_LIVELIHOODS]: "Rural Livelihoods",
  [ChallengeDomain.TRANSPORTATION]: "Transportation",
  [ChallengeDomain.DIGITAL_SERVICES]: "Digital Services",
  [ChallengeDomain.DISASTER_MANAGEMENT]: "Disaster Management",
  [ChallengeDomain.OTHER]: "Other",
};

export const CHALLENGE_STATUS_LABELS: Record<ChallengeStatus, string> = {
  [ChallengeStatus.DRAFT]: "Draft",
  [ChallengeStatus.SUBMITTED]: "Submitted",
  [ChallengeStatus.UNDER_REVIEW]: "Under Review",
  [ChallengeStatus.VALIDATION_REQUIRED]: "Validation Required",
  [ChallengeStatus.VALIDATED]: "Validated",
  [ChallengeStatus.REJECTED]: "Rejected",
  [ChallengeStatus.MATCHING]: "Matching",
  [ChallengeStatus.ASSIGNED]: "Assigned",
  [ChallengeStatus.ACCEPTED]: "Accepted",
  [ChallengeStatus.IN_PROGRESS]: "In Progress",
  [ChallengeStatus.PILOT]: "Pilot",
  [ChallengeStatus.VALIDATION]: "Validation",
  [ChallengeStatus.IMPLEMENTED]: "Implemented",
  [ChallengeStatus.RESOLVED]: "Resolved",
  [ChallengeStatus.ARCHIVED]: "Archived",
};

export const CHALLENGE_PRIORITY_LABELS: Record<ChallengePriority, string> = {
  [ChallengePriority.LOW]: "Low",
  [ChallengePriority.MEDIUM]: "Medium",
  [ChallengePriority.HIGH]: "High",
  [ChallengePriority.CRITICAL]: "Critical",
};

export const ORG_TYPE_LABELS: Record<OrganizationType, string> = {
  [OrganizationType.UNIVERSITY]: "University / HEI",
  [OrganizationType.GOVERNMENT_DEPARTMENT]: "Government Department",
  [OrganizationType.INDUSTRY]: "Industry",
  [OrganizationType.STARTUP]: "Startup",
  [OrganizationType.MSME]: "MSME",
  [OrganizationType.CSR]: "CSR Organization",
  [OrganizationType.RESEARCH_LAB]: "Research Lab",
  [OrganizationType.NGO]: "NGO / Community",
  [OrganizationType.OTHER]: "Other",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.CITIZEN]: "Citizen",
  [UserRole.GOVERNMENT]: "Government",
  [UserRole.ADMIN]: "Administrator",
  [UserRole.UNIVERSITY_ADMIN]: "University Admin",
  [UserRole.FACULTY]: "Faculty",
  [UserRole.STUDENT]: "Student",
  [UserRole.INDUSTRY]: "Industry",
  [UserRole.MENTOR]: "Mentor",
};

export const ALL_ROLES = Object.values(UserRole);
export const ALL_DOMAINS = Object.values(ChallengeDomain);
export const ALL_CHALLENGE_STATUSES = Object.values(ChallengeStatus);
export const ALL_PRIORITIES = Object.values(ChallengePriority);