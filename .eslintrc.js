// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: 'expo',
  // Deno Edge Functions live in a different runtime/module system (npm:
  // specifiers, global Deno) and are linted separately via `supabase functions`.
  ignorePatterns: ['supabase/functions/**'],
};
