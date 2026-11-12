'use strict';
// Small, generic helpers for readable console output: colours, bold, symbols and ready-made
// messages. Built on util.styleText from Node.js, so no extra dependency.
//
// Colours are used only when stdout is a terminal that supports them. NO_COLOR turns them off
// (it wins over everything), FORCE_COLOR turns them on (e.g. in a CI log that renders ANSI codes).
//
//   import { style, print } from './utils/console.js';
//   print.title('Validation');
//   print.success(`Done: ${style.bold('12')} files`);
//   print.error('Something went wrong');              // to stderr
//   console.log(style.gray('detail'), style.red.bold('important'));

import { styleText } from 'node:util';

/**
 * Whether ANSI colour codes are written.
 * NO_COLOR wins over FORCE_COLOR; without either, the terminal decides.
 */
export const colorsEnabled = (() => {
    const env = process.env;
    if ('NO_COLOR' in env && env.NO_COLOR !== '') return false;
    if ('FORCE_COLOR' in env) return env.FORCE_COLOR !== '0' && env.FORCE_COLOR !== 'false';
    return Boolean(process.stdout.isTTY && process.stdout.hasColors?.());
})();

const FORMATS = [
    'bold',
    'dim',
    'italic',
    'underline',
    'red',
    'green',
    'yellow',
    'blue',
    'magenta',
    'cyan',
    'gray',
    'white',
];

// Creates a style function that can be chained: style.red.bold('text')
function createStyle(formats) {
    const fn = (text) => (colorsEnabled ? styleText(formats, String(text), { validateStream: false }) : String(text));
    for (const format of FORMATS) {
        Object.defineProperty(fn, format, { get: () => createStyle([...formats, format]) });
    }
    return fn;
}

/**
 * Style functions, chainable: style.bold('x'), style.red('x'), style.green.bold('x').
 * Without colours they return the text unchanged.
 */
export const style = Object.fromEntries(FORMATS.map((format) => [format, createStyle([format])]));

/** Symbols for messages. */
export const symbol = {
    success: '✔',
    error: '✖',
    warning: '⚠',
    info: 'ℹ',
    arrow: '→',
    bullet: '•',
};

const indent = (level) => '  '.repeat(level);

/** Ready-made messages. Errors and warnings go to stderr, everything else to stdout. */
export const print = {
    /** Bold heading, preceded by an empty line. */
    title: (text) => console.log(`\n${style.bold.cyan(text)}`),
    info: (text) => console.log(`${style.blue(symbol.info)} ${text}`),
    success: (text) => console.log(`${style.green(symbol.success)} ${text}`),
    warning: (text) => console.warn(`${style.yellow(symbol.warning)} ${style.yellow(text)}`),
    error: (text) => console.error(`${style.red(symbol.error)} ${style.red.bold(text)}`),
    /** Indented detail line below a message; `level` is the number of indents. */
    detail: (text, level = 1) => console.log(`${indent(level)}${text}`),
    /** Aligned 'key  value' lines, e.g. { File: 'x.nt', Release: 'v1.0' }. */
    keyValue: (pairs, level = 1) => {
        const width = Math.max(...Object.keys(pairs).map((key) => key.length));
        for (const [key, value] of Object.entries(pairs)) {
            console.log(`${indent(level)}${style.gray(key.padEnd(width))}  ${value}`);
        }
    },
    /** Empty line. */
    blank: () => console.log(),
};

/**
 * Count with a singular or plural noun: plural(1, 'file', 'files') -> '1 file', plural(3, ...) -> '3 files'.
 * @param {number} n
 * @param {string} singular
 * @param {string} pluralForm
 * @param {(n: number) => string} [formatNumber] - e.g. style.bold
 * @returns {string}
 */
export function plural(n, singular, pluralForm, formatNumber = String) {
    return `${formatNumber(n)} ${n === 1 ? singular : pluralForm}`;
}
