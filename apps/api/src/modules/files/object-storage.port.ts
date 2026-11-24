export interface StoredObject {
  readonly id: string;
  readonly institutionId: string;
  readonly channelId: string;
  readonly fileName: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly objectKey: string;
}

export interface ObjectStoragePort {
  save(object: StoredObject): void;
  find(id: string): StoredObject | null;
}

export const OBJECT_STORAGE_PORT = Symbol("OBJECT_STORAGE_PORT");
