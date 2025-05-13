export type TInstructor = {
  _id: string;
  fullName: string;
  picture: string;
  schRole: string;
  reviews: {
    rating: number;
    reviewer: string;
    date: Date;
    comment: string;
    image: string;
    stars: number;
  }[];
  students: string[];
  courses: string[];
  bio: string;
};
