import { Inject, Injectable } from "@nestjs/common";
import { createUlid, createUuidV7 } from "../../common/ids/id-generator.js";
import { ACADEMIC_CHANNEL_BLUEPRINTS } from "./academic-channel.blueprints.js";
import type { StoredCategory, StoredChannel, StoredWorkspace } from "./workspace-store.port.js";
import { WORKSPACE_STORE_PORT, type WorkspaceStorePort } from "./workspace-store.port.js";

@Injectable()
export class DepartmentProvisionerService {
  constructor(@Inject(WORKSPACE_STORE_PORT) private readonly store: WorkspaceStorePort) {}

  ensure(institutionId: string, name: string): StoredWorkspace {
    const existing = this.store.findByInstitution(institutionId);
    if (existing !== null) {
      return existing;
    }
    const categories = uniqueCategories();
    const workspace: StoredWorkspace = {
      id: createUuidV7(),
      publicId: createUlid(),
      institutionId,
      name,
      categories,
      channels: ACADEMIC_CHANNEL_BLUEPRINTS.map((blueprint, index) =>
        toChannel(institutionId, categories, blueprint, index),
      ),
    };
    this.store.save(workspace);
    return workspace;
  }
}

function uniqueCategories(): readonly StoredCategory[] {
  const names: string[] = [];
  for (const blueprint of ACADEMIC_CHANNEL_BLUEPRINTS) {
    if (!names.includes(blueprint.category)) {
      names.push(blueprint.category);
    }
  }
  return names.map((categoryName, position) => ({
    id: createUuidV7(),
    publicId: createUlid(),
    name: categoryName,
    position,
  }));
}

function toChannel(
  institutionId: string,
  categories: readonly StoredCategory[],
  blueprint: (typeof ACADEMIC_CHANNEL_BLUEPRINTS)[number],
  index: number,
): StoredChannel {
  const category = categories.find((item) => item.name === blueprint.category);
  if (category === undefined) {
    throw new Error(`Missing category ${blueprint.category}`);
  }
  return {
    id: createUuidV7(),
    publicId: createUlid(),
    institutionId,
    categoryId: category.id,
    slug: blueprint.slug,
    name: blueprint.name,
    topic: blueprint.topic,
    type: blueprint.type,
    branchName: blueprint.branchName,
    isPrivate: blueprint.isPdrConfidential,
    isPdrConfidential: blueprint.isPdrConfidential,
    maxParticipants: blueprint.type === "TEXT" || blueprint.type === "ANNOUNCEMENT" ? null : 50,
    position: index,
  };
}
