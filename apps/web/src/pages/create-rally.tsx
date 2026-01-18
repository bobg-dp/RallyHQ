import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Seo from "../components/Seo";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/lib/store";
import { addToast } from "@/lib/store/slices/uiSlice";
import { hasCreateRallyPermission } from "@/lib/api/services/permissions.service";

const paymentMethodOptions = [
  { value: "credit_card", label: "Karta kredytowa" },
  { value: "bank_transfer", label: "Przelew bankowy" },
];

const schema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana"),
  teamLimit: z.coerce.number().int().positive().optional(),
  date: z.string().min(1, "Data jest wymagana"),
  location: z.string().optional(),
  website: z.string().url("Nieprawidłowy URL").optional().or(z.literal("")),

  organizerName: z.string().min(1, "Nazwa organizatora jest wymagana"),
  organizerWebsite: z
    .string()
    .url("Nieprawidłowy URL")
    .optional()
    .or(z.literal("")),
  organizerContactEmail: z
    .string()
    .email("Nieprawidłowy email")
    .optional()
    .or(z.literal("")),

  registrationOpens: z.string().min(1, "Data otwarcia zapisów jest wymagana"),
  registrationCloses: z
    .string()
    .min(1, "Data zamknięcia zapisów jest wymagana"),
  registrationFee: z.coerce.number().nonnegative(),
  registrationCurrency: z.string().min(1, "Waluta jest wymagana"),
  paymentMethods: z
    .array(z.string())
    .nonempty("Wybierz przynajmniej jedną metodę płatności"),

  description: z.string().min(1, "Opis jest wymagany"),
  shortDescription: z.string().min(1, "Krótki opis jest wymagany"),

  fileName: z.string().optional(),
  fileType: z.string().optional(),
  fileUrl: z.string().url("Nieprawidłowy URL").optional().or(z.literal("")),
  fileDescription: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CreateRally() {
  const dispatch = useAppDispatch();
  const [canCreateRally, setCanCreateRally] = useState<
    "loading" | "allowed" | "forbidden"
  >("loading");
  const [permissionError, setPermissionError] = useState<string | null>(null);

  useEffect(() => {
    async function checkPermission() {
      try {
        setPermissionError(null);
        setCanCreateRally("loading");
        const allowed = await hasCreateRallyPermission();

        if (allowed) {
          setCanCreateRally("allowed");
        } else {
          setCanCreateRally("forbidden");
          setPermissionError(
            "Nie masz uprawnień do tworzenia rajdów. Skontaktuj się z administratorem."
          );
        }
      } catch (err) {
        console.error("Unexpected error while checking rally permissions", err);
        setCanCreateRally("forbidden");
        setPermissionError(
          "Wystąpił nieoczekiwany błąd podczas sprawdzania uprawnień."
        );
      }
    }

    void checkPermission();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      registrationCurrency: "PLN",
      paymentMethods: ["credit_card"],
      fileType: "regulations",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (canCreateRally !== "allowed") {
      dispatch(
        addToast({
          type: "error",
          message: "Nie masz uprawnień do tworzenia rajdów.",
        })
      );
      return;
    }
    const payload = {
      name: data.name,
      teamLimit: data.teamLimit ?? null,
      date: new Date(data.date).toISOString(),
      location: data.location || null,
      website: data.website || null,
      organizer: {
        name: data.organizerName,
        website: data.organizerWebsite || null,
        contactEmail: data.organizerContactEmail || null,
      },
      registration: {
        opens: new Date(data.registrationOpens).toISOString(),
        closes: new Date(data.registrationCloses).toISOString(),
        fee: data.registrationFee,
        currency: data.registrationCurrency,
        paymentMethods: data.paymentMethods,
      },
      files:
        data.fileName && data.fileUrl
          ? [
              {
                name: data.fileName,
                type: data.fileType || "other",
                url: data.fileUrl,
                description: data.fileDescription || undefined,
              },
            ]
          : [],
      description: data.description,
      shortDescription: data.shortDescription,
      team: [],
    };

    // TODO: Wywołanie API / Supabase funkcji do zapisania rajdu
    console.log("New rally payload", payload);

    dispatch(
      addToast({
        type: "success",
        message: "Rajd został utworzony (na razie tylko lokalnie)",
      })
    );

    reset();
  };

  return (
    <>
      <Seo
        title="Utwórz nowy rajd | RallyHQ"
        description="Formularz dodawania nowego rajdu"
      />
      <div className="min-h-screen bg-background py-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-2xl md:text-3xl font-semibold mb-3">
            Utwórz nowy rajd
          </h1>

          {canCreateRally === "loading" && (
            <p className="text-muted-foreground mb-4">
              Sprawdzanie uprawnień do tworzenia rajdów...
            </p>
          )}

          {canCreateRally === "forbidden" && permissionError && (
            <div className="mb-8 rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {permissionError}
            </div>
          )}

          {canCreateRally === "allowed" && (
            <p className="text-muted-foreground mb-8">
              Wypełnij poniższy formularz, aby dodać nowy rajd. Dane są zgodne
              ze schematem używanym w bazie danych.
            </p>
          )}

          {canCreateRally === "allowed" && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Podstawowe informacje */}
              <section className="space-y-4">
                <h2 className="text-lg font-medium">Podstawowe informacje</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nazwa rajdu
                    </label>
                    <Input type="text" {...register("name")} />
                    {errors.name && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Limit załóg
                    </label>
                    <Input type="number" min={1} {...register("teamLimit")} />
                    {errors.teamLimit && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.teamLimit.message?.toString()}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Data rajdu
                    </label>
                    <Input type="date" {...register("date")} />
                    {errors.date && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.date.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Lokalizacja
                    </label>
                    <Input type="text" {...register("location")} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Strona internetowa
                    </label>
                    <Input
                      type="url"
                      placeholder="https://..."
                      {...register("website")}
                    />
                    {errors.website && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.website.message?.toString()}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Organizator */}
              <section className="space-y-4">
                <h2 className="text-lg font-medium">Organizator</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nazwa organizatora
                    </label>
                    <Input type="text" {...register("organizerName")} />
                    {errors.organizerName && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.organizerName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Strona organizatora
                    </label>
                    <Input
                      type="url"
                      placeholder="https://..."
                      {...register("organizerWebsite")}
                    />
                    {errors.organizerWebsite && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.organizerWebsite.message?.toString()}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Email kontaktowy
                    </label>
                    <Input
                      type="email"
                      {...register("organizerContactEmail")}
                    />
                    {errors.organizerContactEmail && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.organizerContactEmail.message?.toString()}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Rejestracja */}
              <section className="space-y-4">
                <h2 className="text-lg font-medium">Rejestracja</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Otwarcie zapisów
                    </label>
                    <Input type="date" {...register("registrationOpens")} />
                    {errors.registrationOpens && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.registrationOpens.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Zamknięcie zapisów
                    </label>
                    <Input type="date" {...register("registrationCloses")} />
                    {errors.registrationCloses && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.registrationCloses.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Opłata wpisowa
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      {...register("registrationFee")}
                    />
                    {errors.registrationFee && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.registrationFee.message?.toString()}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Waluta
                    </label>
                    <Input type="text" {...register("registrationCurrency")} />
                    {errors.registrationCurrency && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.registrationCurrency.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* <div>
                  <label className="block text-sm font-medium mb-1">
                    Metody płatności
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {paymentMethodOptions.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          value={option.value}
                          {...register("paymentMethods")}
                          className="h-4 w-4 rounded border-input"
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.paymentMethods && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.paymentMethods.message as string}
                    </p>
                  )}
                </div> */}
              </section>

              {/* Pliki */}
              <section className="space-y-4">
                <h2 className="text-lg font-medium">Pliki</h2>
                <p className="text-sm text-muted-foreground">
                  Opcjonalnie możesz dodać podstawowy plik, np. regulamin rajdu.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nazwa pliku
                    </label>
                    <Input type="text" {...register("fileName")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Typ pliku
                    </label>
                    <Input
                      type="text"
                      placeholder="regulations / other"
                      {...register("fileType")}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      URL pliku
                    </label>
                    <Input
                      type="url"
                      placeholder="https://..."
                      {...register("fileUrl")}
                    />
                    {errors.fileUrl && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.fileUrl.message?.toString()}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Opis pliku
                    </label>
                    <Textarea rows={2} {...register("fileDescription")} />
                  </div>
                </div>
              </section>

              {/* Opisy */}
              <section className="space-y-4">
                <h2 className="text-lg font-medium">Opis rajdu</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Krótki opis
                    </label>
                    <Textarea rows={2} {...register("shortDescription")} />
                    {errors.shortDescription && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.shortDescription.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Pełny opis (Markdown)
                    </label>
                    <Textarea rows={6} {...register("description")} />
                    {errors.description && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => reset()}
                  disabled={isSubmitting}
                >
                  Wyczyść formularz
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Zapisywanie..." : "Utwórz rajd"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
