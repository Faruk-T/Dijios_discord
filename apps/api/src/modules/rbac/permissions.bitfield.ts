import type { ChannelPermissionFlags } from "@dijios-connect/contracts";

export const PERMISSION_BITS = {
  VIEW_CHANNEL: 1n << 0n,
  SEND_MESSAGES: 1n << 1n,
  CONNECT_VOICE: 1n << 2n,
  SPEAK: 1n << 3n,
  SHARE_SCREEN: 1n << 4n,
  MUTE_MEMBERS: 1n << 5n,
  MANAGE_CHANNEL: 1n << 6n,
  ACCESS_PDR_CONFIDENTIAL: 1n << 7n,
  MANAGE_INSTITUTION: 1n << 8n,
} as const;

export type PermissionBitName = keyof typeof PERMISSION_BITS;

export function hasPermissionBit(bits: bigint, bit: bigint): boolean {
  return (bits & bit) === bit;
}

export function toChannelPermissionFlags(bits: bigint): ChannelPermissionFlags {
  return {
    canView: hasPermissionBit(bits, PERMISSION_BITS.VIEW_CHANNEL),
    canSendMessages: hasPermissionBit(bits, PERMISSION_BITS.SEND_MESSAGES),
    canConnectVoice: hasPermissionBit(bits, PERMISSION_BITS.CONNECT_VOICE),
    canSpeak: hasPermissionBit(bits, PERMISSION_BITS.SPEAK),
    canShareScreen: hasPermissionBit(bits, PERMISSION_BITS.SHARE_SCREEN),
    canManageChannel: hasPermissionBit(bits, PERMISSION_BITS.MANAGE_CHANNEL),
  };
}
