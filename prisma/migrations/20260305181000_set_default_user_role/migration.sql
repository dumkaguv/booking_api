-- Ensure USER role exists.
INSERT INTO "Role" ("code")
VALUES ('USER'::"RolesEnum")
ON CONFLICT ("code") DO NOTHING;

-- Backfill existing users without role.
UPDATE "User" AS u
SET "role_id" = r."id"
FROM "Role" AS r
WHERE u."role_id" IS NULL
  AND r."code" = 'USER'::"RolesEnum";

-- DB-level default role assignment on insert.
CREATE OR REPLACE FUNCTION set_default_user_role_id()
RETURNS TRIGGER AS $$
DECLARE
  default_role_id INTEGER;
BEGIN
  IF NEW."role_id" IS NULL THEN
    SELECT "id"
    INTO default_role_id
    FROM "Role"
    WHERE "code" = 'USER'::"RolesEnum"
    LIMIT 1;

    NEW."role_id" := default_role_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_default_user_role_id ON "User";

CREATE TRIGGER trg_set_default_user_role_id
BEFORE INSERT ON "User"
FOR EACH ROW
EXECUTE FUNCTION set_default_user_role_id();
