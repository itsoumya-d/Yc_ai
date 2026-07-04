## 2024-05-18 - Missing JWT Validation in Edge Function
**Vulnerability:** Supabase Edge Function `send-notifications` checked for the presence of a Bearer token but never validated it, allowing unauthenticated execution using the service role key.
**Learning:** Edge Functions using direct HTTP POST requests do not automatically validate JWTs; they must be manually checked via `auth.getUser()`.
**Prevention:** Always use `auth.getUser()` with the provided Authorization header before executing privileged actions or using the service role key.
