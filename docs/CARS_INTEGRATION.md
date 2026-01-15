# Integracja Backend Cars - Dokumentacja

## ✅ Zaimplementowane funkcje

### Backend (Supabase Edge Functions)

1. **Migracja bazy danych**
   - Plik: `supabase/migrations/20260115000000_create_cars.sql`
   - Tworzy tabelę `cars` z RLS (Row Level Security)
   - Użytkownicy widzą tylko swoje samochody

2. **Edge Functions**
   - `get-cars` - GET - Pobiera listę samochodów użytkownika
   - `add-car` - POST - Dodaje nowy samochód
   - `update-car` - POST - Aktualizuje samochód
   - `delete-car` - POST - Usuwa samochód

### Frontend (React)

1. **API Service**
   - Plik: `apps/web/src/lib/api/services/car.service.ts`
   - Funkcje: `getCars()`, `addCar()`, `updateCar()`, `deleteCar()`
   - Autoryzacja przez token JWT
   - Mapowanie camelCase ↔ snake_case

2. **Komponent Cars**
   - Plik: `apps/web/src/components/custom/dashboard/Cars.tsx`
   - Pełna integracja z API
   - Loading states
   - Toast notifications (Redux `addToast`)
   - Obsługa błędów i dialog potwierdzenia usunięcia

## 🚀 Jak uruchomić

### 1. Uruchom migrację bazy danych

```bash
cd supabase
supabase db reset
```

Lub:

```bash
cd supabase
supabase migration up
```

### 2. Uruchom Supabase lokalnie (jeśli jeszcze nie działa)

```bash
cd supabase
supabase start
```

### 3. Skonfiguruj zmienne środowiskowe

Upewnij się, że w pliku `apps/web/.env` masz (najlepiej skopiuj z `apps/web/.env.example`):

```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Uruchom aplikację frontend

```bash
# Z głównego katalogu projektu
pnpm dev
```

## 📝 Użycie

Komponent `Cars` automatycznie:
1. Pobiera listę samochodów przy montowaniu
2. Obsługuje dodawanie nowych samochodów
3. Obsługuje edycję istniejących samochodów
4. Obsługuje usuwanie samochodów z potwierdzeniem
5. Wyświetla komunikaty sukcesu/błędu

## 🔒 Bezpieczeństwo

- ✅ JWT Authorization na każdym requestcie
- ✅ Row Level Security (RLS) w bazie danych
- ✅ Użytkownicy widzą tylko swoje samochody
- ✅ Walidacja wymaganych pól po stronie backendu
- ✅ CORS headers skonfigurowane

## 📊 Model danych

### Car interface (Frontend)

```typescript
interface Car {
  id?: string;
  userId?: string;
  make: string;
  model: string;
  year: string;
  registrationNumber: string;
  vin: string;
  engine: {
    capacity: string;
    type: string;
    capacityMultiplier: number;
    capacityWithMultiplier: string;
    fuel: string;
  };
  drive: string;
  nextInspection: string;
  insurance: {
    policyNumber: string;
    expiryDate: string;
  };
  sportCarType: string;
  createdAt?: string;
  updatedAt?: string;
}
```

### Tabela cars (Database)

```sql
- id (UUID, PRIMARY KEY)
- user_id (UUID, FOREIGN KEY -> auth.users)
- make (TEXT, NOT NULL)
- model (TEXT, NOT NULL)
- year (TEXT)
- registration_number (TEXT, NOT NULL)
- vin (TEXT)
- engine_capacity (TEXT)
- engine_type (TEXT)
- engine_capacity_multiplier (NUMERIC)
- engine_capacity_with_multiplier (TEXT)
- engine_fuel (TEXT)
- drive (TEXT)
- next_inspection (TEXT)
- insurance_policy_number (TEXT)
- insurance_expiry_date (TEXT)
- sport_car_type (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 🔄 API Endpoints

Wszystkie endpointy wymagają nagłówka `Authorization: Bearer <token>`

### GET /functions/v1/get-cars
Zwraca listę samochodów użytkownika

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "make": "Subaru",
      "model": "Impreza",
      "year": "2006",
      "registrationNumber": "XYZ1234",
      "vin": "VIN123",
      "engine": {
        "capacity": "1994",
        "type": "Turbo",
        "capacityMultiplier": 1.7,
        "capacityWithMultiplier": "3390",
        "fuel": "Petrol"
      },
      "drive": "AWD",
      "nextInspection": "2026-01-01",
      "insurance": {
        "policyNumber": "POL-001",
        "expiryDate": "2026-12-31"
      },
      "sportCarType": "RallySportCar",
      "createdAt": "2026-01-15T10:00:00Z",
      "updatedAt": "2026-01-15T10:00:00Z"
    }
  ]
}
```

### POST /functions/v1/add-car
Dodaje nowy samochód

**Request Body:**
```json
{
  "make": "Subaru",
  "model": "Impreza",
  "registrationNumber": "XYZ1234",
  "year": "2006",
  "vin": "VIN123",
  "engine": {
    "capacity": "1994",
    "type": "Turbo",
    "capacityMultiplier": 1.7,
    "capacityWithMultiplier": "3390",
    "fuel": "Petrol"
  },
  "drive": "AWD",
  "nextInspection": "2026-01-01",
  "insurance": {
    "policyNumber": "POL-001",
    "expiryDate": "2026-12-31"
  },
  "sportCarType": "RallySportCar"
}
```

**Response:** jak w GET, zwraca utworzony obiekt

### POST /functions/v1/update-car
Aktualizuje samochód

**Request Body:**
```json
{
  "id": "uuid",
  "make": "Subaru",
  "model": "Impreza",
  "registrationNumber": "XYZ1234",
  "engine": { "capacity": "1994" }
}
```

**Response:** jak w GET, zwraca zaktualizowany obiekt

### POST /functions/v1/delete-car
Usuwa samochód

**Request Body:**
```json
{
  "id": "uuid"
}
```

**Response:**
```json
{
  "data": {
    "success": true,
    "id": "uuid"
  }
}
```

## 🐛 Troubleshooting

### Problem: "Not authenticated"
- Sprawdź czy użytkownik jest zalogowany
- Sprawdź czy token jest poprawny w Redux store
- Po `supabase db reset` zaloguj się ponownie (tokeny są nieważne)

### Problem: "Failed to fetch cars"
- Sprawdź czy Supabase działa: `supabase status`
- Sprawdź logi funkcji: `supabase functions logs get-cars`

### Problem: Toast nie wyświetla się
- Upewnij się, że komponent `ToastNotification` jest dodany do `App.tsx`
- Upewnij się, że używasz `addToast` (Redux)

## 📚 Dalszy rozwój

Potencjalne usprawnienia:
- [ ] Paginacja dla dużej liczby samochodów
- [ ] Eksport do PDF/CSV
- [ ] Walidacja VIN
- [ ] Walidacja numeru rejestracyjnego
- [ ] Historia zmian
