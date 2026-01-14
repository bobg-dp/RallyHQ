# Integracja Backend Codrivers - Dokumentacja

## ✅ Zaimplementowane funkcje

### Backend (Supabase Edge Functions)

1. **Migracja bazy danych**
   - Plik: `supabase/migrations/20260114000000_create_codrivers.sql`
   - Tworzy tabelę `codrivers` z pełnym RLS (Row Level Security)
   - Użytkownicy widzą tylko swoich pilotów

2. **Edge Functions**
   - `get-codrivers` - GET - Pobiera listę pilotów użytkownika
   - `add-codriver` - POST - Dodaje nowego pilota
   - `update-codriver` - POST - Aktualizuje pilota
   - `delete-codriver` - POST - Usuwa pilota

### Frontend (React)

1. **API Service**
   - Plik: `apps/web/src/lib/api/services/codriver.service.ts`
   - Funkcje: `getCodrivers()`, `addCodriver()`, `updateCodriver()`, `deleteCodriver()`
   - Automatyczna autoryzacja przez token JWT
   - Mapowanie camelCase ↔ snake_case

2. **Komponent Codrivers**
   - Plik: `apps/web/src/components/custom/dashboard/Codrivers.tsx`
   - Pełna integracja z API
   - Loading states
   - Toast notifications
   - Obsługa błędów

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

Komponent `Codrivers` automatycznie:
1. Pobiera listę pilotów przy montowaniu
2. Obsługuje dodawanie nowych pilotów
3. Obsługuje edycję istniejących pilotów
4. Obsługuje usuwanie pilotów z potwierdzeniem
5. Wyświetla komunikaty sukcesu/błędu

## 🔒 Bezpieczeństwo

- ✅ JWT Authorization na każdym requestcie
- ✅ Row Level Security (RLS) w bazie danych
- ✅ Użytkownicy widzą tylko swoich pilotów
- ✅ Walidacja danych po stronie backendu
- ✅ CORS headers skonfigurowane

## 🎨 UI/UX

- Loading indicator podczas ładowania danych
- Disabled buttons podczas operacji
- Toast notifications dla sukcesu/błędów
- Smooth animations (framer-motion)
- Responsive design
- Dialog potwierdzenia usunięcia

## 📊 Model danych

### Codriver interface (Frontend)

```typescript
interface Codriver {
  id?: string;
  userId?: string;
  name: string;
  club: string;
  birthDate: string;
  drivingLicenseNumber: string;
  sportsLicense: boolean;
  email: string;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
}
```

### Tabela codrivers (Database)

```sql
- id (UUID, PRIMARY KEY)
- user_id (UUID, FOREIGN KEY -> auth.users)
- name (TEXT, NOT NULL)
- club (TEXT)
- birth_date (TEXT)
- driving_license_number (TEXT)
- sports_license (BOOLEAN, DEFAULT FALSE)
- email (TEXT, NOT NULL)
- phone (TEXT, NOT NULL)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 🔄 API Endpoints

Wszystkie endpointy wymagają nagłówka `Authorization: Bearer <token>`

### GET /functions/v1/get-codrivers
Zwraca listę pilotów użytkownika

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "name": "Jan Kowalski",
      "club": "Automobilklub",
      "birthDate": "01.01.1990",
      "drivingLicenseNumber": "12345/67/8901",
      "sportsLicense": true,
      "email": "jan@example.com",
      "phone": "123456789",
      "createdAt": "2026-01-14T10:00:00Z",
      "updatedAt": "2026-01-14T10:00:00Z"
    }
  ]
}
```

### POST /functions/v1/add-codriver
Dodaje nowego pilota

**Request Body:**
```json
{
  "name": "Jan Kowalski",
  "club": "Automobilklub",
  "birthDate": "01.01.1990",
  "drivingLicenseNumber": "12345/67/8901",
  "sportsLicense": true,
  "email": "jan@example.com",
  "phone": "123456789"
}
```

**Response:** Jak w GET, zwraca utworzony obiekt

### POST /functions/v1/update-codriver
Aktualizuje pilota

**Request Body:**
```json
{
  "id": "uuid",
  "name": "Jan Kowalski",
  ...
}
```

**Response:** Jak w GET, zwraca zaktualizowany obiekt

### POST /functions/v1/delete-codriver
Usuwa pilota

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

### Problem: "JWSError JWSInvalidSignature"
- Upewnij się, że `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY` wskazują na ten sam projekt
- Wyczyść sesję (wyloguj się) i zaloguj ponownie

### Problem: "Failed to fetch codrivers"
- Sprawdź czy Supabase działa: `supabase status`
- Sprawdź logi funkcji: `supabase functions logs get-codrivers`

### Problem: "Missing Supabase env vars"
- Upewnij się, że zmienne `SUPABASE_URL` i `SUPABASE_SERVICE_ROLE_KEY` są ustawione w Supabase

### Problem: Toast nie wyświetla się
- Upewnij się, że komponent `<Toaster />` jest dodany do `App.tsx`

## 📚 Dalszy rozwój

Potencjalne usprawnienia:
- [ ] Paginacja dla dużej liczby pilotów
- [ ] Sortowanie i filtrowanie
- [ ] Eksport do PDF/CSV
- [ ] Walidacja formatu daty urodzenia
- [ ] Walidacja numeru telefonu
- [ ] Walidacja email
- [ ] Upload zdjęcia pilota
- [ ] Historia zmian
