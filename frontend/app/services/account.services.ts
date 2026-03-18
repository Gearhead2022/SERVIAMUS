import api from "./axios";
import { UserLists } from "../types/AuthTypes";

export const fetchUsers = async (): Promise<UserLists[]> => {
  const res = await api.get("api/users/users_information");

  console.log('response', res.data.data)
  return res.data.data;
};