<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
# AGENTS
- Menu, business info and promos live in src/lib/menu.ts until a database is added — single source for UI and AI prompt.
- AI chat streams via server route src/routes/api/chat.ts (raw Responses API) — keeps the key server-side.
- Orders are inserted only by the placeOrder server function, which re-prices from src/lib/menu.ts — clients can't tamper with totals.
- Roles live in user_roles (admin/staff/customer); the first account to sign up becomes admin via the signup trigger — gives the owner access without manual setup.
- Owner AI tools stream via src/routes/api/admin-ai.ts and verify the caller is admin from their bearer token.
