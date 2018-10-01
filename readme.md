PlainCAT
========

A simple _Computer Assisted Translation_ tool for translate plain text files,
with help of automatic translation services.

> For now, *Yandek.Translate* and *Microsoft Translator* are supported.


Usage
-----

In order to use the software, you can simply download a binary from the [release](https://github.com/jfmdev/PlainCAT/releases) section, unzip it and execute it.

Once the application is running, you must select the languages from/to you will be translating, set the API key of the translation service you want to use (in case you want to use one), open the source file (i.e. the file you want to translate) and select the destination file (i.e. the file where the traslation will be saved), which can be another file or a copy of the source file. 

> To know how to obtain these API key for the translation services, you can visit the sites from
 [Yandek.Translate](https://tech.yandex.com/translate/)
 and [Microsoft Translator](https://www.microsoft.com/en-us/translator/translatorapi.aspx).

After you selected both the source and the destination, the paragraphs of both files (obtained by splitting the texts on newlines) will be displayed side by side (or one after another, depending of your settings). Then you should simply click on a paragraph and start translating.


Limitations
-----------

### Spellchecker

The integrated spellchecker only supports Dutch, English, French, German, Italian, Portuguese, Russian and Spanish, but more languages could be added.

> In order to add more languages, you just need to download the corresponding Hunspell files, move the files to the `./resources/dict` folder, and then update the `./misc/languages.json` file.

### Supported encodings

The software is intended to be used on files with UTF-8 encoding.

Although it _may_ work with other encodings (like ASCII, latin1 or UTF-16LE), compatibility is not guaranteed.

### Files size

The software has only been tested with small files (< 1 MB), opening larger files _could_ make the software crash.

### New paragraphs

The software only allows to edit current paragraphs, if you want to add new paragraphs or delete existing ones, you will have to use an external editor.


Development
-----------

The software was developed using *Electron* and *JavaScript*, so it requires *NodeJS* for testing and compilation.

For running the software on development mode, you must: 

 1. Install dependencies with `npm install`.

 2. [Re-build the native modules for Electron](https://electronjs.org/docs/tutorial/using-native-node-modules) using `./node_modules/.bin/electron-rebuild` (Linux and MacOS) or `.\node_modules\.bin\electron-rebuild.cmd` (Windows).

 > Currently the only dependency with native code is `nodehun` (a Hunspell library).

 3. Launch the app with `npm start`.

For compile the application and distribute compiled binaries, you can check the [Electron's documentation](https://electronjs.org/docs/tutorial/application-distribution).

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
