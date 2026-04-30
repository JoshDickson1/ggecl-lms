// src/landing/pages/OurStudents.tsx
import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Search, MapPin, BookOpen, Award, Star,
  GraduationCap, Users, Trophy, ChevronRight,
  Sparkles, Filter,
} from "lucide-react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');`;

function FadeUp({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

// ─── Dummy student data ───────────────────────────────────────────────────────

export const STUDENTS = [
  {
    id: "s1",
    name: "Amara Okafor",
    location: "Lagos, Nigeria",
    email: "a.okafor@student.ggecl.edu",
    matricNumber: "GGECL-2024-001",
    enrollmentDate: "January 15, 2024",
    bio: "Passionate software engineer with a love for building scalable systems. Currently exploring cloud architecture and DevOps practices. Believes that technology is the greatest equaliser of our generation.",
    goals: ["Become a Full-Stack Engineer", "Build 3 SaaS products by 2026", "Contribute to open source", "Mentor junior developers"],
    tags: ["Python", "React", "Cloud Computing", "DevOps", "PostgreSQL"],
    accomplishments: ["Dean's List Q1 2024", "Best Student Project Award", "Regional Hackathon Winner"],
    stats: { assignments: 18, avgGrade: "A", coursesCompleted: 5, groups: 3, hoursLearned: 240, streak: 42 },
    courses: [
      { title: "Software Engineering Fundamentals", grade: "A+", completed: true, progress: 100, instructor: "Daniel Vincent" },
      { title: "Cloud Architecture with AWS", grade: "A", completed: true, progress: 100, instructor: "Sarah Johnson" },
      { title: "React & TypeScript Mastery", grade: "A-", completed: true, progress: 100, instructor: "Mike Peters" },
      { title: "Database Design & SQL", grade: "B+", completed: true, progress: 100, instructor: "Lisa Chen" },
      { title: "DevOps & CI/CD Pipelines", grade: "A", completed: true, progress: 100, instructor: "James Williams" },
    ],
    certificates: [
      { course: "Software Engineering Fundamentals", date: "March 15, 2024", credentialId: "GGECL-2024-SEF-001", grade: "A+" },
      { course: "Cloud Architecture with AWS", date: "June 22, 2024", credentialId: "GGECL-2024-CAW-002", grade: "A" },
    ],
    assignmentStats: { total: 18, submitted: 18, graded: 16, pending: 2, avgScore: 92 },
    groups: ["Web Development Cohort", "Cloud & DevOps Guild", "Alumni Network"],
    color: "#3B82F6",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    id: "s2",
    name: "Chisom Adeyemi",
    location: "Abuja, Nigeria",
    email: "c.adeyemi@student.ggecl.edu",
    matricNumber: "GGECL-2024-002",
    enrollmentDate: "February 3, 2024",
    bio: "Data analyst turned aspiring machine learning engineer. Fascinated by how data can tell stories and drive decisions. Working towards a career in AI research.",
    goals: ["Master machine learning algorithms", "Publish a research paper", "Land a role at a top AI company"],
    tags: ["Python", "TensorFlow", "Data Analysis", "SQL", "Statistics"],
    accomplishments: ["Top Scorer in Data Science Module", "Research Excellence Award 2024"],
    stats: { assignments: 14, avgGrade: "A-", coursesCompleted: 4, groups: 2, hoursLearned: 180, streak: 28 },
    courses: [
      { title: "Data Science & Analytics", grade: "A+", completed: true, progress: 100, instructor: "Dr. Emeka Nwachukwu" },
      { title: "Machine Learning with Python", grade: "A", completed: true, progress: 100, instructor: "Sarah Johnson" },
      { title: "Statistical Methods", grade: "A-", completed: true, progress: 100, instructor: "Prof. Aminu Bello" },
      { title: "Deep Learning Fundamentals", grade: "B+", completed: false, progress: 72, instructor: "Mike Peters" },
    ],
    certificates: [
      { course: "Data Science & Analytics", date: "April 10, 2024", credentialId: "GGECL-2024-DSA-003", grade: "A+" },
    ],
    assignmentStats: { total: 14, submitted: 13, graded: 12, pending: 1, avgScore: 88 },
    groups: ["Data Science Circle", "Research & Innovation Club"],
    color: "#8B5CF6",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    id: "s3",
    name: "Emeka Okonkwo",
    location: "Port Harcourt, Nigeria",
    email: "e.okonkwo@student.ggecl.edu",
    matricNumber: "GGECL-2023-015",
    enrollmentDate: "September 12, 2023",
    bio: "Civil engineer pivoting into tech. Bringing a structural thinking mindset to software development. Believes the best code is like good architecture — elegant, functional, and built to last.",
    goals: ["Build a construction-tech startup", "Master React Native", "Bridge engineering and software worlds"],
    tags: ["JavaScript", "React Native", "Node.js", "Project Management", "AutoCAD"],
    accomplishments: ["Perfect Attendance Award", "Innovation in Tech Award 2023", "Community Volunteer Lead"],
    stats: { assignments: 22, avgGrade: "B+", coursesCompleted: 6, groups: 4, hoursLearned: 310, streak: 65 },
    courses: [
      { title: "JavaScript Fundamentals", grade: "A", completed: true, progress: 100, instructor: "James Williams" },
      { title: "Node.js Backend Development", grade: "B+", completed: true, progress: 100, instructor: "Daniel Vincent" },
      { title: "React Native Mobile Dev", grade: "A-", completed: true, progress: 100, instructor: "Mike Peters" },
      { title: "Project Management in Tech", grade: "A", completed: true, progress: 100, instructor: "Ify Willoughby" },
      { title: "API Design & REST", grade: "B+", completed: true, progress: 100, instructor: "Lisa Chen" },
      { title: "Agile & Scrum", grade: "A-", completed: true, progress: 100, instructor: "Sarah Johnson" },
    ],
    certificates: [
      { course: "JavaScript Fundamentals", date: "November 20, 2023", credentialId: "GGECL-2023-JSF-015", grade: "A" },
      { course: "Node.js Backend Development", date: "February 14, 2024", credentialId: "GGECL-2024-NJS-015", grade: "B+" },
      { course: "React Native Mobile Dev", date: "May 5, 2024", credentialId: "GGECL-2024-RNM-015", grade: "A-" },
    ],
    assignmentStats: { total: 22, submitted: 21, graded: 20, pending: 1, avgScore: 85 },
    groups: ["Mobile Dev Squad", "Backend Engineering Guild", "Entrepreneurship Club", "Community Leaders"],
    color: "#10B981",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "s4",
    name: "Fatima Al-Hassan",
    location: "Kano, Nigeria",
    email: "f.alhassan@student.ggecl.edu",
    matricNumber: "GGECL-2024-008",
    enrollmentDate: "March 1, 2024",
    bio: "UI/UX designer with a background in fine arts. Passionate about creating digital experiences that are both beautiful and accessible. Strong advocate for inclusive design.",
    goals: ["Lead a design team at a global company", "Launch a design system for African startups", "Speak at international UX conferences"],
    tags: ["Figma", "Adobe XD", "UI Design", "UX Research", "Accessibility", "CSS"],
    accomplishments: ["Best Design Portfolio 2024", "Accessibility Champion Award"],
    stats: { assignments: 12, avgGrade: "A", coursesCompleted: 3, groups: 2, hoursLearned: 145, streak: 19 },
    courses: [
      { title: "UI/UX Design Principles", grade: "A+", completed: true, progress: 100, instructor: "Sarah Johnson" },
      { title: "User Research & Testing", grade: "A", completed: true, progress: 100, instructor: "Ify Willoughby" },
      { title: "Design Systems", grade: "A-", completed: true, progress: 100, instructor: "Mike Peters" },
    ],
    certificates: [
      { course: "UI/UX Design Principles", date: "May 30, 2024", credentialId: "GGECL-2024-UXD-008", grade: "A+" },
    ],
    assignmentStats: { total: 12, submitted: 12, graded: 11, pending: 1, avgScore: 95 },
    groups: ["Design Collective", "Women in Tech Nigeria"],
    color: "#F59E0B",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    id: "s5",
    name: "Tobechukwu Eze",
    location: "Enugu, Nigeria",
    email: "t.eze@student.ggecl.edu",
    matricNumber: "GGECL-2023-007",
    enrollmentDate: "July 7, 2023",
    bio: "Cybersecurity enthusiast with a mission to help African businesses stay safe online. Former banking IT officer now dedicated to ethical hacking and security architecture.",
    goals: ["Become a Certified Ethical Hacker", "Start a cybersecurity consultancy", "Train 500 security professionals"],
    tags: ["Cybersecurity", "Ethical Hacking", "Networking", "Python", "Linux", "Penetration Testing"],
    accomplishments: ["Security Innovation Award 2023", "Capture The Flag Champion", "Dean's List Q3 2023"],
    stats: { assignments: 26, avgGrade: "A-", coursesCompleted: 7, groups: 3, hoursLearned: 390, streak: 88 },
    courses: [
      { title: "Cybersecurity Fundamentals", grade: "A+", completed: true, progress: 100, instructor: "Dr. Emeka Nwachukwu" },
      { title: "Ethical Hacking & Pen Testing", grade: "A", completed: true, progress: 100, instructor: "James Williams" },
      { title: "Network Security", grade: "A-", completed: true, progress: 100, instructor: "Daniel Vincent" },
      { title: "Linux for Security Pros", grade: "A", completed: true, progress: 100, instructor: "Mike Peters" },
      { title: "Incident Response & Forensics", grade: "B+", completed: true, progress: 100, instructor: "Sarah Johnson" },
      { title: "Cloud Security", grade: "A-", completed: true, progress: 100, instructor: "Lisa Chen" },
      { title: "SIEM & Threat Intelligence", grade: "B+", completed: false, progress: 65, instructor: "Prof. Aminu Bello" },
    ],
    certificates: [
      { course: "Cybersecurity Fundamentals", date: "September 14, 2023", credentialId: "GGECL-2023-CSF-007", grade: "A+" },
      { course: "Ethical Hacking & Pen Testing", date: "December 1, 2023", credentialId: "GGECL-2023-EHP-007", grade: "A" },
      { course: "Network Security", date: "March 22, 2024", credentialId: "GGECL-2024-NSC-007", grade: "A-" },
    ],
    assignmentStats: { total: 26, submitted: 25, graded: 24, pending: 1, avgScore: 91 },
    groups: ["Cybersecurity Guild", "CTF Team Nigeria", "Mentorship Circle"],
    color: "#EF4444",
    gradient: "from-red-500 to-rose-600",
  },
  {
    id: "s6",
    name: "Ngozi Ikechukwu",
    location: "Owerri, Nigeria",
    email: "n.ikechukwu@student.ggecl.edu",
    matricNumber: "GGECL-2024-014",
    enrollmentDate: "April 20, 2024",
    bio: "Product manager passionate about bridging the gap between business strategy and technology execution. Enjoys turning complex problems into simple, user-centred solutions.",
    goals: ["Become a Senior Product Manager", "Launch a HealthTech product", "Complete MBA in Technology Management"],
    tags: ["Product Management", "Agile", "Data Analysis", "User Research", "Roadmapping"],
    accomplishments: ["Outstanding Leadership Award 2024", "Product Demo Day Winner"],
    stats: { assignments: 10, avgGrade: "A", coursesCompleted: 2, groups: 3, hoursLearned: 98, streak: 14 },
    courses: [
      { title: "Product Management Essentials", grade: "A", completed: true, progress: 100, instructor: "Ify Willoughby" },
      { title: "Agile & Scrum", grade: "A-", completed: true, progress: 100, instructor: "Sarah Johnson" },
      { title: "Growth & Product Analytics", grade: "B+", completed: false, progress: 45, instructor: "Dr. Emeka Nwachukwu" },
    ],
    certificates: [
      { course: "Product Management Essentials", date: "July 8, 2024", credentialId: "GGECL-2024-PME-014", grade: "A" },
    ],
    assignmentStats: { total: 10, submitted: 10, graded: 9, pending: 1, avgScore: 90 },
    groups: ["Product Leaders Circle", "Women in Tech Nigeria", "HealthTech Nigeria"],
    color: "#06B6D4",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    id: "s7",
    name: "Babatunde Fashola",
    location: "Ibadan, Nigeria",
    email: "b.fashola@student.ggecl.edu",
    matricNumber: "GGECL-2023-022",
    enrollmentDate: "October 30, 2023",
    bio: "Blockchain developer and DeFi enthusiast. Believes decentralised technology will reshape financial services in Africa. Working on a stablecoin solution for local commerce.",
    goals: ["Build a DeFi platform for African markets", "Master Solidity smart contracts", "Speak at ETHGlobal"],
    tags: ["Solidity", "Web3", "Blockchain", "DeFi", "JavaScript", "Ethereum"],
    accomplishments: ["Blockchain Innovation Grant 2024", "Web3 Hackathon 2nd Place", "Top Performer Q4 2023"],
    stats: { assignments: 20, avgGrade: "B+", coursesCompleted: 5, groups: 4, hoursLearned: 275, streak: 51 },
    courses: [
      { title: "Blockchain Fundamentals", grade: "A", completed: true, progress: 100, instructor: "James Williams" },
      { title: "Solidity Smart Contract Dev", grade: "B+", completed: true, progress: 100, instructor: "Mike Peters" },
      { title: "DeFi Protocols & Applications", grade: "A-", completed: true, progress: 100, instructor: "Daniel Vincent" },
      { title: "Web3 Frontend Development", grade: "B+", completed: true, progress: 100, instructor: "Lisa Chen" },
      { title: "NFT & Digital Assets", grade: "B", completed: true, progress: 100, instructor: "Sarah Johnson" },
    ],
    certificates: [
      { course: "Blockchain Fundamentals", date: "December 18, 2023", credentialId: "GGECL-2023-BCF-022", grade: "A" },
      { course: "Solidity Smart Contract Dev", date: "March 3, 2024", credentialId: "GGECL-2024-SCD-022", grade: "B+" },
    ],
    assignmentStats: { total: 20, submitted: 19, graded: 18, pending: 1, avgScore: 84 },
    groups: ["Blockchain Nigeria", "Web3 Builders Guild", "FinTech Circle", "Entrepreneur's Club"],
    color: "#7C3AED",
    gradient: "from-violet-600 to-indigo-700",
  },
  {
    id: "s8",
    name: "Adaeze Umeh",
    location: "Asaba, Nigeria",
    email: "a.umeh@student.ggecl.edu",
    matricNumber: "GGECL-2024-019",
    enrollmentDate: "May 14, 2024",
    bio: "Health informatics professional and aspiring data engineer. Combining medical knowledge with data science to improve patient outcomes and healthcare systems in Nigeria.",
    goals: ["Build Africa's first open health data platform", "Complete a PhD in Health Informatics", "Create digital health tools for rural communities"],
    tags: ["Health Informatics", "Python", "SQL", "ETL Pipelines", "Healthcare AI"],
    accomplishments: ["Healthcare Innovation Award 2024", "Scholarship Recipient — Highest CGPA Intake"],
    stats: { assignments: 9, avgGrade: "A+", coursesCompleted: 2, groups: 2, hoursLearned: 110, streak: 22 },
    courses: [
      { title: "Health Informatics & Data", grade: "A+", completed: true, progress: 100, instructor: "Dr. Emeka Nwachukwu" },
      { title: "Data Engineering Basics", grade: "A", completed: true, progress: 100, instructor: "Sarah Johnson" },
      { title: "AI in Healthcare", grade: "A+", completed: false, progress: 80, instructor: "Prof. Aminu Bello" },
    ],
    certificates: [
      { course: "Health Informatics & Data", date: "August 2, 2024", credentialId: "GGECL-2024-HID-019", grade: "A+" },
    ],
    assignmentStats: { total: 9, submitted: 9, graded: 8, pending: 1, avgScore: 97 },
    groups: ["Health Data Circle", "Women in STEM Nigeria"],
    color: "#EC4899",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    id: "s9",
    name: "Chukwuemeka Agu",
    location: "Onitsha, Nigeria",
    email: "c.agu@student.ggecl.edu",
    matricNumber: "GGECL-2023-031",
    enrollmentDate: "August 21, 2023",
    bio: "Game developer and creative technologist. Building immersive African-themed games that tell authentic stories. Believes African culture deserves representation in the global gaming industry.",
    goals: ["Release a commercial game on Steam", "Build a game dev studio", "Create Africa's first AAA game title"],
    tags: ["Unity", "C#", "Game Design", "3D Modeling", "Blender", "Narrative Design"],
    accomplishments: ["Best Game Concept Award 2023", "Game Jam Winner Q2 2024", "Creative Excellence Award"],
    stats: { assignments: 24, avgGrade: "A-", coursesCompleted: 6, groups: 3, hoursLearned: 360, streak: 73 },
    courses: [
      { title: "Game Development with Unity", grade: "A+", completed: true, progress: 100, instructor: "Mike Peters" },
      { title: "3D Modelling & Blender", grade: "A", completed: true, progress: 100, instructor: "James Williams" },
      { title: "Game Design Theory", grade: "A-", completed: true, progress: 100, instructor: "Sarah Johnson" },
      { title: "C# Programming", grade: "A-", completed: true, progress: 100, instructor: "Daniel Vincent" },
      { title: "Narrative & Storytelling in Games", grade: "B+", completed: true, progress: 100, instructor: "Ify Willoughby" },
      { title: "AR & VR Development", grade: "A", completed: true, progress: 100, instructor: "Lisa Chen" },
    ],
    certificates: [
      { course: "Game Development with Unity", date: "October 29, 2023", credentialId: "GGECL-2023-GDU-031", grade: "A+" },
      { course: "3D Modelling & Blender", date: "January 17, 2024", credentialId: "GGECL-2024-3DM-031", grade: "A" },
    ],
    assignmentStats: { total: 24, submitted: 23, graded: 22, pending: 1, avgScore: 89 },
    groups: ["Game Dev Nigeria", "Creative Coders Guild", "3D Artists Circle"],
    color: "#F97316",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    id: "s10",
    name: "Zainab Mohammed",
    location: "Maiduguri, Nigeria",
    email: "z.mohammed@student.ggecl.edu",
    matricNumber: "GGECL-2024-005",
    enrollmentDate: "January 29, 2024",
    bio: "EdTech entrepreneur and former secondary school mathematics teacher. On a mission to make quality STEM education accessible to every child in northern Nigeria through technology.",
    goals: ["Launch an EdTech platform for rural students", "Train 1,000 math teachers digitally", "Raise seed funding for her startup"],
    tags: ["EdTech", "Python", "Curriculum Design", "E-Learning", "Entrepreneurship"],
    accomplishments: ["Social Impact Award 2024", "TEDx Speaker — Education in Crisis Zones", "Scholarship Mentor of the Year"],
    stats: { assignments: 15, avgGrade: "A", coursesCompleted: 4, groups: 3, hoursLearned: 200, streak: 35 },
    courses: [
      { title: "EdTech Product Design", grade: "A+", completed: true, progress: 100, instructor: "Ify Willoughby" },
      { title: "Python for Beginners", grade: "A", completed: true, progress: 100, instructor: "Dr. Emeka Nwachukwu" },
      { title: "E-Learning Content Creation", grade: "A-", completed: true, progress: 100, instructor: "Sarah Johnson" },
      { title: "Startup Fundamentals", grade: "A", completed: true, progress: 100, instructor: "Daniel Vincent" },
    ],
    certificates: [
      { course: "EdTech Product Design", date: "April 15, 2024", credentialId: "GGECL-2024-EPD-005", grade: "A+" },
      { course: "Python for Beginners", date: "June 10, 2024", credentialId: "GGECL-2024-PYB-005", grade: "A" },
    ],
    assignmentStats: { total: 15, submitted: 15, graded: 14, pending: 1, avgScore: 93 },
    groups: ["EdTech Builders", "Women in Tech Nigeria", "Entrepreneur's Club"],
    color: "#14B8A6",
    gradient: "from-teal-500 to-cyan-600",
  },
  {
    id: "s11",
    name: "Ifeanyi Nwosu",
    location: "Nnewi, Nigeria",
    email: "i.nwosu@student.ggecl.edu",
    matricNumber: "GGECL-2023-044",
    enrollmentDate: "November 5, 2023",
    bio: "Full-stack developer and open source contributor. Passionate about building tools that empower African developers. Currently maintaining two popular open-source libraries with 2k+ GitHub stars.",
    goals: ["Reach 10k GitHub stars", "Join a FAANG engineering team", "Build the leading African developer community"],
    tags: ["TypeScript", "React", "Go", "Rust", "Open Source", "System Design"],
    accomplishments: ["Open Source Contributor of the Year 2024", "GitHub Stars Achievement", "Best Technical Presentation Q1 2024"],
    stats: { assignments: 28, avgGrade: "A", coursesCompleted: 7, groups: 5, hoursLearned: 420, streak: 102 },
    courses: [
      { title: "Advanced TypeScript", grade: "A+", completed: true, progress: 100, instructor: "Mike Peters" },
      { title: "System Design at Scale", grade: "A", completed: true, progress: 100, instructor: "Daniel Vincent" },
      { title: "Go Programming Language", grade: "A-", completed: true, progress: 100, instructor: "James Williams" },
      { title: "Rust for Systems Programming", grade: "A", completed: true, progress: 100, instructor: "Lisa Chen" },
      { title: "Open Source Best Practices", grade: "A+", completed: true, progress: 100, instructor: "Dr. Emeka Nwachukwu" },
      { title: "Microservices Architecture", grade: "A-", completed: true, progress: 100, instructor: "Sarah Johnson" },
      { title: "Developer Experience & Tooling", grade: "A", completed: true, progress: 100, instructor: "Prof. Aminu Bello" },
    ],
    certificates: [
      { course: "Advanced TypeScript", date: "January 12, 2024", credentialId: "GGECL-2024-ATS-044", grade: "A+" },
      { course: "System Design at Scale", date: "March 28, 2024", credentialId: "GGECL-2024-SDS-044", grade: "A" },
      { course: "Open Source Best Practices", date: "June 5, 2024", credentialId: "GGECL-2024-OSP-044", grade: "A+" },
    ],
    assignmentStats: { total: 28, submitted: 28, graded: 27, pending: 1, avgScore: 96 },
    groups: ["Open Source Club", "Backend Engineering Guild", "System Design Study Group", "Developer Advocacy Circle", "Alumni Network"],
    color: "#6366F1",
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    id: "s12",
    name: "Oluwatosin Adesanya",
    location: "Abeokuta, Nigeria",
    email: "o.adesanya@student.ggecl.edu",
    matricNumber: "GGECL-2024-011",
    enrollmentDate: "March 18, 2024",
    bio: "Marketing specialist learning to code. Combining creative storytelling with digital marketing analytics and automation to drive growth for brands. Building the bridge between creativity and data.",
    goals: ["Master marketing automation", "Launch a digital marketing agency", "Speak at Digital Marketing Africa summit"],
    tags: ["Digital Marketing", "SEO", "Analytics", "Python", "Content Strategy", "Growth Hacking"],
    accomplishments: ["Digital Marketer of the Quarter 2024", "Growth Hacking Challenge Winner"],
    stats: { assignments: 11, avgGrade: "A-", coursesCompleted: 3, groups: 2, hoursLearned: 130, streak: 17 },
    courses: [
      { title: "Digital Marketing Fundamentals", grade: "A+", completed: true, progress: 100, instructor: "Ify Willoughby" },
      { title: "SEO & Content Marketing", grade: "A-", completed: true, progress: 100, instructor: "Sarah Johnson" },
      { title: "Marketing Analytics & Data", grade: "B+", completed: true, progress: 100, instructor: "Dr. Emeka Nwachukwu" },
    ],
    certificates: [
      { course: "Digital Marketing Fundamentals", date: "June 25, 2024", credentialId: "GGECL-2024-DMF-011", grade: "A+" },
    ],
    assignmentStats: { total: 11, submitted: 11, graded: 10, pending: 1, avgScore: 88 },
    groups: ["Marketing Collective", "Creative Entrepreneurs"],
    color: "#84CC16",
    gradient: "from-lime-500 to-green-600",
  },
];

// ─── Grade → colour helper ───────────────────────────────────────────────────
export function gradeColor(g: string) {
  if (g.startsWith("A")) return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40";
  if (g.startsWith("B")) return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/40";
  return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40";
}

// ─── Student card ────────────────────────────────────────────────────────────
function StudentCard({ student, index }: { student: typeof STUDENTS[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const initials = student.name.split(" ").map(n => n[0]).join("").slice(0, 2);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={`/our-students/public/${student.id}`}
        className="group block rounded-[24px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_12px_48px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-1 overflow-hidden"
      >
        {/* colour bar */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${student.gradient}`} />

        <div className="p-6">
          {/* avatar + name */}
          <div className="flex items-start gap-4 mb-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${student.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
              <span className="text-white font-black text-lg">{initials}</span>
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-gray-900 dark:text-white text-base leading-tight truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {student.name}
              </h3>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{student.matricNumber}</p>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{student.location}</span>
              </div>
            </div>
          </div>

          {/* bio */}
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-4">
            {student.bio}
          </p>

          {/* stats row */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "Courses", value: student.stats.coursesCompleted, icon: BookOpen },
              { label: "Avg Grade", value: student.stats.avgGrade, icon: Star },
              { label: "Certs", value: student.certificates.length, icon: Award },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06] p-2.5 text-center">
                <Icon className="w-3.5 h-3.5 mx-auto mb-1 text-gray-400" />
                <div className="text-sm font-black text-gray-900 dark:text-white">{value}</div>
                <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </div>

          {/* tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {student.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-300 text-[10px] font-semibold">
                {tag}
              </span>
            ))}
            {student.tags.length > 3 && (
              <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-gray-400 text-[10px] font-semibold">
                +{student.tags.length - 3}
              </span>
            )}
          </div>

          {/* cta */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/[0.06]">
            <span className="text-[11px] text-gray-400">Enrolled {student.enrollmentDate.split(",")[1]?.trim() ?? student.enrollmentDate}</span>
            <span className={`flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all`}>
              View Profile <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OurStudents() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "completed" | "in-progress">("all");

  const filtered = STUDENTS.filter(s => {
    const q = search.toLowerCase();
    const matches = !q || s.name.toLowerCase().includes(q) || s.tags.some(t => t.toLowerCase().includes(q)) || s.location.toLowerCase().includes(q);
    if (!matches) return false;
    if (filter === "completed") return s.stats.coursesCompleted >= 5;
    if (filter === "in-progress") return s.stats.coursesCompleted < 5;
    return true;
  });

  return (
    <>
      <style>{FONTS}</style>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#0e1f3d] to-[#0a1628] pt-24 pb-20">
        {/* grid bg */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        {/* glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-600/15 rounded-full blur-[80px]" />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.08] border border-white/[0.12] mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Our Community</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-6xl font-black text-white mb-5 leading-[1.08]"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Meet Our <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Students</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="text-base md:text-lg text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Discover the bright minds shaping Africa's technological future through Golden Goshen Educational Consultancy.
          </motion.p>

          {/* stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-center justify-center gap-8"
          >
            {[
              { icon: Users, label: "Active Students", value: "2,400+" },
              { icon: Trophy, label: "Certificates Issued", value: "1,850+" },
              { icon: GraduationCap, label: "Courses Completed", value: "8,200+" },
              { icon: Star, label: "Avg Grade", value: "A−" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Icon className="w-4 h-4 text-blue-400" />
                  <span className="text-xl font-black text-white">{value}</span>
                </div>
                <span className="text-xs text-white/40 uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Filters ── */}
      <section className="max-w-6xl mx-auto px-6 -mt-6 relative z-10 mb-10">
        <FadeUp>
          <div className="bg-white dark:bg-[#0f1623] rounded-[20px] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, skill, or location…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400 hidden sm:block" />
              {(["all", "completed", "in-progress"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                    filter === f
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 dark:bg-white/[0.05] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/[0.08]"
                  }`}
                >
                  {f === "all" ? "All Students" : f === "completed" ? "5+ Courses" : "In Progress"}
                </button>
              ))}
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ── Grid ── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <FadeUp className="mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-bold text-gray-900 dark:text-white">{filtered.length}</span> student{filtered.length !== 1 ? "s" : ""}
          </p>
        </FadeUp>

        {filtered.length === 0 ? (
          <FadeUp className="text-center py-24">
            <GraduationCap className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No students match your search.</p>
          </FadeUp>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((student, i) => (
              <StudentCard key={student.id} student={student} index={i} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
