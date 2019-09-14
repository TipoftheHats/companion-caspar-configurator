// Native
import * as fs from 'fs';

// Packages
import * as convict from 'convict';

export const conf = convict({
	companion_url: {
		doc: 'The URL of the Bitfocus Companion instance you wish to control.',
		format: 'url',
		default: 'http://127.0.0.1:8000',
	},
	rulesets: {
		doc: 'An array of filepaths to Rulesets to load.',
		format: Array,
		default: ['./ruleset.ts'],
	},
	debug: {
		doc: 'Enables extra debug logging.',
		format: Boolean,
		default: false,
	},
	caspar_cg: {
		host: {
			doc: 'The hostname/IP of the CasparCG instance.',
			format: 'ipaddress',
			default: '127.0.0.1',
		},
		port: {
			doc: 'The port of the CasparCG instance.',
			format: 'port',
			default: 5250,
		},
	},
	config_path: {
		doc: 'This is a hack that only gets used via the CLI.',
		format: String,
		arg: 'config',
		default: './config.json',
	},
});

if (fs.existsSync(conf.get('config_path')) && process.env.NODE_ENV !== 'test') {
	conf.loadFile(conf.get('config_path'));
}

// Perform validation
conf.validate({ allowed: 'strict' });
