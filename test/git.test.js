'use strict';
// git.js roept het echte git-commando aan, in een eigen tijdelijke repository: de workspace in Jenkins
// is van een andere gebruiker, waardoor git daar weigert ('dubious ownership')
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { command, init, revParse } from '../src/utils/git.js';

describe('git', () => {
    let repo;

    beforeAll(() =>
        mkdtemp(path.join(os.tmpdir(), 'git-test-')).then((dir) => {
            repo = dir;
            return mkdir(path.join(repo, 'sub')).then(() => init('--quiet', { cwd: repo }));
        }),
    );

    afterAll(() => rm(repo, { recursive: true, force: true }));

    it('resolves with stdout and passes an options object as the last argument to execFile', () =>
        expect(revParse('--show-prefix', { cwd: path.join(repo, 'sub') })).resolves.toBe('sub/\n'));

    it('rejects on a non-zero exit code', () =>
        expect(command('rev-parse')('--verify', 'bestaat-niet', { cwd: repo })).rejects.toThrow());
});
