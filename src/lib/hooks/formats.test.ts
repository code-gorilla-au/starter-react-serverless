import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { formatDate, truncate, extractUrlParts } from '$lib/hooks/formats';

describe('Hooks: formats', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.resetAllMocks();
		vi.useRealTimers();
	});

	describe('formatDate', () => {
		it("should format current date as 'less than a minute'", () => {
			const now = new Date();
			vi.setSystemTime(now);

			const result = formatDate(now);
			expect(result).toBe('less than a minute');
		});

		it('should format date from 1 minute ago', () => {
			const now = new Date();
			const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
			vi.setSystemTime(now);

			const result = formatDate(oneMinuteAgo);
			expect(result).toBe('1 minute');
		});

		it('should format date from 1 hour ago', () => {
			const now = new Date();
			const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
			vi.setSystemTime(now);

			const result = formatDate(oneHourAgo);
			expect(result).toBe('about 1 hour');
		});

		it('should format date from 1 day ago', () => {
			const now = new Date();
			const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
			vi.setSystemTime(now);

			const result = formatDate(oneDayAgo);
			expect(result).toBe('1 day');
		});

		it('should format date from 1 month ago', () => {
			const now = new Date();
			const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
			vi.setSystemTime(now);

			const result = formatDate(oneMonthAgo);
			expect(result).toBe('about 1 month');
		});

		it('should format date from 1 year ago', () => {
			const now = new Date();
			const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
			vi.setSystemTime(now);

			const result = formatDate(oneYearAgo);
			expect(result).toBe('about 1 year');
		});
	});

	describe('truncate', () => {
		it('should return original string when length is under 100 characters', () => {
			const shortString = 'This is a short string';
			const result = truncate(shortString);
			expect(result).toBe(shortString);
		});

		it('should return original string when length is exactly 100 characters', () => {
			const exactString = 'a'.repeat(100);
			const result = truncate(exactString);
			expect(result).toBe(exactString);
		});

		it('should truncate string when length is over 100 characters', () => {
			const longString = 'a'.repeat(150);
			const result = truncate(longString);
			expect(result).toBe('a'.repeat(100) + '...');
		});

		it('should handle empty string', () => {
			const result = truncate('');
			expect(result).toBe('');
		});

		it('should handle string with exactly 101 characters', () => {
			const string101 = 'a'.repeat(101);
			const result = truncate(string101);
			expect(result).toBe('a'.repeat(100) + '...');
		});

		it('should truncate very long string correctly', () => {
			const veryLongString =
				'This is a very long string that definitely exceeds the maximum length of 100 characters and should be truncated with ellipsis at the end to indicate that there is more content that has been cut off';
			const result = truncate(veryLongString);
			expect(result).toBe(
				'This is a very long string that definitely exceeds the maximum length of 100 characters and should b...'
			);
			expect(result.length).toBe(103); // 100 chars + "..."
		});

		it('should preserve special characters in truncated string', () => {
			const stringWithSpecialChars = 'Special chars: @#$%^&*()_+-={}[]|;:\'",.<>?/~`'.repeat(
				3
			);
			const result = truncate(stringWithSpecialChars);
			expect(result.endsWith('...')).toBe(true);
			expect(result.length).toBe(103);
		});

		it('should handle unicode characters correctly', () => {
			const unicodeString = 'こんにちは世界'.repeat(20);
			const result = truncate(unicodeString);
			expect(result.endsWith('...')).toBe(true);
			expect(result.length).toBe(103);
		});
	});

	describe('extractUrlParts', () => {
		it('should split URL into parts and filter empty parts', () => {
			const url = '/users/123/profile';
			const page = { params: {} };
			
			const result = extractUrlParts(url, page);
			expect(result).toEqual(['users', '123', 'profile']);
		});

		it('should replace matching parameter values with "..."', () => {
			const url = '/users/123/profile';
			const page = { params: { id: '123' } };
			
			const result = extractUrlParts(url, page);
			expect(result).toEqual(['users', '...', 'profile']);
		});

		it('should handle multiple matching parameters', () => {
			const url = '/users/123/posts/456';
			const page = { params: { userId: '123', postId: '456' } };
			
			const result = extractUrlParts(url, page);
			expect(result).toEqual(['users', '...', 'posts', '...']);
		});

		it('should handle URL with no matching parameters', () => {
			const url = '/users/123/profile';
			const page = { params: { otherId: '999' } };
			
			const result = extractUrlParts(url, page);
			expect(result).toEqual(['users', '123', 'profile']);
		});

		it('should handle empty URL', () => {
			const url = '';
			const page = { params: {} };
			
			const result = extractUrlParts(url, page);
			expect(result).toEqual([]);
		});

		it('should handle root URL', () => {
			const url = '/';
			const page = { params: {} };
			
			const result = extractUrlParts(url, page);
			expect(result).toEqual([]);
		});

		it('should filter out empty parts from URL with multiple slashes', () => {
			const url = '//users//123//profile//';
			const page = { params: {} };
			
			const result = extractUrlParts(url, page);
			expect(result).toEqual(['users', '123', 'profile']);
		});

		it('should handle URL with special characters in parts', () => {
			const url = '/users/user@email.com/profile';
			const page = { params: { email: 'user@email.com' } };
			
			const result = extractUrlParts(url, page);
			expect(result).toEqual(['users', '...', 'profile']);
		});

		it('should handle empty params object', () => {
			const url = '/users/123/profile';
			const page = { params: {} };
			
			const result = extractUrlParts(url, page);
			expect(result).toEqual(['users', '123', 'profile']);
		});

		it('should handle URL part that partially matches parameter', () => {
			const url = '/users/123456/profile';
			const page = { params: { id: '123' } };
			
			const result = extractUrlParts(url, page);
			expect(result).toEqual(['users', '123456', 'profile']);
		});

		it('should handle URL with numeric and string parameters', () => {
			const url = '/category/electronics/product/laptop123';
			const page = { params: { category: 'electronics', productId: 'laptop123' } };
			
			const result = extractUrlParts(url, page);
			expect(result).toEqual(['category', '...', 'product', '...']);
		});
	});
});
