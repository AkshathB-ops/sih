// Phase 1 seed data for the Societal Innovation Collaboration Portal.
// Creates clearly-labeled demo users, organizations with structured
// capabilities, sample challenges across the lifecycle, a project, activity
// history, notifications and audit entries.
//
// Run: npm run db:seed   (or:  npx prisma db seed)

import "dotenv/config";

import {
  ChallengeDomain,
  ChallengePriority,
  ChallengeStatus,
  IndustryCollaborationStatus,
  MilestoneStatus,
  OrganizationType,
  ProjectStatus,
  UserRole,
} from "@/generated/prisma/client";

import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";

async function main() {
  // ── Reset in dependency order ─────────────────────────────────────────
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.impactMetric.deleteMany();
  await prisma.industryCollaboration.deleteMany();
  await prisma.document.deleteMany();
  await prisma.deliverable.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.challengeReview.deleteMany();
  await prisma.challengeAssignment.deleteMany();
  await prisma.challengeStatusHistory.deleteMany();
  await prisma.challengeEvidence.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.student.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.universityDepartment.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // ── Users ─────────────────────────────────────────────────────────────
  const passwordHash = await hashPassword("Demo@1234");

  const admin = await prisma.user.create({
    data: { email: "admin@jharkha.in", name: "Arjun Mehta", role: UserRole.ADMIN, district: "Ranchi", passwordHash },
  });
  const gov = await prisma.user.create({
    data: { email: "gov@jharkha.in", name: "Sushma Devi", role: UserRole.GOVERNMENT, district: "Ranchi", passwordHash },
  });
  const citizen = await prisma.user.create({
    data: { email: "citizen@example.com", name: "Ramesh Mahto", role: UserRole.CITIZEN, district: "Ranchi", passwordHash },
  });
  const citizen2 = await prisma.user.create({
    data: { email: "farida@example.com", name: "Farida Khatoon", role: UserRole.CITIZEN, district: "Godda", passwordHash },
  });
  const uniAdmin = await prisma.user.create({
    data: { email: "admin@nit-ranchi.in", name: "Dr. Kavita Sinha", role: UserRole.UNIVERSITY_ADMIN, district: "Ranchi", passwordHash },
  });
  const faculty = await prisma.user.create({
    data: { email: "prof@nit-ranchi.in", name: "Dr. Rakesh Banerjee", role: UserRole.FACULTY, district: "Ranchi", passwordHash },
  });
  const student = await prisma.user.create({
    data: { email: "student@nit-ranchi.in", name: "Ankit Kumar", role: UserRole.STUDENT, district: "Ranchi", passwordHash },
  });
  const industryUser = await prisma.user.create({
    data: { email: "csr@tatasteel.in", name: "Meera Agarwal", role: UserRole.INDUSTRY, district: "Jamshedpur", passwordHash },
  });

  // ── Organizations ─────────────────────────────────────────────────────
  const nit = await prisma.organization.create({
    data: {
      name: "National Institute of Technology, Ranchi",
      slug: "nit-ranchi",
      orgType: OrganizationType.UNIVERSITY,
      description: "Leading engineering and technology institute in Jharkhand.",
      location: "Ranchi",
      district: "Ranchi",
      website: "https://nitranchi.ac.in",
      disciplines: ["Civil Engineering", "Computer Science", "Mechanical Engineering", "Environmental Engineering", "Water Resource Engineering"],
      researchAreas: ["Water resources", "Disaster management", "Rural infrastructure", "Clean energy", "Waste management"],
      labs: ["Hydraulics Lab", "Environmental Lab", "Renewable Energy Lab", "GIS Lab"],
      innovationCentres: ["Innovation and Incubation Centre", "Smart City Research Centre"],
      incubation: true,
      sectors: ["Water", "Disaster Management", "Energy"],
      expertise: ["Hydrology", "Geoinformatics", "Structural health", "Community engagement"],
      technologies: ["IoT sensors", "Drone surveying", "Remote sensing", "Machine learning"],
      departments: {
        create: [
          { name: "Civil Engineering", disciplines: ["Structural Engineering", "Water Resources"], researchAreas: ["Low-cost housing", "Flood modelling"] },
          { name: "Computer Science", disciplines: ["AI/ML", "Software Systems"], researchAreas: ["Civic tech", "Data analytics"] },
        ],
      },
      faculty: { create: [{ userId: faculty.id, title: "Associate Professor", expertise: ["Hydrology", "IoT", "Flood early warning"] }] },
      students: { create: [{ userId: student.id, program: "B.Tech Civil Engineering" }] },
    },
  });

  const ranchiUni = await prisma.organization.create({
    data: {
      name: "Ranchi University",
      slug: "ranchi-university",
      orgType: OrganizationType.UNIVERSITY,
      description: "Multi-faculty state university serving Jharkhand.",
      location: "Ranchi",
      district: "Ranchi",
      disciplines: ["Agriculture Sciences", "Economics", "Public Health", "Social Work"],
      researchAreas: ["Agri value chains", "Maternal health", "Livelihoods", "Labour studies"],
      labs: ["Soil Testing Lab", "Public Health Lab"],
      innovationCentres: ["Entrepreneurship Cell"],
      incubation: false,
      sectors: ["Agriculture", "Health", "Livelihoods"],
      expertise: ["Field surveys", "Behaviour change", "Policy research"],
      technologies: ["GIS", "Survey tools"],
    },
  });

  const ismdhanbad = await prisma.organization.create({
    data: {
      name: "IIT (ISM) Dhanbad",
      slug: "iit-ism-dhanbad",
      orgType: OrganizationType.UNIVERSITY,
      description: "Premier institute focused on mining, energy and earth sciences.",
      location: "Dhanbad",
      district: "Dhanbad",
      disciplines: ["Mining Engineering", "Environmental Science", "Geology", "Mechanical Engineering"],
      researchAreas: ["Air quality", "Land reclamation", "Mine safety", "Clean energy"],
      labs: ["Air Quality Lab", "Environmental Geotech Lab", "Energy Lab"],
      innovationCentres: ["Research and Incubation Centre"],
      incubation: true,
      sectors: ["Environment", "Energy", "Mining"],
      expertise: ["Pollution monitoring", "Mine closure", "Rehabilitation"],
      technologies: ["Sensors", "Data analytics"],
    },
  });

  const tataSteel = await prisma.organization.create({
    data: {
      name: "Tata Steel Foundation",
      slug: "tata-steel-foundation",
      orgType: OrganizationType.CSR,
      description: "CSR arm of Tata Steel operating across Jharkhand.",
      location: "Jamshedpur",
      district: "East Singhbhum",
      website: "https://www.tatasteel.com",
      disciplines: ["Community Development", "Public Health", "Education", "Skill Development"],
      researchAreas: ["Rural health", "Education outcomes", "Livelihoods"],
      labs: [],
      innovationCentres: [],
      incubation: false,
      fundingCapability: true,
      mentorshipCapability: true,
      prototypingCapability: false,
      deploymentCapability: true,
      sectors: ["Health", "Education", "Livelihoods"],
      expertise: ["Community programmes", "Monitoring and evaluation"],
      technologies: [],
      members: { create: [{ userId: industryUser.id, designation: "Head – CSR Partnerships" }] },
    },
  });

  const rmc = await prisma.organization.create({
    data: {
      name: "Ranchi Municipal Corporation",
      slug: "ranchi-municipal-corporation",
      orgType: OrganizationType.GOVERNMENT_DEPARTMENT,
      description: "Urban local body for Ranchi.",
      location: "Ranchi",
      district: "Ranchi",
    },
  });

  // ── Challenges ────────────────────────────────────────────────────────
  const water = await prisma.challenge.create({
    data: {
      userId: citizen.id,
      title: "Erratic water supply in Harmu slum",
      description:
        "Residents of Harmu slum receive water only a few hours a week from tankers, and the borewells dry up in summer. Families must skip work to queue for water.",
      problemStatement: "Design a low-cost, community-managed water access system for the area.",
      district: "Ranchi",
      block: "Harmu",
      villageWard: "Ward 8",
      primaryDomain: ChallengeDomain.WATER_RESOURCES,
      secondaryDomains: [ChallengeDomain.URBAN_DEVELOPMENT],
      tags: ["water", "slum", "tanker", "boring"],
      urgency: ChallengePriority.HIGH,
      priority: ChallengePriority.CRITICAL,
      affectedPopulation: "~4,000 residents",
      geographicScope: "Single ward",
      status: ChallengeStatus.VALIDATED,
      aiSummary: "Water access scarcity in an urban slum with chronic supply gaps.",
      submittedAt: new Date(Date.now() - 14 * 86400000),
      reviewedAt: new Date(Date.now() - 10 * 86400000),
      statusHistory: {
        create: [
          { fromStatus: ChallengeStatus.SUBMITTED, toStatus: ChallengeStatus.VALIDATED, changedById: gov.id, note: "Verified with ward councillor" },
        ],
      },
      reviews: {
        create: [
          { reviewerId: gov.id, decision: "APPROVED", notes: "Validated against corporator's report; high impact.", priority: ChallengePriority.CRITICAL },
        ],
      },
    },
  });

  const drainage = await prisma.challenge.create({
    data: {
      userId: citizen2.id,
      title: "Open drainage next to Upper Bazaar middle school",
      description:
        "An open drain runs right beside the school gate. In monsoon it overflows, creating a health and safety hazard for around 600 students.",
      district: "Godda",
      primaryDomain: ChallengeDomain.SANITATION,
      secondaryDomains: [ChallengeDomain.HEALTHCARE],
      tags: ["drainage", "school", "flooding", "children"],
      urgency: ChallengePriority.HIGH,
      priority: ChallengePriority.HIGH,
      affectedPopulation: "~600 students plus residents",
      geographicScope: "Single locality",
      status: ChallengeStatus.SUBMITTED,
      submittedAt: new Date(Date.now() - 3 * 86400000),
    },
  });

  const flood = await prisma.challenge.create({
    data: {
      userId: citizen.id,
      title: "Monsoon flooding cuts off villages in Koderma",
      description:
        "Every monsoon, four panchayats in Koderma get cut off for 2-3 weeks because the connecting culverts and embankments wash away.",
      district: "Koderma",
      primaryDomain: ChallengeDomain.DISASTER_MANAGEMENT,
      secondaryDomains: [ChallengeDomain.RURAL_LIVELIHOODS],
      tags: ["flood", "culvert", "embankment", "isolation"],
      urgency: ChallengePriority.CRITICAL,
      priority: ChallengePriority.HIGH,
      affectedPopulation: "~8,000 people across 4 panchayats",
      geographicScope: "District sub-region",
      status: ChallengeStatus.ASSIGNED,
      assignedOrganizationId: nit.id,
      submittedAt: new Date(Date.now() - 40 * 86400000),
      reviewedAt: new Date(Date.now() - 30 * 86400000),
      statusHistory: {
        create: [
          { fromStatus: ChallengeStatus.SUBMITTED, toStatus: ChallengeStatus.VALIDATED, changedById: gov.id, note: "District emergency cell confirmed data" },
          { fromStatus: ChallengeStatus.VALIDATED, toStatus: ChallengeStatus.MATCHING, changedById: gov.id, note: "Entered matching" },
          { fromStatus: ChallengeStatus.MATCHING, toStatus: ChallengeStatus.ASSIGNED, changedById: gov.id, note: "Assigned to NIT Ranchi" },
        ],
      },
      reviews: {
        create: [
          { reviewerId: gov.id, decision: "APPROVED", notes: "Recurring annual issue; disaster cell endorses.", priority: ChallengePriority.HIGH },
        ],
      },
      assignments: {
        create: [
          { organizationId: nit.id, status: "ACCEPTED", assignedById: gov.id, notes: "NIT team agreed to study flood routing." },
        ],
      },
    },
  });

  const middayMeal = await prisma.challenge.create({
    data: {
      userId: citizen2.id,
      title: "Midday meal quality not visibly monitored in Godda schools",
      description:
        "There is no transparent, community-accessible record of midday meal quality or nutrition in higher secondary schools across the district.",
      district: "Godda",
      primaryDomain: ChallengeDomain.EDUCATION,
      secondaryDomains: [ChallengeDomain.HEALTHCARE],
      tags: ["midday meal", "nutrition", "transparency", "schools"],
      urgency: ChallengePriority.MEDIUM,
      priority: ChallengePriority.MEDIUM,
      affectedPopulation: "All mid-day meal beneficiaries in district",
      geographicScope: "District-wide",
      status: ChallengeStatus.UNDER_REVIEW,
      submittedAt: new Date(Date.now() - 1 * 86400000),
    },
  });

  const wasteAir = await prisma.challenge.create({
    data: {
      userId: citizen.id,
      title: "Detectable smoke from illegal waste burning in East Singhbhum",
      description:
        "Informal waste burning produces visible smoke near residential clusters. Citizens want monitoring plus a community reporting mechanism.",
      district: "East Singhbhum",
      primaryDomain: ChallengeDomain.ENVIRONMENT,
      secondaryDomains: [ChallengeDomain.HEALTHCARE],
      tags: ["air quality", "waste burning", "monitoring"],
      urgency: ChallengePriority.MEDIUM,
      priority: ChallengePriority.MEDIUM,
      affectedPopulation: "~15,000 residents near clusters",
      geographicScope: "Two municipal wards",
      status: ChallengeStatus.SUBMITTED,
      submittedAt: new Date(Date.now() - 2 * 86400000),
    },
  });

  // ── Project for the assigned challenge ────────────────────────────────
  const project = await prisma.project.create({
    data: {
      challengeId: flood.id,
      title: "Community flood-resilient culvert design for Koderma",
      description: "Engineering study and prototype for resilient culverts using local materials.",
      organizationId: nit.id,
      ownerId: faculty.id,
      status: ProjectStatus.IN_PROGRESS,
      objectives: "Reduce weeks of isolation; co-design with panchayats; low-cost durable materials.",
      methodology: "Hydrological modelling + community surveys + prototype culvert panels.",
      members: {
        create: [
          { userId: faculty.id, role: "FACULTY", isLead: true },
          { userId: student.id, role: "STUDENT", isLead: false },
          { userId: uniAdmin.id, role: "FACULTY", isLead: false },
        ],
      },
      milestones: {
        create: [
          { name: "Kickoff", description: "Project initiation and planning", status: MilestoneStatus.COMPLETED, completionPct: 100 },
          { name: "Hydrological survey", description: "Field data collection across four panchayats", status: MilestoneStatus.IN_PROGRESS, completionPct: 50 },
        ],
      },
      impactMetrics: {
        create: [{ key: "villages reached", value: 4, unit: "panchayats" }],
      },
      collaborations: {
        create: [
          {
            organizationId: tataSteel.id,
            status: IndustryCollaborationStatus.INTERESTED,
            roles: ["FUNDING", "MENTORSHIP"],
            notes: "Interested in funding prototype fabrication.",
          },
        ],
      },
    },
  });

  // ── Notifications, audit ──────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      { userId: citizen.id, type: "CHALLENGE_SUBMISSION", title: "Challenge submitted", body: "Flood challenge submitted and awaiting review.", link: `/challenges/${flood.id}` },
      { userId: citizen.id, type: "CHALLENGE_STATUS", title: "Challenge assigned", body: "Flood challenge assigned to NIT Ranchi.", link: `/challenges/${flood.id}` },
      { userId: gov.id, type: "ADMIN_ACTION", title: "New challenge to review", body: "Open drainage challenge is pending review.", link: `/challenges/${drainage.id}` },
      { userId: industryUser.id, type: "INDUSTRY_INTEREST", title: "Industry interest recorded", body: "Tata Steel Foundation expressed interest in the Koderma flood project.", link: `/projects/${project.id}` },
    ],
  });

  await prisma.auditLog.createMany({
    data: [
      { userId: admin.id, action: "seed.installed", entityType: "System", entityId: "seed", metadata: { demo: true } },
      { userId: gov.id, action: "challenge.reviewed", entityType: "Challenge", entityId: flood.id, metadata: { decision: "APPROVED" } },
      { userId: gov.id, action: "challenge.assigned", entityType: "Challenge", entityId: flood.id, metadata: { organizationId: nit.id } },
    ],
  });

  console.log("Seed complete.");
  console.log("Demo credentials (password: Demo@1234):");
  console.log(`  Admin     admin@jharkha.in`);
  console.log(`  Government gov@jharkha.in`);
  console.log(`  Citizen   citizen@example.com`);
  console.log(`  University admin@nit-ranchi.in`);
  console.log(`  Faculty   prof@nit-ranchi.in`);
  console.log(`  Student   student@nit-ranchi.in`);
  console.log(`  Industry  csr@tatasteel.in`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());