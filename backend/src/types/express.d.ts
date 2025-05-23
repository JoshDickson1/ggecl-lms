import { Request } from "express";
import { UserRole } from "../utils/roleMappings.ts";

export interface AuthenticatedRequest<P = object, B = object>
  extends Request<P, object, B> {
  user?: {
    id: string;
    role: UserRole;
  };
}
