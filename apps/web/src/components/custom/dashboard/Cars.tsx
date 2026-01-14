import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  addCar,
  deleteCar,
  getCars,
  updateCar,
  type Car,
} from "@/lib/api/services/car.service";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

enum EngineType {
  NaturallyAspirated = "NaturallyAspirated",
  Turbo = "Turbo",
  Electric = "Electric",
  Rotary = "Rotary",
  TwoStroke = "TwoStroke"
}

enum FuelType {
  Petrol = "Petrol",
  LPG = "LPG",
  Diesel = "Diesel",
  Electric = "Electric",
  Hybrid = "Hybrid",
}

enum DriveType {
  FWD = "FWD",
  RWD = "RWD",
  AWD = "AWD",
}

enum SportCarType {
  StockCar = "StockCar",
  AmatorRallyCar = "AmatorRallyCar",
  SportCar = "SportCar",
  RallySportCar = "RallySportCar",
}

type CarForm = Omit<Car, "id" | "userId" | "createdAt" | "updatedAt"> & {
  engine: {
    capacity: string;
    type: EngineType;
    capacityMultiplier: number;
    capacityWithMultiplier: string;
    fuel: FuelType;
  };
  drive: DriveType;
  sportCarType: SportCarType;
};

const initialCar: CarForm = {
  make: "",
  model: "",
  year: "",
  registrationNumber: "",
  vin: "",
  engine: {
    capacity: "",
    type: EngineType.NaturallyAspirated,
    capacityMultiplier: 1.0,
    capacityWithMultiplier: "",
    fuel: FuelType.Petrol,
  },
  drive: DriveType.FWD,
  nextInspection: "",
  insurance: {
    policyNumber: "",
    expiryDate: "",
  },
  sportCarType: SportCarType.StockCar,
};

const getCapacityWithMultiplier = (capacity: string, multiplier: number) => {
  const parsed = Number(capacity);
  if (!Number.isFinite(parsed) || parsed <= 0) return "";
  return String(Math.round(parsed * multiplier));
};

// Funkcja obliczająca mnożnik pojemności na podstawie typu silnika i paliwa
const calculateCapacityMultiplier = (
  engineType: EngineType,
  fuelType: FuelType
): number => {
  switch (engineType) {
    case EngineType.NaturallyAspirated:
      return 1.0;
    case EngineType.Turbo:
      return fuelType === FuelType.Diesel ? 1.5 : 1.7;
    case EngineType.Electric:
      return 1.0;
    case EngineType.Rotary:
      return 1.8;
    case EngineType.TwoStroke:
      return 1.9;
    default:
      return 1.0;
  }
};

// Funkcje pomocnicze do wyświetlania nazw
const getEngineTypeLabel = (type: EngineType): string => {
  const labels: Record<EngineType, string> = {
    [EngineType.NaturallyAspirated]: "Wolnossący",
    [EngineType.Turbo]: "Turbo",
    [EngineType.Electric]: "Elektryczny",
    [EngineType.Rotary]: "Wankla (Rotary)",
    [EngineType.TwoStroke]: "Dwusuw",
  };
  return labels[type];
};

const getFuelTypeLabel = (type: FuelType): string => {
  const labels: Record<FuelType, string> = {
    [FuelType.Petrol]: "Benzyna",
    [FuelType.LPG]: "LPG",
    [FuelType.Diesel]: "Diesel",
    [FuelType.Electric]: "Elektryczny",
    [FuelType.Hybrid]: "Hybrydowy",
  };
  return labels[type];
};

// Funkcja zwracająca dostępne typy paliwa dla danego typu silnika
const getAvailableFuelTypes = (engineType: EngineType): FuelType[] => {
  if (engineType === EngineType.Electric) {
    return [FuelType.Electric];
  }
  return Object.values(FuelType).filter(fuel => fuel !== FuelType.Electric);
};

export default function Cars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [newCar, setNewCar] = useState<CarForm>(initialCar);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteCar_, setDeleteCar_] = useState<Car | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    try {
      setLoading(true);
      const data = await getCars();
      setCars(data);
    } catch (error) {
      console.error("Failed to load cars:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się załadować samochodów",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (field: string, value: string | number) => {
    if (field.startsWith("engine.")) {
      const engineField = field.split(".")[1];
      
      // Tworzymy nowy obiekt engine z zaktualizowanym polem
      const updatedEngine = {
        ...newCar.engine,
        [engineField]: value,
      };
      
      // Jeśli zmieniamy typ silnika, ustaw odpowiednie paliwo
      if (engineField === "type") {
        const newEngineType = value as EngineType;
        if (newEngineType === EngineType.Electric) {
          // Dla silnika elektrycznego ustaw paliwo Electric
          updatedEngine.fuel = FuelType.Electric;
        } else if (updatedEngine.fuel === FuelType.Electric) {
          // Jeśli obecne paliwo to Electric, a typ silnika nie jest elektryczny, zmień na Petrol
          updatedEngine.fuel = FuelType.Petrol;
        }
      }
      
      // Jeśli zmieniamy typ silnika lub paliwo, przelicz mnożnik
      if (engineField === "type" || engineField === "fuel") {
        updatedEngine.capacityMultiplier = calculateCapacityMultiplier(
          engineField === "type" ? (value as EngineType) : newCar.engine.type,
          engineField === "fuel" ? (value as FuelType) : updatedEngine.fuel
        );
      }

      if (engineField === "capacity" || engineField === "type" || engineField === "fuel") {
        updatedEngine.capacityWithMultiplier = getCapacityWithMultiplier(
          updatedEngine.capacity,
          updatedEngine.capacityMultiplier
        );
      }

      setNewCar((prev) => ({
        ...prev,
        engine: updatedEngine,
      }));
    } else if (field.startsWith("insurance.")) {
      const insuranceField = field.split(".")[1];
      setNewCar((prev) => ({
        ...prev,
        insurance: {
          ...prev.insurance,
          [insuranceField]: value,
        },
      }));
    } else {
      setNewCar((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newCar.make && newCar.model && newCar.registrationNumber) {
      try {
        setSubmitting(true);

        if (editingId !== null) {
          const updatedCar = await updateCar({
            ...newCar,
            id: editingId,
          });
          setCars((prev) =>
            prev.map((car) => (car.id === editingId ? updatedCar : car))
          );
          toast({
            title: "Sukces",
            description: "Samochód został zaktualizowany",
          });
          setEditingId(null);
        } else {
          const newCarData = await addCar(newCar);
          setCars((prev) => [newCarData, ...prev]);
          toast({
            title: "Sukces",
            description: "Samochód został dodany",
          });
        }

        setNewCar(initialCar);
        setShowForm(false);
      } catch (error) {
        console.error("Failed to save car:", error);
        toast({
          title: "Błąd",
          description: editingId
            ? "Nie udało się zaktualizować samochodu"
            : "Nie udało się dodać samochodu",
          variant: "destructive",
        });
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleRemove = async () => {
    if (!deleteCar_?.id) return;

    try {
      setSubmitting(true);
      await deleteCar(deleteCar_.id);
      setCars((prev) => prev.filter((car) => car.id !== deleteCar_.id));
      toast({
        title: "Sukces",
        description: "Samochód został usunięty",
      });
      setShowDeleteDialog(false);
      setDeleteCar_(null);
    } catch (error) {
      console.error("Failed to delete car:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć samochodu",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteDialog = (car: Car) => {
    setDeleteCar_(car);
    setShowDeleteDialog(true);
  };

  const handleEdit = (car: Car) => {
    setNewCar({
      make: car.make ?? "",
      model: car.model ?? "",
      year: car.year ?? "",
      registrationNumber: car.registrationNumber ?? "",
      vin: car.vin ?? "",
      engine: {
        capacity: car.engine?.capacity ?? "",
        type: (car.engine?.type as EngineType) ?? EngineType.NaturallyAspirated,
        capacityMultiplier: car.engine?.capacityMultiplier ?? 1.0,
        capacityWithMultiplier: car.engine?.capacityWithMultiplier ?? "",
        fuel: (car.engine?.fuel as FuelType) ?? FuelType.Petrol,
      },
      drive: (car.drive as DriveType) ?? DriveType.FWD,
      nextInspection: car.nextInspection ?? "",
      insurance: {
        policyNumber: car.insurance?.policyNumber ?? "",
        expiryDate: car.insurance?.expiryDate ?? "",
      },
      sportCarType: (car.sportCarType as SportCarType) ?? SportCarType.StockCar,
    });
    setEditingId(car.id || null);
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      {/* Dialog potwierdzenia usunięcia */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Czy na pewno chcesz usunąć samochód?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteCar_ && (
                <>
                  Zamierzasz usunąć samochód:{" "}
                  <strong>
                    {deleteCar_.make} {deleteCar_.model}
                  </strong>
                  . Ta operacja jest nieodwracalna.
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

      {/* Lista Samochodów */}
      <motion.article
        key="cars-list"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-card rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow p-4"
      >
        <h2 className="text-lg font-semibold mb-4">Samochody</h2>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Ładowanie...
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nie masz jeszcze żadnych samochodów. Dodaj pierwszy!
          </div>
        ) : (
          <div className="space-y-3">
            {cars.map((car, index) => (
              <motion.div
                key={car.id ?? index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="border border-border rounded-lg p-3 hover:bg-accent/50 transition-colors"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Marka i model
                    </p>
                    <p className="text-base">
                      {car.make} {car.model}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Rok produkcji
                    </p>
                    <p className="text-base">{car.year}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Numer rejestracyjny
                    </p>
                    <p className="text-base">{car.registrationNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      VIN
                    </p>
                    <p className="text-base">{car.vin}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Silnik
                    </p>
                    <p className="text-base">
                      {car.engine.capacity} cm³ ({getEngineTypeLabel(car.engine.type as EngineType)})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Paliwo
                    </p>
                    <p className="text-base">
                      {getFuelTypeLabel(car.engine.fuel as FuelType)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Napęd
                    </p>
                    <p className="text-base">{car.drive}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Typ samochodu
                    </p>
                    <p className="text-base">{car.sportCarType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Następny przegląd
                    </p>
                    <p className="text-base">{car.nextInspection}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Ubezpieczenie
                    </p>
                    <p className="text-base">
                      {car.insurance.policyNumber} (do {car.insurance.expiryDate})
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(car)}
                    disabled={submitting}
                  >
                    Edytuj
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => openDeleteDialog(car)}
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
              + Dodaj Samochód
            </Button>
          </div>
        )}
      </motion.article>

      {/* Formularz dodawania Samochodu */}
      {showForm && (
        <motion.article
          key="add-car"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-card rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow p-4"
        >
          <h2 className="text-lg font-semibold mb-4">
            {editingId !== null ? "Edytuj Samochód" : "Dodaj Samochód"}
          </h2>

          <form className="grid grid-cols-1 gap-4" onSubmit={handleSubmit}>
            {/* Podstawowe informacje */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Podstawowe informacje
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="car-make">Marka *</Label>
                  <Input
                    id="car-make"
                    value={newCar.make}
                    onChange={(e) => handleInput("make", e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="car-model">Model *</Label>
                  <Input
                    id="car-model"
                    value={newCar.model}
                    onChange={(e) => handleInput("model", e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="car-year">Rok produkcji</Label>
                  <Input
                    id="car-year"
                    value={newCar.year}
                    onChange={(e) => handleInput("year", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="car-registrationNumber">
                    Numer rejestracyjny *
                  </Label>
                  <Input
                    id="car-registrationNumber"
                    value={newCar.registrationNumber}
                    onChange={(e) =>
                      handleInput("registrationNumber", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="car-vin">VIN</Label>
                  <Input
                    id="car-vin"
                    value={newCar.vin}
                    onChange={(e) => handleInput("vin", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="car-drive">Napęd</Label>
                  <Select
                    value={newCar.drive}
                    onValueChange={(value) => handleInput("drive", value)}
                  >
                    <SelectTrigger id="car-drive">
                      <SelectValue placeholder="Wybierz napęd" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(DriveType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Informacje o silniku */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Informacje o silniku
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="car-engine-capacity">Pojemność (cm³)</Label>
                  <Input
                    id="car-engine-capacity"
                    value={newCar.engine.capacity}
                    onChange={(e) =>
                      handleInput("engine.capacity", e.target.value)
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="car-engine-type">Typ silnika</Label>
                  <Select
                    value={newCar.engine.type}
                    onValueChange={(value) => handleInput("engine.type", value)}
                  >
                    <SelectTrigger id="car-engine-type">
                      <SelectValue placeholder="Wybierz typ silnika" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(EngineType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {getEngineTypeLabel(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="car-engine-fuel">Paliwo</Label>
                  <Select
                    value={newCar.engine.fuel}
                    onValueChange={(value) => handleInput("engine.fuel", value)}
                  >
                    <SelectTrigger id="car-engine-fuel">
                      <SelectValue placeholder="Wybierz paliwo" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableFuelTypes(newCar.engine.type).map((type) => (
                        <SelectItem key={type} value={type}>
                          {getFuelTypeLabel(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="car-engine-multiplier">
                    Mnożnik pojemności
                  </Label>
                  <Input
                    id="car-engine-multiplier"
                    type="number"
                    step="0.1"
                    value={newCar.engine.capacityMultiplier}
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Dodatkowe informacje */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Dodatkowe informacje
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="car-sportCarType">Typ samochodu</Label>
                  <Select
                    value={newCar.sportCarType}
                    onValueChange={(value) =>
                      handleInput("sportCarType", value)
                    }
                  >
                    <SelectTrigger id="car-sportCarType">
                      <SelectValue placeholder="Wybierz typ" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(SportCarType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="car-nextInspection">Następny przegląd</Label>
                  <Input
                    id="car-nextInspection"
                    type="date"
                    value={newCar.nextInspection}
                    onChange={(e) =>
                      handleInput("nextInspection", e.target.value)
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="car-insurance-policyNumber">
                    Numer polisy
                  </Label>
                  <Input
                    id="car-insurance-policyNumber"
                    value={newCar.insurance.policyNumber}
                    onChange={(e) =>
                      handleInput("insurance.policyNumber", e.target.value)
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="car-insurance-expiryDate">
                    Data wygaśnięcia ubezpieczenia
                  </Label>
                  <Input
                    id="car-insurance-expiryDate"
                    type="date"
                    value={newCar.insurance.expiryDate}
                    onChange={(e) =>
                      handleInput("insurance.expiryDate", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setNewCar(initialCar);
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
                  : "Dodaj Samochód"}
              </Button>
            </div>
          </form>
        </motion.article>
      )}
    </div>
  );
}
