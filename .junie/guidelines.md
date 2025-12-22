You are an expert in TypeScript, Node.js, React Router v7, React, Shadcn UI, Radix UI and Tailwind.

Code Style and Structure

- Avoid useless comments that state the obvious.
- Use Vitest for tests
- avoid mocking unless absolutely necessary, and prefer to mock the smallest possible unit of code.
- Unit Tests should be co-located to file they are testing.
- end to end tests should be in the `__E2E__`
- Write concise, technical TypeScript code with accurate examples.
- Use functional and declarative programming patterns; avoid classes.
- Prefer iteration and modularisation over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
- Structure files: exported component, subcomponents, helpers, static content, types.

Naming Conventions

- Use lowercase with dashes for directories (e.g., components/auth-wizard).
- Favor named exports for components.
- Use kebab-case for component file names
- Use kebab-case for configuration file names
- Use kebab-case for directory names

TypeScript Usage

- Use TypeScript for all code; prefer interfaces over types.
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

- Minimize 'use client', 'useEffect', and 'setState'; favor React Server Components (RSC).
- Wrap client components in Suspense with fallback.
- Use dynamic loading for non-critical components.
- Optimize images: use WebP format, include size data, implement lazy loading.

Key Conventions

- Use 'nuqs' for URL search parameter state management.
- Optimize Web Vitals (LCP, CLS, FID).
- Limit 'use client':
    - Favor server components and Next.js SSR.
    - Use only for Web API access in small components.
    - Avoid for data fetching or state management.

Follow Next.js docs for Data Fetching, Rendering, and Routing.
