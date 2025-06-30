import { Request } from "express";
import { IUser } from "./models";

export interface JwtPayload {
  userId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}
