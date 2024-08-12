/*
  Warnings:

  - You are about to alter the column `view` on the `TheSportsCenter` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "TheSportsCenter" ALTER COLUMN "view" SET DATA TYPE INTEGER;
