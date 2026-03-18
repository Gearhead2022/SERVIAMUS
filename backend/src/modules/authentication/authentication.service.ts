import { prisma } from "../../config/prismaClient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RegisterPayload } from "./authentication.types";

/**
 * REGISTER USER
 */
export const registerUser = async (payload: RegisterPayload) => {
  const { name, username, password, role_id } = payload;

  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.$transaction(async (tx) => {
    const user = await tx.users.create({
      data: {
        name,
        username,
        password: hashedPassword
      }
    });

    await tx.userRole.create({
      data: {
        user_id: user.user_id,
        role_id
      }
    });

    return {
      user_id: user.user_id,
      username: user.username
    };
  });
};


/**
 * LOGIN USER
 */
export const loginUser = async (username: string, password: string) => {
  const user = await prisma.users.findUnique({
    where: { username },
    include: {
        roles: {
        include: {
            role: true
        }
        }
    }
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  const roles = user.roles.map(r => r.role.role_name);

  // Generate JWT
  const token = jwt.sign(
    {
      user_id: user.user_id,
      roles
    },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" }
  );

  return {
    token,
    user: {
      user_id: user.user_id,
      username: user.username,
      roles,
      name: user.name
    }
  };
};

export const getRoles = async () => {
    const get = await prisma.roleTypes.findMany({
        select:{
            role_id:true,
            role_name:true,
            role_desc: true,
        }
    })
    return get;
}