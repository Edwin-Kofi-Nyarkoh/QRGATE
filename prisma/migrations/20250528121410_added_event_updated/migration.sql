/*
  Warnings:

  - You are about to drop the column `contactOrg` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `emailOrg` on the `Event` table. All the data in the column will be lost.
  - Added the required column `organiserContact` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organiserEmail` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "contactOrg",
DROP COLUMN "emailOrg",
ADD COLUMN     "organiserContact" TEXT NOT NULL,
ADD COLUMN     "organiserEmail" TEXT NOT NULL;
