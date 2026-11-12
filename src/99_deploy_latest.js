'use strict';
import { deploy_latest } from '@milieuinfo/maven-metadata-generator-npm';
import { print, style, symbol } from './utils/console.js';

const omgeving = 'pr';
const setenv = new URL('./utils/setenv.js', import.meta.url).href;

import(setenv)
    .then(({ set_env }) => set_env(omgeving))
    .then(() => deploy_latest(omgeving))
    .catch((error) => {
        const missing = error?.code === 'ERR_MODULE_NOT_FOUND' && error.url === setenv;
        if (missing) {
            print.error('Missing src/utils/setenv.js (credentials, git-ignored)');
            print.errorDetail(
                `${style.gray(symbol.arrow)} see ${style.cyan('docs/scripts.md')}, section 99_deploy_latest.js`,
            );
        } else {
            print.error('Deploy failed');
            print.errorDetail(style.gray(error?.message ?? error));
        }
        process.exitCode = 1;
    });
