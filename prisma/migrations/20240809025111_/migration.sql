-- AlterTable
ALTER TABLE "User" ALTER COLUMN "avatar" DROP NOT NULL,
ALTER COLUMN "background" DROP NOT NULL,
ALTER COLUMN "isBlocked" DROP NOT NULL,
ALTER COLUMN "isDeleted" DROP NOT NULL;
