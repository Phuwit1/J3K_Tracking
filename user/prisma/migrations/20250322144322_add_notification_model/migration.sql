-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'EXCEPTION', 'CUSTOM');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('SMS', 'EMAIL', 'PUSH_NOTIFICATION');

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "parcelId" INTEGER NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "channel" "NotificationChannel"[],

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
