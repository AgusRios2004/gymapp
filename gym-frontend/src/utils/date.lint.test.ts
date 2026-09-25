// @vitest-environment node
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

const frontendRoot = decodeURIComponent(new URL('../..', import.meta.url).pathname);

// Spec 0008: la regla de lint es lo que impide que vuelva el cálculo de "hoy" en UTC.
describe('regla de lint contra "hoy" en UTC', () => {
  it('AC-0008-17: toISOString().split en src/ da error apuntando a todayLocalISO, y src/ queda sin errores', async () => {
    const eslint = new ESLint({ cwd: frontendRoot });

    const [snippet] = await eslint.lintText(
      "export const today = new Date().toISOString().split('T')[0];\n",
      { filePath: `${frontendRoot}src/fecha-vieja.ts` },
    );
    const errors = snippet.messages.filter((m) => m.severity === 2);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((m) => m.message.includes('todayLocalISO'))).toBe(true);

    const results = await eslint.lintFiles(['src']);
    expect(results.reduce((total, r) => total + r.errorCount, 0)).toBe(0);
  }, 60_000);
});
