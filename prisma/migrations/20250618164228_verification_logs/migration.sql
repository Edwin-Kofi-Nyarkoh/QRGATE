-- CreateTable
CREATE TABLE "verification_logs" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "securityOfficerId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "verification_logs_eventId_idx" ON "verification_logs"("eventId");

-- CreateIndex
CREATE INDEX "verification_logs_securityOfficerId_idx" ON "verification_logs"("securityOfficerId");

-- CreateIndex
CREATE INDEX "verification_logs_timestamp_idx" ON "verification_logs"("timestamp");

-- AddForeignKey
ALTER TABLE "verification_logs" ADD CONSTRAINT "verification_logs_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_logs" ADD CONSTRAINT "verification_logs_securityOfficerId_fkey" FOREIGN KEY ("securityOfficerId") REFERENCES "security_officers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_logs" ADD CONSTRAINT "verification_logs_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
