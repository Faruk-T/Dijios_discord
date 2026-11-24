import type {
  AcademicSystemRole,
  ChannelPermissionFlags,
  ChannelType,
  ChannelWithOccupants,
  CreateChannelRequestDto,
  WorkspaceTreeResponse,
} from "@dijios-connect/contracts";
import { Inject, Injectable } from "@nestjs/common";
import type { AuthContext } from "../../common/auth/auth-context.js";
import {
  TenantForbiddenException,
  ValidationDomainException,
} from "../../common/errors/domain.exception.js";
import { createUlid, createUuidV7, parseUlid, parseUuidV7 } from "../../common/ids/id-generator.js";
import {
  SCHOOL_DIRECTORY_PORT,
  type SchoolDirectoryPort,
} from "../directory/school-directory.port.js";
import { RbacEvaluatorService } from "../rbac/rbac-evaluator.service.js";
import { DepartmentProvisionerService } from "./department-provisioner.service.js";
import type { StoredChannel, StoredWorkspace } from "./workspace-store.port.js";
import { WORKSPACE_STORE_PORT, type WorkspaceStorePort } from "./workspace-store.port.js";

@Injectable()
export class WorkspacesService {
  constructor(
    @Inject(WORKSPACE_STORE_PORT) private readonly store: WorkspaceStorePort,
    @Inject(DepartmentProvisionerService)
    private readonly provisioner: DepartmentProvisionerService,
    @Inject(RbacEvaluatorService) private readonly rbac: RbacEvaluatorService,
    @Inject(SCHOOL_DIRECTORY_PORT) private readonly directory: SchoolDirectoryPort,
  ) {}

  tree(auth: AuthContext): WorkspaceTreeResponse {
    const workspace = this.readyWorkspace(auth.institutionId);
    const categories = workspace.categories.map((category) => ({
      id: parseUuidV7(category.id),
      publicId: parseUlid(category.publicId),
      name: category.name,
      position: category.position,
      channels: workspace.channels
        .filter((channel) => channel.categoryId === category.id)
        .flatMap((channel) => this.visibleChannel(auth, channel)),
    }));
    return {
      workspaceId: parseUuidV7(workspace.id),
      institutionId: parseUuidV7(workspace.institutionId),
      categories,
    };
  }

  createChannel(auth: AuthContext, input: CreateChannelRequestDto): ChannelWithOccupants {
    const branchName = input.branchName ?? null;
    if (!mayCreate(auth.systemRole, auth.branchName, branchName)) {
      throw new TenantForbiddenException("This role cannot open that channel.");
    }
    const workspace = this.readyWorkspace(auth.institutionId);
    if (workspace.channels.some((channel) => channel.slug === input.slug)) {
      throw new ValidationDomainException("Channel slug already exists.");
    }
    const category = workspace.categories.find((item) => item.id === input.categoryId);
    if (category === undefined) {
      throw new ValidationDomainException("Channel category was not found.");
    }
    const created: StoredChannel = {
      id: createUuidV7(),
      publicId: createUlid(),
      institutionId: auth.institutionId,
      categoryId: category.id,
      slug: input.slug,
      name: input.name,
      topic: input.topic ?? null,
      type: input.type,
      branchName,
      isPrivate: input.isPrivate ?? false,
      isPdrConfidential: input.isPdrConfidential ?? false,
      maxParticipants: input.maxParticipants ?? null,
      position: workspace.channels.length,
    };
    this.store.save({ ...workspace, channels: [...workspace.channels, created] });
    const visible = this.visibleChannel(auth, created);
    const channel = visible[0];
    if (channel === undefined) {
      throw new TenantForbiddenException("Created channel is not visible to this role.");
    }
    return channel;
  }

  private readyWorkspace(institutionId: string): StoredWorkspace {
    const institution = this.directory.findInstitutionById(institutionId);
    return this.provisioner.ensure(institutionId, institution?.name ?? "Kurum");
  }

  private visibleChannel(
    auth: AuthContext,
    channel: StoredChannel,
  ): readonly ChannelWithOccupants[] {
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
      return [];
    }
    return [toChannel(channel, decision.permissions.flags)];
  }
}

function mayCreate(
  role: AcademicSystemRole,
  ownBranch: string,
  channelBranch: string | null,
): boolean {
  if (role === "FOUNDER" || role === "PRINCIPAL") {
    return true;
  }
  return role === "DEPT_HEAD" && channelBranch === ownBranch;
}

function toChannel(
  channel: StoredChannel,
  permissions: ChannelPermissionFlags,
): ChannelWithOccupants {
  return {
    id: parseUuidV7(channel.id),
    publicId: parseUlid(channel.publicId),
    institutionId: parseUuidV7(channel.institutionId),
    categoryId: parseUuidV7(channel.categoryId),
    slug: channel.slug,
    name: channel.name,
    topic: channel.topic,
    type: channel.type satisfies ChannelType,
    branchName: channel.branchName,
    isPrivate: channel.isPrivate,
    isPdrConfidential: channel.isPdrConfidential,
    maxParticipants: channel.maxParticipants,
    position: channel.position,
    permissions,
    occupants: [],
  };
}
