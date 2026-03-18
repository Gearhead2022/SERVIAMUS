import { Request, Response, NextFunction } from "express";

export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRoles: string[] = req.user?.roles || [];

    const hasAccess = userRoles.some(role =>
      allowedRoles.includes(role)
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Forbidden"
      });
    }

    next();
  };
};
