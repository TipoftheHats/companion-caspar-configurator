/* A page has 12 buttons.
 * Well, on the normal Stream Deck...
 * I guess the Mini and XL are different.
 * Look, its good enough for now.
 */
interface GenericPage<T> {
	// These refer to the Button numbers of this Page.
	1: T;
	2: T;
	3: T;
	4: T;
	5: T;
	6: T;
	7: T;
	8: T;
	9: T;
	10: T;
	11: T;
	12: T;
}

// A utility type for forcing code to specify only a single Page's worth of data.
interface SinglePage<T> {
	// This "1" refers to the page number.
	1: Companion.GenericPage<T>;
}

export interface Action {
	id: string;
	label: string;
	instance: string;
	action: string;
	delay: string;
	options?: {
		[k: string]: number | string | boolean;
	};
}

export interface ButtonConfig {
	alignment: Alignment;
	bgcolor: number;
	color: number;
	size: Size;
	style: Style;
	text: string;
}

export const enum Alignment {
	LeftTop = 'left:top',
	LeftCenter = 'left:center',
	LeftBottom = 'left:bottom',
	CenterTop = 'center:top',
	CenterCenter = 'center:center',
	CenterBottom = 'center:bottom',
	RightTop = 'right:top',
	RightCenter = 'right:center',
	RightBottom = 'right:bottom',
}

export const enum Size {
	Small = 'small',
	Large = 'large',
	Seven = '7',
	Fourteen = '14',
	Eighteen = '18',
	TwentyFour = '24',
	Thirty = '30',
	FourtyFour = '44',
	Auto = 'auto',
}

export const enum Style {
	PageUp = 'pageup',
	PageDown = 'pagedown',
	PageNum = 'pagenum',
	Text = 'text',
	PNG = 'png',
}

export interface Instance {
	instance_type: string;
	label: string;
	import_to: string;
	host?: string;
	port?: string;
}

export interface Events {
	loadsave_import_page: (topage: number, frompage: 1, data: LoadSaveData) => void;
}

export interface LoadSaveData {
	actions: SinglePage<Companion.Action[]>;
	config: SinglePage<Companion.ButtonConfig[]>;
	page: SinglePage<{ name: string }>;
	instances: {
		[k: string]: Companion.Instance;
	};
	type: 'full';
}

export const PAGE_LENGTH = 12;
