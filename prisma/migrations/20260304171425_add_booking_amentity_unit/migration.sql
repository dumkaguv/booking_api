-- CreateEnum
CREATE TYPE "BookingStatusEnum" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ListingStatusEnum" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ListingTypeEnum" AS ENUM ('APARTMENT', 'HOUSE', 'VILLA', 'HOTEL', 'HOSTEL', 'ROOM');

-- CreateEnum
CREATE TYPE "UnitCalendarDayStateEnum" AS ENUM ('AVAILABLE', 'BLOCKED');

-- CreateTable
CREATE TABLE "Amenity" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "color" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Amenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingDay" (
    "id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "BookingDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" SERIAL NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "guest_id" INTEGER NOT NULL,
    "listing_id" INTEGER,
    "check_in" DATE NOT NULL,
    "check_out" DATE NOT NULL,
    "guests_count" INTEGER NOT NULL,
    "status" "BookingStatusEnum" NOT NULL DEFAULT 'PENDING',
    "total_amount" DECIMAL(65,30) NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "confirmed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "cancel_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingUnit" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "listing_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),
    "status" "ListingStatusEnum" DEFAULT 'DRAFT',
    "type" "ListingTypeEnum" NOT NULL,
    "country" VARCHAR(255) NOT NULL,
    "city" VARCHAR(255) NOT NULL,
    "address_line" VARCHAR(255) NOT NULL,
    "base_price" DECIMAL(65,30) NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "max_guests" INTEGER NOT NULL,
    "check_in_from" TIMESTAMP(3) NOT NULL,
    "check_out_until" TIMESTAMP(3) NOT NULL,
    "instant_book" BOOLEAN NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "listing_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitCalendarDay" (
    "id" SERIAL NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "state" "UnitCalendarDayStateEnum" NOT NULL DEFAULT 'AVAILABLE',
    "price_override" DECIMAL(65,30),
    "min_nights" INTEGER,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnitCalendarDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AmenityToListing" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AmenityToListing_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Amenity_code_key" ON "Amenity"("code");

-- CreateIndex
CREATE INDEX "BookingDay_booking_id_idx" ON "BookingDay"("booking_id");

-- CreateIndex
CREATE INDEX "BookingDay_date_idx" ON "BookingDay"("date");

-- CreateIndex
CREATE UNIQUE INDEX "BookingDay_unit_id_date_key" ON "BookingDay"("unit_id", "date");

-- CreateIndex
CREATE INDEX "Booking_unit_id_idx" ON "Booking"("unit_id");

-- CreateIndex
CREATE INDEX "Booking_guest_id_idx" ON "Booking"("guest_id");

-- CreateIndex
CREATE INDEX "Booking_listing_id_idx" ON "Booking"("listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "Review_booking_id_key" ON "Review"("booking_id");

-- CreateIndex
CREATE INDEX "Review_listing_id_idx" ON "Review"("listing_id");

-- CreateIndex
CREATE INDEX "Review_author_id_idx" ON "Review"("author_id");

-- CreateIndex
CREATE INDEX "UnitCalendarDay_date_idx" ON "UnitCalendarDay"("date");

-- CreateIndex
CREATE UNIQUE INDEX "UnitCalendarDay_unit_id_date_key" ON "UnitCalendarDay"("unit_id", "date");

-- CreateIndex
CREATE INDEX "_AmenityToListing_B_index" ON "_AmenityToListing"("B");

-- AddForeignKey
ALTER TABLE "BookingDay" ADD CONSTRAINT "BookingDay_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingDay" ADD CONSTRAINT "BookingDay_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "ListingUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "ListingUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingUnit" ADD CONSTRAINT "ListingUnit_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitCalendarDay" ADD CONSTRAINT "UnitCalendarDay_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "ListingUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AmenityToListing" ADD CONSTRAINT "_AmenityToListing_A_fkey" FOREIGN KEY ("A") REFERENCES "Amenity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AmenityToListing" ADD CONSTRAINT "_AmenityToListing_B_fkey" FOREIGN KEY ("B") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
