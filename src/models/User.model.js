const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type:String,
        required:true
    },
    avatar:{
        type:String
    },
    bio:{
        type:String
    },
    role:{
        type:String,
        required:true,
        enum : ['user','admin'],
        default: 'user'
    },
    favoriteGenres:[String]
},{
    timestamps : true
})

const User = mongoose.model('User', userSchema)
module.exports = User