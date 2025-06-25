import { create } from "zustand";
import { persist } from "zustand/middleware";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { Session, User } from "@/lib/types";

interface SessionState {
  token: string | null;
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  setSession: (session: Session, token: string) => void;
  restoreSession: () => Promise<void>;
  clearSession: () => void;
  handleTokenRefresh: (token: string) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      session: null,
      isAuthenticated: false,

      setSession: (session, token) => {
        set({
          token,
          user: session.user,
          session,
          isAuthenticated: true,
        });
        db.updateSessionData(session);
      },

      handleTokenRefresh: (token: string) => {
        set({
          token,
        });
        db.updateSessionData({ ...useSessionStore.getState().session, token });
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
          useSessionStore.getState().clearSession();
          window.location.href = "/login";
        }
      },

      clearSession: () => {
        db.clearSessionData();
        set({
          token: null,
          user: null,
          session: null,
          isAuthenticated: false,
        });
        window.location.href = "/login";
      },
    }),
    {
      name: "session-storage",
    },
  ),
);
