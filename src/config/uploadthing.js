const { createUploadthing } = require('uploadthing/express')

const f = createUploadthing()

const uploadRouter = {
  avatar: f({ image: { maxFileSize: '4MB' } })
    .middleware(async ({ req }) => {
      const user = req.user
      if (!user) throw new Error('Unauthorized')
      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Avatar uploaded by user:', metadata.userId)
      console.log('File URL:', file.url)
    }),

  clubCover: f({ image: { maxFileSize: '4MB' } })
    .middleware(async ({ req }) => {
      const user = req.user
      if (!user) throw new Error('Unauthorized')
      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Club cover uploaded by user:', metadata.userId)
      console.log('File URL:', file.url)
    }),
}

module.exports = uploadRouter