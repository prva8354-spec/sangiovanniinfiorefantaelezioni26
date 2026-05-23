CREATE TABLE "election_results" (
	"id" serial PRIMARY KEY,
	"candidate_id" text NOT NULL UNIQUE,
	"candidate_type" text NOT NULL,
	"elected" boolean DEFAULT false,
	"elected_ballot" boolean DEFAULT false,
	"percentage" real,
	"list_above_threshold" boolean DEFAULT false,
	"list_id" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "live_updates" (
	"id" serial PRIMARY KEY,
	"mayor_id" text NOT NULL UNIQUE,
	"percentage" real,
	"sezioni_contate" integer DEFAULT 0,
	"sezioni_totali" integer DEFAULT 0,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" serial PRIMARY KEY,
	"user_id" text NOT NULL UNIQUE,
	"user_name" text NOT NULL,
	"team_name" text NOT NULL,
	"mayor_id" text NOT NULL,
	"councilors" json DEFAULT '[]' NOT NULL,
	"mayor_percentages" json DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
