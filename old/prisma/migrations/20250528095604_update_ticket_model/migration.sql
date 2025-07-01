/*
  Warnings:

  - You are about to drop the column `title` on the `Event` table. All the data in the column will be lost.
  - The primary key for the `Ticket` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `qrToken` on the `Ticket` table. All the data in the column will be lost.
  - The `used` column on the `Ticket` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[slug]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `emailOrg` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `code` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Ticket_qrToken_key";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "title",
ADD COLUMN     "category" TEXT,
ADD COLUMN     "emailOrg" TEXT NOT NULL,
ADD COLUMN     "image" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL,
ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_pkey",
DROP COLUMN "qrToken",
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "isExpired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "quantity" INTEGER NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
DROP COLUMN "used",
ADD COLUMN     "used" INTEGER NOT NULL DEFAULT 0,
ADD CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Ticket_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_code_key" ON "Ticket"("code");
