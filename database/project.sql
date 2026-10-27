-- Generated from backend/schema.ts by drizzle-kit; do not edit by hand.
-- Original supplied design: database/source/project.sql. See schema-mapping.md for amendments.
CREATE TABLE "bookings" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "bookings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint,
	"screening_id" bigint NOT NULL,
	"reference" varchar(40) NOT NULL,
	"guest_name" varchar(80),
	"guest_email" varchar(255),
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	CONSTRAINT "bookings_reference_unique" UNIQUE("reference"),
	CONSTRAINT "bookings_status_check" CHECK ("bookings"."status" IN ('PENDING','PAID','CANCELLED','EXPIRED')),
	CONSTRAINT "bookings_total_check" CHECK ("bookings"."total_amount" >= 0),
	CONSTRAINT "bookings_cancelled_check" CHECK ("bookings"."cancelled_at" IS NULL OR "bookings"."status" = 'CANCELLED'),
	CONSTRAINT "bookings_customer_check" CHECK ("bookings"."user_id" IS NOT NULL OR ("bookings"."guest_name" IS NOT NULL AND "bookings"."guest_email" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "cinemas" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cinemas_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" varchar(150) NOT NULL,
	"city" varchar(100) NOT NULL,
	"address" varchar(255) NOT NULL,
	"timezone" varchar(50) DEFAULT 'Europe/Tallinn' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "cinemas_name_city_unique" UNIQUE("name","city")
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"user_id" bigint NOT NULL,
	"movie_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "favorites_user_id_movie_id_pk" PRIMARY KEY("user_id","movie_id")
);
--> statement-breakpoint
CREATE TABLE "genres" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "genres_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" varchar(80) NOT NULL,
	CONSTRAINT "genres_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "halls" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "halls_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"cinema_id" bigint NOT NULL,
	"name" varchar(80) NOT NULL,
	"supported_format" varchar(10) DEFAULT '2D' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "halls_cinema_name_unique" UNIQUE("cinema_id","name"),
	CONSTRAINT "halls_format_check" CHECK ("halls"."supported_format" IN ('2D','3D','IMAX'))
);
--> statement-breakpoint
CREATE TABLE "movie_genres" (
	"movie_id" bigint NOT NULL,
	"genre_id" bigint NOT NULL,
	CONSTRAINT "movie_genres_movie_id_genre_id_pk" PRIMARY KEY("movie_id","genre_id")
);
--> statement-breakpoint
CREATE TABLE "movies" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "movies_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"title" varchar(255) NOT NULL,
	"original_title" varchar(255),
	"description" text NOT NULL,
	"duration_minutes" smallint NOT NULL,
	"release_date" date NOT NULL,
	"age_rating" smallint NOT NULL,
	"critics_rating" numeric(4, 1),
	"original_language" varchar(10) NOT NULL,
	"trailer_url" varchar(500),
	"poster_url" varchar(500),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "movies_duration_check" CHECK ("movies"."duration_minutes" > 0),
	CONSTRAINT "movies_age_check" CHECK ("movies"."age_rating" BETWEEN 0 AND 18),
	CONSTRAINT "movies_critics_check" CHECK ("movies"."critics_rating" BETWEEN 0 AND 100)
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "notifications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"booking_id" bigint,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "payments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"booking_id" bigint NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"payment_method" varchar(30) NOT NULL,
	"provider_reference" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"paid_at" timestamp with time zone,
	CONSTRAINT "payments_provider_reference_unique" UNIQUE("provider_reference"),
	CONSTRAINT "payments_amount_check" CHECK ("payments"."amount" > 0),
	CONSTRAINT "payments_status_check" CHECK ("payments"."status" IN ('PENDING','COMPLETED','FAILED','REFUNDED'))
);
--> statement-breakpoint
CREATE TABLE "screenings" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "screenings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"movie_id" bigint NOT NULL,
	"hall_id" bigint NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"movie_format" varchar(10) NOT NULL,
	"audio_language" varchar(10) NOT NULL,
	"subtitle_language" varchar(10),
	"base_price" numeric(10, 2) NOT NULL,
	"status" varchar(20) DEFAULT 'SCHEDULED' NOT NULL,
	CONSTRAINT "screenings_hall_start_unique" UNIQUE("hall_id","starts_at"),
	CONSTRAINT "screenings_format_check" CHECK ("screenings"."movie_format" IN ('2D','3D','IMAX')),
	CONSTRAINT "screenings_price_check" CHECK ("screenings"."base_price" >= 0),
	CONSTRAINT "screenings_status_check" CHECK ("screenings"."status" IN ('SCHEDULED','CANCELLED','FINISHED'))
);
--> statement-breakpoint
CREATE TABLE "seats" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "seats_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"hall_id" bigint NOT NULL,
	"row_label" varchar(10) NOT NULL,
	"seat_number" smallint NOT NULL,
	"seat_type" varchar(20) DEFAULT 'STANDARD' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "seats_hall_row_number_unique" UNIQUE("hall_id","row_label","seat_number"),
	CONSTRAINT "seats_number_check" CHECK ("seats"."seat_number" > 0),
	CONSTRAINT "seats_type_check" CHECK ("seats"."seat_type" IN ('STANDARD','PREMIUM','ACCESSIBLE'))
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tickets_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"booking_id" bigint NOT NULL,
	"screening_id" bigint NOT NULL,
	"seat_id" bigint NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"qr_code" varchar(255) NOT NULL,
	"status" varchar(20) DEFAULT 'VALID' NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tickets_qr_code_unique" UNIQUE("qr_code"),
	CONSTRAINT "tickets_screening_seat_unique" UNIQUE("screening_id","seat_id"),
	CONSTRAINT "tickets_price_check" CHECK ("tickets"."price" >= 0),
	CONSTRAINT "tickets_status_check" CHECK ("tickets"."status" IN ('VALID','USED','CANCELLED'))
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"birth_date" date,
	"phone" varchar(30),
	"role" varchar(20) DEFAULT 'CUSTOMER' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_role_check" CHECK ("users"."role" IN ('CUSTOMER','CURATOR','ADMIN'))
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_screening_id_screenings_id_fk" FOREIGN KEY ("screening_id") REFERENCES "public"."screenings"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "halls" ADD CONSTRAINT "halls_cinema_id_cinemas_id_fk" FOREIGN KEY ("cinema_id") REFERENCES "public"."cinemas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_genres" ADD CONSTRAINT "movie_genres_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_genres" ADD CONSTRAINT "movie_genres_genre_id_genres_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."genres"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "screenings" ADD CONSTRAINT "screenings_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "screenings" ADD CONSTRAINT "screenings_hall_id_halls_id_fk" FOREIGN KEY ("hall_id") REFERENCES "public"."halls"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seats" ADD CONSTRAINT "seats_hall_id_halls_id_fk" FOREIGN KEY ("hall_id") REFERENCES "public"."halls"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_screening_id_screenings_id_fk" FOREIGN KEY ("screening_id") REFERENCES "public"."screenings"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_seat_id_seats_id_fk" FOREIGN KEY ("seat_id") REFERENCES "public"."seats"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_bookings_user_created" ON "bookings" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_bookings_screening" ON "bookings" USING btree ("screening_id");--> statement-breakpoint
CREATE INDEX "idx_favorites_movie" ON "favorites" USING btree ("movie_id");--> statement-breakpoint
CREATE INDEX "idx_movie_genres_genre" ON "movie_genres" USING btree ("genre_id");--> statement-breakpoint
CREATE INDEX "idx_movies_title" ON "movies" USING btree ("title");--> statement-breakpoint
CREATE INDEX "idx_movies_filters" ON "movies" USING btree ("age_rating","critics_rating","original_language");--> statement-breakpoint
CREATE INDEX "idx_movies_release" ON "movies" USING btree ("release_date");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_created" ON "notifications" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_notifications_booking" ON "notifications" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "idx_payments_booking" ON "payments" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "idx_screenings_movie_start" ON "screenings" USING btree ("movie_id","starts_at");--> statement-breakpoint
CREATE INDEX "idx_screenings_hall_start" ON "screenings" USING btree ("hall_id","starts_at");--> statement-breakpoint
CREATE INDEX "idx_tickets_booking" ON "tickets" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "idx_tickets_seat" ON "tickets" USING btree ("seat_id");