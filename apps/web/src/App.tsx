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

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // On app load, try to restore session
    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.warn("Error getting Supabase session", error);
        dispatch(setInitialized());
        return;
      }

      const session = (data as any)?.session;

      if (session) {
        const emailConfirmed = session.user?.email_confirmed_at !== null;
        dispatch(
          setCredentials({
            user: {
              id: session.user?.id ?? "",
              email: session.user?.email ?? "",
              name: session.user?.user_metadata?.name ?? "",
              role: "user",
              emailConfirmed,
            },
            token: session.access_token ?? "",
            refreshToken: session.refresh_token ?? "",
          })
        );
      } else {
        dispatch(setInitialized());
      }
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
      <RouterProvider router={router} />
      <ToastNotification />
    </>
  );
}
