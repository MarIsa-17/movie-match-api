// middlewares/notFound.js
// Este middleware captura rutas que NO existen

export function notFound(req, res) {
  // Responde con 404 y mensaje descriptivo
  // Incluye el método y URL que se intentó acceder
  res.status(404).json({
    success: false,
    error: `Ruta ${req.method} ${req.originalURL} no encontrada`
  });
}