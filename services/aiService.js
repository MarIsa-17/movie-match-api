const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "google/gemini-2.0-flash-exp:free";

const cache = new Map();

const systemPrompt =
  "Eres un experto en cine. Responde SIEMPRE en español neutro. Devuelve ÚNICAMENTE JSON válido. No incluyas texto adicional.";

function buildPrompt(movies) {
  const movieList = movies
    .map((m) => `- "${m.title}" (${m.year})`)
    .join("\n");

  return `
Genera anécdota, trivia, cita famosa y pitch de venta PARA CADA PELÍCULA.
Responde TODO EN ESPAÑOL.
${movieList}

Responde SOLO con este formato JSON exacto:
{
  "enriched": [
    {
      "title": "...",
      "anecdote": "...",
      "trivia": "...",
      "famous_quote": "...",
      "pitch": "..."
    }
  ]
}
`;
}
 //Extrae el PRIMER objeto JSON válido encontrado en un texto

function extractJSON(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("No se encontró JSON en la respuesta de la IA");
  }
  return JSON.parse(match[0]);
}

export async function enrichMoviesWithAI(movies) {
  // 🔒 Si no hay API key, no rompemos la app
  if (!OPENROUTER_API_KEY) {
    return movies.map((m) => ({ ...m, ai_enriched: null }));
  }

  // 🔑 Clave de caché por títulos
  const movieTitlesKey = movies
    .map((m) => m.title)
    .sort()
    .join("|");

  // ⚡ Cache
  if (cache.has(movieTitlesKey)) {
    const cached = cache.get(movieTitlesKey);
    if (cached.every((m) => m.ai_enriched !== null)) {
      console.log("🎬 IA cargada desde caché");
      return cached;
    }
  }

  let rawContent = "";

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
          temperature: 0.7
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("🔴 Error OpenRouter:", data.error.message);
      throw new Error(data.error.message);
    }

    if (!data.choices || data.choices.length === 0) {
      throw new Error("La IA no devolvió respuestas");
    }

    rawContent = data.choices[0]?.message?.content;

    if (!rawContent) {
      throw new Error("Contenido de IA vacío");
    }

    // 🧠 Parseo seguro
    const parsed = extractJSON(rawContent);

    if (!Array.isArray(parsed.enriched)) {
      throw new Error("Formato IA inválido: enriched no es un array");
    }

    // por índice 
    const enrichedResult = movies.map((movie, index) => ({
      ...movie,
      ai_enriched: parsed.enriched[index] || null,
    }));

    // Cachear solo si todas se enriquecieron
    if (enrichedResult.every((m) => m.ai_enriched !== null)) {
      cache.set(movieTitlesKey, enrichedResult);
    }

    return enrichedResult;
  } catch (error) {
    console.error("❌ Error IA:", error.message);
    console.error("🧠 Respuesta cruda IA:", rawContent);

    // 🔁 Fallback seguro
    return movies.map((m) => ({
      ...m,
      ai_enriched: {
        error: "No se pudo enriquecer con IA",
      },
    }));
  }
}
