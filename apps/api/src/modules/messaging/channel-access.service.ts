import type { ChannelPermissionFlags } from "@dijios-connect/contracts";
import { Inject, Injectable } from "@nestjs/common";
import type { AuthContext } from "../../common/auth/auth-context.js";
import {
  PdrAccessDeniedException,
  TenantForbiddenException,
  ValidationDomainException,
} from "../../common/errors/domain.exception.js";
import { RbacEvaluatorService } from "../rbac/rbac-evaluator.service.js";
import type { StoredChannel } from "../workspaces/workspace-store.port.js";
import { DepartmentProvisionerService } from "../workspaces/department-provisioner.service.js";

@Injectable()
export class ChannelAccessService {
  constructor(
    @Inject(DepartmentProvisionerService)
    private readonly provisioner: DepartmentProvisionerService,
    @Inject(RbacEvaluatorService) private readonly rbac: RbacEvaluatorService,
  ) {}

  require(auth: AuthContext, channelId: string, send: boolean): StoredChannel {
    const workspace = this.provisioner.ensure(auth.institutionId, "Kurum");
    const channel = workspace.channels.find((item) => item.id === channelId);
    if (channel === undefined) {
      throw new ValidationDomainException("Channel was not found in this institution.");
    }
    const decision = this.rbac.evaluate({
      systemRole: auth.systemRole,
      branchName: auth.branchName,
      channelType: channel.type,
      channelBranchName: channel.branchName,
      isPdrConfidential: channel.isPdrConfidential,
      allowBits: 0n,
      denyBits: 0n,
    });
    if (!decision.ok) {
      throw new PdrAccessDeniedException();
    }
    if (send && !decision.permissions.flags.canSendMessages) {
      throw new TenantForbiddenException("This channel does not allow messages from this role.");
    }
    return channel;
  }

  flags(auth: AuthContext, channel: StoredChannel): ChannelPermissionFlags {
    const decision = this.rbac.evaluate({
      systemRole: auth.systemRole,
      branchName: auth.branchName,
      channelType: channel.type,
      channelBranchName: channel.branchName,
      isPdrConfidential: channel.isPdrConfidential,
      allowBits: 0n,
      denyBits: 0n,
    });
    if (!decision.ok) {
      throw new PdrAccessDeniedException();
    }
    return decision.permissions.flags;
  }

  canPin(auth: AuthContext, channel: StoredChannel): boolean {
    if (auth.systemRole === "FOUNDER" || auth.systemRole === "PRINCIPAL") {
      return true;
    }
    return auth.systemRole === "DEPT_HEAD" && channel.branchName === auth.branchName;
  }
}
