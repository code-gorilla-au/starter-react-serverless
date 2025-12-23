import type { Route } from './+types/page';
import { LoginForm } from './login-form';
import { data, redirect, useActionData, useNavigation } from 'react-router';

export function meta() {
	return [
		{ title: 'Login | Delightable' },
		{ name: 'description', content: 'Login to your account' }
	];
}

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData();
	const email = formData.get('email');
	const password = formData.get('password');

	// Basic validation
	if (typeof email !== 'string' || !email.includes('@')) {
		return data({ error: 'Invalid email address' }, { status: 400 });
	}

	if (typeof password !== 'string' || password.length < 6) {
		return data({ error: 'Password must be at least 6 characters' }, { status: 400 });
	}

	// TODO: Implement actual login logic
	console.log('Login attempt:', { email });

	// Simulate successful login
	return redirect('/');
}

export default function LoginPage() {
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const isLoading = navigation.state !== 'idle';

	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
			<LoginForm error={actionData?.error} isLoading={isLoading} />
		</div>
	);
}
