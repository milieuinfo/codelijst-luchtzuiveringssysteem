'use strict';
// Generic CSV reading, built on csv-parser.
import { Readable } from 'node:stream';
import csv from 'csv-parser';

/**
 * Rows of a CSV text; the first row holds the column names.
 * @param {string} text
 * @returns {Promise<Record<string, string>[]>}
 */
export function parseCsv(text) {
    return new Promise((resolve, reject) => {
        const rows = [];
        Readable.from([text])
            .pipe(csv())
            .on('data', (row) => rows.push(row))
            .on('end', () => resolve(rows))
            .on('error', reject);
    });
}
