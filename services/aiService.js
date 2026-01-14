const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "meta-llama/llama-3.3-70b-instruct:free";

// cache para almacenar resultados previos
const cache = new Map()

const systemPrompt =
  'Eres un experto en cine. Siempre respondes estrictamente en formato JSON. Para cada película proporcionas: una anécdota graciosa (máx 50 palabras), un dato de trivia, una cita famosa icónica y un pitch de venta.';

function buildPrompt(movies) {
  const movieList = movies.map((m) => `- "${m.title}" (${m.year})`).join("\n");
  return `Para cada película, proporciona: anécdota del rodaje, trivia,  citas famosas y pitch de venta.
Lista:
${movieList}
Responde SOLO en JSON: {"enriched":[{"title":"...","anecdote":"...","trivia":"...", "famous_quote":"...","pitch":"..."}]}`;
}

export async function enrichMoviesWithAI(movies) {
  if (!OPENROUTER_API_KEY) {
    return movies.map((m) => ({ ...m, ai_enriched: null }));
  }

  // verificar si los titulos ya están en la cache para ahorrar créditos
  const movieTitlesKey = movies.map(m=> m.title).sort().join('|')
  if(cache.has(movieTitlesKey)){
    console.log("🎬 Cargando desde caché...")
    return cache.get(movieTitlesKey)
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
        }),
      }
    );

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);

    const enrichedResult = movies.map((movie)=>{
        const enriched = parsed.enriched.find(
            (e) => e.title.toLowerCase() === movie.title.toLowerCase()
        );
        return {...movie, ai_enriched:enriched || null}
    });

    //Guardar en caché antes de retornar
    cache.set(movieTitlesKey,enrichedResult)
    return enrichedResult;
    
  } catch (error) {
    console.error("Error IA:", error.message);
    return movies.map((m) => ({ ...m, ai_enriched: null }));
  }
}
