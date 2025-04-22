/*
  Warnings:

  - The primary key for the `Url` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Visit" DROP CONSTRAINT "Visit_urlId_fkey";

-- AlterTable
ALTER TABLE "Url" DROP CONSTRAINT "Url_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Url_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Url_id_seq";

-- AlterTable
ALTER TABLE "Visit" ALTER COLUMN "urlId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_urlId_fkey" FOREIGN KEY ("urlId") REFERENCES "Url"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
