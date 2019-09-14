export interface CINF {
	name: string;
	type: 'MOVIE' | 'STILL';
	size: number;
	changed: number;
	frames: number;
	frameTime: number;
	frameRate: number;
	duration: number;
}
