const DEMO_USERS: Readonly<Record<string, string>> = {
  "ayse.kurucu@fen.k12.tr": "founder.fen",
  "mehmet.mudur@fen.k12.tr": "principal.fen",
  "zeynep.basaran@fen.k12.tr": "math.head.fen",
  "can.fizik@fen.k12.tr": "physics.fen",
  "elif.rehber@fen.k12.tr": "counselor.fen",
  "burak.nobet@fen.k12.tr": "duty.fen",
};

export function resolveDemoUser(value: string): string {
  const normalized = value.trim().toLowerCase();
  return DEMO_USERS[normalized] ?? normalized;
}
