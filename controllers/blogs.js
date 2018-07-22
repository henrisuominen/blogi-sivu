const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogRouter.get('/', async (request, response) => {
	const blogs = await Blog
		.find({})
		.populate('user', { username: 1, name: 1 } )
  response.json(blogs)
})

blogRouter.post('/', async (request, response) => {
	const body = request.body
	
	if (body.title === undefined || body.url === undefined) {
  	return response.status(400).json({ error: 'Bad request' })
  }
	
	try {
		const token = request.token
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    if (body.title === undefined || body.url === undefined) {
      return response.status(400).json({ error: 'title or url is missing from the body' })
    }

    const user = await User.findById(decodedToken.id)
	
  	const blog = new Blog({
			title: body.title,
  		author: body.author,
  		url: body.url,
  		likes: body.likes === undefined ? 0 : body.likes,
			user: user._id
		})
	
  	const savedBlog = await blog.save()
	
		user.blogs = user.blogs.concat(savedBlog._id)
  	await user.save()
	
  	response.json(savedBlog)
		} catch(exception) {
    	if (exception.name === 'JsonWebTokenError' ) {
      	response.status(401).json({ error: exception.message })
    	} else {
      	console.log(exception)
      	response.status(500).json({ error: 'something went wrong...' })
    }
  }
})

blogRouter.delete('/:id', async (request,response) => {
	try {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } catch (exception) {
    console.log(exception)
    response.status(400).send({ error: 'malformatted id' })
  }
})

blogRouter.put('/:id', async (request,response) => {
	const body = request.body

  const blog = {
    title: body.title,
  	author: body.author,
  	url: body.url,
  	likes: body.likes
  }
		
	try {
    const blog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(blog)
  } catch (exception) {
    console.log(exception)
    response.status(400).send({ error: 'malformatted id' })
  }
   	
})

module.exports = blogRouter