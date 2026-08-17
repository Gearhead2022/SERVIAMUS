import { prisma } from "../../config/prismaClient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { iRegister } from "./authentication.types";

/**
 * REGISTER USER
 */
export const registerUser = async (payload: iRegister) => {
  const { name, username, password, role_id, license_no, title, ptr_no } = payload;

  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.$transaction(async (tx) => {
    const user = await tx.users.create({
      data: {
        name,
        username,
        password: hashedPassword,
        license_no,
        title: title === "" ? undefined : title,
        ptr_no,
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
  const normalizedUsername = username.trim();
  if (!normalizedUsername || !password) {
    throw new Error("Invalid credentials");
  }

  const user = await prisma.users.findUnique({
    where: { username: normalizedUsername },
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

  const roles = Array.from(
    new Set(
      user.roles
        .map((entry) => entry.role.role_name.trim().toUpperCase())
        .filter(Boolean)
    )
  );

  if (!user.is_active || roles.length === 0) {
    throw new Error("Invalid credentials");
  }

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
      name: user.name,
      title: user.title
    }
  };
};

export const getRoles = async () => {
  const get = await prisma.roleTypes.findMany({
    select: {
      role_id: true,
      role_name: true,
      role_desc: true,
    }
  })
  return get;
}
