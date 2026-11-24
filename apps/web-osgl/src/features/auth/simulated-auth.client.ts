import type { MockPersonaSummary } from "@dijios-connect/contracts";
import type { AuthClientPort, ClientSession } from "./auth-client.port.js";

const FEN = {
  institutionId: "018f0000-0000-7000-8000-000000000001",
  institutionAlias: "fen-koleji",
  institutionName: "Örnek Fen ve Teknoloji Koleji",
  primaryColor: "#002147",
} as const;

export const DEV_PERSONAS: readonly MockPersonaSummary[] = [
  persona("founder.fen", "Ayşe Kurucu", "FOUNDER", "Yönetim", "Kurucu"),
  persona("principal.fen", "Mehmet Müdür", "PRINCIPAL", "İdare", "Kampüs Müdürü"),
  persona("math.head.fen", "Zeynep Başaran", "DEPT_HEAD", "Matematik", "Matematik Zümre Başkanı"),
  persona("physics.fen", "Can Fizik", "TEACHER", "Fizik", "Fizik Öğretmeni"),
  persona("counselor.fen", "Elif Rehber", "COUNSELOR", "PDR", "PDR Uzmanı"),
  persona("duty.fen", "Burak Nöbet", "TEACHER", "Nöbet", "Nöbetçi Öğretmen"),
];

function persona(
  dijiosUserId: string,
  fullName: string,
  systemRole: MockPersonaSummary["systemRole"],
  branchName: string,
  title: string,
): MockPersonaSummary {
  return {
    dijiosUserId,
    fullName,
    systemRole,
    branchName,
    title,
    institutionAlias: FEN.institutionAlias,
    institutionName: FEN.institutionName,
  };
}

function sessionFor(person: MockPersonaSummary): ClientSession {
  return {
    accessToken: `simulated.${person.dijiosUserId}`,
    userId: person.dijiosUserId,
    fullName: person.fullName,
    systemRole: person.systemRole,
    branchName: person.branchName,
    title: person.title,
    institutionId: FEN.institutionId,
    institutionAlias: FEN.institutionAlias,
    institutionName: FEN.institutionName,
    primaryColor: FEN.primaryColor,
  };
}

export class SimulatedAuthClient implements AuthClientPort {
  login(input: { institutionAlias: string; dijiosUserId: string }): Promise<ClientSession> {
    const person = DEV_PERSONAS.find(
      (item) =>
        item.institutionAlias === input.institutionAlias &&
        item.dijiosUserId === input.dijiosUserId,
    );
    if (person === undefined) {
      return Promise.reject(new Error("Simulated teacher was not found."));
    }
    return Promise.resolve(sessionFor(person));
  }

  exchangeDijiosToken(input: { exchangeToken: string }): Promise<ClientSession> {
    return this.login({
      institutionAlias: FEN.institutionAlias,
      dijiosUserId: input.exchangeToken,
    });
  }

  refresh(): Promise<ClientSession> {
    const person = DEV_PERSONAS[0];
    if (person === undefined) {
      return Promise.reject(new Error("Simulated directory is empty."));
    }
    return Promise.resolve(sessionFor(person));
  }

  logout(): Promise<void> {
    return Promise.resolve();
  }

  listPersonas(): Promise<readonly MockPersonaSummary[]> {
    return Promise.resolve(DEV_PERSONAS);
  }
}
