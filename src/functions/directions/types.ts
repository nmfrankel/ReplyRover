export interface DirectionResponse {
	routes: {
		legs: {
			distance: {
				text: string;
				value: number;
			};
			duration: {
				text: string;
				value: number;
			};
			end_address: string;
			start_address: string;
			steps: {
				distance: {
					text: string;
					value: number;
				};
				duration: {
					text: string;
					value: number;
				};
				end_location: {
					lat: number;
					lng: number;
				};
				html_instructions: string;
				travel_mode: string;
			}[];
		}[];
	}[];
}

export type TripInfoType = DirectionResponse['routes'][0]['legs'][0];
