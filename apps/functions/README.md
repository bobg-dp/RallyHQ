# @rallyhq/functions

Supabase Edge Functions (Deno/TypeScript) — wszystkie funkcje serverless w jednym miejscu.

## Struktura

```
apps/functions/
├── hello-world/
│   └── index.ts          # Przykładowa funkcja
├── package.json
└── README.md
```

## Użycie

### Lokalny development

1. **Start Supabase** (w osobnym terminalu):

   ```bash
   npm run supabase:start
   ```

2. **Start aplikacji + funkcji razem**:

   ```bash
   npm run dev:functions
   ```

   Lub tylko funkcje:

   ```bash
   cd apps/functions
   pnpm dev
   ```

### Tworzenie nowej funkcji

```bash
# Utwórz folder z nazwą funkcji
mkdir apps/functions/my-function
# Dodaj plik index.ts
touch apps/functions/my-function/index.ts
```

### Deploy na produkcję

```bash
# Pojedyncza funkcja
supabase functions deploy hello-world --project-ref <twoj-project-ref>

# Wszystkie funkcje
supabase functions deploy --project-ref <twoj-project-ref>
```

## Testowanie lokalnie

```bash
# GET request
curl http://127.0.0.1:54321/functions/v1/hello-world

# POST request
curl -X POST http://127.0.0.1:54321/functions/v1/hello-world \
  -H "Content-Type: application/json" \
  -d '{"name": "World"}'
```

## Dokumentacja

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Deno API](https://deno.land/api)
