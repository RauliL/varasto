import { Storage } from '@varasto/storage';
import JSON5 from 'json5';
import { colorize } from 'json-colorizer';

import { tokenize } from './tokenizer';

export type CommandDefinition = {
  description: string;
  args?: string[];
  optionalArgs?: string[];
  callback: (storage: Storage, args: string[]) => Promise<void>;
};

export class CommandError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CommandError';
  }
}

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
    description: 'Displays information about commands.',
    optionalArgs: ['command'],
    async callback(storage, args) {
      if (args.length === 0) {
        for (const name of commandNames) {
          const definition = commands[name];

          console.log(`${name} ${renderUsage(definition)}`.trim());
          console.log(definition.description);
          console.log();
        }
        return;
      }

      const [command] = args;
      const definition = commands[command];

      if (definition) {
        console.log(`${command} ${renderUsage(definition)}`.trim());
        console.log(definition.description);
      } else {
        throw new CommandError(`Unknown command: ${command}`);
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
      if (key === '*') {
        for await (const key of storage.keys(namespace)) {
          console.log(
            renderValue({
              [key]: await storage.update(namespace, key, JSON5.parse(value)),
            })
          );
        }
      } else {
        console.log(
          renderValue(await storage.update(namespace, key, JSON5.parse(value)))
        );
      }
    },
  },
  delete: {
    description: 'Deletes an entry from namespace.',
    args: ['namespace', 'key'],
    async callback(storage, [namespace, key]) {
      if (key === '*') {
        for await (const key of storage.keys(namespace)) {
          await storage.delete(namespace, key);
        }
      } else {
        if (!(await storage.delete(namespace, key))) {
          console.error('Item does not exist.');
        }
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
    throw new CommandError(`Unknown command: ${args[0]}`);
  }

  const minArity = command.args?.length ?? 0;
  const maxArity = minArity + (command.optionalArgs?.length ?? 0);
  const providedArity = args.length - 1;

  if (providedArity < minArity) {
    throw new CommandError(`Missing arguments for command ${args[0]}`);
  } else if (providedArity > maxArity) {
    throw new CommandError(`Too many arguments for command ${args[0]}`);
  }

  await command.callback(storage, args.slice(1));
};
