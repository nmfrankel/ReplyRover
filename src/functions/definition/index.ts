const baseURL = 'https://api.dictionaryapi.dev/api/v2/entries/en/'

export const getDefinition = async (msg: string) => {
	const term = msg.split(/\s/).pop()

	if (!term) {
		return "Text 'define' +  the word you'd like defined.\n I.e. define the word addition"
	}

	const endpoint = baseURL + term
	const rawDefinition = await fetch(endpoint)

	if (rawDefinition.status !== 200)
		return `An error occured while defining '${term}'. Text \'define\' +  the word you\'d like defined.\n I.e. define the word addition`
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
