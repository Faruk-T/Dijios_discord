import type { AcademicSystemRole, ChannelType } from "@dijios-connect/contracts";
import { Injectable } from "@nestjs/common";
import {
  hasPermissionBit,
  PERMISSION_BITS,
  toChannelPermissionFlags,
} from "./permissions.bitfield.js";

const MEMBER_BITS =
  PERMISSION_BITS.VIEW_CHANNEL |
  PERMISSION_BITS.SEND_MESSAGES |
  PERMISSION_BITS.CONNECT_VOICE |
  PERMISSION_BITS.SPEAK |
  PERMISSION_BITS.SHARE_SCREEN;

const LEADER_BITS =
  MEMBER_BITS |
  PERMISSION_BITS.MUTE_MEMBERS |
  PERMISSION_BITS.MANAGE_CHANNEL |
  PERMISSION_BITS.MANAGE_INSTITUTION;

const COUNSELOR_PDR_BITS =
  PERMISSION_BITS.VIEW_CHANNEL |
  PERMISSION_BITS.SEND_MESSAGES |
  PERMISSION_BITS.CONNECT_VOICE |
  PERMISSION_BITS.SPEAK |
  PERMISSION_BITS.ACCESS_PDR_CONFIDENTIAL;

export interface ChannelPermissionQuery {
  readonly systemRole: AcademicSystemRole;
  readonly branchName: string;
  readonly channelType: ChannelType;
  readonly channelBranchName: string | null;
  readonly isPdrConfidential: boolean;
  readonly allowBits: bigint;
  readonly denyBits: bigint;
}

export interface PermissionSnapshot {
  readonly bits: bigint;
  readonly flags: ReturnType<typeof toChannelPermissionFlags>;
  readonly canMuteMembers: boolean;
  readonly canAccessPdrConfidential: boolean;
  readonly canManageInstitution: boolean;
}

export type PermissionDecision =
  | { readonly ok: true; readonly permissions: PermissionSnapshot }
  | { readonly ok: false; readonly code: "PDR_ACCESS_DENIED" };

function announcementCanPublish(role: AcademicSystemRole): boolean {
  return role === "FOUNDER" || role === "PRINCIPAL" || role === "DEPT_HEAD";
}

function roleBaseline(query: ChannelPermissionQuery): bigint {
  if (query.isPdrConfidential) {
    return query.systemRole === "COUNSELOR" ? COUNSELOR_PDR_BITS : 0n;
  }
  if (query.systemRole === "FOUNDER" || query.systemRole === "PRINCIPAL") {
    return LEADER_BITS;
  }
  let bits = MEMBER_BITS;
  if (query.channelType === "ANNOUNCEMENT" && !announcementCanPublish(query.systemRole)) {
    bits &= ~PERMISSION_BITS.SEND_MESSAGES;
  }
  if (query.systemRole === "DEPT_HEAD" && query.channelBranchName === query.branchName) {
    bits |= PERMISSION_BITS.MANAGE_CHANNEL | PERMISSION_BITS.MUTE_MEMBERS;
  }
  return bits;
}

function snapshot(bits: bigint): PermissionSnapshot {
  return {
    bits,
    flags: toChannelPermissionFlags(bits),
    canMuteMembers: hasPermissionBit(bits, PERMISSION_BITS.MUTE_MEMBERS),
    canAccessPdrConfidential: hasPermissionBit(bits, PERMISSION_BITS.ACCESS_PDR_CONFIDENTIAL),
    canManageInstitution: hasPermissionBit(bits, PERMISSION_BITS.MANAGE_INSTITUTION),
  };
}

@Injectable()
export class RbacEvaluatorService {
  evaluate(query: ChannelPermissionQuery): PermissionDecision {
    const bits = (roleBaseline(query) | query.allowBits) & ~query.denyBits;
    if (query.isPdrConfidential && !hasPermissionBit(bits, PERMISSION_BITS.VIEW_CHANNEL)) {
      return { ok: false, code: "PDR_ACCESS_DENIED" };
    }
    return { ok: true, permissions: snapshot(bits) };
  }
}
