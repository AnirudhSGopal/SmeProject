import { useEffect, useState } from "react";

export type User = {
  id: string;
  name: string;
  role: "SME" | "CA";
  profile_complete: boolean;
};

export default function useUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") as "SME" | "CA" | null;

    if (!token || !role) {
      setUser(null);
      return;
    }

    // TEMP — replace with backend call later
    const stored = localStorage.getItem("user_profile");
    if (stored) {
      setUser(JSON.parse(stored));
    } else {
      setUser({
        id: "1",
        name: role === "SME" ? "SME User" : "CA User",
        role,
        profile_complete: false,
      });
    }
  }, []);

  return user;
}
