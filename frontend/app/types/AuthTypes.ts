/* =====================
   TYPES
===================== */

export interface Role {
  role_id: number;
  role_name: string;
  role_desc?: string;
}

export interface LoginResponse {
  token: string;
  user: {
    user_id: number;
    roles: string[];
  };
}

export interface RegisterPayload {
  name: string;
  username: string;
  password: string;
  role_id: number;
}

export interface UserInfo {
    user_id: number;
    name: string;
    username: string;
}
