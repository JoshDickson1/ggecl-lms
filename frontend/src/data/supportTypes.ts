// src/dashboards/shared/support/supportTypes.ts

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH";
export type TicketCategory =
  | "BILLING"
  | "TECHNICAL"
  | "COURSE_ISSUE"
  | "ACCOUNT"
  | "OTHER";

export type TicketRole = "student" | "instructor";

export interface SupportNote {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    role: string;
    image?: string | null;
  };
  createdAt: Date | string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  description: string;
  attachment?: string | null;
  resolvedAt?: Date | null;
  user: {
    id: string;
    name: string;
    role: string;
    image?: string | null;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
  notes: SupportNote[];
}

// ── Seed ──────────────────────────────────────────────────────────────────────

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);

export const SEED_TICKETS: SupportTicket[] = [
  {
    id: "TKT-001",
    ticketNumber: "TKT-001",
    subject: "Unable to access course materials after payment",
    category: "COURSE_ISSUE",
    priority: "HIGH",
    status: "OPEN",
    description:
      "I completed payment for Advanced React & System Design 3 days ago but still cannot access the course content. The dashboard shows it as enrolled but every module is locked.",
    user: {
      id: "stu_001",
      name: "Olusegun Adewale",
      role: "student",
    },
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    notes: [],
  },
  {
    id: "TKT-002",
    ticketNumber: "TKT-002",
    subject: "Video upload failing for module 4",
    category: "TECHNICAL",
    priority: "HIGH",
    status: "IN_PROGRESS",
    description:
      "Every time I try to upload the lecture video for module 4 it fails at 98% with a timeout error. File size is 1.2 GB, format is MP4.",
    attachment: "upload_error_screenshot.png",
    user: {
      id: "ins_001",
      name: "Sarah Mitchell",
      role: "instructor",
    },
    createdAt: daysAgo(3),
    updatedAt: daysAgo(1),
    notes: [
      {
        id: "note-1",
        content: "Looking into the upload timeout limit. Will update shortly.",
        author: {
          id: "adm_001",
          name: "Admin",
          role: "admin",
        },
        createdAt: daysAgo(1),
      },
    ],
  },
  {
    id: "TKT-003",
    ticketNumber: "TKT-003",
    subject: "Incorrect charge on my invoice",
    category: "BILLING",
    priority: "MEDIUM",
    status: "OPEN",
    description:
      "My last invoice shows a charge of $149 but I subscribed to the $99 plan. Please review and issue a refund for the difference.",
    user: {
      id: "stu_002",
      name: "Mei-Ling Chen",
      role: "student",
    },
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
    notes: [],
  },
  {
    id: "TKT-004",
    ticketNumber: "TKT-004",
    subject: "Student quiz submissions not showing in gradebook",
    category: "TECHNICAL",
    priority: "MEDIUM",
    status: "RESOLVED",
    description:
      "Several students have submitted the Week 2 quiz but their scores are not appearing in my gradebook. This is affecting grade calculations.",
    user: {
      id: "ins_002",
      name: "Luca Ferreira",
      role: "instructor",
    },
    resolvedAt: daysAgo(6),
    createdAt: daysAgo(10),
    updatedAt: daysAgo(6),
    notes: [
      {
        id: "note-2",
        content: "Identified a sync bug in the gradebook. Deployed a fix — all scores should now be visible.",
        author: {
          id: "adm_001",
          name: "Admin",
          role: "admin",
        },
        createdAt: daysAgo(6),
      },
    ],
  },
  {
    id: "TKT-005",
    ticketNumber: "TKT-005",
    subject: "Cannot update profile picture",
    category: "ACCOUNT",
    priority: "LOW",
    status: "OPEN",
    description:
      "The profile picture upload button does nothing when clicked. Tried on Chrome and Firefox.",
    user: {
      id: "stu_003",
      name: "Tobias Richter",
      role: "student",
    },
    createdAt: daysAgo(7),
    updatedAt: daysAgo(7),
    notes: [],
  },
];