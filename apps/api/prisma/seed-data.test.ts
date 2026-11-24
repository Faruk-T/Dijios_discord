import { describe, expect, it } from "vitest";
import { SEED_INSTITUTIONS, SEED_TEACHERS } from "./seed-data.ts";

describe("school seed", () => {
  it("defines two institutions and six fen teachers", () => {
    expect(SEED_INSTITUTIONS.map((institution) => institution.primaryColor)).toEqual([
      "#002147",
      "#1D3557",
    ]);
    expect(SEED_TEACHERS.map((teacher) => teacher.systemRole)).toEqual([
      "FOUNDER",
      "PRINCIPAL",
      "DEPT_HEAD",
      "TEACHER",
      "COUNSELOR",
      "TEACHER",
    ]);
    expect(new Set(SEED_TEACHERS.map((teacher) => teacher.dijiosUserId)).size).toBe(6);
  });
});
