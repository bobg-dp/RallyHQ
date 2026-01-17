import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAppDispatch } from "@/lib/store";
import { addToast } from "@/lib/store/slices/uiSlice";
import {
  getUserPermissions,
  UserPermission,
} from "@/lib/api/services/permissions.service";

function mapPermissionLabel(permission: string): string {
  switch (permission) {
    case "admin":
      return "Administrator systemu";
    case "create_rally":
      return "Tworzenie rajdów";
    default:
      return permission;
  }
}

export default function UserPermissions() {
  const dispatch = useAppDispatch();
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPermissions() {
      try {
        setLoading(true);
        const data = await getUserPermissions();
        setPermissions(data ?? []);
      } catch (err) {
        console.error("Unexpected error while fetching user permissions", err);
        dispatch(
          addToast({
            type: "error",
            message: "Wystąpił błąd podczas pobierania uprawnień użytkownika",
          })
        );
      } finally {
        setLoading(false);
      }
    }

    void loadPermissions();
  }, [dispatch]);

  return (
    <motion.article
      key="permissions"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="bg-card rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow p-4"
    >
      <h2 className="text-lg font-semibold mb-4">Twoje uprawnienia</h2>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : permissions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nie masz jeszcze żadnych specjalnych uprawnień.
        </p>
      ) : (
        <ul className="space-y-2 text-sm">
          {permissions.map((p) => (
            <li
              key={p.permission}
              className="flex items-center justify-between rounded-md border border-border px-3 py-2 bg-background/60"
            >
              <span className="font-medium">
                {mapPermissionLabel(p.permission)}
              </span>
              {p.created_at && (
                <span className="text-xs text-muted-foreground">
                  od {new Date(p.created_at).toLocaleDateString("pl-PL")}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </motion.article>
  );
}
