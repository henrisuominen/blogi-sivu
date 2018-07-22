const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const {initialBlogs, nonExistingId, blogsInDb, usersInDb } = require('./test_helper')

describe('Get request', () => {
	beforeAll(async () => {
    await Blog.remove({})

    const blogObjects = initialBlogs.map(n => new Blog(n))
    await Promise.all(blogObjects.map(n => n.save()))
  })

	test('blogs are returned ', async () => {
		const blogsInDatabase = await blogsInDb()
		
  	const response = await api
    	.get('/api/blogs')
    	.expect(200)
			.expect('Content-Type', /application\/json/)
		
		expect(response.body.length).toBe(blogsInDatabase.length)
			
		const returnedTitles = response.body.map(n => n.title)
    blogsInDatabase.forEach(blog => {
      expect(returnedTitles).toContain(blog.title)
    })
	})
})

describe('Post adds correctly', () => {
	beforeAll(async () => {
    await Blog.remove({})

    const blogObjects = initialBlogs.map(n => new Blog(n))
    await Promise.all(blogObjects.map(n => n.save()))
  })

	test('blogs are added ', async () => {
		const blogsInDatabase = await blogsInDb()
			
  	const newBlog = {
    	title: "Uusi blogi",
  		author: "Henri",
  		url: "www.henrinblogi.fi",
  		likes: 5,
  	}
		
  	await api
    	.post('/api/blogs')
    	.send(newBlog)
    	.expect(200)
    	.expect('Content-Type', /application\/json/)

		const response = await blogsInDb()
		
  	const titles = response.map(r => r.title)

  	expect(response.length).toBe(blogsInDatabase.length + 1)
  	expect(titles).toContain('Uusi blogi')
	})

	test('blogs with no likes have 0 likes ', async () => {
  	const newBlog = {
    	title: "Huono blogi",
  		author: "Kalle",
  		url: "www.huonoblogi.fi"
		}
	
  	await api
    	.post('/api/blogs')
    	.send(newBlog)
    	.expect(200)
    	.expect('Content-Type', /application\/json/)

  	const response = await blogsInDb()
					
		const last = response.pop()
	
  	expect(last.title).toBe("Huono blogi")
  	expect(last.likes).toBe(0)
	})
})

describe('Post bad request', () => {
	
	test('bad request when title missing ', async () => {
  	const newBlog = {
    	title: "Huono blogi",
  		author: "Kalle",
			likes: 0
  	}
	
  	await api
    	.post('/api/blogs')
    	.send(newBlog)
			.expect(400)
	})
	
	test('bad request when url missing ', async () => {
		const newBlog = {
  		author: "Kalle",
			url:"www.sivusto.com",
			likes: 0
  	}
	
  	await api
    	.post('/api/blogs')
    	.send(newBlog)
			.expect(400)
	})
})

describe('Post new user', async () => {
  beforeAll(async () => {
    await User.remove({})
    const user = new User({ username: 'root', name:'root', password: 'password123' })
    await user.save()
  })

  test('POST /api/users succeeds with a fresh username ', async () => {
    const usersBeforeOperation = await usersInDb()

    const newUser = {
      username: 'tester',
      name: 'Teppo Testaaja',
      password: 'password123'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAfterOperation = await usersInDb()
    expect(usersAfterOperation.length).toBe(usersBeforeOperation.length+1)
    const usernames = usersAfterOperation.map(u=>u.username)
    expect(usernames).toContain(newUser.username)
  })
		
	test('POST person with taken username isn\'t taken ', async () => {
  const usersBeforeOperation = await usersInDb()

    const newUser = {
      username: 'supertester',
      name: 'Teppo Testaaja',
      password: 'password456'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

			const newerUser = {
      username: 'supertester',
      name: 'Teppo Testaajaton',
      password: 'password789'
    }

    const result = await api
      .post('/api/users')
      .send(newerUser)
      .expect(400)
			.expect('Content-Type', /application\/json/)
			
	  expect(result.body).toEqual({ error: 'username must be unique'})
  })
		
	test('POST invalid password fails ', async () => {
  const usersBeforeOperation = await usersInDb()

    const newUser = {
      username: 'badPasswordMan',
      name: 'Teuvo Testaaja',
      password: 'ab'
    }
		
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
			.expect('Content-Type', /application\/json/)
			
		expect(result.body).toEqual({ error: 'password must be at least 3 numbers' })
  })
})