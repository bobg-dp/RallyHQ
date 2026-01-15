# Integracja Backend YourProfile - Dokumentacja

## ✅ Zaimplementowane funkcje

### Backend (Supabase Edge Functions)

1. **Migracja bazy danych**
   - Plik: `supabase/migrations/20260113000000_create_user_profiles.sql`
   - Tworzy tabelę `user_profiles` z RLS (Row Level Security)
   - Użytkownicy widzą tylko swój profil

2. **Edge Functions**
   - `get-profile` - GET - Pobiera profil użytkownika
   - `update-profile` - POST - Aktualizuje profil użytkownika

### Frontend (React)

1. **API Service**
   - Plik: `apps/web/src/lib/api/services/profile.service.ts`
   - Funkcje: `getProfile()`, `updateProfile()`
   - Autoryzacja przez token JWT + walidacja sesji Supabase
   - Mapowanie camelCase ↔ snake_case

2. **Komponent YourProfile**
   - Plik: `apps/web/src/components/custom/dashboard/YourProfile.tsx`
   - Pobiera profil przy montowaniu
   - Obsługuje zapis profilu
   - Toast notifications (Redux `addToast`)
   - Loading i saving states

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

Komponent `YourProfile` automatycznie:
1. Pobiera profil przy montowaniu
2. Uzupełnia email z sesji użytkownika, jeśli brak w profilu
3. Pozwala zapisać zmiany w profilu
4. Wyświetla komunikaty sukcesu/błędu

## 🔒 Bezpieczeństwo

- ✅ JWT Authorization na każdym requestcie
- ✅ Row Level Security (RLS) w bazie danych
- ✅ Użytkownicy widzą tylko swój profil
- ✅ Walidacja wymaganych pól po stronie backendu
- ✅ CORS headers skonfigurowane

## 📊 Model danych

### Profile interface (Frontend)

```typescript
interface Profile {
  name: string;
  team: string;
  club: string;
  birthDate: string;
  drivingLicenseNumber: string;
  sportsLicense: boolean;
  email: string;
  phone: string;
  iceContact: {
    name: string;
    phone: string;
  };
}
```

### Tabela user_profiles (Database)

```sql
- id (UUID, PRIMARY KEY -> auth.users)
- name (TEXT, NOT NULL)
- team (TEXT)
- club (TEXT)
- birth_date (TEXT)
- driving_license_number (TEXT)
- sports_license (BOOLEAN)
- email (TEXT, NOT NULL)
- phone (TEXT)
- ice_contact_name (TEXT)
- ice_contact_phone (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 🔄 API Endpoints

Wszystkie endpointy wymagają nagłówka `Authorization: Bearer <token>`

### GET /functions/v1/get-profile
Zwraca profil użytkownika

**Response:**
```json
{
  "data": {
    "name": "Jan Kowalski",
    "team": "Rally Team",
    "club": "Automobilklub",
    "birthDate": "01.01.1990",
    "drivingLicenseNumber": "12345/67/8901",
    "sportsLicense": true,
    "email": "jan@example.com",
    "phone": "123456789",
    "iceContact": {
      "name": "Anna Kowalska",
      "phone": "987654321"
    }
  }
}
```

### POST /functions/v1/update-profile
Aktualizuje profil użytkownika

**Request Body:**
```json
{
  "name": "Jan Kowalski",
  "team": "Rally Team",
  "club": "Automobilklub",
  "birthDate": "01.01.1990",
  "drivingLicenseNumber": "12345/67/8901",
  "sportsLicense": true,
  "email": "jan@example.com",
  "phone": "123456789",
  "iceContact": {
    "name": "Anna Kowalska",
    "phone": "987654321"
  }
}
```

**Response:** jak w GET, zwraca zaktualizowany obiekt

## 🐛 Troubleshooting

### Problem: "Not authenticated"
- Sprawdź czy użytkownik jest zalogowany
- Sprawdź czy token jest poprawny w Redux store
- Po `supabase db reset` zaloguj się ponownie (tokeny są nieważne)

### Problem: "Failed to fetch profile"
- Sprawdź czy Supabase działa: `supabase status`
- Sprawdź logi funkcji: `supabase functions logs get-profile`

### Problem: Toast nie wyświetla się
- Upewnij się, że komponent `ToastNotification` jest dodany do `App.tsx`
- Upewnij się, że używasz `addToast` (Redux)

## 📚 Dalszy rozwój

Potencjalne usprawnienia:
- [ ] Walidacja formatu daty urodzenia
- [ ] Walidacja numeru telefonu
- [ ] Walidacja email
- [ ] Wersjonowanie profilu
