// src/services/certificate.service.ts
import { APIConfig } from "@/lib/api.config";

// ==================== TYPES ====================

/** A certificate that has already been generated */
export interface GeneratedCertificate {
  id: string;
  courseId: string;
  courseTitle: string;
  courseImg: string;
  fileUrl: string;
  issuedAt: string;
}

/** A completed course that is eligible for certificate generation */
export interface EligibleCourse {
  courseId: string;
  courseTitle: string;
  courseImg: string;
}

/** An enrolled course that is not yet completed */
export interface IneligibleCourse {
  courseId: string;
  courseTitle: string;
  courseImg: string;
}

/** Response shape from GET /api/certificates/dashboardCertificate */
export interface CertificateDashboard {
  generated: GeneratedCertificate[];
  eligible: EligibleCourse[];
  ineligible: IneligibleCourse[];
}

// ==================== SERVICE ====================

export default class CertificateService {
  /**
   * Fetch all three certificate lists in a single round-trip.
   * Returns generated certificates, eligible courses, and ineligible courses.
   * STUDENT only.
   */
  static async getDashboard(): Promise<CertificateDashboard> {
    const response = await APIConfig.fetch("/certificates/dashboard");
    return response.json();
  }

  /**
   * List courses the student has completed but hasn't claimed a certificate for yet.
   * STUDENT only.
   */
  static async getEligible(): Promise<EligibleCourse[]> {
    const response = await APIConfig.fetch("/certificates/eligible");
    return response.json();
  }

  /**
   * List all certificates the student has already generated, newest first.
   * STUDENT only.
   */
  static async getMyCertificates(): Promise<GeneratedCertificate[]> {
    const response = await APIConfig.fetch("/certificates/me");
    return response.json();
  }

  /**
   * Generate (or retrieve an existing) certificate for a completed course.
   * Idempotent — returns the existing record if already generated.
   * STUDENT only.
   * @param courseId - ID of the completed course
   */
  static async generate(courseId: string): Promise<GeneratedCertificate> {
    const response = await APIConfig.fetch(`/certificates/${courseId}`, {
      method: "POST",
    });
    return response.json();
  }
}
