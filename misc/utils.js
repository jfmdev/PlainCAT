'use strict';

const NATIVE_ENCODINGS = [
    'ascii',
    'base64',
    'binary',
    'hex',
    'latin1',
    'ucs2', 'ucs-2',
    'utf8', 'utf-8',
    'utf16le', 'utf-16le',
];

const Utils = {
    /**
     * Converts an JSChardet encoding (which uses a different naming convention than NodeJS)
     * into a value accepted by the 'fs' module.
     */
    convertChardetEncoding: function(chardetEncoding) {
        const enc = chardetEncoding.toLowerCase();

        if(NATIVE_ENCODINGS.indexOf(enc) >= 0) {
            return enc;
        }

        if(enc == 'iso-8859-1' || enc == 'iso-8859-7' || enc == 'windows-1252') {
            return 'latin1';
        }

        return 'ascii';
    }
};

module.exports = Utils;