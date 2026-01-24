const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "meta-llama/llama-3.2-3b-instruct:free";

const cache = new Map();

const systemPrompt = `
Eres un experto en cine.
Respondes SIEMPRE en español neutro.
Devuelve EXCLUSIVAMENTE un objeto JSON válido.
NO incluyas texto adicional.
NO uses markdown.
`;

function buildPrompt(movies) {
  const list = movies.map((m) => `"${m.title}" (${m.year})`).join(", ");

  return `
Genera una anécdota, trivia, cita famosa y pitch de venta
PARA CADA UNA de estas películas:

${list}

Formato JSON EXACTO:
{
  "enriched": [
    {
      "title": "",
      "anecdote": "",
      "trivia": "",
      "famous_quote": "",
      "pitch": ""
    }
  ]
}

NO escribas nada fuera del JSON.
`;
}

// =======================
// UTILS
// =======================
function extractJSON(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("No se encontró JSON en la respuesta de la IA");
  }
  return JSON.parse(match[0]);
}

export async function enrichMoviesWithAI(movies) {
  if (!OPENROUTER_API_KEY) {
    return movies.map((m) => ({ ...m, ai_enriched: null }));
  }

  const cacheKey = movies
    .map((m) => m.title)
    .sort()
    .join("|");

  // ⚡ Cache
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
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
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Movie Match API",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: buildPrompt(movies) },
          ],
          temperature: 0.6,
        }),
      },
    );

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    rawContent = data.choices?.[0]?.message?.content;
    if (!rawContent) {
      throw new Error("Contenido vacío de IA");
    }

    const parsed = extractJSON(rawContent);

    if (!Array.isArray(parsed.enriched)) {
      throw new Error("Formato inválido: enriched no es array");
    }

    const enrichedResult = movies.map((movie, index) => ({
      ...movie,
      ai_enriched: parsed.enriched[index] || null,
    }));

    if (enrichedResult.every((m) => m.ai_enriched !== null)) {
      cache.set(cacheKey, enrichedResult);
    }

    return enrichedResult;
  } catch (error) {
    console.error("❌ Error IA:", error.message);
    console.error("🧠 Respuesta cruda:", rawContent);

    return movies.map((m) => ({
      ...m,
      ai_enriched: {
        error: "No se pudo enriquecer con IA",
      },
    }));
  }
}
