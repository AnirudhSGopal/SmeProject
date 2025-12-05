import { createContext } from "react";

export type Me = {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  profile_complete?: boolean;
  verified?: boolean;
  phone?: string;
  companyName?: string;
  // ...any other fields your /me returns
};

export type UserContextValue = {
  me: Me | null;
  setMe: (m: Me | null) => void;
};

const UserContext = createContext<UserContextValue>({
  me: null,
  setMe: () => {},
});

export { UserContext };
