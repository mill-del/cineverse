const { getWeek, getYear } = require('date-fns')

const getCurrentWeek = () => getWeek(new Date())
const getCurrentYear = () => getYear(new Date())

module.exports = { getCurrentWeek, getCurrentYear }