import { Upload, View } from "lucide-react";

export const TABLE_ACTIONS = [
  { name: "View", icon: View },
  { name: "Upload", icon: Upload },
] as const;

export type TableActionName = (typeof TABLE_ACTIONS)[number]["name"];
