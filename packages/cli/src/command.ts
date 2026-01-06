import { Storage } from '@varasto/storage';
import JSON5 from 'json5';
import { colorize } from 'json-colorizer';

import { tokenize } from './tokenizer';

export type CommandDefinition = {
  description: string;
  args?: string[];
  callback: (storage: Storage, args: string[]) => Promise<void>;
};

const renderValue = (value: string | object): string =>
  colorize(value, { indent: 2 });

export const renderUsage = (command: CommandDefinition): string =>
  command.args?.map((arg) => `<${arg}>`).join(' ') ?? '';

const commands: Readonly<Record<string, CommandDefinition>> = {
  quit: {
    description: 'Exits the command line interface.',
    async callback() {
      process.exit(0);
    },
  },
  help: {
    description: 'Displays information about an command.',
    args: ['command'],
    async callback(storage, [command]) {
      const definition = commands[command];

      if (definition) {
        console.log(`${command} ${renderUsage(definition)}`);
        console.log(definition.description);
      } else {
        throw new Error(`Unknown command: ${command}`);
      }
    },
  },
  list: {
    description: 'Lists all entries from an namespace.',
    args: ['namespace'],
    async callback(storage, [namespace]) {
      for await (const [key, value] of storage.entries(namespace)) {
        console.log(renderValue({ [key]: value }));
      }
    },
  },
  keys: {
    description: 'Lists keys of all entries from an namespace.',
    args: ['namespace'],
    async callback(storage, [namespace]) {
      for await (const key of storage.keys(namespace)) {
        console.log(key);
      }
    },
  },
  get: {
    description: 'Retrieves an entry from an namespace.',
    args: ['namespace', 'key'],
    async callback(storage, [namespace, key]) {
      const value = await storage.get(namespace, key);

      if (value === undefined) {
        console.error('Entry does not exist.');
      } else {
        console.log(renderValue(value));
      }
    },
  },
  set: {
    description: 'Inserts an entry to namespace.',
    args: ['namespace', 'key', 'value'],
    async callback(storage, [namespace, key, value]) {
      await storage.set(namespace, key, JSON5.parse(value));
    },
  },
  update: {
    description: 'Patches an already existing entry in namespace.',
    args: ['namespace', 'key', 'value'],
    async callback(storage, [namespace, key, value]) {
      console.log(
        renderValue(await storage.update(namespace, key, JSON5.parse(value)))
      );
    },
  },
  delete: {
    description: 'Deletes an entry from namespace.',
    args: ['namespace', 'key'],
    async callback(storage, [namespace, key]) {
      if (!(await storage.delete(namespace, key))) {
        console.error('Item does not exist.');
      }
    },
  },
};

export const commandNames: Readonly<string[]> = Object.keys(commands).sort();

export const runCommand = async (
  storage: Storage,
  input: string
): Promise<void> => {
  const args = tokenize(input);
  let command: CommandDefinition;

  if (args.length === 0) {
    return;
  } else if (!(command = commands[args[0]])) {
    throw new Error(`Unknown command: ${args[0]}`);
  }

  const arity = command.args?.length ?? 0;

  if (args.length - 1 < arity) {
    throw new Error(`Missing arguments for command ${args[0]}`);
  } else if (args.length - 1 > arity) {
    throw new Error(`Too many arguments for command ${args[0]}`);
  }

  await command.callback(storage, args.slice(1));
};
