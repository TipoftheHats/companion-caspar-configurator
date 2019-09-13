// Native
import { EventEmitter } from 'events';

// Packages
import * as CasparCGConnection from 'casparcg-connection';
import * as equals from 'fast-deep-equal';
import StrictEventEmitter from 'strict-event-emitter-types';

// Ours
import { conf } from './config';
import { ClipMetadata } from '../types/Ruleset';
import * as CasparTypes from '../types/caspar_cg';
import { createLogger } from './logging';

const UPDATE_FREQUENCY = 30 * 1000;
const log = createLogger('caspar');
type TypedEmitter = StrictEventEmitter<
	EventEmitter,
	{
		clips_changed: (clips: ClipMetadata[]) => void;
	}
>;

export class CasparCG extends (EventEmitter as new () => TypedEmitter) {
	clips: ClipMetadata[];

	private readonly _connection: CasparCGConnection.CasparCG;

	private _updateFilesInterval: NodeJS.Timer;

	constructor(host: string, port: number) {
		// ESLint is getting confused here, dunno why.
		// eslint-disable-next-line constructor-super
		super();

		this._connection = new CasparCGConnection.CasparCG({
			host,
			port,
			onConnected: () => {
				log.info('Connected.');
				clearInterval(this._updateFilesInterval);
				this._updateFiles();
				this._updateFilesInterval = setInterval(this._updateFiles, UPDATE_FREQUENCY);
			},
			onDisconnected: () => {
				clearInterval(this._updateFilesInterval);
				log.warn('Disconnected.');
			},
			onLog(str) {
				if (conf.get('debug')) {
					log.info(str);
				}
			},
			onError(error) {
				log.error(error);
			},
		});
	}

	private _updateFiles(): void {
		this._connection
			.cls()
			.then(reply => {
				// Filter out invalid responses.
				// Why are invalid responses even possible? Idk.
				// Also, the response isn't typed by default, so we have to cast it here
				// to a type we wrote ourselves. Not a great experience all-around.
				const validFiles: CasparTypes.CINF[] = reply.response.data.filter((data: unknown) => {
					if (typeof data !== 'object' || data === null) {
						return false;
					}

					return {}.hasOwnProperty.call(data, 'name');
				});

				const remappedMetadata = validFiles.map(f => {
					return {
						duration: {
							frames: f.frames, // TODO: is this right?
							milliseconds: f.duration, // TODO: is this right?
						},
						framerate: f.frameRate,
						filename: f.name,
					};
				});

				// Don't emit if nothing changed.
				if (equals(remappedMetadata, this.clips)) {
					return;
				}

				this.clips = remappedMetadata;
				this.emit('clips_changed', this.clips);
			})
			.catch(e => {
				log.error('Error updating files:', e);
			});
	}
}
