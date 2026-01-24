// middlewares/errorHandler.js
// Este middleware captura TODOS los errores de la aplicación
// Express lo reconoce como error handler por tener 4 parámetros

export function errorHandler(err, req, res, next) {
  // 1. Loguea el error en consola para debugging
  console.error('Error:', err);

  // 2. Determina el status code
  // Si err.status existe, úsalo. Si no, usa 500 (error interno)
  // Tip: Usa operador || para valores por defecto
  const status = err.status|| 500;

  // 3. Responde con JSON en formato estándar
  // { success: false, error: "mensaje del error" }
  res.status(status).json({
    success: false,
    error: err.message || 'Se presenta un error'
  });
}