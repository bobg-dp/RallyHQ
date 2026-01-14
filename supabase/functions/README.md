# Tworzenie funkcji w katalogu `supabase/functions`

## Dobre praktyki

1. **Obsługa CORS**
   - Zawsze ustawiaj nagłówki CORS (`Access-Control-Allow-Origin`, `Access-Control-Allow-Headers`, `Access-Control-Allow-Methods`).
   - Obsłuż preflight (`OPTIONS`) na początku funkcji.

2. **Autoryzacja**
   - Wymagaj nagłówka `Authorization` z JWT.
   - Dekoduj token i wyciągaj `userId` z payloadu (`sub`, `user_id` lub `id`).
   - Zwracaj błąd 401, jeśli token jest nieprawidłowy lub brak userId.

3. **Połączenie z Supabase**
   - Używaj `SUPABASE_URL` i `SUPABASE_SERVICE_ROLE_KEY` z env.
   - Sprawdzaj obecność tych zmiennych i zwracaj błąd 500, jeśli ich brakuje.

4. **Walidacja danych wejściowych**
   - Sprawdzaj wymagane pola w body requestu (np. `name`, `email`).
   - Zwracaj błąd 400, jeśli brakuje wymaganych danych.

5. **Mapowanie pól**
   - Mapuj camelCase <-> snake_case między frontendem a bazą.
   - Odpowiedzi do frontu zawsze w camelCase.

6. **Obsługa błędów**
   - Zwracaj czytelne komunikaty błędów z odpowiednim statusem HTTP.
   - Loguj błędy po stronie serwera (np. `console.error`).

7. **Odpowiedzi**
   - Zawsze ustawiaj `Content-Type: application/json` w odpowiedzi.
   - Zwracaj dane w polu `data` lub błąd w polu `error`.

8. **Metody HTTP**
   - Ograniczaj dozwolone metody (np. tylko `POST` dla update, tylko `GET` dla pobierania).
   - Zwracaj 405 dla niedozwolonych metod.

## Szkielet przykładowej funkcji

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@x.x.x";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // ...autoryzacja, walidacja, logika...

  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
```

## Rekomendacje

- Rozważ ograniczenie `Access-Control-Allow-Origin` do zaufanych domen.
- Powtarzające się fragmenty (autoryzacja, inicjalizacja supabase) można wydzielić do wspólnego pliku util.
- Dodaj walidację typów (np. z użyciem Zod) dla większego bezpieczeństwa.
- Usuń nadmiarowe logi w produkcji.

---

Przed dodaniem nowej funkcji, skopiuj szkielet i stosuj powyższe zasady.
