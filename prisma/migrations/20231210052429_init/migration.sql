-- CreateTable
CREATE TABLE "Log" (
    "id" SERIAL NOT NULL,
    "event" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);
