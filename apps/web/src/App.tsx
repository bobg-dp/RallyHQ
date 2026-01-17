import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import ToastNotification from './components/ui/toast';
import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAppDispatch } from "@/lib/store";
import {
  setCredentials,
  setInitialized,
  clearCredentials,
} from "@/lib/store/slices/authSlice";
import { refreshToken as refreshTokenThunk } from "@/lib/store/thunks/auth.thunks";

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // On app load, try to restore session using our own stored refresh token
    (async () => {
      const storedRefreshToken = localStorage.getItem("rallyhq_refresh_token");

      // If we don't have our own refresh token, make sure
      // there are no stale Supabase auth entries left in localStorage
      if (!storedRefreshToken) {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("sb-")) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      }

      if (storedRefreshToken) {
        try {
          await dispatch(
            refreshTokenThunk(storedRefreshToken)
          ).unwrap();
        } catch (error) {
          console.warn("Error restoring session from stored refresh token", error);
          localStorage.removeItem("rallyhq_refresh_token");
        }
      }

      // Mark app as initialized after attempting restore
      dispatch(setInitialized());
    })();

    // Subscribe to auth changes and keep Redux in sync
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Handle sign in and email verification (TOKEN_REFRESHED happens after email verification)
        if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session) {
          const s = session as any;
          const emailConfirmed = s.user?.email_confirmed_at !== null;
          dispatch(
            setCredentials({
              user: {
                id: s.user?.id ?? "",
                email: s.user?.email ?? "",
                name: s.user?.user_metadata?.name ?? "",
                role: "user",
                emailConfirmed,
              },
              token: s.access_token ?? "",
              refreshToken: s.refresh_token ?? "",
            })
          );
        }

        if (event === "SIGNED_OUT") {
          dispatch(clearCredentials());
        }

        // mark initialization complete after first event
        dispatch(setInitialized());
      }
    );

    return () => {
      listener?.subscription?.unsubscribe?.();
    };
  }, [dispatch]);

  return (
    <>
      <RouterProvider
        router={router}
        future={{
          v7_startTransition: true,
        }}
      />
      <ToastNotification />
    </>
  );
}
