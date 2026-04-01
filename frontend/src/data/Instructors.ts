import type { LucideIcon } from "lucide-react";
import {
  Code2, Megaphone, Atom, Telescope, PenLine,
  ListOrdered, HeartPulse, Music4, Briefcase,
  Camera, FlaskConical, Globe,
} from "lucide-react";

export type SocialLink = {
  platform: "website" | "linkedin" | "twitter" | "github" | "youtube";
  url: string;
};

export type CourseSnippet = {
  id: string;
  title: string;
  thumbnail: string; // tailwind gradient
  icon: LucideIcon;
  rating: number;
  students: number;
  price: number;
};

export type RatingBreakdown = {
  star: number;
  pct: number;
};

export type Instructor = {
  id: string;
  name: string;
  avatar: string;        // initials
  avatarBg: string;      // tailwind bg class
  photo?: string;        // optional real photo path
  title: string;         // short role line
  bio: string;           // long paragraph
  bio2?: string;         // second paragraph
  expertise: string[];
  experience: string;    // paragraph
  experience2?: string;
  categoryIds: string[]; // which categories they teach
  rating: number;
  reviews: number;
  students: number;
  courses: number;
  ratingBreakdown: RatingBreakdown[];
  socials: SocialLink[];
  badges: string[];      // e.g. "Top Rated", "Bestseller"
  featured?: boolean;
  courseSnippets: CourseSnippet[];
};

export const instructors: Instructor[] = [
  {
    id: "inst-1",
    name: "Sarah Mitchell",
    avatar: "SM",
    avatarBg: "bg-blue-500",
    title: "Senior Software Engineer · React & TypeScript Expert",
    bio: "Sarah Mitchell is a Senior Software Engineer with 9 years of industry experience building large-scale frontend systems at top-tier technology companies. She has led engineering teams at Series B and Series C startups, shipped products used by millions, and is a frequent speaker at React conferences.",
    bio2: "As an educator, Sarah believes learning happens best through building real things. Her courses are project-driven, deeply practical, and built around the patterns she uses every single day on the job.",
    expertise: [
      "React 18 & Next.js Architecture",
      "TypeScript & Advanced Type Patterns",
      "State Management (Zustand, Redux Toolkit)",
      "Performance Optimisation & Web Vitals",
      "Component Design Systems",
      "Testing with Vitest & Playwright",
      "CI/CD & Frontend DevOps",
      "Code Review & Engineering Mentorship",
    ],
    experience: "Before teaching full-time, Sarah was a Staff Engineer at a Series C fintech company, where she led a team of 11 frontend engineers, architected a component library used across 6 product lines, and reduced Time-to-Interactive by 58% across the platform.",
    experience2: "She has consulted for clients in fintech, healthtech, and SaaS, and holds certifications in AWS Cloud Practitioner and Google Associate Cloud Engineer.",
    categoryIds: ["development"],
    rating: 4.9,
    reviews: 12400,
    students: 54200,
    courses: 8,
    ratingBreakdown: [
      { star: 5, pct: 82 }, { star: 4, pct: 12 }, { star: 3, pct: 4 },
      { star: 2, pct: 1 }, { star: 1, pct: 1 },
    ],
    socials: [
      { platform: "website", url: "#" },
      { platform: "github", url: "#" },
      { platform: "twitter", url: "#" },
      { platform: "linkedin", url: "#" },
    ],
    badges: ["Top Rated", "Bestseller"],
    featured: true,
    courseSnippets: [
      {
        id: "dev-001",
        title: "The Complete React & TypeScript Bootcamp 2024",
        thumbnail: "from-blue-500 to-cyan-400",
        icon: Code2,
        rating: 4.9,
        students: 54200,
        price: 14.99,
      },
      {
        id: "dev-003",
        title: "Python for Data Science & Machine Learning",
        thumbnail: "from-yellow-500 to-orange-400",
        icon: Code2,
        rating: 4.7,
        students: 29400,
        price: 13.99,
      },
    ],
  },
  {
    id: "inst-2",
    name: "James Okafor",
    avatar: "JO",
    avatarBg: "bg-emerald-500",
    title: "Full Stack Developer & Educator",
    bio: "James Okafor is a Full Stack Developer with 7 years of experience building scalable backend systems and modern web applications. He has worked across fintech, logistics, and e-commerce, and is passionate about making backend engineering approachable for everyone.",
    bio2: "His teaching style combines deep technical rigour with clear, jargon-free explanations. James believes anyone can master backend engineering with the right roadmap.",
    expertise: [
      "Node.js & Express Architecture",
      "REST & GraphQL API Design",
      "MongoDB, PostgreSQL & Redis",
      "Authentication & Security (JWT, OAuth)",
      "Docker & Kubernetes Basics",
      "Microservices Architecture",
      "WebSockets & Real-Time Systems",
      "Backend Testing & TDD",
    ],
    experience: "James spent 5 years as a Backend Engineer at a logistics unicorn, where he designed APIs handling 10M+ requests per day and led the migration from a monolith to a microservices architecture.",
    experience2: "He is an open-source contributor, a technical writer, and has mentored over 300 developers through 1-on-1 coaching sessions.",
    categoryIds: ["development"],
    rating: 4.8,
    reviews: 8700,
    students: 38100,
    courses: 6,
    ratingBreakdown: [
      { star: 5, pct: 76 }, { star: 4, pct: 16 }, { star: 3, pct: 5 },
      { star: 2, pct: 2 }, { star: 1, pct: 1 },
    ],
    socials: [
      { platform: "website", url: "#" },
      { platform: "github", url: "#" },
      { platform: "linkedin", url: "#" },
    ],
    badges: ["Top Rated"],
    featured: true,
    courseSnippets: [
      {
        id: "dev-002",
        title: "Node.js, Express & MongoDB: Backend Masterclass",
        thumbnail: "from-green-500 to-emerald-400",
        icon: Code2,
        rating: 4.8,
        students: 38100,
        price: 12.99,
      },
    ],
  },
  {
    id: "inst-3",
    name: "Amara Nwosu",
    avatar: "AN",
    avatarBg: "bg-pink-500",
    title: "Marketing Strategist · Growth & Brand Expert",
    bio: "Amara Nwosu is a seasoned Marketing Strategist with 8 years of experience growing brands across Africa, Europe, and North America. She specialises in digital marketing, paid acquisition, and content strategy, and has managed ad budgets exceeding $2M.",
    bio2: "Her courses are built on real campaigns she has run — every framework she teaches is one she has tested and proven in the field.",
    expertise: [
      "Digital Marketing Strategy",
      "SEO & Content Marketing",
      "Google Ads & Meta Ads",
      "Email Marketing & Automation",
      "Brand Positioning & Storytelling",
      "Growth Hacking Techniques",
      "Analytics & Conversion Optimisation",
      "Social Media Strategy",
    ],
    experience: "Amara has worked as Head of Growth at two venture-backed startups, scaling one from 0 to 200k monthly active users in 18 months. She has also run her own digital marketing consultancy serving clients across 12 countries.",
    categoryIds: ["marketing"],
    rating: 4.7,
    reviews: 9200,
    students: 41600,
    courses: 5,
    ratingBreakdown: [
      { star: 5, pct: 71 }, { star: 4, pct: 18 }, { star: 3, pct: 7 },
      { star: 2, pct: 3 }, { star: 1, pct: 1 },
    ],
    socials: [
      { platform: "website", url: "#" },
      { platform: "linkedin", url: "#" },
      { platform: "twitter", url: "#" },
    ],
    badges: ["Bestseller"],
    featured: true,
    courseSnippets: [
      {
        id: "mkt-001",
        title: "Digital Marketing Masterclass: SEO, Ads & Social",
        thumbnail: "from-violet-500 to-purple-400",
        icon: Megaphone,
        rating: 4.8,
        students: 41600,
        price: 11.99,
      },
    ],
  },
  {
    id: "inst-4",
    name: "David Chen",
    avatar: "DC",
    avatarBg: "bg-violet-500",
    title: "Physics Professor · MIT · Quantum Mechanics Specialist",
    bio: "Dr David Chen is a Physics Professor at MIT with a PhD in Theoretical Physics and 15 years of teaching and research experience. He has published 40+ peer-reviewed papers and is a world authority on quantum mechanics and thermodynamics.",
    bio2: "David has a rare gift for making abstract physics feel intuitive and exciting. His online courses have brought rigorous university-level physics to students who never had access to world-class instruction.",
    expertise: [
      "Quantum Mechanics & Wave Functions",
      "Classical & Statistical Mechanics",
      "Thermodynamics & Entropy",
      "Electromagnetism & Maxwell's Equations",
      "Special & General Relativity",
      "Mathematical Physics",
      "Computational Physics",
      "Physics Research Methodology",
    ],
    experience: "Dr Chen holds a PhD from Caltech and has been a faculty member at MIT for 12 years. He has supervised 18 PhD students, received the MIT Excellence in Teaching Award three times, and consults for CERN on detector physics.",
    categoryIds: ["physics", "science"],
    rating: 4.9,
    reviews: 6700,
    students: 24800,
    courses: 4,
    ratingBreakdown: [
      { star: 5, pct: 84 }, { star: 4, pct: 11 }, { star: 3, pct: 3 },
      { star: 2, pct: 1 }, { star: 1, pct: 1 },
    ],
    socials: [
      { platform: "website", url: "#" },
      { platform: "linkedin", url: "#" },
    ],
    badges: ["Top Rated", "Verified Expert"],
    featured: true,
    courseSnippets: [
      {
        id: "phy-001",
        title: "Quantum Mechanics: From Zero to Uncertainty",
        thumbnail: "from-rose-500 to-orange-400",
        icon: Atom,
        rating: 4.9,
        students: 14200,
        price: 15.99,
      },
      {
        id: "phy-002",
        title: "Classical Mechanics & Thermodynamics Explained",
        thumbnail: "from-orange-500 to-amber-400",
        icon: Atom,
        rating: 4.7,
        students: 10600,
        price: 13.99,
      },
    ],
  },
  {
    id: "inst-5",
    name: "Fatima Al-Hassan",
    avatar: "FA",
    avatarBg: "bg-amber-500",
    title: "Astrophysicist & Researcher · Astrology Educator",
    bio: "Fatima Al-Hassan is an Astrophysicist and researcher with a deep passion for the intersection of science and the ancient art of astrology. She holds a Masters in Astrophysics and has spent 8 years bridging scientific thinking with astrological tradition.",
    expertise: [
      "Natal Chart Reading & Interpretation",
      "Planetary Transits & Progressions",
      "Synastry & Relationship Astrology",
      "Mundane Astrology",
      "Astronomical Foundations of Astrology",
      "Predictive Techniques",
      "Hellenistic & Modern Astrology",
      "Chart Rectification",
    ],
    experience: "Fatima has consulted for hundreds of clients globally and has been featured in several podcasts and publications on astrology and consciousness. She brings a uniquely scientific rigour to astrological education.",
    categoryIds: ["astrology"],
    rating: 4.8,
    reviews: 5600,
    students: 21300,
    courses: 3,
    ratingBreakdown: [
      { star: 5, pct: 74 }, { star: 4, pct: 17 }, { star: 3, pct: 6 },
      { star: 2, pct: 2 }, { star: 1, pct: 1 },
    ],
    socials: [
      { platform: "website", url: "#" },
      { platform: "youtube", url: "#" },
    ],
    badges: ["Top Rated"],
    courseSnippets: [
      {
        id: "ast-001",
        title: "Modern Astrology: Birth Charts & Transits",
        thumbnail: "from-indigo-500 to-blue-400",
        icon: Telescope,
        rating: 4.7,
        students: 21300,
        price: 9.99,
      },
    ],
  },
  {
    id: "inst-6",
    name: "Luca Romano",
    avatar: "LR",
    avatarBg: "bg-cyan-500",
    title: "Creative Director · Writer · Music Producer",
    bio: "Luca Romano is a Creative Director, writer, and music producer with 12 years of experience across advertising, publishing, and the music industry. He has written for international publications, directed campaigns for global brands, and produced music released on major labels.",
    bio2: "His courses are creative, unconventional, and deeply practical — built for people who want to make things that matter.",
    expertise: [
      "Creative Writing & Storytelling",
      "Copywriting & Content Strategy",
      "Music Production (Ableton Live)",
      "Sound Design & Mixing",
      "Brand Creative Direction",
      "Photography Composition",
      "Visual Storytelling",
      "Creative Process & Ideation",
    ],
    experience: "Luca has art-directed campaigns for Nike, Spotify, and several independent brands. As a music producer he has collaborated with artists across electronic, hip-hop, and indie genres, with releases on Ninja Tune and Hyperdub.",
    categoryIds: ["writing", "music", "photography"],
    rating: 4.6,
    reviews: 10100,
    students: 55400,
    courses: 5,
    ratingBreakdown: [
      { star: 5, pct: 68 }, { star: 4, pct: 21 }, { star: 3, pct: 8 },
      { star: 2, pct: 2 }, { star: 1, pct: 1 },
    ],
    socials: [
      { platform: "website", url: "#" },
      { platform: "instagram", url: "#" } as unknown as SocialLink,
      { platform: "youtube", url: "#" },
    ],
    badges: ["Bestseller"],
    courseSnippets: [
      {
        id: "mus-001",
        title: "Music Production with Ableton Live 11",
        thumbnail: "from-fuchsia-500 to-pink-400",
        icon: Music4,
        rating: 4.8,
        students: 24700,
        price: 12.99,
      },
      {
        id: "wri-001",
        title: "Creative Writing: From Blank Page to Published",
        thumbnail: "from-amber-500 to-yellow-400",
        icon: PenLine,
        rating: 4.6,
        students: 12900,
        price: 10.99,
      },
    ],
  },
  {
    id: "inst-7",
    name: "Priya Sharma",
    avatar: "PS",
    avatarBg: "bg-rose-500",
    title: "Business Coach · MBA · Entrepreneurship Expert",
    bio: "Priya Sharma is a Business Coach and MBA holder with 14 years of experience in entrepreneurship, corporate strategy, and finance. She has founded two companies, advised 30+ startups, and taught business strategy at the graduate level.",
    bio2: "Priya's courses combine strategic frameworks with the practical, gritty realities of building and running a business — no theory without application.",
    expertise: [
      "Business Strategy & Planning",
      "Entrepreneurship & Startup Building",
      "Financial Modelling & Valuation",
      "Fundraising & Investor Relations",
      "Project & Team Management",
      "Leadership & Executive Coaching",
      "Business Development & Sales",
      "Corporate Finance & Accounting",
    ],
    experience: "Priya was formerly VP of Strategy at a $400M enterprise software company and has founded two successful startups in the edtech and fintech sectors. She holds an MBA from INSEAD and is a CFA charterholder.",
    categoryIds: ["business", "management"],
    rating: 4.8,
    reviews: 19000,
    students: 79300,
    courses: 7,
    ratingBreakdown: [
      { star: 5, pct: 78 }, { star: 4, pct: 15 }, { star: 3, pct: 5 },
      { star: 2, pct: 1 }, { star: 1, pct: 1 },
    ],
    socials: [
      { platform: "website", url: "#" },
      { platform: "linkedin", url: "#" },
      { platform: "twitter", url: "#" },
    ],
    badges: ["Top Rated", "Bestseller"],
    featured: true,
    courseSnippets: [
      {
        id: "biz-001",
        title: "The Complete Entrepreneurship & Startup Playbook",
        thumbnail: "from-sky-500 to-blue-400",
        icon: Briefcase,
        rating: 4.9,
        students: 47800,
        price: 14.99,
      },
      {
        id: "biz-002",
        title: "Financial Modelling & Valuation Analyst (FMVA)",
        thumbnail: "from-blue-600 to-indigo-400",
        icon: Briefcase,
        rating: 4.8,
        students: 21400,
        price: 17.99,
      },
    ],
  },
  {
    id: "inst-8",
    name: "Marcus Thompson",
    avatar: "MT",
    avatarBg: "bg-teal-500",
    title: "Health & Wellness Expert · Nutritionist",
    bio: "Marcus Thompson is a certified Health & Wellness Expert, Nutritionist, and Personal Trainer with 10 years of experience helping people transform their relationship with food, movement, and mental wellbeing.",
    bio2: "His courses are evidence-based, compassionate, and built for real life — not for perfect conditions. Marcus meets students where they are.",
    expertise: [
      "Nutrition Science & Dietetics",
      "Meal Planning & Healthy Cooking",
      "Exercise Physiology & Training",
      "Mental Health & Wellness",
      "Habit Formation & Behaviour Change",
      "Sleep Optimisation",
      "Stress Management",
      "Longevity & Preventive Health",
    ],
    experience: "Marcus holds a BSc in Sports Science and a diploma in Nutritional Therapy. He has worked with elite athletes, corporate wellness programmes, and individuals recovering from chronic illness, and is a published author on nutrition and behaviour change.",
    categoryIds: ["health"],
    rating: 4.7,
    reviews: 4800,
    students: 19600,
    courses: 4,
    ratingBreakdown: [
      { star: 5, pct: 72 }, { star: 4, pct: 18 }, { star: 3, pct: 7 },
      { star: 2, pct: 2 }, { star: 1, pct: 1 },
    ],
    socials: [
      { platform: "website", url: "#" },
      { platform: "youtube", url: "#" },
      { platform: "linkedin", url: "#" },
    ],
    badges: ["Top Rated"],
    courseSnippets: [
      {
        id: "hlt-001",
        title: "Nutrition Science & Healthy Living Blueprint",
        thumbnail: "from-pink-500 to-rose-400",
        icon: HeartPulse,
        rating: 4.7,
        students: 19600,
        price: 11.99,
      },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function getInstructorById(id: string): Instructor | undefined {
  return instructors.find((i) => i.id === id);
}

export function getFeaturedInstructors(): Instructor[] {
  return instructors.filter((i) => i.featured);
}

export function getInstructorsByCategory(categoryId: string): Instructor[] {
  return instructors.filter((i) => i.categoryIds.includes(categoryId));
}

export function fmt(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}