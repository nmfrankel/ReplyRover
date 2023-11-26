interface CardinalDirections {
	[key: string]: [number, number]
}

const cardinalDirections: CardinalDirections = {
	N1: [348.75, 360],
	N2: [0, 11.25],
	NNE: [11.25, 33.75],
	NE: [33.75, 56.25],
	ENE: [56.25, 78.75],
	E: [78.75, 101.25],
	ESE: [101.25, 123.75],
	SE: [123.75, 146.25],
	SSE: [146.25, 168.75],
	S: [168.75, 191.25],
	SSW: [191.25, 213.75],
	SW: [213.75, 236.25],
	WSW: [236.25, 258.75],
	W: [258.75, 281.25],
	WNW: [281.25, 303.75],
	NW: [303.75, 326.25],
	NNW: [326.25, 348.75]
}

export const mapWindCardinals = (angle: number) => {
	// tslint:disable-next-line:forin
	for (const direction in cardinalDirections) {
		const [min, max] = cardinalDirections[direction]
		if ((angle >= min && angle <= max) || (max < min && (angle >= min || angle <= max))) {
			return direction === 'N1' || direction === 'N2' ? 'N' : direction
		}
	}

	return 'Unknown'
}

// Example usage
// const angle = 30 // Replace with your angle
// const direction = mapAngleToDirection(angle)
// console.log(`Angle ${angle} corresponds to direction ${direction}`)
