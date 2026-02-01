import type { SignupUser } from "../apiCalls/auth";
import type { UserState } from "../redux-store/userSlice";

export const getInitials = (user?: UserState | SignupUser): string => {
  if (!user?.firstName && !user?.lastName) return "N/A";

  const first = user?.firstName ? user.firstName.charAt(0).toUpperCase() : "";

  const last = user?.lastName ? user.lastName.charAt(0).toUpperCase() : "";

  return `${first}${last}`;
};

export const formatUserName = (user?: UserState | SignupUser): string => {
  if (!user?.firstName && !user?.lastName) return "N/A";

  const first = user?.firstName
    ? user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1)
    : "";

  const last = user?.lastName
    ? user.lastName.charAt(0).toUpperCase() + user.lastName.slice(1)
    : "";

  return `${first}${first && last ? " " : ""}${last}`;
};
