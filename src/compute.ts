// Packages
import * as shortid from 'shortid';

// Ours
import { LoadSaveData, PAGE_LENGTH } from '../types/companion';
import { ClipMetadata, Ruleset } from '../types/Ruleset';
import * as CompanionTypes from '../types/companion';

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
				return clip.filename.startsWith(rule.folder);
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

		const numPages = actions.length % PAGE_LENGTH;
		for (let i = 0; i < actions.length; i += PAGE_LENGTH) {
			const startIndex = i * PAGE_LENGTH;
			const endIndex = startIndex + PAGE_LENGTH + 1;
			pages.push({
				name: `${rule.folder} - ${i + 1}/${numPages}`,
				data: {
					actions: {
						1: actions.slice(startIndex, endIndex),
					},
					config: {
						1: configs.slice(startIndex, endIndex),
					},
				},
			});
		}
	});
	return pages;
}
