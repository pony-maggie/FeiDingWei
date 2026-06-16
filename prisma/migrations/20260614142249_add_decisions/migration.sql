-- CreateTable
CREATE TABLE "Decision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "creatorId" TEXT,
    "roomId" TEXT NOT NULL,
    "sourceMessageId" TEXT,
    "sourceRunId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Decision_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Decision_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ProjectRoom" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Decision_sourceMessageId_fkey" FOREIGN KEY ("sourceMessageId") REFERENCES "Message" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Decision_sourceRunId_fkey" FOREIGN KEY ("sourceRunId") REFERENCES "AgentRun" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Decision_roomId_idx" ON "Decision"("roomId");

-- CreateIndex
CREATE INDEX "Decision_creatorId_idx" ON "Decision"("creatorId");

-- CreateIndex
CREATE INDEX "Decision_sourceMessageId_idx" ON "Decision"("sourceMessageId");

-- CreateIndex
CREATE INDEX "Decision_sourceRunId_idx" ON "Decision"("sourceRunId");
