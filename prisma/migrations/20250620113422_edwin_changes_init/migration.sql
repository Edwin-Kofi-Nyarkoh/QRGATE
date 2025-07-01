-- CreateTable
CREATE TABLE "About" (
    "id" TEXT NOT NULL,
    "mission" TEXT NOT NULL,
    "vision" TEXT NOT NULL,
    "story" TEXT NOT NULL,
    "founded" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "teamSize" INTEGER NOT NULL,
    "eventsHosted" INTEGER NOT NULL,
    "happyCustomers" INTEGER NOT NULL,
    "values" TEXT,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactWebsite" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "About_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "aboutId" TEXT NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_aboutId_fkey" FOREIGN KEY ("aboutId") REFERENCES "About"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
