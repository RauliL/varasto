import { Storage } from '@varasto/storage';

export type MultiStorageConfig = Record<string, Storage | Storage[]>;
