import { Link, Form } from 'react-router';
import { Button } from '~/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

interface LoginFormProps {
	error?: string;
	isLoading?: boolean;
}

export function LoginForm({ error, isLoading }: LoginFormProps) {
	return (
		<Card className="mx-auto w-full max-w-md">
			<CardHeader>
				<CardTitle className="text-2xl">Login</CardTitle>
				<CardDescription>Enter your email below to login to your account</CardDescription>
			</CardHeader>
			<Form method="post">
				<CardContent className="grid gap-4">
					<div className="grid gap-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder="m@example.com"
							required
							autoComplete="email"
						/>
					</div>
					<div className="grid gap-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="password">Password</Label>
							<Link
								to="/forgot-password"
								className="text-sm text-muted-foreground hover:underline"
							>
								Forgot password?
							</Link>
						</div>
						<Input
							id="password"
							name="password"
							type="password"
							required
							autoComplete="current-password"
						/>
					</div>
					{error && <p className="text-sm font-medium text-destructive">{error}</p>}
				</CardContent>
				<CardFooter className="flex flex-col gap-4">
					<Button type="submit" className="w-full" disabled={isLoading}>
						{isLoading ? 'Logging in...' : 'Login'}
					</Button>
					<div className="text-center text-sm">
						Don&apos;t have an account?{' '}
						<Link to="/register" className="underline underline-offset-4">
							Sign up
						</Link>
					</div>
				</CardFooter>
			</Form>
		</Card>
	);
}
