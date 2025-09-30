import { formatDistanceToNow, format } from 'date-fns';

/**
 * Formats the given date to display the relative time (distance to now).
 */
export function formatDate(date: Date) {
	return formatDistanceToNow(date);
}

export function prettyDate(date: Date) {
	return format(date, 'do MMM yyyy');
}

/**
 * Truncates the provided string to a maximum of 100 characters and appends an ellipsis ("...") at the end.
 */
export function truncate(str: string) {
	const maxLength = 100;

	if (str.length <= maxLength) {
		return str;
	}

	const sub = str.substring(0, maxLength);
	return `${sub}...`;
}

export function extractUrlParts(url: string, page: { params: Record<string, string> }) {
	return url
		.split('/')
		.map((part) => {
			for (const param of Object.values(page.params)) {
				if (part === param) {
					return '...';
				}
			}

			return part;
		})
		.filter((part) => part !== '');
}
