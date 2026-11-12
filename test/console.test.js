'use strict';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { print } from '../src/utils/console.js';

afterEach(() => {
    vi.restoreAllMocks();
});

describe('print.errorDetail', () => {
    it('writes an indented detail line to stderr, like print.error', () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        print.errorDetail('uitleg');
        print.errorDetail('dieper', 2);
        expect(error.mock.calls).toEqual([['  uitleg'], ['    dieper']]);
        expect(log).not.toHaveBeenCalled();
    });
});

describe('print', () => {
    it('writes warnings and errors to stderr, the rest to stdout', () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        print.info('info');
        print.warning('let op');
        print.error('fout');
        expect(log.mock.calls.flat()).toEqual([expect.stringContaining('info')]);
        expect(warn.mock.calls.flat()).toEqual([expect.stringContaining('let op')]);
        expect(error.mock.calls.flat()).toEqual([expect.stringContaining('fout')]);
    });

    it('aligns key-value pairs', () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        print.keyValue({ File: 'x.nt', Release: 'v1' });
        expect(log.mock.calls.flat()).toEqual(['  File     x.nt', '  Release  v1']);
    });
});

// colorsEnabled wordt bepaald bij het laden van de module: per test opnieuw laden met andere omgeving
describe('colours', () => {
    const laad = (env) => {
        vi.resetModules();
        for (const [naam, waarde] of Object.entries(env)) vi.stubEnv(naam, waarde);
        return import('../src/utils/console.js');
    };

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('turns colours on with FORCE_COLOR', () =>
        laad({ NO_COLOR: undefined, FORCE_COLOR: '1' }).then(({ colorsEnabled, style }) => {
            expect(colorsEnabled).toBe(true);
            // Met ANSI-codes rond de tekst
            expect(style.red.bold('x')).not.toBe('x');
            expect(style.red.bold('x')).toContain('x');
        }));

    it('lets NO_COLOR win over FORCE_COLOR', () =>
        laad({ NO_COLOR: '1', FORCE_COLOR: '1' }).then(({ colorsEnabled, style }) => {
            expect(colorsEnabled).toBe(false);
            expect(style.red.bold('x')).toBe('x');
        }));

    it('turns colours off with FORCE_COLOR=0', () =>
        laad({ NO_COLOR: undefined, FORCE_COLOR: '0' }).then(({ colorsEnabled }) => {
            expect(colorsEnabled).toBe(false);
        }));
});
