// Packages
import * as io from 'socket.io-client';
import StrictEventEmitter from 'strict-event-emitter-types';

// Ours
import { LoadSaveData, Events } from './types/companion';
import { ConnectionEvents } from './types/socket.io';
import { createLogger } from './logging';

const log = createLogger('companion');

export class Companion {
	private readonly _socket: StrictEventEmitter<SocketIOClient.Socket, Events & ConnectionEvents>;

	constructor(url: string) {
		// See: https://github.com/bterlson/strict-event-emitter-types/issues/12
		// Just forcing it for now with 'any', as a workaround.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this._socket = io(url) as any;
		this._socket.on('connect', () => {
			log.info('Connected.');
		});
		this._socket.on('disconnect', () => {
			log.info('Disconnected.');
		});
		this._socket.on('error', error => {
			log.error(error);
		});
	}

	replacePage(index: number, name: string, data: Pick<LoadSaveData, 'actions' | 'config'>): void {
		this._socket.emit('loadsave_import_page', index, 1, {
			...data,
			page: {
				1: { name },
			},
			instances: {},
			type: 'full',
		});
	}
}
