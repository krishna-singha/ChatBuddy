import { Response } from "express";

export const errorResponse = (res: Response, code: number, message: string) => {
  // console.log(message);
  
  return res.status(code).json({ success: false, message });
};
export const successResponse = (res: Response, data: object, code = 200) => {
  return res.status(code).json({ success: true, ...data });
};