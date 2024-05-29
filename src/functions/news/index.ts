import { JSDOM } from 'jsdom';
import { z } from 'zod';

const baseURL = 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en';
const baseURLwithSearch = 'https://news.google.com/rss/search?hl=en-US&gl=US&ceid=US%3Aen&oc=11';

/**
 * Fetches news items based on the provided filter.
 *
 * @param filter - The filter to be applied to the news items.
 * @returns A formatted string containing the titles and sources of the news items.
 * @throws An error message if there was an issue fetching the news items.
 */
export const fetchNews = async (filter: string) => {
	const endpoint = filter.length > 1 ? `${baseURLwithSearch}&q=${filter}` : baseURL;
	const response = await fetch(endpoint);

	if (response.status !== 200)
		return `An error occured while getting news on ${filter}, try again later.`;
	const data = await response.text();

	// Process and extract news items from the XML document
	const { window } = new JSDOM(data);
	const items = window.document.querySelectorAll('item');
	const articles = Array.from(items).map((item) => {
		const [title, source] = item.querySelector('title').textContent.split(' - ');
		return {
			title,
			source,
			published: item.querySelector('pubDate').textContent
		};
	});
	window.close();

	let formatted = '';
	articles.forEach((a, i) => {
		if (i < 6) formatted += `* ${a.title} [${a.source.trim()}]\n`;
	});

	return formatted;
};

export const news = {
	descirption: 'Fetch news headlines, with the option to spcify the source and/or topic',
	parameters: z.object({
		topic: z
			.string()
			.describe(
				'A topic which to filter the news by, can also be a noun. Any topic not rated for conservative children or rabbi approved, are not valid topics, including inappropriate topics, LGBTQ+ or cheating.'
			),
		filters: z
			.string()
			.describe('Additional parameters to filter by, for example the source or language.')
	}),
	execute: async ({ topic, filters }: any) => await fetchNews(`${topic}%20${filters}`)
};
