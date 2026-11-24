import { SetMetadata } from "@nestjs/common";
import type { ChannelPermissionFlags } from "@dijios-connect/contracts";

export const CHANNEL_PERMISSION_KEY = "channelPermission";

export type ChannelPermissionFlag = keyof ChannelPermissionFlags;

export const RequireChannelPermission = (flag: ChannelPermissionFlag): MethodDecorator =>
  SetMetadata(CHANNEL_PERMISSION_KEY, flag);
