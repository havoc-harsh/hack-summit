/*
  Warnings:

  - You are about to drop the column `department` on the `Appointment` table. All the data in the column will be lost.
  - Added the required column `date` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `symptoms` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "department",
ADD COLUMN     "alert" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "symptoms" TEXT NOT NULL,
ALTER COLUMN "time" DROP DEFAULT,
ALTER COLUMN "time" SET DATA TYPE TEXT;
