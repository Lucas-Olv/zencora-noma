import { create } from "zustand";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { Session, User } from "@/lib/types";
import { cleanWorkspaceData } from "@/lib/utils";
import { postCoreApi, postCoreApiPublic } from "@/lib/apiHelpers";

interface SessionState {
  token: string | null;
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  setSession: (session: Session, token: string) => Promise<void>;
  restoreSession: () => Promise<void>;
  clearSession: () => Promise<void>;
}

export const useSessionStorage = create<SessionState>((set) => ({
  token: null,
  user: null,
  session: null,
  isAuthenticated: false,

  setSession: async (session, token) => {
    set({
      token,
      user: session.user,
      session,
      isAuthenticated: true,
    });
    await db.updateSessionData(session);
  },

  restoreSession: async () => {
    try {
      const sessionData = await db.getSessionData();
      if (!sessionData) throw Error('Invalid session or session not found');
      set({
        token: sessionData.token,
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
      token: null,
      user: null,
      session: null,
      isAuthenticated: false,
    });
  },
}));
