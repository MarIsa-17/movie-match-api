// Tip: res.on('finish', callback) se ejecuta cuando la respuesta termina

export function responseTime(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now()- start;
    console.log(`${req.method } ${req.originalUrl}- ${duration}ms`)
  });

  next();
}