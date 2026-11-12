'use strict';
// git.js roept het echte git-commando aan; enkel commando's die niets wijzigen
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { command, revParse } from '../src/utils/git.js';

describe('git', () => {
    it('resolves with stdout and passes an options object as the last argument to execFile', () =>
        expect(revParse('--show-prefix', { cwd: path.join(import.meta.dirname, '..', 'test') })).resolves.toBe(
            'test/\n',
        ));

    it('rejects on a non-zero exit code', () =>
        expect(command('rev-parse')('--verify', 'bestaat-niet')).rejects.toThrow());
});
