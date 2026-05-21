# B15: Add Secure flag to admin session cookie

## Context

The admin session cookie (`admin_session`) is set by the `login` action in
`src/routes/(private)/admin/+page.server.ts`. As of the bug filing, the cookie options
do not include `secure: true`, meaning the cookie could be transmitted over a plain HTTP
connection and captured in transit.

Related pages:
- Item card: `wiki/backlog/doing/B15-admin-cookie-secure-flag.md`
- Architecture: `wiki/architecture.md` — `(private)/` routes, auth utilities
- Auth utility: `src/lib/utils/auth.ts` — HMAC session creation and verification
- Auth guard: `src/routes/(private)/admin/+layout.server.ts` — session gate for all admin sub-routes

The fix is a one-line change to the `cookies.set` call. The existing options are:

```ts
{ path: '/', httpOnly: true, sameSite: 'strict', maxAge: 60 * 60 * 24 * 365 }
```

They must become:

```ts
{ path: '/admin', httpOnly: true, sameSite: 'strict', secure: true, maxAge: 60 * 60 * 24 * 365 }
```

Two attributes change simultaneously:
1. `secure: true` is added.
2. `path` is tightened from `'/'` to `'/admin'` — the cookie is only needed under
   `/admin` and should not be sent with requests to unrelated routes.

`secure: true` is safe for local development: browsers treat `http://localhost` as a
secure context and do not suppress secure cookies on it. No development workflow change
is required.

## Acceptance criteria

1. After a successful login the `Set-Cookie` response header for `admin_session` includes
   the `Secure` attribute.
2. After a successful login the `Set-Cookie` response header for `admin_session` includes
   `HttpOnly`.
3. After a successful login the `Set-Cookie` response header for `admin_session` includes
   `SameSite=Strict`.
4. After a successful login the `Set-Cookie` response header for `admin_session` has
   `Path=/admin` (not `Path=/`).
5. After a successful login the `Set-Cookie` response header for `admin_session` includes
   a `Max-Age` value equal to `31536000` (60 × 60 × 24 × 365 seconds).
6. A failed login (wrong token) does NOT set any `admin_session` cookie.
7. A Vitest unit / integration test for the login action asserts that the `Secure`
   attribute is present on the cookie set by a successful login. This test must fail
   against the original code and pass after the fix.
8. The existing `verifyAdminSession` helper is unchanged — no modifications to
   `src/lib/utils/auth.ts` are required by this item.
9. The auth guard in `+layout.server.ts` is unchanged — it continues to read the cookie
   by name `admin_session` via `cookies.get('admin_session')`.

## Out of scope

- Changing the cookie name.
- Rotating or expiring existing sessions (no server-side session store exists; HMAC
  self-validation is the current design).
- Adding a `__Host-` prefix to the cookie (stricter browser enforcement — considered
  but not required here; file a separate item if desired).
- Any other admin-route changes.
- Testing actual browser behaviour across environments; this spec covers server-side
  response header assertions only.

## Open questions

None. The fix is unambiguous and non-blocking.
