import type { ApplicationDto } from '$lib/applications/types';
import { SvelteDate } from 'svelte/reactivity';
import { isBefore, sub } from 'date-fns';

/**
 * Filters applications based on a search term provided in the input.
 * The filter excludes the "notes" property and matches string fields against the search term.
 */
export function filterApplication(input: string) {
	return (app: ApplicationDto) => {
		if (input === '') {
			return true;
		}

		for (const [key, value] of Object.entries(app)) {
			if (key === 'notes') {
				continue;
			}

			if (typeof value !== 'string') {
				continue;
			}

			const term = input.toLowerCase().trim();
			const searchField = value.toLowerCase();
			if (searchField.includes(term)) {
				return true;
			}
		}

		return false;
	};
}

/**
 * Filters a list of applications to include only those older than a specified number of days.
 */
export function filterOldApplications(
	apps: ApplicationDto[],
	numberDays: number
): ApplicationDto[] {
	const now = new SvelteDate();
	const cutoffDate = sub(now, { days: numberDays });

	return apps.filter((app) => isBefore(app.startDate, cutoffDate));
}
