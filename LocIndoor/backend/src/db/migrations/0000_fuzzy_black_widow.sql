CREATE TABLE "beacon_readings" (
	"id" serial PRIMARY KEY NOT NULL,
	"beacon_id" integer,
	"user_id" uuid,
	"rssi" integer NOT NULL,
	"distance" integer,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "beacons" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" text NOT NULL,
	"major" integer NOT NULL,
	"minor" integer NOT NULL,
	"name" text NOT NULL,
	"location" json NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "beacons_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"floor" integer NOT NULL,
	"coordinates" json NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "navigation_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"start_location" integer,
	"end_location" integer,
	"start_time" timestamp DEFAULT now(),
	"end_time" timestamp,
	"status" text NOT NULL,
	"route" json,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"location_id" integer,
	"beacon_id" integer,
	"signal_strength" integer,
	"accuracy" integer,
	"timestamp" timestamp DEFAULT now(),
	"coordinates" json
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"avatar" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "beacon_readings" ADD CONSTRAINT "beacon_readings_beacon_id_beacons_id_fk" FOREIGN KEY ("beacon_id") REFERENCES "public"."beacons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beacon_readings" ADD CONSTRAINT "beacon_readings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "navigation_sessions" ADD CONSTRAINT "navigation_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "navigation_sessions" ADD CONSTRAINT "navigation_sessions_start_location_locations_id_fk" FOREIGN KEY ("start_location") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "navigation_sessions" ADD CONSTRAINT "navigation_sessions_end_location_locations_id_fk" FOREIGN KEY ("end_location") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_locations" ADD CONSTRAINT "user_locations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_locations" ADD CONSTRAINT "user_locations_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_locations" ADD CONSTRAINT "user_locations_beacon_id_beacons_id_fk" FOREIGN KEY ("beacon_id") REFERENCES "public"."beacons"("id") ON DELETE no action ON UPDATE no action;