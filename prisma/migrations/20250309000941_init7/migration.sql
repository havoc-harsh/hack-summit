/*
  Warnings:

  - You are about to drop the column `userId` on the `MedicalProfile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `MedicalProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "MedicalProfile" DROP CONSTRAINT "MedicalProfile_userId_fkey";

-- DropIndex
DROP INDEX "MedicalProfile_userId_key";

-- AlterTable
ALTER TABLE "MedicalProfile" DROP COLUMN "userId",
ADD COLUMN     "care_instructions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "user_id" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "MedicalProfile_user_id_key" ON "MedicalProfile"("user_id");

-- AddForeignKey
ALTER TABLE "MedicalProfile" ADD CONSTRAINT "MedicalProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
