/*
  Warnings:

  - You are about to drop the column `alert` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Alert" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "symptomFingerprint" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "alert";

-- CreateTable
CREATE TABLE "UserAlert" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "alertId" INTEGER NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRead" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAlert_userId_alertId_key" ON "UserAlert"("userId", "alertId");

-- AddForeignKey
ALTER TABLE "UserAlert" ADD CONSTRAINT "UserAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAlert" ADD CONSTRAINT "UserAlert_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE CASCADE ON UPDATE CASCADE;
