import { Request, Response, NextFunction } from "express";

export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // console.log("Allowed:", allowedRoles);
    // console.log("User:", req.user);

    const userRoles = req.user?.roles || [];

    // console.log("Roles:", userRoles);

    const hasAccess = userRoles.some(role =>
      allowedRoles.includes(role)
    );

    // console.log("Has Access:", hasAccess);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    next();
  };
};
