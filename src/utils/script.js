'use strict';
// Helpers for scripts that can also be imported (e.g. by tests) without running.
//
//   import { isMainModule } from './utils/script.js';
//   if (isMainModule(import.meta.url)) main();
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

/**
 * Whether the module with this URL is the script Node.js was started with.
 * @param {string} moduleUrl - import.meta.url of the calling module
 * @returns {boolean}
 */
export function isMainModule(moduleUrl) {
    const script = process.argv[1];
    if (!script) return false;
    return moduleUrl === pathToFileURL(fs.realpathSync(script)).href;
}
