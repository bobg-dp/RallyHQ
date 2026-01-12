import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { useAppDispatch } from "@/lib/store";
import { addToast } from "@/lib/store/slices/uiSlice";

export default function AuthCallback() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    // Supabase automatically exchanges the hash fragment for a session
    // We just need to wait for it to complete
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          setError("Błąd podczas weryfikacji emaila. Spróbuj zalogować się ponownie.");
          dispatch(
            addToast({
              type: "error",
              message: "Błąd podczas weryfikacji emaila.",
            })
          );
          setTimeout(() => navigate("/login"), 3000);
          return;
        }

        if (data.session) {
          // Session is valid, redirect to dashboard
          dispatch(
            addToast({
              type: "success",
              message: "Email zweryfikowany pomyślnie! Witamy w RallyHQ.",
            })
          );
          navigate("/dashboard");
        } else {
          // No session, something went wrong
          setError("Nie udało się zweryfikować emaila.");
          dispatch(
            addToast({
              type: "error",
              message: "Nie udało się zweryfikować emaila.",
            })
          );
          setTimeout(() => navigate("/login"), 3000);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Wystąpił nieoczekiwany błąd.");
        dispatch(
          addToast({
            type: "error",
            message: "Wystąpił nieoczekiwany błąd.",
          })
        );
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, dispatch]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Błąd</h2>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm mt-2">Przekierowywanie do logowania...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold mb-2">Weryfikacja emaila...</h2>
        <p className="text-muted-foreground">Proszę czekać, trwa weryfikacja Twojego konta.</p>
      </div>
    </div>
  );
}
