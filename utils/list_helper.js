const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
	if (blogs.length !== 0) {
	  return blogs.map(blog => blog.likes).reduce((acc, cur) => acc + cur)
  }
}

const favoriteBlog = (blogs) => {
	return blogs.map(blog => {return{title:blog.title,author:blog.author,likes:blog.likes}}).reduce((acc,cur) => (cur === undefined) ? acc : ((cur.likes > acc.likes) ? cur : acc))
}

const mostBlogs = (blogs) => {
	const authors = blogs.map(blog => blog.author)
	const author = authors.sort((a,b) => authors.filter(author => author===a).length - authors.filter(author => author===b).length).slice(-1).pop()
	const amount = authors.filter(a => a===author).length
	return {
		author:author,
		blogs:amount
	}
}

const mostLikes = (blogs) => {
	const authors = Array.from(new Set(blogs.map(blog => blog.author)))
	let max = 0
	let author = ""
	for(let i = 0; i < authors.length; i++){
		const likes = blogs.filter(blog => blog.author===authors[i]).map(blog => blog.likes).reduce((acc,cur) => acc + cur)
		if (likes >= max) {
			max = likes
			author = authors[i]
		}
	}
	return {
		author:author,
		likes:max
	}
}

module.exports = {
  dummy,
	totalLikes,
	favoriteBlog,
	mostBlogs,
	mostLikes
}
