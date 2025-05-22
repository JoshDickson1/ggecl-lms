// types.ts
export type Message = {
    sender: string;
    content: string;
    type: "text" | "image" | "video" | "pdf" | "msword";
    fileUrl?: string;
  };
  
  export interface Group {
    id: number;
    name: string;
    createdAt: Date;
    image: string;
    instructor: string;
    students: string[];
    description: string;
    classroomId: number;
  }
  export interface ClassGroup {
    id: number;
    name: string;
    createdAt: Date;
    image: string;
    instructor: string;
    students: string[];
    description: string;
    classroomId?: number; // Optional property
  }
  export interface Classroom {
    id: number;
    name: string;
    instructor: string;
    students: string[];
  }
    