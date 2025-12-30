You are an expert in TypeScript, Node.js, Vitest, React Router v7, React, Shadcn UI, Radix UI, and Tailwind.

Code Style and Structure

- Avoid useless comments that state the obvious.
- Use Vitest for tests
- avoid mocking unless absolutely necessary and prefer to mock the smallest possible unit of code.
- Unit Tests should be co-located to file they are testing.
- end-to-end tests should be in the `__E2E__`
- Write concise, technical TypeScript code with accurate examples.
- Use functional and declarative programming patterns; avoid classes.
- Prefer iteration and modularisation over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g. isLoading, hasError).
- Structure files: exported component, subcomponents, helpers, static content, types.

Naming Conventions

- Use lowercase with dashes for directories (e.g., components/auth-wizard).
- Favour named exports for components.
- Use kebab-case for component file names
- Use kebab-case for configuration file names
- Use kebab-case for directory names

TypeScript Usage

- Use TypeScript for all code; prefer interfaces to types.
- Avoid enums; use maps instead.
- Use functional components with TypeScript interfaces.

Syntax and Formatting

- Use the "function" keyword for pure functions.
- Use declarative JSX.

UI and Styling

- Use Shadcn UI, Radix, and Tailwind for components and styling.
- Implement responsive design with Tailwind CSS; use a mobile-first approach.
- only use the tailwind colours declared 'src/app/globals.css'

Performance Optimisation

- Minimise , 'useEffect', and 'setState'.
- Wrap client components in Suspense with fallback.
- Use dynamic loading for non-critical components.
- Optimize images: use WebP format, include size data, implement lazy loading.

Key Conventions

- Use 'nuqs' for URL search parameter state management.
- Optimize Web Vitals (LCP, CLS, FID).
- Limit 'use client':
    - Favour server components and SSR.
    - Use only for Web API access in small components.
    - Avoid it for data fetching or state management.

Follow React router v7 docs for Data Fetching, Rendering, and Routing.

## Testing

### Example unit test for components

```tsx
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from 'vitest-browser-react';
import { createRoutesStub } from 'react-router';
import { LoginForm } from './login-form';

describe('LoginForm', async () => {
	describe('layout validation', () => {
		const Stub = createRoutesStub([
			{
				path: '/login',
				// @ts-expect-error - types will not match, react router docs mention using this.
				Component: LoginForm
			}
		]);
		it('should render email input form', async () => {
			const { getByLabelText } = await render(<Stub initialEntries={['/login']} />);
			await expect.element(getByLabelText('email')).toBeVisible();
		});
		it('should render password input form', async () => {
			const { getByLabelText } = await render(<Stub initialEntries={['/login']} />);
			await expect.element(getByLabelText('password')).toBeVisible();
		});
		it('should render login button', async () => {
			const { getByRole } = await render(<Stub initialEntries={['/login']} />);
			await expect.element(getByRole('button')).toBeVisible();
		});
		it('should render sign up link', async () => {
			const { getByText } = await render(<Stub initialEntries={['/login']} />);
			await expect.element(getByText('Sign up')).toBeVisible();
		});
	});
	describe('form submit', () => {
		const mockAction = vi.fn();

		const Stub = createRoutesStub([
			{
				path: '/login',
				// @ts-expect-error - types will not match, docs mention to use this.
				Component: LoginForm,
				action: mockAction
			}
		]);

		afterEach(() => {
			vi.clearAllMocks();
		});

		it('should submit form when data is entered correctly', async () => {
			const { getByLabelText, getByRole } = await render(
				<Stub initialEntries={['/login']} />
			);

			const emailEl = getByLabelText('email');
			await emailEl.fill('user@mail.com');

			const passwordEl = getByLabelText('password');
			await passwordEl.fill('Password123$');

			const submitBtn = getByRole('button');
			await submitBtn.click();
			expect(mockAction).toHaveBeenCalled();
		});
		it('should not submit form when data is incorrect', async () => {
			const { getByLabelText, getByRole } = await render(
				<Stub initialEntries={['/login']} />
			);

			const emailEl = getByLabelText('email');
			await emailEl.fill('invalid-email');

			const passwordEl = getByLabelText('password');
			await passwordEl.fill('Password123$');

			const submitBtn = getByRole('button');
			await submitBtn.click();
			expect(mockAction).not.toHaveBeenCalled();
		});
		it('should not submit form when data is empty', async () => {
			const { getByRole } = await render(<Stub initialEntries={['/login']} />);

			const submitBtn = getByRole('button');
			await submitBtn.click();
			expect(mockAction).not.toHaveBeenCalled();
		});
	});
	describe('ui regression test', () => {
		const Stub = createRoutesStub([
			{
				path: '/login',
				// @ts-expect-error - types will not match, docs mention to use this.
				Component: LoginForm
			}
		]);

		it('should match snapshot', async () => {
			const { container } = await render(<Stub initialEntries={['/login']} />);
			expect(container).toMatchSnapshot();
		});
	});
});

```

### Example unit test for server side code

```ts
import { describe, it, expect } from 'vitest';
import { loadServerEnv } from '~/lib/env/env.server';

describe('loadServerEnv()', () => {
	it('should load server environment variables', () => {
		const config = loadServerEnv();

		expect(config).toEqual({
			appTableName: 'delightable',
			domain: '.localhost',
			dynamoEndpoint: 'http://localhost:8110',
			logLevel: 'debug',
			secretAppSigningToken: 'some-secret-token'
		});
	});
});


```