import { describe, expect, it } from "vitest";
import { PERMISSION_BITS } from "./permissions.bitfield.js";
import { RbacEvaluatorService, type ChannelPermissionQuery } from "./rbac-evaluator.service.js";

const evaluator = new RbacEvaluatorService();

function query(overrides: Partial<ChannelPermissionQuery>): ChannelPermissionQuery {
  return {
    systemRole: "TEACHER",
    branchName: "Fizik",
    channelType: "TEXT",
    channelBranchName: "Fizik",
    isPdrConfidential: false,
    allowBits: 0n,
    denyBits: 0n,
    ...overrides,
  };
}

describe("academic rbac evaluator", () => {
  it("grants founders and principals full standard-room authority without PDR access", () => {
    for (const systemRole of ["FOUNDER", "PRINCIPAL"] as const) {
      const decision = evaluator.evaluate(query({ systemRole, channelType: "VOICE" }));
      expect(decision.ok).toBe(true);
      if (!decision.ok) {
        return;
      }
      expect(decision.permissions.flags).toEqual({
        canView: true,
        canSendMessages: true,
        canConnectVoice: true,
        canSpeak: true,
        canShareScreen: true,
        canManageChannel: true,
      });
      expect(decision.permissions.canMuteMembers).toBe(true);
      expect(decision.permissions.canManageInstitution).toBe(true);
      expect(decision.permissions.canAccessPdrConfidential).toBe(false);
      expect(evaluator.evaluate(query({ systemRole, isPdrConfidential: true }))).toEqual({
        ok: false,
        code: "PDR_ACCESS_DENIED",
      });
    }
  });

  it("keeps confidential PDR rooms limited to counselors or an explicit allow bit", () => {
    const counselor = evaluator.evaluate(
      query({ systemRole: "COUNSELOR", branchName: "PDR", isPdrConfidential: true }),
    );
    expect(counselor.ok && counselor.permissions.canAccessPdrConfidential).toBe(true);
    const opened = evaluator.evaluate(
      query({
        systemRole: "FOUNDER",
        isPdrConfidential: true,
        allowBits: PERMISSION_BITS.VIEW_CHANNEL,
      }),
    );
    expect(opened.ok && opened.permissions.flags.canView).toBe(true);
    const revoked = evaluator.evaluate(
      query({
        systemRole: "COUNSELOR",
        isPdrConfidential: true,
        denyBits: PERMISSION_BITS.VIEW_CHANNEL,
      }),
    );
    expect(revoked).toEqual({ ok: false, code: "PDR_ACCESS_DENIED" });
  });

  it("lets only leadership publish in announcement channels", () => {
    const teacher = evaluator.evaluate(query({ channelType: "ANNOUNCEMENT" }));
    const counselor = evaluator.evaluate(
      query({ systemRole: "COUNSELOR", channelType: "ANNOUNCEMENT" }),
    );
    const head = evaluator.evaluate(
      query({ systemRole: "DEPT_HEAD", branchName: "Matematik", channelType: "ANNOUNCEMENT" }),
    );
    expect(teacher.ok && teacher.permissions.flags.canView).toBe(true);
    expect(teacher.ok && teacher.permissions.flags.canSendMessages).toBe(false);
    expect(counselor.ok && counselor.permissions.flags.canSendMessages).toBe(false);
    expect(head.ok && head.permissions.flags.canSendMessages).toBe(true);
  });
});

describe("channel overrides", () => {
  it("gives department heads moderation only inside their own branch channel", () => {
    const own = evaluator.evaluate(
      query({
        systemRole: "DEPT_HEAD",
        branchName: "Matematik",
        channelBranchName: "Matematik",
      }),
    );
    const other = evaluator.evaluate(
      query({
        systemRole: "DEPT_HEAD",
        branchName: "Matematik",
        channelBranchName: "Fizik",
      }),
    );
    expect(own.ok && own.permissions.flags.canManageChannel).toBe(true);
    expect(own.ok && own.permissions.canMuteMembers).toBe(true);
    expect(other.ok && other.permissions.flags.canManageChannel).toBe(false);
    expect(other.ok && other.permissions.canMuteMembers).toBe(false);
    expect(other.ok && other.permissions.flags.canView).toBe(true);
  });

  it("applies channel allow and deny bits after the role baseline", () => {
    const denied = evaluator.evaluate(
      query({ systemRole: "FOUNDER", denyBits: PERMISSION_BITS.SEND_MESSAGES }),
    );
    const promoted = evaluator.evaluate(
      query({ allowBits: PERMISSION_BITS.MANAGE_CHANNEL | PERMISSION_BITS.MUTE_MEMBERS }),
    );
    expect(denied.ok && denied.permissions.flags.canSendMessages).toBe(false);
    expect(denied.ok && denied.permissions.flags.canView).toBe(true);
    expect(promoted.ok && promoted.permissions.flags.canManageChannel).toBe(true);
    expect(promoted.ok && promoted.permissions.canMuteMembers).toBe(true);
  });
});
