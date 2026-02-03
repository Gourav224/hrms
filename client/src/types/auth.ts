export type AuthToken = {
  access_token: string;
  token_type: string;
};

export type AdminUser = {
  id: number;
  name: string | null;
  email: string;
  role: "admin" | "manager";
  created_at: string;
  updated_at: string;
  created_by_id: number | null;
  updated_by_id: number | null;
  last_active_at: string | null;
};

export type SessionData = {
  user: AdminUser;
  token: AuthToken;
};
