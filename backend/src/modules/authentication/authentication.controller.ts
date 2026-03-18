import { Request, Response } from "express";
import {
  getRoles,
  loginUser,
  registerUser
} from "./authentication.service";

export const authRoleController = async (req: Request, res: Response) => {
  try {
    const roles = await getRoles();
    return res.status(200).json({
      success: true,
      data: roles
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch roles"
    });
  }
};

export const authLoginController = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const result = await loginUser(username, password);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

export const authRegisterController = async (req: Request, res: Response) => {
  try {
    const user = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      data: user
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
