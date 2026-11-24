import type { CampusBroadcastAlert } from "@dijios-connect/contracts";
import { Inject, Injectable } from "@nestjs/common";
import type { AuthContext } from "../../common/auth/auth-context.js";
import { TenantForbiddenException } from "../../common/errors/domain.exception.js";
import { createUlid, parseUuidV7 } from "../../common/ids/id-generator.js";
import { CampusAlertEvents } from "../realtime/campus-alert.events.js";

@Injectable()
export class CampusBroadcastService {
  private readonly latest = new Map<string, CampusBroadcastAlert>();

  constructor(@Inject(CampusAlertEvents) private readonly events: CampusAlertEvents) {}

  publish(auth: AuthContext, message: string): CampusBroadcastAlert {
    if (auth.systemRole !== "FOUNDER" && auth.systemRole !== "PRINCIPAL") {
      throw new TenantForbiddenException("Only campus leadership can broadcast.");
    }
    const alert: CampusBroadcastAlert = {
      id: createUlid(),
      message,
      publishedAt: new Date().toISOString() as CampusBroadcastAlert["publishedAt"],
      publishedBy: parseUuidV7(auth.userId),
    };
    this.latest.set(auth.institutionId, alert);
    this.events.publish(auth.institutionId, alert);
    return alert;
  }

  current(auth: AuthContext): CampusBroadcastAlert | null {
    return this.latest.get(auth.institutionId) ?? null;
  }
}
