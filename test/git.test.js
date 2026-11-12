import { beforeEach, describe, expect, it, vi } from 'vitest';
import { execFile } from 'node:child_process';
import * as git from '../src/utils/git.js';

// git zelf wordt niet gestart: execFile wordt gesimuleerd en geeft 'uitvoer' terug
vi.mock('node:child_process', () => ({
    execFile: vi.fn((file, args, options, callback) => callback(null, { stdout: 'uitvoer', stderr: '' })),
}));

const DEFAULTS = { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 };

beforeEach(() => {
    execFile.mockClear();
});

describe('git', () => {
    it('runs git with the arguments and returns stdout', () =>
        git.git('status', '--short').then((stdout) => {
            expect(stdout).toBe('uitvoer');
            expect(execFile).toHaveBeenCalledWith('git', ['status', '--short'], DEFAULTS, expect.any(Function));
        }));

    it('uses a last object argument as options, on top of the defaults', () =>
        git.git('log', { cwd: '/tmp', encoding: 'latin1' }).then(() => {
            expect(execFile).toHaveBeenCalledWith(
                'git',
                ['log'],
                { ...DEFAULTS, cwd: '/tmp', encoding: 'latin1' },
                expect.any(Function),
            );
        }));

    it('treats a last null argument as a normal argument', () =>
        git.git('show', null).then(() => {
            expect(execFile.mock.calls[0][1]).toEqual(['show', null]);
        }));

    it('rejects when git fails', () => {
        execFile.mockImplementationOnce((file, args, options, callback) => callback(new Error('exit 128')));
        return expect(git.git('show', 'x')).rejects.toThrow('exit 128');
    });
});

describe('command functions', () => {
    // export -> git-commando
    const commands = {
        add: 'add',
        branch: 'branch',
        checkout: 'checkout',
        clone: 'clone',
        commit: 'commit',
        config: 'config',
        describe: 'describe',
        diff: 'diff',
        fetch: 'fetch',
        init: 'init',
        log: 'log',
        lsFiles: 'ls-files',
        lsRemote: 'ls-remote',
        merge: 'merge',
        mergeBase: 'merge-base',
        mv: 'mv',
        pull: 'pull',
        push: 'push',
        rebase: 'rebase',
        remote: 'remote',
        reset: 'reset',
        restore: 'restore',
        revParse: 'rev-parse',
        rm: 'rm',
        show: 'show',
        stash: 'stash',
        status: 'status',
        switchBranch: 'switch',
        tag: 'tag',
    };

    it.each(Object.entries(commands))('%s runs git %s', (name, subcommand) =>
        git[name]('--arg', { cwd: '/repo' }).then((stdout) => {
            expect(stdout).toBe('uitvoer');
            expect(execFile).toHaveBeenCalledWith(
                'git',
                [subcommand, '--arg'],
                { ...DEFAULTS, cwd: '/repo' },
                expect.any(Function),
            );
        }),
    );

    it('command() creates a function for any git command', () =>
        git
            .command('blame')('file.js')
            .then(() => {
                expect(execFile.mock.calls[0][1]).toEqual(['blame', 'file.js']);
            }));
});
