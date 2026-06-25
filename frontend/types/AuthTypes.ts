/* =====================
  TYPES
===================== */

export interface Role {
  role_id: number;
  role_name: string;
  role_desc?: string;
}

export interface AuthUser {
  user_id: number;
  roles: string[];
  username: string;
  name: string;
  title: string;
}

export interface RegisterPayload {
  user_id?: number;
  name: string;
  username: string;
  password: string;
  role_id: number;
  license_no?: string;
  title?: string;
  ptr_no?: string;
  is_active: boolean;
}

export type UpdateUserPayload = Omit<RegisterPayload, 'password'>;

export interface UserInfo {
  user_id: number;
  name: string;
  username: string;
}

export type ServiceProps = {
  reference_id: number;
  service_name: string;
  price: number;
  date?: string;
};

export interface DashboardStats {
  requests: {
    total: number;
    pending: number;
    done: number;
    cancelled: number;
  };

  billing: {
    totalBilled: number;
    totalCollected: number;
    totalPending: number;
    collectionRate: number;
  };

  paymentMethods: {
    CASH: number;
    GCASH: number;
    CARD: number;
    BANK_TRANSFER: number;
  };

  users: {
    total: number;
  };

  patients: {
    total: number;
  };
}