import type { Student360Summary } from "@dijios-connect/contracts";
import { Injectable } from "@nestjs/common";
import type { AuthContext } from "../../common/auth/auth-context.js";
import {
  TenantForbiddenException,
  ValidationDomainException,
} from "../../common/errors/domain.exception.js";
import { STUDENT_CATALOG } from "./student-catalog.js";

@Injectable()
export class StudentSummaryService {
  summarize(auth: AuthContext, studentCode: string): Student360Summary {
    const student = STUDENT_CATALOG.find((item) => item.studentCode === studentCode);
    if (student === undefined) {
      throw new ValidationDomainException("Student was not found.");
    }
    if (student.institutionId !== auth.institutionId) {
      throw new TenantForbiddenException();
    }
    return {
      studentCode: student.studentCode,
      fullName: student.fullName,
      gradeLabel: student.gradeLabel,
      gpa: student.gpa,
      attendanceRate: student.attendanceRate,
      examTrend: student.examTrend,
      academicAlert: student.academicAlert,
      pdrConfidentialNote: auth.systemRole === "COUNSELOR" ? student.note : null,
    };
  }
}
