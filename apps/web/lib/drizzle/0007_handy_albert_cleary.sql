DROP TABLE "farcaster_apps" CASCADE;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN IF EXISTS "signer_uuid";