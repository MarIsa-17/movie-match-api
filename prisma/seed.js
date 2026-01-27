import { PrismaClient } from '../src/generated/client/index.js';
const prisma = new PrismaClient();

const movies = [
  {
    title: 'The Matrix',
    year: 1999,
    rating: 8.7,
    genre: 'SCIFI',
    director: 'Wachowski',
    poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg'
  },
  {
    title: 'The Dark Knight',
    year: 2008,
    rating: 9.0,
    genre: 'ACTION',
    director: 'Christopher Nolan',
    poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg'
  },
  {
    title: 'Inception',
    year: 2010,
    rating: 8.8,
    genre: 'SCIFI',
    director: 'Christopher Nolan',
    poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg'
  },
  {
    title: 'Parasite',
    year: 2019,
    rating: 8.5,
    genre: 'THRILLER',
    director: 'Bong Joon-ho',
    poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg'
  },
  {
    title: 'Interstellar',
    year: 2014,
    rating: 8.7,
    genre: 'SCIFI',
    director: 'Christopher Nolan',
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'
  },
  {
    title: 'Gladiator',
    year: 2000,
    rating: 8.5,
    genre: 'ACTION',
    director: 'Ridley Scott',
    poster: 'https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg'
  }

  // Agrega 6 películas más con géneros variados (COMEDY, DRAMA, HORROR, THRILLER)
];

async function main() {
  await prisma.movie.deleteMany();
  for (const movie of movies) {
    await prisma.movie.create({ data: movie });
  }
  console.log('Seed completado!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());