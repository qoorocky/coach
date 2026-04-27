export type Role = "EDITOR" | "REVIEWER" | "ADMIN";

export interface CurrentUser {
  userId: number;
  email: string;
  name: string;
  role: Role;
}
