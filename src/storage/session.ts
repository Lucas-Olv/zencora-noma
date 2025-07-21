import { create } from "zustand";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { Session, User } from "@/lib/types";
import { cleanWorkspaceData } from "@/lib/utils";

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
      if (!sessionData?.token) return;
      const payload = await verifyToken(sessionData.token);
      set({
        token: sessionData.token,
        user: {
          id: payload.sub,
          email: payload.email as string,
          name: payload.name as string,
          sessionId: payload.sessionId as string,
        },
        session: {
          id: payload.sessionId as string,
          user: {
            id: payload.sub,
            email: payload.email as string,
            name: payload.name as string,
            sessionId: payload.sessionId as string,
          },
          token: sessionData.token,
          productId: payload.productId as string,
        },
        isAuthenticated: true,
      });
    } catch (error) {
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
