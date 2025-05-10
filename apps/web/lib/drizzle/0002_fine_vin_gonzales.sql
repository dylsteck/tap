CREATE TABLE IF NOT EXISTS "farcaster_apps" (
	"slug" varchar(256) PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"tag" varchar(256) NOT NULL,
	"description" varchar(256) NOT NULL,
	"image_url" varchar(256) NOT NULL,
	"screenshots" json NOT NULL,
	"url" varchar(256) NOT NULL,
	"spotlight_image_url" varchar(256),
	"color" varchar(256),
	"author_fid" varchar(64)
);
