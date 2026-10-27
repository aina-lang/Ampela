-- AlterTable
ALTER TABLE "Room" ADD COLUMN "userAClearedAt" TIMESTAMP(3),
ADD COLUMN "userBClearedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Message" ADD COLUMN "editedAt" TIMESTAMP(3),
ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "readAt" TIMESTAMP(3);
