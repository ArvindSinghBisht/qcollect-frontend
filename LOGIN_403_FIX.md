# Login 403 Fix

## Root cause
The shared Axios request interceptor attached the existing `token` cookie and
`X-Project-Id` header to `/auth/login`. A stale or invalid JWT could therefore
be processed by the backend JWT filter before the public login controller.

## Changes
- Added a `publicApi` Axios client for login/registration.
- Login no longer sends `Authorization` or `X-Project-Id`.
- Stale token cookie is removed before login.
- Protected requests continue to use the authenticated Axios client.
- Login 401 responses no longer cause a redirect loop.
- Default fallback API URL updated to:
  `https://fifff-production.up.railway.app`

## Deployment
Redeploy the frontend and perform a hard refresh. Existing browser sessions
should clear the `token` cookie and `qcollect-auth-store` local-storage entry.
