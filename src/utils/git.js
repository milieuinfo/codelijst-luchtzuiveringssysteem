'use strict';
// Small, generic git library: one function per git command.
//
// Every function takes the same arguments as the command on the command line and returns a Promise
// that resolves with stdout. On a non-zero exit code the Promise rejects with an Error that also
// carries `code`, `stdout` and `stderr`. The output is neither parsed nor trimmed.
//
// An object as the last argument is passed as options to child_process.execFile, for example the
// directory git runs in (defaults to the current working directory):
//
//   show('v1.0:README.md')
//   tag('--list', 'v*', '--sort=-v:refname')
//   status('--porcelain', { cwd: '/path/to/repo' })
//   git('cat-file', '-p', 'HEAD')     // commands without a dedicated function
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const DEFAULT_OPTIONS = { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 };

/**
 * Runs 'git <args...>'.
 * @param {...(string|import('node:child_process').ExecFileOptions)} args - arguments, optionally followed by options
 * @returns {Promise<string>} stdout
 */
export function git(...args) {
    const last = args.at(-1);
    const options = last !== null && typeof last === 'object' ? args.pop() : {};
    return execFileAsync('git', args, { ...DEFAULT_OPTIONS, ...options }).then(({ stdout }) => stdout);
}

/**
 * Creates a function for a single git command: command('show')(...args) runs 'git show ...args'.
 * @param {string} name
 * @returns {(...args: (string|import('node:child_process').ExecFileOptions)[]) => Promise<string>}
 */
export const command =
    (name) =>
    (...args) =>
        git(name, ...args);

export const add = command('add');
export const branch = command('branch');
export const checkout = command('checkout');
export const clone = command('clone');
export const commit = command('commit');
export const config = command('config');
export const describe = command('describe');
export const diff = command('diff');
export const fetch = command('fetch');
export const init = command('init');
export const log = command('log');
export const lsFiles = command('ls-files');
export const lsRemote = command('ls-remote');
export const merge = command('merge');
export const mergeBase = command('merge-base');
export const mv = command('mv');
export const pull = command('pull');
export const push = command('push');
export const rebase = command('rebase');
export const remote = command('remote');
export const reset = command('reset');
export const restore = command('restore');
export const revParse = command('rev-parse');
export const rm = command('rm');
export const show = command('show');
export const stash = command('stash');
export const status = command('status');
export const switchBranch = command('switch'); // 'switch' is a reserved word in JavaScript
export const tag = command('tag');
