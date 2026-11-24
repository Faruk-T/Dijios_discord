import type { CampusBroadcastAlert } from "@dijios-connect/contracts";
import { Injectable } from "@nestjs/common";

interface CampusSink {
  publish: (institutionId: string, alert: CampusBroadcastAlert) => void;
}

@Injectable()
export class CampusAlertEvents {
  private sink: CampusSink | null = null;

  bind(sink: CampusSink): void {
    this.sink = sink;
  }

  publish(institutionId: string, alert: CampusBroadcastAlert): void {
    this.sink?.publish(institutionId, alert);
  }
}
