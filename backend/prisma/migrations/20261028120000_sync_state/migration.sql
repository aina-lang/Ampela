-- Synchronisation multi-appareils : horodatages « le plus récent gagne ».
ALTER TABLE "User" ADD COLUMN "profileUpdatedAt" TIMESTAMP(3),
ADD COLUMN "preferences" JSONB,
ADD COLUMN "preferencesUpdatedAt" TIMESTAMP(3),
ADD COLUMN "cyclesUpdatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "hour" INTEGER NOT NULL DEFAULT 8,
    "minute" INTEGER NOT NULL DEFAULT 0,
    "frequency" TEXT NOT NULL DEFAULT 'quotidien',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reminder_userId_name_key" ON "Reminder"("userId", "name");

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
