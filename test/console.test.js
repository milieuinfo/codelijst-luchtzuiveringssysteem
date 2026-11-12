import { afterEach, describe, expect, it, vi } from 'vitest';

// colorsEnabled wordt bepaald bij het importeren: elke test laadt console.js opnieuw
const laad = (env = {}) => {
    vi.resetModules();
    vi.stubEnv('NO_COLOR', env.NO_COLOR);
    vi.stubEnv('FORCE_COLOR', env.FORCE_COLOR);
    return import('../src/utils/console.js');
};

// Laadt console.js met tijdelijk andere eigenschappen op process.stdout (in de test is dat een pipe)
const laadMetStdout = (eigenschappen) => {
    const origineel = Object.fromEntries(
        Object.keys(eigenschappen).map((key) => [key, Object.getOwnPropertyDescriptor(process.stdout, key)]),
    );
    for (const [key, value] of Object.entries(eigenschappen)) {
        Object.defineProperty(process.stdout, key, { value, configurable: true, writable: true });
    }
    return laad().finally(() => {
        for (const [key, descriptor] of Object.entries(origineel)) {
            if (descriptor) Object.defineProperty(process.stdout, key, descriptor);
            else delete process.stdout[key];
        }
    });
};

afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
});

describe('colorsEnabled', () => {
    it.each([
        [{ NO_COLOR: '1', FORCE_COLOR: '1' }, false],
        [{ NO_COLOR: '', FORCE_COLOR: '1' }, true],
        [{ FORCE_COLOR: '1' }, true],
        [{ FORCE_COLOR: '' }, true],
        [{ FORCE_COLOR: '0' }, false],
        [{ FORCE_COLOR: 'false' }, false],
    ])('with %o is %s', (env, verwacht) => laad(env).then((m) => expect(m.colorsEnabled).toBe(verwacht)));

    it.each([
        [{ isTTY: true, hasColors: () => true }, true],
        [{ isTTY: true, hasColors: () => false }, false],
        [{ isTTY: false, hasColors: () => true }, false],
        [{ isTTY: true, hasColors: undefined }, false],
    ])('follows the terminal without NO_COLOR or FORCE_COLOR: %o', (stdout, verwacht) =>
        laadMetStdout(stdout).then((m) => expect(m.colorsEnabled).toBe(verwacht)),
    );
});

describe('style', () => {
    it('keeps colours on a terminal, also when the stream itself is not checked', () =>
        // geladen alsof stdout een kleurenterminal is; bij het stylen is stdout weer een pipe
        laadMetStdout({ isTTY: true, hasColors: () => true }).then(({ style }) => {
            expect(style.red('x')).toBe('\x1b[31mx\x1b[39m');
        }));

    it('adds ANSI codes when colours are on, also chained', () =>
        laad({ FORCE_COLOR: '1' }).then(({ style }) => {
            expect(style.red('x')).toBe('\x1b[31mx\x1b[39m');
            expect(style.red.bold('x')).toBe('\x1b[31m\x1b[1mx\x1b[22m\x1b[39m');
            for (const format of ['bold', 'dim', 'italic', 'underline', 'green', 'yellow', 'blue', 'magenta']) {
                expect(style[format]('x'), format).not.toBe('x');
            }
            for (const format of ['cyan', 'gray', 'white']) expect(style[format]('x'), format).not.toBe('x');
        }));

    it('returns the plain text, as a string, when colours are off', () =>
        laad({ NO_COLOR: '1' }).then(({ style }) => {
            expect(style.red.bold('x')).toBe('x');
            expect(style.bold(12)).toBe('12');
        }));
});

describe('print', () => {
    const spies = () => ({
        log: vi.spyOn(console, 'log').mockImplementation(() => {}),
        warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
        error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    });

    it('writes messages with their symbol to the right stream', () =>
        laad({ NO_COLOR: '1' }).then(({ print }) => {
            const out = spies();
            print.success('ok');
            print.info('let op');
            print.warning('pas op');
            print.error('fout');
            print.title('Titel');
            expect(out.log.mock.calls).toEqual([['✔ ok'], ['ℹ let op'], ['\nTitel']]);
            expect(out.warn.mock.calls).toEqual([['⚠ pas op']]);
            expect(out.error.mock.calls).toEqual([['✖ fout']]);
        }));

    it('indents details and aligns key-value pairs', () =>
        laad({ NO_COLOR: '1' }).then(({ print }) => {
            const out = spies();
            print.detail('a');
            print.detail('b', 0);
            print.detail('c', 2);
            print.keyValue({ File: 'x.nt', Release: 'v1' });
            print.keyValue({ K: 'v' }, 0);
            print.blank();
            expect(out.log.mock.calls).toEqual([
                ['  a'],
                ['b'],
                ['    c'],
                ['  File     x.nt'],
                ['  Release  v1'],
                ['K  v'],
                [],
            ]);
        }));

    it('plural picks singular or plural form', () =>
        laad({ NO_COLOR: '1' }).then(({ plural }) => {
            expect(plural(1, 'concept', 'concepts')).toBe('1 concept');
            expect(plural(0, 'concept', 'concepts')).toBe('0 concepts');
            expect(plural(2, 'concept', 'concepts', (n) => `*${n}*`)).toBe('*2* concepts');
        }));

    it('exposes the symbols', () =>
        laad({ NO_COLOR: '1' }).then(({ symbol }) => {
            expect(symbol).toEqual({ success: '✔', error: '✖', warning: '⚠', info: 'ℹ', arrow: '→', bullet: '•' });
        }));
});
