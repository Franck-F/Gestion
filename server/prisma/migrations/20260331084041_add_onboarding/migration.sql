-- AlterTable
ALTER TABLE "users" ADD COLUMN     "goalType" TEXT,
ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;
