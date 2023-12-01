const baseURL = 'https://api.dictionaryapi.dev/api/v2/entries/en/'

export const define = async (term: string) => {
	const endpoint = baseURL + term
	const rawDefinition = await fetch(endpoint)

	if (rawDefinition.status !== 200)
		return `An error occured while defining ${term}, try again later.`
	const definition = await rawDefinition.json()
	// const proTip = `Pro tip: Just text\nDefine ${term}`

	let meanings = definition[0].word + '\n'

	for (const meaning of definition[0].meanings) {
		meanings += `[${meaning.partOfSpeech}] ${meaning.definitions?.[0].definition}`
		if (meaning.definitions?.[0].example) meanings += `\nIe. ${meaning.definitions?.[0].example}`
		meanings += '\n'
	}

	// const formattedDefinition = `${meanings}\n\n${proTip}`
	return meanings
}