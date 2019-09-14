// Packages
import * as shortid from 'shortid';

// Ours
import { LoadSaveData, PAGE_LENGTH } from './types/companion';
import { ClipMetadata, Ruleset } from './types/ruleset';
import * as CompanionTypes from './types/companion';

type ReturnType = Array<{
	name: string;
	data: Pick<LoadSaveData, 'actions' | 'config'>;
}>;

export function computePageIndicies(ruleset: Ruleset): number[] {
	const pageIndicies: number[] = [];
	ruleset.page_ranges.forEach(range => {
		for (let i = range[0]; i <= range[1]; i++) {
			pageIndicies.push(i);
		}
	});
	return pageIndicies;
}

export function computePages(clips: ClipMetadata[], ruleset: Ruleset): ReturnType {
	const pages: ReturnType = [];
	ruleset.template_rules.forEach(rule => {
		const actions: CompanionTypes.Action[][] = [];
		const configs: CompanionTypes.ButtonConfig[] = [];
		clips
			.filter(clip => {
				return clip.filename.toLowerCase().startsWith(rule.folder.toLowerCase());
			})
			.forEach(clip => {
				const actionsWithIds = rule.actions(clip).map(action => {
					return {
						id: shortid.generate(),
						...action,
					};
				});
				actions.push(actionsWithIds);
				configs.push(rule.config(clip));
			});

		const numPages = Math.ceil(actions.length / PAGE_LENGTH);
		let currentPageNum = 0;
		for (let i = 0; i < actions.length; i += PAGE_LENGTH) {
			currentPageNum++;
			pages.push({
				name: `${rule.folder} - ${currentPageNum}/${numPages}`,
				data: {
					actions: {
						1: {
							1: actions[i],
							2: actions[i + 1],
							3: actions[i + 2],
							4: actions[i + 3],
							5: actions[i + 4],
							6: actions[i + 5],
							7: actions[i + 6],
							8: actions[i + 7],
							9: actions[i + 8],
							10: actions[i + 9],
							11: actions[i + 10],
							12: actions[i + 11],
						},
					},
					config: {
						1: {
							1: configs[i],
							2: configs[i + 1],
							3: configs[i + 2],
							4: configs[i + 3],
							5: configs[i + 4],
							6: configs[i + 5],
							7: configs[i + 6],
							8: configs[i + 7],
							9: configs[i + 8],
							10: configs[i + 9],
							11: configs[i + 10],
							12: configs[i + 11],
						},
					},
				},
			});
		}
	});
	return pages;
}
