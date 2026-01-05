import { Storage } from '@varasto/storage';
import readline from 'node:readline';

import { commandNames, runCommand } from './command';

const completer = (line: string): [Readonly<string[]>, string] => {
  const hits = commandNames.filter((command) => command.indexOf(line) === 0);

  return [hits.length ? hits : commandNames, line];
};

export const repl = (storage: Storage) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'varasto> ',
    completer,
  });

  rl.on('close', () => {
    process.exit(0);
  });

  rl.on('line', async (input) => {
    try {
      await runCommand(storage, input);
    } catch (err) {
      console.error(err);
    }
    rl.prompt();
  });

  rl.prompt();
};
