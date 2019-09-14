#!/usr/bin/env node
const path = require('path');
require('ts-node').register({
	project: path.resolve(__dirname, '../tsconfig.json'),
	ignore: ['node_modules/(?!@tipofthehats/companion-caspar-configurator)'],
});
require('../src/index.ts');
