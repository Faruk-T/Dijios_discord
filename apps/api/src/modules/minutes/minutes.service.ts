import type { MeetingMinutesDocument, SaveMeetingMinutesDto } from "@dijios-connect/contracts";
import { Inject, Injectable } from "@nestjs/common";
import type { AuthContext } from "../../common/auth/auth-context.js";
import { ValidationDomainException } from "../../common/errors/domain.exception.js";
import { createUlid, createUuidV7, parseUlid, parseUuidV7 } from "../../common/ids/id-generator.js";
import {
  SCHOOL_DIRECTORY_PORT,
  type SchoolDirectoryPort,
} from "../directory/school-directory.port.js";
import { ChannelAccessService } from "../messaging/channel-access.service.js";
import { VoiceRoomsService } from "../media-livekit/voice-rooms.service.js";
import type { StoredChannel } from "../workspaces/workspace-store.port.js";
import { renderOfficialMinutes } from "./minutes-export.js";
import {
  MINUTES_STORE_PORT,
  type MinutesStorePort,
  type StoredMinutes,
} from "./minutes-store.port.js";

@Injectable()
export class MinutesService {
  constructor(
    @Inject(MINUTES_STORE_PORT) private readonly store: MinutesStorePort,
    @Inject(ChannelAccessService) private readonly access: ChannelAccessService,
    @Inject(SCHOOL_DIRECTORY_PORT) private readonly directory: SchoolDirectoryPort,
    @Inject(VoiceRoomsService) private readonly voice: VoiceRoomsService,
  ) {}

  list(auth: AuthContext, channelId: string): MeetingMinutesDocument[] {
    const channel = this.access.require(auth, channelId, false);
    this.seedMath(auth, channel);
    return this.store.list(auth.institutionId, channelId).map((item) => toDocument(item));
  }

  save(auth: AuthContext, channelId: string, dto: SaveMeetingMinutesDto): MeetingMinutesDocument {
    const channel = this.access.require(auth, channelId, true);
    this.seedMath(auth, channel);
    const now = new Date().toISOString();
    const existing =
      dto.minutesId === undefined ? null : this.store.find(auth.institutionId, dto.minutesId);
    const record: StoredMinutes = {
      id: existing?.id ?? createUuidV7(),
      publicId: existing?.publicId ?? createUlid(),
      institutionId: auth.institutionId,
      channelId,
      title: dto.title,
      markdownBody: dto.markdownBody,
      decisions: [...dto.decisions],
      attendees: mergeNames(existing?.attendees ?? [], this.liveAttendees(auth)),
      createdBy: existing?.createdBy ?? auth.userId,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    return toDocument(this.store.save(record));
  }

  exportMarkdown(auth: AuthContext, minutesId: string): string {
    const record = this.store.find(auth.institutionId, minutesId);
    if (record === null) {
      throw new ValidationDomainException("Minutes were not found.");
    }
    const channel = this.access.require(auth, record.channelId, false);
    const institution = this.directory.findInstitutionById(auth.institutionId);
    return renderOfficialMinutes({
      institutionName: institution?.name ?? "Kurum",
      departmentName: channel.branchName ?? channel.name,
      document: toDocument(record),
    });
  }

  private seedMath(auth: AuthContext, channel: StoredChannel): void {
    if (channel.slug !== "matematik-zumresi") {
      return;
    }
    if (this.store.list(auth.institutionId, channel.id).length > 0) {
      return;
    }
    const now = new Date().toISOString();
    this.store.save({
      id: createUuidV7(),
      publicId: createUlid(),
      institutionId: auth.institutionId,
      channelId: channel.id,
      title: "Matematik Zümre Tutanağı",
      markdownBody: "11. sınıf türev taraması ve ortak sınav takvimi görüşüldü.",
      decisions: [
        {
          id: "karar-turev",
          text: "11. Sınıf ortak türev taraması Cuma 3. ders uygulanacak",
          ownerName: "Zeynep Başaran",
          done: true,
        },
      ],
      attendees: ["Zeynep Başaran", "Can Fizik"],
      createdBy: auth.userId,
      createdAt: now,
      updatedAt: now,
    });
  }

  private liveAttendees(auth: AuthContext): readonly string[] {
    const teacher = this.directory.findTeacherById(auth.userId);
    return [teacher?.fullName ?? "Öğretmen", ...this.voice.activeNames(auth.institutionId)];
  }
}

function mergeNames(current: readonly string[], live: readonly string[]): string[] {
  return [...new Set([...current, ...live].filter((name) => name.length > 0))];
}

function toDocument(record: StoredMinutes): MeetingMinutesDocument {
  return {
    id: parseUuidV7(record.id),
    publicId: parseUlid(record.publicId),
    institutionId: parseUuidV7(record.institutionId),
    channelId: parseUuidV7(record.channelId),
    title: record.title,
    markdownBody: record.markdownBody,
    decisions: record.decisions,
    attendees: record.attendees,
    createdBy: parseUuidV7(record.createdBy),
    createdAt: record.createdAt as MeetingMinutesDocument["createdAt"],
    updatedAt: record.updatedAt as MeetingMinutesDocument["updatedAt"],
  };
}
