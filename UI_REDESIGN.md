# QCollect frontend redesign

Visual redesign using Leonxlnx/taste-skill's redesign-existing-projects guidance. The existing Next.js 16, React 19, Tailwind 4 and Base UI stack is retained.

## Changes
- New split sign-in layout, visible six-option role selector, labelled inputs and accessible validation messages.
- New workspace navigation, project context, active navigation treatment and working mobile navigation menu.
- Geist typography, restrained teal accent, neutral surfaces, smaller corner radii and consistent focus states.
- Dashboard metric strip, submission chart styling and recent-project rows.
- Project directory rows, registration styling, shared tables, dialogs, inputs and empty states.
- Survey designer and respondent styling, including a responsive designer grid that fits the workspace.
- Light/dark theme tokens and reduced-motion support.

## Preserved
All original routes, API endpoints, services, authentication hooks, stores, role and project rules, validation engines, field types, survey logic, integrations and action handlers are retained. The sign-in role selector remains a reference selection, as in the original; actual access is decided by the account and project permissions.

## Running
Use the original environment settings, including NEXT_PUBLIC_API_URL when required.

```sh
npm ci
npm run dev
```

For production, use the existing deployment configuration and `npm run build`. No backend migration or new application dependency is needed. The Geist font is bundled locally with its licence.

## Validation
- Production build and TypeScript checks pass.
- Services, hooks, stores, lib, types and utils compare byte-for-byte with the original archive.
- AST comparison found no changes to non-rendering function bodies in modified TSX files.
- Existing lint diagnostics are identical to the original: 35 errors and 21 warnings.
- Production-browser checks use intercepted test responses rather than real backend data: sign-in validation, role selection, mobile layout, mobile navigation, dashboard rendering and survey-builder rendering.
- Live backend authentication, uploads, save/publish and integrations require verification against your configured backend. They were not exercised with real credentials.

The taste skill was installed in the working environment. To install it in your own checkout, run `npx skills add Leonxlnx/taste-skill`.
