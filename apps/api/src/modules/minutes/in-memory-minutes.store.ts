import { Injectable } from "@nestjs/common";
import type { MinutesStorePort, StoredMinutes } from "./minutes-store.port.js";

@Injectable()
export class InMemoryMinutesStore implements MinutesStorePort {
  private readonly records: StoredMinutes[] = [];

  list(institutionId: string, channelId: string): readonly StoredMinutes[] {
    return this.records.filter(
      (item) => item.institutionId === institutionId && item.channelId === channelId,
    );
  }

  find(institutionId: string, minutesId: string): StoredMinutes | null {
    return (
      this.records.find((item) => item.institutionId === institutionId && item.id === minutesId) ??
      null
    );
  }

  save(record: StoredMinutes): StoredMinutes {
    const index = this.records.findIndex((item) => item.id === record.id);
    if (index >= 0) {
      this.records.splice(index, 1, record);
      return record;
    }
    this.records.push(record);
    return record;
  }
}
