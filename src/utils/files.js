'use strict';
// Small, generic helpers for reading files with promises.
//
//   import { readTextIfExists } from './utils/files.js';
//   readTextIfExists('optional.txt').then((text) => text ?? 'default');

import { readFile } from 'node:fs/promises';

/**
 * Reads a UTF-8 text file; resolves with `fallback` when the file does not exist.
 * Other errors (e.g. no permission, a directory) still reject.
 * @param {string} path
 * @param {*} [fallback=null]
 * @returns {Promise<string|*>}
 */
export function readTextIfExists(path, fallback = null) {
    return readFile(path, 'utf8').catch((error) => (error.code === 'ENOENT' ? fallback : Promise.reject(error)));
}
