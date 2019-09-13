export interface ConnectionEvents {
	connect: void;
	connect_error: (error: Error) => void;
	connect_timeout: void;
	error: (error: Error) => void;
	disconnect: (reason: string) => void;
	reconnect: (attemptNumber: number) => void;
	reconnect_attempt: (attemptNumber: number) => void;
	reconnecting: (attemptNumber: number) => void;
	reconnect_error: (error: Error) => void;
	reconnect_failed: void;
}
