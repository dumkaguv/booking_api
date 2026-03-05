-- Make User.role_id optional at DB level.
ALTER TABLE "User" ALTER COLUMN "role_id" DROP NOT NULL;
