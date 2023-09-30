import { Storage } from '@varasto/storage';

/**
 * Storage implementation which stores data in memory instead of hard disk.
 */
export abstract class MemoryStorage extends Storage {
  /**
   * Removes data from the storage. If namespace is given, all data from that
   * namespace is cleared. If namespace is omitted, all data from all
   * namespaces is cleared.
   */
  abstract clear(namespace?: string): void;
}
