-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "interviewDate" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "offerSalary" TEXT,
ADD COLUMN     "rejectionReason" TEXT;
