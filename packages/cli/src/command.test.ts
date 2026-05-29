import { createMemoryStorage } from '@varasto/memory-storage';
import { describe, expect, it, vi } from 'vitest';

import { CommandError, commandNames, runCommand } from './command';

describe('runCommand()', () => {
  it('should list all commands when help is called without arguments', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    await runCommand(createMemoryStorage(), 'help');

    expect(log).toHaveBeenCalledTimes(commandNames.length * 3);

    for (const name of commandNames) {
      expect(log).toHaveBeenCalledWith(expect.stringContaining(name));
    }

    log.mockRestore();
  });

  it('should display help for a specific command', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    await runCommand(createMemoryStorage(), 'help get');

    expect(log).toHaveBeenCalledWith('get <namespace> <key>');
    expect(log).toHaveBeenCalledWith('Retrieves an entry from an namespace.');

    log.mockRestore();
  });

  it('should reject help for an unknown command', async () => {
    await expect(
      runCommand(createMemoryStorage(), 'help foo')
    ).rejects.toThrow(CommandError);
  });
});
