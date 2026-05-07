import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/verifyToken";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // ✅ get token from cookie
    const token = req.cookies?.access_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const user = verifyToken(token);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }

    // attach user
    req.user = user;

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed"
    });
  }
};