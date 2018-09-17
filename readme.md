PlainCAT
========

A simple _Computer Assisted Translation_ tool for translate plain text files,
with help of automatic translation services.

> For now, *Yandek.Translate* and *Microsoft Translator* are supported.


Usage
-----

In order to use the software, just:

 * Select the source file (i.e. the file you want to translate).

 > Note that paragraphs will be obtained by splitting the text by newlines).

 * Select the destination file (i.e. the file with the translation) or use the source file as template. 

 * Choose the languages of the source and the destination files.

 * Set the API key of the translation service you want to use.

 > To know how to obtain these keys, you can visit the sites from
 [Yandek.Translate](https://tech.yandex.com/translate/)
 or from [Microsoft Translator](https://www.microsoft.com/en-us/translator/translatorapi.aspx).

 * Click on a paragraph and start translating.


Limitations
-----------

### Spellchecker

The integrated spellchecker currently only supports Dutch, English, French, German, Portuguese and Spanish.

### Supported encodings

The software is intended to be used on files with UTF-8 encoding.

Although it _may_ work with other encodings (like ASCII, latin1 or UTF-16LE), compatibility is not guaranteed.

### Files size

The software has only been tested with small files (< 1 MB), opening larger files _could_ make the software crash.

### New paragraphs

The software allows only to edit the paragraphs of files, if you want to add a new paragraph or delete one, you will have to use an external editor (but please note that the software can't yet detect if a opened file has been modified by an external editor).


Development
-----------

The software was developed using *Electron* and *JavaScript*, so it requires *NodeJS* for testing and compilation.

For running the software on development mode, just install dependencies and execute the start command:

```
npm install
npm start
```

For compile the application and distribute compiled binaries, you can check the [Electron documentation](https://electronjs.org/docs/tutorial/application-distribution).

> When compiling, don't forget to use `npm install --production` instead of `npm install`

License
-------

PlainCAT is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

PlainCAT is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with PlainCAT. If not, see <http://www.gnu.org/licenses/>.
