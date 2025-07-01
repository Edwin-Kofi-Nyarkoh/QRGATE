-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SECURITY';

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "ticketTypeId" TEXT;

-- CreateTable
CREATE TABLE "ticket_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "soldCount" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "ticket_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_officers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "security_officers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ticket_types" ADD CONSTRAINT "ticket_types_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "ticket_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_officers" ADD CONSTRAINT "security_officers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_officers" ADD CONSTRAINT "security_officers_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
