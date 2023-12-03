const baseURL = 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en';

export const fetchNews = async (filter: string) => {
	const response = await fetch(endpoint)

	if (response.status !== 200)
		return `An error occured while defining ${term}, try again later.`
	const data = await response.text()

	console.log(data)

	const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'application/xml');

    // Extract news items from the XML document
    const items = xmlDoc.querySelectorAll('item');
    const newsItems = Array.from(items).map(item => {
      return {
        title: item.querySelector('title').textContent,
        link: item.querySelector('link').textContent,
        // Add more properties as needed
      };
    });

	return data // newsItems
}
