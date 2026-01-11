Deno.serve(async (req: Request) => {
  try {
    const body = await req.json().catch(() => ({}));

    return new Response(
      JSON.stringify({ message: "Hello from Supabase Edge Function", body }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
