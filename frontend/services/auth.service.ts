import api from "./axios";
import { LoginResponse, RegisterPayload, Role } from "../types/AuthTypes";

/* =====================
   API CALLS
===================== */

// LOGIN
export const login = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  const res = await api.post("/authentication/login", {
    username,
    password
  });
  console.log('data after login', res.data.data)
  const { token, user } = res.data.data;
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));

  return res.data.data;
};

// REGISTER
export const registerUser = async (
  data: RegisterPayload
) => {
  const res = await api.post("/authentication/register", data);
  return res.data.data;
};

// FETCH ROLES
export const fetchRoles = async (): Promise<Role[]> => {
  const res = await api.get("/authentication/roles");
  return res.data.data;
};

// LOGOUT
export const logout = () => {
  localStorage.removeItem("token");
};

// // FETCH USER INFO
// export const fetchUserInfo = async(user_id: number): Promise<UserInfo> => {
//   const res = await api.get("/api/users/user-information", {
//     params : {
//       user_id : user_id
//     }
//   });
//   return res.data.data;
// }
