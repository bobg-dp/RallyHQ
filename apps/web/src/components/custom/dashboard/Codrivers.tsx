import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getCodrivers,
  addCodriver,
  updateCodriver,
  deleteCodriver,
  type Codriver,
} from "@/lib/api/services/codriver.service";
import { useAppDispatch } from "@/lib/store";
import { addToast } from "@/lib/store/slices/uiSlice";

const initialCodriver: Omit<
  Codriver,
  "id" | "userId" | "createdAt" | "updatedAt"
> = {
  name: "",
  club: "",
  birthDate: "",
  drivingLicenseNumber: "",
  sportsLicense: false,
  email: "",
  phone: "",
};

export default function Codrivers() {
  const [codrivers, setCodrivers] = useState<Codriver[]>([]);
  const [newCodriver, setNewCodriver] = useState(initialCodriver);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteCodriver_, setDeleteCodriver_] = useState<Codriver | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useAppDispatch();

  // Pobierz codriverów przy montowaniu komponentu
  useEffect(() => {
    loadCodrivers();
  }, []);

  const loadCodrivers = async () => {
    try {
      setLoading(true);
      const data = await getCodrivers();
      setCodrivers(data);
    } catch (error) {
      console.error("Failed to load codrivers:", error);
      dispatch(
        addToast({
          type: "error",
          message: "Nie udało się załadować pilotów",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (field: keyof Codriver, value: string | boolean) => {
    setNewCodriver((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newCodriver.name && newCodriver.email && newCodriver.phone) {
      try {
        setSubmitting(true);

        if (editingId !== null) {
          // Tryb edycji - aktualizuj istniejącego codrivera
          const updatedCodriver = await updateCodriver({
            ...newCodriver,
            id: editingId,
          });
          setCodrivers((prev) =>
            prev.map((codriver) =>
              codriver.id === editingId ? updatedCodriver : codriver
            )
          );
          dispatch(
            addToast({
              type: "success",
              message: "Pilot został zaktualizowany",
            })
          );
          setEditingId(null);
        } else {
          // Tryb dodawania - dodaj nowego codrivera
          const newCodriverData = await addCodriver(newCodriver);
          setCodrivers((prev) => [newCodriverData, ...prev]);
          dispatch(
            addToast({
              type: "success",
              message: "Pilot został dodany",
            })
          );
        }

        setNewCodriver(initialCodriver);
        setShowForm(false);
      } catch (error) {
        console.error("Failed to save codriver:", error);
        dispatch(
          addToast({
            type: "error",
            message: editingId
              ? "Nie udało się zaktualizować pilota"
              : "Nie udało się dodać pilota",
          })
        );
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleRemove = async () => {
    if (deleteCodriver_?.id) {
      try {
        setSubmitting(true);
        await deleteCodriver(deleteCodriver_.id);
        setCodrivers((prev) => prev.filter((c) => c.id !== deleteCodriver_.id));
        dispatch(
          addToast({
            type: "success",
            message: "Pilot został usunięty",
          })
        );
        setShowDeleteDialog(false);
        setDeleteCodriver_(null);
      } catch (error) {
        console.error("Failed to delete codriver:", error);
        dispatch(
          addToast({
            type: "error",
            message: "Nie udało się usunąć pilota",
          })
        );
      } finally {
        setSubmitting(false);
      }
    }
  };

  const openDeleteDialog = (codriver: Codriver) => {
    setDeleteCodriver_(codriver);
    setShowDeleteDialog(true);
  };

  const handleEdit = (codriver: Codriver) => {
    setNewCodriver({
      name: codriver.name ?? "",
      club: codriver.club ?? "",
      birthDate: codriver.birthDate ?? "",
      drivingLicenseNumber: codriver.drivingLicenseNumber ?? "",
      sportsLicense: codriver.sportsLicense ?? false,
      email: codriver.email ?? "",
      phone: codriver.phone ?? "",
    });
    setEditingId(codriver.id || null);
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      {/* Dialog potwierdzenia usunięcia */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Czy na pewno chcesz usunąć pilota?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteCodriver_ && (
                <>
                  Zamierzasz usunąć pilota:{" "}
                  <strong>{deleteCodriver_.name}</strong>. Ta operacja jest
                  nieodwracalna.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={submitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitting ? "Usuwanie..." : "Usuń"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Lista Codriverów */}
      <motion.article
        key="codrivers-list"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-card rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow p-4"
      >
        <h2 className="text-lg font-semibold mb-4">Piloci</h2>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Ładowanie...
          </div>
        ) : codrivers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nie masz jeszcze żadnych pilotów. Dodaj pierwszego!
          </div>
        ) : (
          <div className="space-y-3">
            {codrivers.map((codriver) => (
              <motion.div
                key={codriver.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="border border-border rounded-lg p-3 hover:bg-accent/50 transition-colors"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Imię i nazwisko
                    </p>
                    <p className="text-base">{codriver.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Klub
                    </p>
                    <p className="text-base">{codriver.club}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Data urodzenia
                    </p>
                    <p className="text-base">{codriver.birthDate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Email
                    </p>
                    <p className="text-base">{codriver.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Telefon
                    </p>
                    <p className="text-base">{codriver.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`license-${codriver.id}`}
                      checked={codriver.sportsLicense}
                      disabled
                    />
                    <Label
                      htmlFor={`license-${codriver.id}`}
                      className="text-sm cursor-pointer"
                    >
                      Licencja sportowa
                    </Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(codriver)}
                    disabled={submitting}
                  >
                    Edytuj
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => openDeleteDialog(codriver)}
                    disabled={submitting}
                  >
                    Usuń
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!showForm && (
          <div className="flex justify-end mt-4">
            <Button
              type="button"
              variant="default"
              onClick={() => setShowForm(true)}
              disabled={loading || submitting}
            >
              + Dodaj Pilota
            </Button>
          </div>
        )}
      </motion.article>

      {/* Formularz dodawania Codrivera */}
      {showForm && (
        <motion.article
          key="add-codriver"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-card rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow p-4"
        >
          <h2 className="text-lg font-semibold mb-4">
            {editingId !== null ? "Edytuj Pilota" : "Dodaj Pilota"}
          </h2>

          <form className="grid grid-cols-1 gap-3" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="codriver-name">Imię i nazwisko *</Label>
                <Input
                  id="codriver-name"
                  value={newCodriver.name ?? ""}
                  onChange={(e) => handleInput("name", e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="codriver-club">Klub</Label>
                <Input
                  id="codriver-club"
                  value={newCodriver.club ?? ""}
                  onChange={(e) => handleInput("club", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="codriver-birthDate">Data urodzenia</Label>
                <Input
                  id="codriver-birthDate"
                  type="date"
                  value={newCodriver.birthDate ?? ""}
                  onChange={(e) => handleInput("birthDate", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="codriver-drivingLicenseNumber">
                  Numer prawa jazdy
                </Label>
                <Input
                  id="codriver-drivingLicenseNumber"
                  value={newCodriver.drivingLicenseNumber ?? ""}
                  onChange={(e) =>
                    handleInput("drivingLicenseNumber", e.target.value)
                  }
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Checkbox
                  id="codriver-sportsLicense"
                  checked={newCodriver.sportsLicense}
                  onCheckedChange={(checked) =>
                    handleInput("sportsLicense", Boolean(checked))
                  }
                />
                <Label htmlFor="codriver-sportsLicense">
                  Posiada licencję sportową
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="codriver-email">Email *</Label>
                <Input
                  id="codriver-email"
                  type="email"
                  value={newCodriver.email ?? ""}
                  onChange={(e) => handleInput("email", e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="codriver-phone">Telefon *</Label>
                <Input
                  id="codriver-phone"
                  value={newCodriver.phone ?? ""}
                  onChange={(e) => handleInput("phone", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setNewCodriver(initialCodriver);
                  setEditingId(null);
                  setShowForm(false);
                }}
                disabled={submitting}
              >
                Anuluj
              </Button>
              <Button type="submit" variant="default" disabled={submitting}>
                {submitting
                  ? "Zapisywanie..."
                  : editingId !== null
                  ? "Zapisz zmiany"
                  : "Dodaj Pilota"}
              </Button>
            </div>
          </form>
        </motion.article>
      )}
    </div>
  );
}
