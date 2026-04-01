// src/dashboards/shared/support/supportTypes.ts

export type TicketStatus = "Open" | "In Progress" | "Resolved";
export type TicketPriority = "Low" | "Medium" | "High";
export type TicketCategory =
  | "Billing"
  | "Technical"
  | "Course Issue"
  | "Account"
  | "Other";

export type TicketRole = "student" | "instructor";

export interface SupportNote {
  id: string;
  author: string;
  authorRole: "admin" | TicketRole;
  text: string;
  createdAt: Date;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  description: string;
  attachmentName?: string;
  submittedBy: string;
  submitterRole: TicketRole;
  createdAt: Date;
  updatedAt: Date;
  notes: SupportNote[];
}

// ── Seed ──────────────────────────────────────────────────────────────────────

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);

export const SEED_TICKETS: SupportTicket[] = [
  {
    id: "TKT-001",
    subject: "Unable to access course materials after payment",
    category: "Course Issue",
    priority: "High",
    status: "Open",
    description:
      "I completed payment for Advanced React & System Design 3 days ago but still cannot access the course content. The dashboard shows it as enrolled but every module is locked.",
    submittedBy: "Olusegun Adewale",
    submitterRole: "student",
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    notes: [],
  },
  {
    id: "TKT-002",
    subject: "Video upload failing for module 4",
    category: "Technical",
    priority: "High",
    status: "In Progress",
    description:
      "Every time I try to upload the lecture video for module 4 it fails at 98% with a timeout error. File size is 1.2 GB, format is MP4.",
    attachmentName: "upload_error_screenshot.png",
    submittedBy: "Sarah Mitchell",
    submitterRole: "instructor",
    createdAt: daysAgo(3),
    updatedAt: daysAgo(1),
    notes: [
      {
        id: "note-1",
        author: "Admin",
        authorRole: "admin",
        text: "Looking into the upload timeout limit. Will update shortly.",
        createdAt: daysAgo(1),
      },
    ],
  },
  {
    id: "TKT-003",
    subject: "Incorrect charge on my invoice",
    category: "Billing",
    priority: "Medium",
    status: "Open",
    description:
      "My last invoice shows a charge of $149 but I subscribed to the $99 plan. Please review and issue a refund for the difference.",
    submittedBy: "Mei-Ling Chen",
    submitterRole: "student",
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
    notes: [],
  },
  {
    id: "TKT-004",
    subject: "Student quiz submissions not showing in gradebook",
    category: "Technical",
    priority: "Medium",
    status: "Resolved",
    description:
      "Several students have submitted the Week 2 quiz but their scores are not appearing in my gradebook. This is affecting grade calculations.",
    submittedBy: "Luca Ferreira",
    submitterRole: "instructor",
    createdAt: daysAgo(10),
    updatedAt: daysAgo(6),
    notes: [
      {
        id: "note-2",
        author: "Admin",
        authorRole: "admin",
        text: "Identified a sync bug in the gradebook. Deployed a fix — all scores should now be visible.",
        createdAt: daysAgo(6),
      },
    ],
  },
  {
    id: "TKT-005",
    subject: "Cannot update profile picture",
    category: "Account",
    priority: "Low",
    status: "Open",
    description:
      "The profile picture upload button does nothing when clicked. Tried on Chrome and Firefox.",
    submittedBy: "Tobias Richter",
    submitterRole: "student",
    createdAt: daysAgo(7),
    updatedAt: daysAgo(7),
    notes: [],
  },
];