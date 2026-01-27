const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "google/gemini-2.0-flash-exp:free";

const cache = new Map();

const systemPrompt = `
Eres un experto en cine.
Respondes SIEMPRE en español neutro.
Devuelve EXCLUSIVAMENTE un objeto JSON válido.
NO incluyas texto adicional.
NO uses markdown.
`;

function buildPrompt(movies) {
  const list = movies
    .map((m) => `"${m.title}" (Director: ${m.director})`)
    .join(", ");

  return `Genera datos para estas películas: ${list}.
  Responde ÚNICAMENTE con este formato JSON:
  {
    "enriched": [
      {
        "title": "Nombre de la película",
        "anecdote": "Breve anécdota",
        "trivia": "Dato curioso",
        "famous_quote": "Frase icónica",
        "pitch": "Resumen rápido"
      }
    ]
  }`;
}

// =======================
// UTILS
// =======================
function extractJSON(text) {
  try {
    // Elimina bloques de código markdown y espacios en blanco
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // Busca el primer '{' y el último '}'
    const start = cleanText.indexOf('{');
    const end = cleanText.lastIndexOf('}');
    
    if (start === -1 || end === -1) {
      throw new Error("No se encontró un objeto JSON válido");
    }

    const jsonString = cleanText.substring(start, end + 1);
    return JSON.parse(jsonString);
  } catch (e) {
    throw new Error("Error al procesar JSON de la IA: " + e.message);
  }
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
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY.trim()}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000", // Requerido por OpenRouter
        "X-Title": "Movie Match API",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: buildPrompt(movies) },
        ],
        temperature: 0.5,
      }),
    });

    const data = await response.json();
    
    // Si la respuesta no es OK (200), lanzamos el error específico de la API
    if (!response.ok) {
      throw new Error(data.error?.message || `Error API: ${response.status}`);
    }

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
