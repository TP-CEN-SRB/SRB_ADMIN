/*
  Warnings:

  - Added the required column `updatedAt` to the `quest_template` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "quest_template" ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 7,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
