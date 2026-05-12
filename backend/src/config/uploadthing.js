const { createUploadthing } = require('uploadthing/express');
const jwt = require('jsonwebtoken');

const f = createUploadthing(); // эта строка должна быть!

const getUserFromReq = (req) => {
    const auth = req.headers.authorization;
    console.log('AUTH HEADER:', auth);
    if (!auth) return null;
    try {
        const token = auth.split(' ')[1];
        console.log('TOKEN:', token);
        console.log('JWT_SECRET:', process.env.JWT_SECRET);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('DECODED:', decoded);
        return decoded;
    } catch(e) {
        console.log('JWT ERROR:', e.message);
        return null;
    }
};

const uploadRouter = {
    avatar: f({ image: { maxFileSize: '4MB' } })
        .middleware(async ({ req }) => {
            return { userId: 'anonymous' };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log('Avatar uploaded:', file.url);
        }),

    clubCover: f({ image: { maxFileSize: '4MB' } })
        .middleware(async ({ req }) => {
            return { userId: 'anonymous' };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log('Club cover uploaded:', file.url);
        }),
};

module.exports = uploadRouter;