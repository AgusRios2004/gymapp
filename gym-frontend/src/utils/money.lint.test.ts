// @vitest-environment node
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

const frontendRoot = decodeURIComponent(new URL('../..', import.meta.url).pathname);

async function lintErrors(eslint: ESLint, code: string) {
  const [result] = await eslint.lintText(code, { filePath: `${frontendRoot}src/monto-viejo.ts` });
  return result.messages.filter((m) => m.severity === 2);
}

// Spec 0009: la regla de lint es lo que impide que vuelvan los montos con el locale del navegador.
describe('regla de lint contra toLocaleString() sin locale', () => {
  it('AC-0009-13: sin argumentos da error apuntando a formatMoney, con locale explícito no, y src/ queda sin errores', async () => {
    const eslint = new ESLint({ cwd: frontendRoot });

    const sinLocale = await lintErrors(eslint, 'export const f = (amount: number) => amount.toLocaleString();\n');
    expect(sinLocale.some((m) => m.message.includes('formatMoney'))).toBe(true);

    const conLocale = await lintErrors(
      eslint,
      "export const f = (date: Date) => date.toLocaleString('es-ES', { month: 'short' });\n",
    );
    expect(conLocale).toHaveLength(0);

    const results = await eslint.lintFiles(['src']);
    expect(results.reduce((total, r) => total + r.errorCount, 0)).toBe(0);
  }, 60_000);
});
