import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Spec 0008: toISOString() es UTC y entre las 21 y las 24 de Argentina da el día siguiente.
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.property.name=/^(split|slice)$/][callee.object.callee.property.name='toISOString']",
          message:
            "toISOString() es UTC y corre la fecha un día en Argentina. Para la fecha de hoy usá todayLocalISO() de 'src/utils/date' (spec 0008).",
        },
      ],
    },
  },
])
