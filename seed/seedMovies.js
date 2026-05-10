require('dotenv').config()
const mongoose = require('mongoose')
const axios = require('axios')
const Movie = require('../src/models/Movie.model')

const moviesData = [
  { title: 'Inception', genres: ['Sci-Fi', 'Action'], year: 2010, director: 'Christopher Nolan' },
  { title: 'The Shawshank Redemption', genres: ['Drama'], year: 1994, director: 'Frank Darabont' },
  { title: 'The Dark Knight', genres: ['Action', 'Crime'], year: 2008, director: 'Christopher Nolan' },
  { title: 'Interstellar', genres: ['Sci-Fi', 'Adventure'], year: 2014, director: 'Christopher Nolan' },
  { title: 'Parasite', genres: ['Thriller', 'Drama'], year: 2019, director: 'Bong Joon-ho' },
  { title: 'The Godfather', genres: ['Crime', 'Drama'], year: 1972, director: 'Francis Ford Coppola' },
  { title: 'Pulp Fiction', genres: ['Crime', 'Drama'], year: 1994, director: 'Quentin Tarantino' },
  { title: 'The Matrix', genres: ['Sci-Fi', 'Action'], year: 1999, director: 'The Wachowskis' },
  { title: 'Forrest Gump', genres: ['Drama', 'Romance'], year: 1994, director: 'Robert Zemeckis' },
  { title: 'Spirited Away', genres: ['Animation', 'Fantasy'], year: 2001, director: 'Hayao Miyazaki' },
]

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    await Movie.deleteMany()

    const movies = []

    for (const m of moviesData) {
      const { data } = await axios.get(
        `http://www.omdbapi.com/?t=${encodeURIComponent(m.title)}&apikey=${process.env.OMDB_API_KEY}`
      )
      movies.push({
        ...m,
        description: data.Plot || 'No description',
        poster: data.Poster !== 'N/A' ? data.Poster : '',
        rating: parseFloat(data.imdbRating) || 0
      })
      console.log(` ${m.title}`)
    }

    await Movie.insertMany(movies)
    console.log('All movies seeded!')
    mongoose.disconnect()
  } catch (error) {
    console.error('Error:', error.message)
    mongoose.disconnect()
  }
}

seed()