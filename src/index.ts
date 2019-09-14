// Native
import * as fs from 'fs';

// Ours
import { conf } from './config';
import { Companion } from './companion';
import { CasparCG } from './caspar';
import { computePageIndicies, computePages } from './compute';
import { Ruleset } from '../types/Ruleset';
import { createLogger } from './logging';

const log = createLogger('app');
const companion = new Companion();
const caspar = new CasparCG(conf.get('caspar_cg').host, conf.get('caspar_cg').port);

init().catch(error => {
	log.error(error);
	setImmediate(() => {
		process.exit(1);
	});
});

async function init(): Promise<void> {
	const rulesets: Ruleset[] = [];
	for (const ruleset_path of conf.get('rulesets')) {
		if (!fs.existsSync(ruleset_path)) {
			throw new Error(`Rulset "${ruleset_path}" does not exist.`);
		}

		// eslint-disable-next-line no-await-in-loop
		const result = await import(ruleset_path);
		if (!result.default) {
			throw new Error(`Rulset "${ruleset_path}" does not have a default export.`);
		}

		rulesets.push(result.default);
	}

	// Whenever any clip(s) change in Caspar,
	// Update the Pages we control in Companion.
	caspar.on('clips_changed', clips => {
		rulesets.forEach(ruleset => {
			const pageIndicies = computePageIndicies(ruleset);
			const pages = computePages(clips, ruleset);
			if (pages.length > pageIndicies.length) {
				log.warn('Rules %s has more button than can fit in the allowed pages. Buttons will be truncated!');
			}

			pageIndicies.forEach((pageIndex, arrayIndex) => {
				const page = pages[arrayIndex];
				if (page) {
					companion.replacePage(pageIndex, page.name, page.data);
				}
			});
		});
	});
}
