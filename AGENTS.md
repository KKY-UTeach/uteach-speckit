# Agent guidance

## Language support

The application supports Czech (`cs`) and English (`en`). Preserve this multilingual behavior when adding or changing features:

- Add user-visible frontend text to the language dictionaries in `frontend/src/i18n.ts`; do not introduce new hardcoded UI copy in components.
- Keep language selection and persistence in step with the existing app behavior. The default language is Czech.
- Pass the selected language through frontend service requests when backend behavior or generated text depends on it. Keep the API's existing Czech default for callers that omit a language.
- Add or update backend language-specific prompt templates when introducing or changing AI-generated output. Keep templates grouped by language so additional locales can be added consistently.
- Update tests for localized behavior and language values sent across API boundaries.

## Branches and deployment

- Name feature branches `feature/{feature-name}`, using a concise kebab-case name, for example `feature/language-support`.
- Changes committed and pushed to a non-`main` feature branch are automatically deployed to the testing environment. Commits to `main` are for production.
- Do not run a frontend or backend build manually for deployment; the deployment process builds automatically.
- See [DEPLOYMENT.md](DEPLOYMENT.md) for environment details.
