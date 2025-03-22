-- CreateTable
CREATE TABLE "Parcel" (
    "id" SERIAL NOT NULL,
    "trackingCode" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderAddress" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "recipientAddress" TEXT NOT NULL,
    "senderPhone" TEXT,
    "recipientPhone" TEXT,

    CONSTRAINT "Parcel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Parcel_trackingCode_key" ON "Parcel"("trackingCode");

-- CreateIndex
CREATE INDEX "Parcel_trackingCode_idx" ON "Parcel"("trackingCode");
