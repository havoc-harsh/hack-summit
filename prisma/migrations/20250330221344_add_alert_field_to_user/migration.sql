/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Alert` table. All the data in the column will be lost.
  - You are about to drop the column `symptomFingerprint` on the `Alert` table. All the data in the column will be lost.
  - You are about to drop the `UserAlert` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserAlert" DROP CONSTRAINT "UserAlert_alertId_fkey";

-- DropForeignKey
ALTER TABLE "UserAlert" DROP CONSTRAINT "UserAlert_userId_fkey";

-- AlterTable
ALTER TABLE "Alert" DROP COLUMN "createdAt",
DROP COLUMN "symptomFingerprint";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "alert" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- DropTable
DROP TABLE "UserAlert";
