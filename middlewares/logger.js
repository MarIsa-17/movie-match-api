export function logger(req, res, next) {
  // 1. Obtén el timestamp actual en formato ISO
  // Tip: new Date().toISOString() retorna "2024-01-15T10:30:00.000Z"
  const timestamp = new Date().toISOString();

  // 2. Imprime el log con formato: [timestamp] METHOD /path
  // Tip: req.method = "GET", req.url = "/movies"
  console.log(`[${timestamp}] ${req.method} ${req.url}`);

  // 3. Continúa al siguiente middleware/ruta
  // Pregunta: ¿Qué función llamas para pasar al siguiente?
  next();
}