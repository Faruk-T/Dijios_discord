import { Controller, Post, UseGuards } from "@nestjs/common";
import { ChannelPermissionGuard } from "./channel-permission.guard.js";
import { RequireChannelPermission } from "./require-channel-permission.decorator.js";

@Controller("rbac")
@UseGuards(ChannelPermissionGuard)
export class RbacController {
  @Post("view")
  @RequireChannelPermission("canView")
  view(): { readonly granted: true } {
    return { granted: true };
  }

  @Post("send")
  @RequireChannelPermission("canSendMessages")
  send(): { readonly granted: true } {
    return { granted: true };
  }

  @Post("manage")
  @RequireChannelPermission("canManageChannel")
  manage(): { readonly granted: true } {
    return { granted: true };
  }
}
