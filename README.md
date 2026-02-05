# Movie Match API 🎬

API REST para consultar, filtrar y gestionar películas, con endpoints para reviews, estadísticas y documentación interactiva vía Swagger.

## Características

- Consultar todas las películas y filtrar por género, año, director, rating, etc.
- Obtener una película aleatoria.
- Consultar películas por ID.
- Gestionar reviews de películas.
- Endpoints de estadísticas y dashboard.
- Documentación Swagger interactiva.
- Middlewares personalizados: logging, manejo de errores, tiempo de respuesta, CORS.

## Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/movie-match-api.git
   cd movie-match-api
   ```

2. Instala dependencias:
   ```bash
   npm install
   ```

3. Crea un archivo `.env` (opcional):
   ```
   PORT=3000
   NODE_ENV=development
   ```

## Uso

1. Inicia el servidor:
   ```bash
   npm start
   ```
   O, si usas nodemon:
   ```bash
   npm run dev
   ```

2. Accede a la API en:
   ```
   http://localhost:3000/
   ```

3. Documentación Swagger:
   ```
   http://localhost:3000/docs
   ```

## Endpoints principales

- `GET /movies` — Obtener todas las películas.
- `GET /movies?genre=Drama` — Filtrar por género.
- `GET /movies?genre=Drama&minRating=8.5&year=2020&director=Nolan` — Filtrar por múltiples criterios.
- `GET /movies/random` — Película aleatoria.
- `GET /movies/:id` — Película por ID.
- `POST /reviews` — Crear review.
- `GET /health` — Estado de la API.
- `GET /movies/reports/dashboard` — Estadísticas.

## Estructura del proyecto

```
movie-match-api/
│
├── index.js
├── src/
│   ├── routes/
│   │   ├── movies.js
│   │   ├── reviewRouter.js
│   │   ├── statsRoutes.js
│   ├── controllers/
│   │   ├── moviesController.js
│   │   ├── reviewController.js
│   │   ├── statsController.js
│   ├── middlewares/
│   │   ├── logger.js
│   │   ├── notFound.js
│   │   ├── errorHandler.js
│   │   ├── responseTime.js
│   ├── docs/
│   │   └── swagger.yaml
│   └── models/
│       └── movie.js
│
├── package.json
└── .env
```

## Tecnologías

- Node.js
- Express
- Swagger (swagger-ui-express, yamljs)
- CORS
- Dotenv

## Contribución

¡Pull requests y sugerencias son bienvenidas!

## Licencia

MIT

---

**Autor:** Isabel Nuñez
