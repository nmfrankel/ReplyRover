export interface Timeslot {
	day: number;
	hour: number;
	minute: number;
}

export interface Period {
	open: Timeslot;
	close: Timeslot;
}

export interface RegularOpeningHours {
	openNow: boolean;
	periods: Period[];
	weekdayDescriptions: string[];
}

export interface Place {
	displayName: {
		text: string;
		languageCode: string;
	};
	formattedAddress: string;
	nationalPhoneNumber: string;
	regularOpeningHours: RegularOpeningHours;
	// Add more properties as needed
}

interface EntitySearchSuccess {
	error: undefined;
	places: Place[];
}

interface EntitySearchError {
	error: {
		code: number;
		message: string;
		status: string;
		details?: object[];
	};
	places: undefined;
}

export type EntitySearch = EntitySearchSuccess | EntitySearchError;
