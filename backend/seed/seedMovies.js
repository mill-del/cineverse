require('dotenv').config()
const mongoose = require('mongoose')
const axios = require('axios')
const Movie = require('../src/models/Movie.model')

const TMDB_KEY = process.env.TMDB_API_KEY
const TMDB_IMAGE = 'https://image.tmdb.org/t/p/w500'

const genreMap = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
  53: 'Thriller', 10752: 'War', 37: 'Western'
}

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')

    const existing = await Movie.countDocuments()
    if (existing > 0) {
      console.log(`Already have ${existing} movies, skipping seed`)
      return mongoose.disconnect()
    }

    const movies = []

    for (let page = 1; page <= 10; page++) {
      const { data } = await axios.get(
          `https://api.themoviedb.org/3/movie/top_rated`,
          {
            params: {
              api_key: TMDB_KEY,
              language: 'en-US',
              page
            }
          }
      )

      for (const m of data.results) {
        const { data: details } = await axios.get(
            `https://api.themoviedb.org/3/movie/${m.id}/credits`,
            { params: { api_key: TMDB_KEY } }
        )

        const director = details.crew.find(p => p.job === 'Director')?.name || 'Unknown'
        const cast = details.cast.slice(0, 5).map(a => a.name)

        movies.push({
          title: m.title,
          description: m.overview || 'No description',
          poster: m.poster_path ? `${TMDB_IMAGE}${m.poster_path}` : '',
          genres: m.genre_ids.map(id => genreMap[id]).filter(Boolean),
          year: m.release_date ? parseInt(m.release_date.split('-')[0]) : 0,
          director,
          cast,
          trailerUrl: '',
          rating: m.vote_average || 0
        })

        process.stdout.write(`\r Fetched ${movies.length} movies...`)
      }
    }

    await Movie.insertMany(movies)
    console.log(`\n Done! ${movies.length} movies added to DB`)
    mongoose.disconnect()
  } catch (error) {
    console.error('Error:', error.message)
    mongoose.disconnect()
  }
}

seed()