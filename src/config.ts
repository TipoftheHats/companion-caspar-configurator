// Native
import * as fs from 'fs';

// Packages
import * as convict from 'convict';

export const conf = convict({
	companion_url: {
		doc: 'The URL of the Bitfocus Companion instance you wish to control.',
		format: 'url',
		default: 'http://localhost:8000',
	},
	rulesets: {
		doc: 'An array of filepaths to Rulesets to load.',
		format: 'string',
		default: ['./ruleset.ts'],
	},
	debug: {
		doc: 'Enables extra debug logging.',
		format: 'boolean',
		default: false,
	},
	caspar_cg: {
		host: {
			doc: 'The hostname/IP of the CasparCG instance.',
			format: 'ipaddress',
			default: 'localhost',
		},
		port: {
			doc: 'The port of the CasparCG instance.',
			format: 'port',
			default: 5250,
		},
	},
});

if (fs.existsSync('./config.json') && process.env.NODE_ENV !== 'test') {
	conf.loadFile('./config.json');
}

// Perform validation
conf.validate({ allowed: 'strict' });
