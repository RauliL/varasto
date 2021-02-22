import { Storage } from '@varasto/storage';

export type MockStorage = Storage & {
  /**
   * Removes all data from the mock storage.
   */
  clear: () => void;
};
