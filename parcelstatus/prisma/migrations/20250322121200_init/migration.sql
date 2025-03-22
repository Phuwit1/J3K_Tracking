-- CreateEnum
CREATE TYPE "ParcelStatus" AS ENUM ('PENDING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'EXCEPTION');

-- CreateTable
CREATE TABLE "Status" (
    "id" SERIAL NOT NULL,
    "parcelId" INTEGER NOT NULL,
    "status" "ParcelStatus" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "location" TEXT,

    CONSTRAINT "Status_pkey" PRIMARY KEY ("id")
);
