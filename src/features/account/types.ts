export type AccountProfile = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  userType: string;
};

export type AccountProfileInput = Pick<AccountProfile, "fullName" | "email" | "phone">;

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};
