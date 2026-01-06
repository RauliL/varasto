# @varasto/cli

[![npm][npm-image]][npm-url]

[Command-line interface] for [Varasto storages].

[npm-image]: https://img.shields.io/npm/v/@varasto/cli.svg
[npm-url]: https://npmjs.org/package/@varasto/cli
[Command-line interface]: https://en.wikipedia.org/wiki/Command-line_interface
[Varasto storages]: https://www.npmjs.com/package/@varasto/storage

## Installation

Use [npm] global install to install the CLI:

```sh
$ npm install -g @varasto/cli
```

Or alternatively use [npx] to run the CLI directly:

```sh
$ npx @varasto/cli
```

[npm]: https://docs.npmjs.com/cli/v8/commands/npm-install#global
[npx]: https://docs.npmjs.com/cli/v8/commands/npx

## Usage

The CLI takes an [URL] or name of directory as an argument, that will be used
for retrieving/storing data. For example:

```sh
$ varasto-cli http://user:pass@localhost:8080/
$ varasto-cli sqlite:database.sqlite
$ varasto-cli /some/directory
```

You can also pass command you wish to execute as the second argument. If this
omitted, an [REPL] will be launched instead.

```sh
$ varasto-cli sqlite:database.sqlite "set foo bar { value: 5 }"
$ varasto-cli sqlite:database.sqlite "get foo bar"
```

The inputted data is expected to be in ordinary [JSON] or the more human
friendly [JSON5] format.

[URL]: https://www.npmjs.com/package/@varasto/url
[REPL]: https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop
[JSON]: https://www.json.org/json-en.html
[JSON5]: https://json5.org/

### Commands

| Command | Description                               |
| ------- | ----------------------------------------- |
| delete  | Deletes an entry from namespace.          |
| get     | Retrieves an entry from namespace.        |
| help    | Displays information about commands.      |
| keys    | Lists all keys of entries in a namespace. |
| list    | Lists all entries in a namespace.         |
| quit    | Exits the CLI.                            |
| set     | Inserts an entry.                         |
| update  | Updates existing entry.                   |
