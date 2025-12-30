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
