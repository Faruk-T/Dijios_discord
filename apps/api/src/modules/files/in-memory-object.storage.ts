import { Injectable } from "@nestjs/common";
import type { ObjectStoragePort, StoredObject } from "./object-storage.port.js";

@Injectable()
export class InMemoryObjectStorage implements ObjectStoragePort {
  private readonly objects: StoredObject[] = [];

  save(object: StoredObject): void {
    this.objects.push(object);
  }

  find(id: string): StoredObject | null {
    return this.objects.find((item) => item.id === id) ?? null;
  }
}
