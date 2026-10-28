-- AlterTable
ALTER TABLE "User" ADD COLUMN "verificationStatus" TEXT NOT NULL DEFAULT 'none',
ADD COLUMN "verifiedAt" TIMESTAMP(3),
ADD COLUMN "verifiedBy" TEXT,
ADD COLUMN "fullName" TEXT,
ADD COLUMN "institution" TEXT,
ADD COLUMN "licenseNumber" TEXT;

-- Les professionnelles déjà enregistrées (seed) sont considérées vérifiées.
UPDATE "User" SET "verificationStatus" = 'verified', "verifiedAt" = CURRENT_TIMESTAMP, "verifiedBy" = 'migration' WHERE "role" = 'doctor';

-- CreateTable
CREATE TABLE "DoctorInvitation" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "code" TEXT NOT NULL,
    "note" TEXT,
    "createdBy" TEXT,
    "expiresAt" TIMESTAMP(3),
    "usedAt" TIMESTAMP(3),
    "usedById" TEXT,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DoctorInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DoctorInvitation_code_key" ON "DoctorInvitation"("code");

-- CreateIndex
CREATE INDEX "DoctorInvitation_email_idx" ON "DoctorInvitation"("email");
