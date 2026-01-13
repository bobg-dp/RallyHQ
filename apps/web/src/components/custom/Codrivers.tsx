import { useState } from "react";
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

type Codriver = {
  name: string;
  club: string;
  birthDate: string;
  drivingLicenseNumber: string;
  sportsLicense: boolean;
  email: string;
  phone: string;
};

const initialCodriver: Codriver = {
  name: "",
  club: "",
  birthDate: "",
  drivingLicenseNumber: "",
  sportsLicense: false,
  email: "",
  phone: "",
};

export default function Codrivers() {
  const [codrivers, setCodrivers] = useState<Codriver[]>([
    {
      name: "Jan Kowalski",
      club: "Automobilklub Karkonosze",
      birthDate: "01.01.1990",
      drivingLicenseNumber: "12345/67/8901",
      sportsLicense: true,
      email: "Bob.grabinski@gmail.com",
      phone: "123456789",
    },
  ]);

  const [newCodriver, setNewCodriver] = useState<Codriver>(initialCodriver);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleInput = (field: keyof Codriver, value: string | boolean) => {
    setNewCodriver((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newCodriver.name && newCodriver.email && newCodriver.phone) {
      if (editingIndex !== null) {
        // Tryb edycji - aktualizuj istniejącego codrivera
        setCodrivers((prev) =>
          prev.map((codriver, index) =>
            index === editingIndex ? newCodriver : codriver
          )
        );
        setEditingIndex(null);
      } else {
        // Tryb dodawania - dodaj nowego codrivera
        setCodrivers((prev) => [...prev, newCodriver]);
      }
      setNewCodriver(initialCodriver);
      setShowForm(false);
    }
  };

  const handleRemove = (index: number) => {
    setCodrivers((prev) => prev.filter((_, i) => i !== index));
    setShowDeleteDialog(false);
    setDeleteIndex(null);
  };

  const openDeleteDialog = (index: number) => {
    setDeleteIndex(index);
    setShowDeleteDialog(true);
  };

  const handleEdit = (index: number) => {
    setNewCodriver(codrivers[index]);
    setEditingIndex(index);
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
              {deleteIndex !== null && (
                <>
                  Zamierzasz usunąć pilota:{" "}
                  <strong>{codrivers[deleteIndex]?.name}</strong>. Ta operacja
                  jest nieodwracalna.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteIndex !== null && handleRemove(deleteIndex)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Usuń
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

        <div className="space-y-3">
          {codrivers.map((codriver, index) => (
            <motion.div
              key={index}
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
                    id={`license-${index}`}
                    checked={codriver.sportsLicense}
                    disabled
                  />
                  <Label
                    htmlFor={`license-${index}`}
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
                  onClick={() => handleEdit(index)}
                >
                  Edytuj
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => openDeleteDialog(index)}
                >
                  Usuń
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {!showForm && (
          <div className="flex justify-end mt-4">
            <Button
              type="button"
              variant="default"
              onClick={() => setShowForm(true)}
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
            {editingIndex !== null ? "Edytuj Pilota" : "Dodaj Pilota"}
          </h2>

          <form className="grid grid-cols-1 gap-3" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="codriver-name">Imię i nazwisko *</Label>
                <Input
                  id="codriver-name"
                  value={newCodriver.name}
                  onChange={(e) => handleInput("name", e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="codriver-club">Klub</Label>
                <Input
                  id="codriver-club"
                  value={newCodriver.club}
                  onChange={(e) => handleInput("club", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="codriver-birthDate">Data urodzenia</Label>
                <Input
                  id="codriver-birthDate"
                  value={newCodriver.birthDate}
                  onChange={(e) => handleInput("birthDate", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="codriver-drivingLicenseNumber">
                  Numer prawa jazdy
                </Label>
                <Input
                  id="codriver-drivingLicenseNumber"
                  value={newCodriver.drivingLicenseNumber}
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
                  Posiadam licencję sportową
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="codriver-email">Email *</Label>
                <Input
                  id="codriver-email"
                  type="email"
                  value={newCodriver.email}
                  onChange={(e) => handleInput("email", e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="codriver-phone">Telefon *</Label>
                <Input
                  id="codriver-phone"
                  value={newCodriver.phone}
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
                  setEditingIndex(null);
                  setShowForm(false);
                }}
              >
                Anuluj
              </Button>
              <Button type="submit" variant="default">
                {editingIndex !== null ? "Zapisz zmiany" : "Dodaj Pilota"}
              </Button>
            </div>
          </form>
        </motion.article>
      )}
    </div>
  );
}
