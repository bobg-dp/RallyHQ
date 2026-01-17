import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { logout as logoutThunk } from "@/lib/store/thunks/auth.thunks";
import { addToast } from "@/lib/store/slices/uiSlice";

export default function useAuth() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useAppSelector((s) => s.auth);

  const logout = useCallback(async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      // Clear our own refresh token and any Supabase auth entries
      localStorage.removeItem("rallyhq_refresh_token");
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("sb-")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      dispatch(
        addToast({
          type: "success",
          message: "Wylogowano pomyślnie",
        })
      );
      navigate("/");
    } catch (err) {
      dispatch(
        addToast({
          type: "error",
          message: "Błąd podczas wylogowywania",
        })
      );
    }
  }, [dispatch, navigate]);

  return { isAuthenticated, user, loading, logout };
}
