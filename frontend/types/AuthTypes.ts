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
    username: string;
    name: string;
    title: string;
  };
}

export interface RegisterPayload {
  name: string;
  username: string;
  password: string;
  role_id: number;
  license_no?: string;
  title?: string;
  ptr_no?: string;
}

export interface UserInfo {
  user_id: number;
  name: string;
  username: string;
}
