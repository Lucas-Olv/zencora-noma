import { create } from "zustand";
import { db } from "@/lib/db";
import { Session, User } from "@/lib/types";
import { cleanWorkspaceData } from "@/lib/utils";

interface SessionState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  setSession: (session: Session) => Promise<void>;
  restoreSession: () => Promise<void>;
  clearSession: () => Promise<void>;
}

export const useSessionStorage = create<SessionState>((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,

  setSession: async (session) => {
    set({
      user: session.user,
      session,
      isAuthenticated: true,
    });
    await db.updateSessionData(session);
  },

  restoreSession: async () => {
    try {
      const sessionData = await db.getSessionData();
      if (!sessionData) return;
      set({
        user: sessionData.user,
        session: sessionData,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error(error);
      await cleanWorkspaceData();
    }
  },

  clearSession: async () => {
    await db.clearSessionData();
    set({
      user: null,
      session: null,
      isAuthenticated: false,
    });
  },
}));
