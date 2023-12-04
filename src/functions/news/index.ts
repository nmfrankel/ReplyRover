import { JSDOM } from 'jsdom'

const baseURL = 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en'
const baseURLwithSearch = 'https://news.google.com/rss/search?hl=en-US&gl=US&ceid=US%3Aen&oc=11'

export const fetchNews = async (filter: string) => {
	const endpoint = filter.length > 1 ? `${baseURLwithSearch}&q=${filter}` : baseURL
	const response = await fetch(endpoint)

	if (response.status !== 200)
		return `An error occured while getting news on ${filter}, try again later.`
	const data = await response.text()

	// Process and extract news items from the XML document
	const { window } = new JSDOM(data)
	const items = window.document.querySelectorAll('item')
	const articles = Array.from(items).map((item) => {
		const [title, source] = item.querySelector('title').textContent.split(' - ')
		return {
			title,
			source,
			published: item.querySelector('pubDate').textContent
		}
	})
	window.close()

	let formatted = ''
	articles.forEach((a, i) => {
		if (i < 6) formatted += `* ${a.title} [${a.source}]\n`
	})

	return formatted
}
