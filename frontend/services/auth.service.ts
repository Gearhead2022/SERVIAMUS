import api from "./axios";
import { AuthUser, RegisterPayload, Role, UpdateUserPayload } from "../types/AuthTypes";

/* =====================
   API CALLS
===================== */

// LOGIN
export const login = async (
  username: string,
  password: string
): Promise<AuthUser> => {
  const res = await api.post("/authentication/login", {
    username,
    password
  }, {
    withCredentials: true
  });

  const user = res.data.data;

  localStorage.setItem("user", JSON.stringify(user));

  return user;
};
// REGISTER
export const registerUser = async (
  data: RegisterPayload
) => {
  const res = await api.post("/authentication/register", data);
  return res.data.data;
};

export const editUser = async (
  user_id: number,
  data: UpdateUserPayload
) => {
  const res = await api.patch(`api/request/${user_id}/updateUser`, data);
  return res.data.data;
};

export const deleteUser = async (user_id: number) => {
  const res = await api.delete(`/api/request/${user_id}/deleteUser`);
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
