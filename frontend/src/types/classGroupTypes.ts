export interface ClassGroup {
  id: number;
  name: string;
  createdAt: Date;
  image: string;
  instructor: string;
  students: string[];
  description: string;
  subGroups?: {
    id: number;
    name: string;
    createdAt: Date;
    image: string;
    instructor: string;
    students: string[];
    description: string;
  }[];
}

export const initClassGroup: ClassGroup = {
  id: 0,
  name: "",
  createdAt: new Date(),
  image: "",
  instructor: "",
  students: [],
  description: "",
  subGroups: [],
};
