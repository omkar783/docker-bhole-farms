<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:agency-workflow-rules -->
# Agency Workflow Rules

## Core Principles
- Always check available skills before acting; load and apply them when relevant
- Use structured thinking for complex tasks
- Write tests for all new features and bug fixes
- Follow existing code patterns in the codebase
- Prioritize type safety and proper error handling

## Development Workflow
1. **Plan**: For complex features, create a plan before coding
2. **Spec**: Define API contracts and data models upfront
3. **Implement**: Write clean, typed, tested code
4. **Review**: Self-review code for quality and security
5. **Document**: Document APIs and significant logic

## Tech Stack Standards
- **Frontend**: React, Next.js (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API routes / Server Actions, Node.js, Express, PHP
- **Database**: Prisma ORM with PostgreSQL/MongoDB
- **Mobile**: Flutter or React Native
- **DevOps**: Docker, GitHub Actions, AWS/Azure
- **Testing**: Vitest for unit, Playwright for E2E
- **State**: React Query for server, Zustand/Context for client

## Git Practices
- Use conventional commits (feat:, fix:, chore:, docs:, refactor:, test:)
- Keep commits focused and atomic
- Write meaningful commit messages
- Create PRs with clear descriptions

## Security Checklist
- No secrets in code or .env files
- Validate and sanitize all inputs
- Use parameterized queries (Prisma)
- Set proper CORS and security headers
- Review dependencies for vulnerabilities
<!-- END:agency-workflow-rules -->
