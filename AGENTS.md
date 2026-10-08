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
