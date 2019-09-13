// Packages
import { Except } from 'type-fest';

// Ours
import * as Companion from './companion';

export type Action = Except<Companion.Action, 'id'> & {
	// Action IDs are generated for us.
	// Therefore, we forbid the user config from explicitly defining them.
	id?: never;
};

export interface ClipMetadata {
	duration: {
		frames: number;
		milliseconds: number;
	};
	framerate: number;
	filename: string;
}

export type ActionsFactory = (clipMetadata: ClipMetadata) => Action[];
export type ConfigFactory = (clipMetadata: ClipMetadata) => Companion.ButtonConfig;

export interface Ruleset {
	page_ranges: number[][];
	template_rules: Array<{
		folder: string;

		// Actions are computed by a function whenever the list of Clips updates.
		// This is done so that Actions can have values computed
		// from the metadata of the clip they correspond to.
		actions: ActionsFactory;

		config: ConfigFactory;
	}>;
}
