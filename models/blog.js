const User = require('../models/user')

const mongoose = require('mongoose')

if ( process.env.NODE_ENV !== 'production' ) {
  require('dotenv').config()
}

const url = process.env.MONGODB_URI

mongoose.connect(url)

const Blog = mongoose.model('Blog', {
  title: String,
  author: String,
  url: String,
  likes: Number,
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
})

module.exports = Blog