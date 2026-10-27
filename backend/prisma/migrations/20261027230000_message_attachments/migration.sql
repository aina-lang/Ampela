-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "text" SET DEFAULT '',
ADD COLUMN "attachmentType" TEXT,
ADD COLUMN "attachmentUrl" TEXT,
ADD COLUMN "attachmentName" TEXT,
ADD COLUMN "attachmentSize" INTEGER,
ADD COLUMN "durationMs" INTEGER;
