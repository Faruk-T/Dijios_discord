import { PrismaClient } from "@prisma/client";
import { SEED_CAMPUSES, SEED_INSTITUTIONS, SEED_TEACHERS } from "./seed-data.ts";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  for (const institution of SEED_INSTITUTIONS) {
    await prisma.institution.upsert({
      where: { id: institution.id },
      update: institution,
      create: institution,
    });
  }
  for (const campus of SEED_CAMPUSES) {
    await prisma.campus.upsert({ where: { id: campus.id }, update: campus, create: campus });
  }
  for (const teacher of SEED_TEACHERS) {
    const profile = {
      branchName: teacher.branchName,
      title: teacher.title,
    };
    await prisma.user.upsert({
      where: { id: teacher.id },
      update: {
        fullName: teacher.fullName,
        email: teacher.email,
        phone: teacher.phone,
        systemRole: teacher.systemRole,
      },
      create: {
        id: teacher.id,
        publicId: teacher.publicId,
        institutionId: teacher.institutionId,
        campusId: teacher.campusId,
        dijiosUserId: teacher.dijiosUserId,
        fullName: teacher.fullName,
        email: teacher.email,
        phone: teacher.phone,
        systemRole: teacher.systemRole,
        teacherProfile: { create: profile },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (caught: unknown) => {
    const message = caught instanceof Error ? caught.message : "Seed failed";
    console.error(message);
    await prisma.$disconnect();
    process.exit(1);
  });
