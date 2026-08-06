import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        user_id: number;
        roles: string[];
      };
    }
  }
}
