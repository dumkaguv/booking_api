-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "avatar_file_id" INTEGER;

-- CreateTable
CREATE TABLE "File" (
    "id" SERIAL NOT NULL,
    "public_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" VARCHAR(50),
    "user_id" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingFile" (
    "id" SERIAL NOT NULL,
    "listing_id" INTEGER NOT NULL,
    "file_id" INTEGER NOT NULL,
    "order_index" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewFile" (
    "id" SERIAL NOT NULL,
    "review_id" INTEGER NOT NULL,
    "file_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_avatar_file_id_key" ON "Profile"("avatar_file_id");

-- CreateIndex
CREATE INDEX "File_user_id_idx" ON "File"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ListingFile_listing_id_file_id_key" ON "ListingFile"("listing_id", "file_id");

-- CreateIndex
CREATE INDEX "ListingFile_file_id_idx" ON "ListingFile"("file_id");

-- CreateIndex
CREATE INDEX "ListingFile_listing_id_idx" ON "ListingFile"("listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewFile_review_id_file_id_key" ON "ReviewFile"("review_id", "file_id");

-- CreateIndex
CREATE INDEX "ReviewFile_file_id_idx" ON "ReviewFile"("file_id");

-- CreateIndex
CREATE INDEX "ReviewFile_review_id_idx" ON "ReviewFile"("review_id");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_avatar_file_id_fkey" FOREIGN KEY ("avatar_file_id") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingFile" ADD CONSTRAINT "ListingFile_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingFile" ADD CONSTRAINT "ListingFile_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewFile" ADD CONSTRAINT "ReviewFile_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewFile" ADD CONSTRAINT "ReviewFile_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;
