import { describe, expect, it } from "vitest";
import { DijiosSanctumAuthAdapter } from "./dijios-sanctum.adapter.js";
import { MockSchoolAuthAdapter } from "./mock-school.adapter.js";

const founder = {
  userId: "018f0000-0000-7000-8000-000000000003",
  publicId: "01JFEN00000000000000000003",
  institutionId: "018f0000-0000-7000-8000-000000000001",
  institutionPublicId: "01JFEN000000000000000000A1",
  institutionAlias: "fen-koleji",
  institutionName: "Örnek Fen ve Teknoloji Koleji",
  primaryColor: "#002147",
  fullName: "Ayşe Kurucu",
  systemRole: "FOUNDER" as const,
  branchName: "Yönetim",
  title: "Kurucu",
  avatarUrl: null,
};

describe("auth provider substitution", () => {
  it("returns the same teacher shape from mock credentials and sanctum fetch", async () => {
    const mock = new MockSchoolAuthAdapter();
    const sanctum = new DijiosSanctumAuthAdapter("https://app.dijios.com", () => {
      return Promise.resolve(new Response(JSON.stringify(founder), { status: 200 }));
    });

    const fromMock = await mock.authenticateCredentials({
      institutionAlias: "fen-koleji",
      dijiosUserId: "founder.fen",
    });
    const fromSanctum = await sanctum.exchangeDijiosToken({ exchangeToken: "token" });

    expect(fromMock).toEqual(founder);
    expect(fromSanctum).toEqual(founder);
    expect(mock.listDevPersonas()).toHaveLength(6);
    expect(sanctum.listDevPersonas()).toEqual([]);
  });

  it("maps sanctum 401 and network failures to domain errors", async () => {
    const denied = new DijiosSanctumAuthAdapter("https://app.dijios.com", () => {
      return Promise.resolve(new Response("nope", { status: 401 }));
    });
    const offline = new DijiosSanctumAuthAdapter("https://app.dijios.com", () => {
      return Promise.reject(new Error("offline"));
    });

    await expect(
      denied.authenticateCredentials({ institutionAlias: "fen", dijiosUserId: "x" }),
    ).rejects.toMatchObject({
      problem: { code: "UNAUTHORIZED", status: 401 },
    });
    await expect(offline.exchangeDijiosToken({ exchangeToken: "x" })).rejects.toMatchObject({
      problem: { status: 503 },
    });
  });
});
