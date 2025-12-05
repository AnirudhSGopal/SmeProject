import { createContext } from "react";

export type CAMe = {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  profile_complete?: boolean;
  verified?: boolean;
  // ...any other CA-specific fields
};

export type CAUserContextValue = {
  me: CAMe | null;
  setMe: (m: CAMe | null) => void;
};

const CAUserContext = createContext<CAUserContextValue>({
  me: null,
  setMe: () => {},
});

export { CAUserContext };
