const { createRouteHandler } = require('uploadthing/express')
const uploadRouter = require('../config/uploadthing')

const handler = createRouteHandler({ router: uploadRouter })

module.exports = handler