CREATE TABLE IF NOT EXISTS "ApiConnection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projectId" uuid NOT NULL,
	"apiName" varchar NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"config" json
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Project" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"subdomain" varchar(63),
	"status" varchar DEFAULT 'draft' NOT NULL,
	"deploymentUrl" text,
	"thumbnailUrl" text,
	"isPublic" boolean DEFAULT true NOT NULL,
	"likesCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Project_subdomain_unique" UNIQUE("subdomain")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ProjectCode" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projectId" uuid NOT NULL,
	"files" json NOT NULL,
	"prompt" text,
	"version" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ProjectLike" (
	"userId" uuid NOT NULL,
	"projectId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ProjectLike_userId_projectId_pk" PRIMARY KEY("userId","projectId")
);
--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "walletAddress" varchar(42);--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "username" varchar(32);--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "avatarUrl" text;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "createdAt" timestamp DEFAULT now();--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ApiConnection" ADD CONSTRAINT "ApiConnection_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProjectCode" ADD CONSTRAINT "ProjectCode_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProjectLike" ADD CONSTRAINT "ProjectLike_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ProjectLike" ADD CONSTRAINT "ProjectLike_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "Chat" DROP COLUMN IF EXISTS "lastContext";