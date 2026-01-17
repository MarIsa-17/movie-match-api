const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "google/gemini-2.0-flash-exp:free";

const cache = new Map();

const systemPrompt =
  "Eres un experto en cine. Siempre respondes estrictamente en formato JSON. No incluyas texto introductorio, solo el objeto JSON.";

function buildPrompt(movies) {
  const movieList = movies.map((m) => `- "${m.title}" (${m.year})`).join("\n");
  return `Genera anécdota, trivia, cita famosa y pitch de venta para estas películas:
${movieList}
Responde con este formato exacto: {"enriched":[{"title":"...","anecdote":"...","trivia":"...", "famous_quote":"...","pitch":"..."}]}`;
}

export async function enrichMoviesWithAI(movies) {
  if (!OPENROUTER_API_KEY)
    return movies.map((m) => ({ ...m, ai_enriched: null }));

  const movieTitlesKey = movies
    .map((m) => m.title)
    .sort()
    .join("|");

  if (cache.has(movieTitlesKey)) {
    const cachedData = cache.get(movieTitlesKey);
    // Verificación robusta de la caché
    if (
      cachedData.length > 0 &&
      cachedData.every((m) => m.ai_enriched !== null)
    ) {
      console.log("🎬 Cargando desde caché...");
      return cachedData;
    }
  }

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: buildPrompt(movies) },
          ],
          // SUGERENCIA: Forzar formato JSON si el modelo lo soporta
          response_format: { type: "json_object" },
        }),
      },
    );

    const data = await response.json();

    if (data.error) {
      console.error("🔴 Error de OpenRouter:", data.error.message);
      // Devolvemos las películas sin enriquecer para que la página cargue
      return movies.map((m) => ({ ...m, ai_enriched: null }));
    }
    if (!data.choices || data.choices.length === 0) {
      throw new Error("No se recibió respuesta de la IA");
    }

    let content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Cuerpo de respuesta vacío");

    // MEJORA 1: Extracción de JSON robusta (ignora texto basura antes o después)
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      content = content.substring(start, end + 1);
    }
    const parsed = JSON.parse(content);

    const enrichedResult = movies.map((movie) => {
      const enriched = parsed.enriched?.find((e) => {
        const aiTitle = e.title.replace(/['"]+/g, "").toLowerCase().trim();
        const dbTitle = movie.title.toLowerCase().trim();
        return aiTitle.includes(dbTitle) || dbTitle.includes(aiTitle);
      });
      return { ...movie, ai_enriched: enriched || null };
    });

    // MEJORA 2: Solo cachear si TODAS se enriquecieron (opcional, pero más seguro)
    if (enrichedResult.every((m) => m.ai_enriched !== null)) {
      cache.set(movieTitlesKey, enrichedResult);
    }

    return enrichedResult;
  } catch (error) {
    console.error("❌ Error IA:", error.message);
    // Retornamos los datos originales para no romper la app
    return movies.map((m) => ({ ...m, ai_enriched: null }));
  }
}
