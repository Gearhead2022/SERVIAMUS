import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d"
};
