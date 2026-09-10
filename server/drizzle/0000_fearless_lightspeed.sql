-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified_at" timestamp(0),
	"password" varchar(255) NOT NULL,
	"remember_token" varchar(100),
	"created_at" timestamp(0),
	"updated_at" timestamp(0),
	"username" varchar(255),
	"avatar_url" varchar(255),
	"website" varchar(255),
	"first_name" varchar(255),
	"last_name" varchar(255),
	"phone_number" varchar(255),
	"phone_verified_at" timestamp(0),
	"is_admin" boolean DEFAULT false NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"title" varchar(255),
	"message" text,
	"created_at" timestamp(0),
	"updated_at" timestamp(0),
	"read_at" timestamp(0)
);
--> statement-breakpoint
CREATE TABLE "vehicle_finance_sheets" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"sheet_name" varchar(255),
	"sales_consultant" varchar(255),
	"dealership_name" varchar(255),
	"vehicle_type" varchar(255) DEFAULT 'CAR' NOT NULL,
	"shareable_key" varchar(255),
	"vehicle_year" varchar(255),
	"vehicle_make" varchar(255),
	"vehicle_model" varchar(255),
	"vehicle_trim" varchar(255),
	"msrp" double precision,
	"fees" double precision,
	"discounts" double precision,
	"rebates" double precision,
	"down_payment" double precision,
	"sales_tax_percent" double precision,
	"interest_rate" double precision,
	"finance_term" smallint,
	"start_date" timestamp(0),
	"contact_email" varchar(255),
	"contact_phone" varchar(255),
	"extra_payments_json" text,
	"notes" text,
	"created_at" timestamp(0),
	"updated_at" timestamp(0),
	CONSTRAINT "vehicle_finance_sheets_vehicle_type_check" CHECK ((vehicle_type)::text = ANY ((ARRAY['CAR'::character varying, 'TRUCK'::character varying, 'SUV'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "migrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"migration" varchar(255) NOT NULL,
	"batch" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"email" varchar(255) PRIMARY KEY NOT NULL,
	"token" varchar(255) NOT NULL,
	"created_at" timestamp(0)
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" bigint,
	"ip_address" varchar(45),
	"user_agent" text,
	"payload" text NOT NULL,
	"last_activity" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cache" (
	"key" varchar(255) PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"expiration" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cache_locks" (
	"key" varchar(255) PRIMARY KEY NOT NULL,
	"owner" varchar(255) NOT NULL,
	"expiration" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"queue" varchar(255) NOT NULL,
	"payload" text NOT NULL,
	"attempts" smallint NOT NULL,
	"reserved_at" integer,
	"available_at" integer NOT NULL,
	"created_at" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_batches" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"total_jobs" integer NOT NULL,
	"pending_jobs" integer NOT NULL,
	"failed_jobs" integer NOT NULL,
	"failed_job_ids" text NOT NULL,
	"options" text,
	"cancelled_at" integer,
	"created_at" integer NOT NULL,
	"finished_at" integer
);
--> statement-breakpoint
CREATE TABLE "failed_jobs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" varchar(255) NOT NULL,
	"connection" text NOT NULL,
	"queue" text NOT NULL,
	"payload" text NOT NULL,
	"exception" text NOT NULL,
	"failed_at" timestamp(0) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "failed_jobs_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"title" varchar(255),
	"message" text,
	"created_at" timestamp(0),
	"updated_at" timestamp(0)
);
--> statement-breakpoint
CREATE TABLE "vehicle_lease_sheets" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"sheet_name" varchar(255),
	"sales_consultant" varchar(255),
	"dealership_name" varchar(255),
	"vehicle_type" varchar(255) DEFAULT 'CAR' NOT NULL,
	"shareable_key" varchar(255),
	"vehicle_year" varchar(255),
	"vehicle_make" varchar(255),
	"vehicle_model" varchar(255),
	"vehicle_trim" varchar(255),
	"msrp" double precision,
	"dealer_contribution" double precision,
	"trade_in" double precision,
	"doc_fee" double precision,
	"acquisition_fee" double precision,
	"misc_fees" double precision,
	"lease_cash" double precision,
	"down_payment" double precision,
	"money_factor" double precision,
	"sales_tax_percent" double precision,
	"residual_percent" double precision,
	"lease_term" smallint,
	"start_date" timestamp(0),
	"contact_email" varchar(255),
	"contact_phone" varchar(255),
	"notes" text,
	"created_at" timestamp(0),
	"updated_at" timestamp(0),
	CONSTRAINT "vehicle_lease_sheets_vehicle_type_check" CHECK ((vehicle_type)::text = ANY ((ARRAY['CAR'::character varying, 'TRUCK'::character varying, 'SUV'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "retailers" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"api_base_url" varchar(255) NOT NULL,
	"api_key" varchar(255),
	"api_config" json,
	"is_active" boolean DEFAULT true NOT NULL,
	"rate_limit_per_hour" integer DEFAULT 1000 NOT NULL,
	"created_at" timestamp(0),
	"updated_at" timestamp(0),
	"logo_url" varchar(255),
	"coming_soon" boolean DEFAULT false NOT NULL,
	CONSTRAINT "retailers_name_unique" UNIQUE("name"),
	CONSTRAINT "retailers_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "price_history" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"tracked_product_id" bigint NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"in_stock" boolean DEFAULT true NOT NULL,
	"api_response" json,
	"checked_at" timestamp(0) NOT NULL,
	"created_at" timestamp(0),
	"updated_at" timestamp(0)
);
--> statement-breakpoint
CREATE TABLE "price_check_schedules" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"frequency" varchar(255) DEFAULT 'daily' NOT NULL,
	"minute_offset" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"user_id" bigint,
	"created_at" timestamp(0),
	"updated_at" timestamp(0),
	CONSTRAINT "price_check_schedules_name_unique" UNIQUE("name"),
	CONSTRAINT "price_check_schedules_frequency_check" CHECK ((frequency)::text = ANY ((ARRAY['hourly'::character varying, 'every_2_hours'::character varying, 'every_6_hours'::character varying, 'daily'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "price_alerts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"tracked_product_id" bigint NOT NULL,
	"old_price" numeric(10, 2) NOT NULL,
	"new_price" numeric(10, 2) NOT NULL,
	"alert_type" varchar(255) NOT NULL,
	"notification_sent" boolean DEFAULT false NOT NULL,
	"triggered_at" timestamp(0) NOT NULL,
	"created_at" timestamp(0),
	"updated_at" timestamp(0),
	CONSTRAINT "price_alerts_alert_type_check" CHECK ((alert_type)::text = ANY ((ARRAY['price_drop'::character varying, 'target_reached'::character varying, 'back_in_stock'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "bug_reports" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint,
	"page_url" varchar(255) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"status" varchar(255) DEFAULT 'new' NOT NULL,
	"metadata" json,
	"created_at" timestamp(0),
	"updated_at" timestamp(0),
	CONSTRAINT "bug_reports_status_check" CHECK ((status)::text = ANY ((ARRAY['new'::character varying, 'in_progress'::character varying, 'resolved'::character varying, 'closed'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "phone_verification_codes" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"phone_number" varchar(255) NOT NULL,
	"code" varchar(6) NOT NULL,
	"expires_at" timestamp(0) NOT NULL,
	"verified_at" timestamp(0),
	"created_at" timestamp(0),
	"updated_at" timestamp(0)
);
--> statement-breakpoint
CREATE TABLE "personal_access_tokens" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"tokenable_type" varchar(255) NOT NULL,
	"tokenable_id" bigint NOT NULL,
	"name" text NOT NULL,
	"token" varchar(64) NOT NULL,
	"abilities" text,
	"last_used_at" timestamp(0),
	"expires_at" timestamp(0),
	"created_at" timestamp(0),
	"updated_at" timestamp(0),
	CONSTRAINT "personal_access_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user_devices" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"device_name" varchar(255),
	"device_type" varchar(255) NOT NULL,
	"push_token" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_used_at" timestamp(0),
	"created_at" timestamp(0),
	"updated_at" timestamp(0),
	CONSTRAINT "user_devices_push_token_unique" UNIQUE("push_token")
);
--> statement-breakpoint
CREATE TABLE "tracked_products" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"retailer_id" bigint NOT NULL,
	"sku_upc" varchar(255) NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"product_variant" varchar(255),
	"product_description" text,
	"product_image_url" varchar(255),
	"retail_price" numeric(10, 2) NOT NULL,
	"current_price" numeric(10, 2) NOT NULL,
	"target_price" numeric(10, 2) NOT NULL,
	"tracking_start_date" timestamp(0) NOT NULL,
	"tracking_end_date" timestamp(0),
	"is_active" boolean DEFAULT true NOT NULL,
	"product_metadata" json,
	"last_checked_at" timestamp(0),
	"created_at" timestamp(0),
	"updated_at" timestamp(0),
	"deleted_at" timestamp(0),
	"notification_method" json,
	"last_scraper_error" text,
	"last_error_at" timestamp(0),
	"watch_type" varchar(255) DEFAULT 'price' NOT NULL,
	"check_interval" integer DEFAULT 60 NOT NULL,
	"in_stock" boolean DEFAULT true NOT NULL,
	CONSTRAINT "tracked_products_watch_type_check" CHECK ((watch_type)::text = ANY ((ARRAY['price'::character varying, 'stock'::character varying, 'both'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "ai_agent_routes" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"context_key" varchar(255) NOT NULL,
	"agent_id" bigint NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp(0),
	"updated_at" timestamp(0)
);
--> statement-breakpoint
CREATE TABLE "ai_providers" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"base_url" varchar(255) NOT NULL,
	"api_key" text,
	"default_model" varchar(255),
	"enabled" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"sends_data_externally" boolean DEFAULT false NOT NULL,
	"timeout_seconds" integer DEFAULT 20 NOT NULL,
	"settings" json,
	"created_at" timestamp(0),
	"updated_at" timestamp(0),
	CONSTRAINT "ai_providers_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "ai_agents" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"provider_id" bigint,
	"model" varchar(255),
	"system_prompt" text NOT NULL,
	"user_prompt_template" text NOT NULL,
	"response_format" varchar(255) DEFAULT 'json_object' NOT NULL,
	"output_schema" json,
	"temperature" numeric(4, 2) DEFAULT '0.2' NOT NULL,
	"top_p" numeric(4, 2) DEFAULT '0.9' NOT NULL,
	"max_tokens" integer DEFAULT 500 NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"rate_limit_per_user_day" integer DEFAULT 50 NOT NULL,
	"settings" json,
	"created_at" timestamp(0),
	"updated_at" timestamp(0),
	CONSTRAINT "ai_agents_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "ai_agent_versions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"agent_id" bigint NOT NULL,
	"version" integer NOT NULL,
	"snapshot" json NOT NULL,
	"created_by" bigint,
	"created_at" timestamp(0) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "ai_agent_versions_agent_id_version_unique" UNIQUE("agent_id","version")
);
--> statement-breakpoint
CREATE TABLE "ai_invocations" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint,
	"agent_id" bigint,
	"agent_version" integer,
	"provider_id" bigint,
	"model" varchar(255),
	"context_key" varchar(255),
	"request_hash" char(64),
	"request_payload" json,
	"response" json,
	"raw_response" text,
	"status" varchar(255) DEFAULT 'pending' NOT NULL,
	"error" text,
	"latency_ms" integer,
	"prompt_tokens" integer,
	"completion_tokens" integer,
	"cached" boolean DEFAULT false NOT NULL,
	"created_at" timestamp(0) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_invocation_cache" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"cache_key" char(64) NOT NULL,
	"agent_id" bigint NOT NULL,
	"agent_version" integer NOT NULL,
	"provider_id" bigint,
	"model" varchar(255),
	"request_hash" char(64) NOT NULL,
	"response" json NOT NULL,
	"hit_count" integer DEFAULT 0 NOT NULL,
	"last_hit_at" timestamp(0),
	"created_at" timestamp(0) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "ai_invocation_cache_cache_key_unique" UNIQUE("cache_key")
);
--> statement-breakpoint
CREATE TABLE "mortgage_sheets" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"sheet_name" varchar(255),
	"property_address" varchar(255),
	"property_type" varchar(255) DEFAULT 'HOUSE' NOT NULL,
	"shareable_key" varchar(255),
	"property_value" double precision,
	"down_payment" double precision,
	"interest_rate" double precision,
	"loan_term_years" smallint,
	"start_date" timestamp(0),
	"monthly_hoa" double precision,
	"annual_insurance" double precision,
	"annual_property_tax" double precision,
	"extra_expenses_json" text,
	"extra_payments_json" text,
	"contact_email" varchar(255),
	"contact_phone" varchar(255),
	"notes" text,
	"created_at" timestamp(0),
	"updated_at" timestamp(0),
	CONSTRAINT "mortgage_sheets_property_type_check" CHECK ((property_type)::text = ANY ((ARRAY['HOUSE'::character varying, 'CONDO'::character varying, 'TOWNHOUSE'::character varying, 'MULTI_FAMILY'::character varying, 'LAND'::character varying])::text[]))
);
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_finance_sheets" ADD CONSTRAINT "vehicle_finance_sheets_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_lease_sheets" ADD CONSTRAINT "vehicle_lease_sheets_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_tracked_product_id_foreign" FOREIGN KEY ("tracked_product_id") REFERENCES "public"."tracked_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_check_schedules" ADD CONSTRAINT "price_check_schedules_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_alerts" ADD CONSTRAINT "price_alerts_tracked_product_id_foreign" FOREIGN KEY ("tracked_product_id") REFERENCES "public"."tracked_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bug_reports" ADD CONSTRAINT "bug_reports_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phone_verification_codes" ADD CONSTRAINT "phone_verification_codes_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_devices" ADD CONSTRAINT "user_devices_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracked_products" ADD CONSTRAINT "tracked_products_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracked_products" ADD CONSTRAINT "tracked_products_retailer_id_foreign" FOREIGN KEY ("retailer_id") REFERENCES "public"."retailers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_agent_routes" ADD CONSTRAINT "ai_agent_routes_agent_id_foreign" FOREIGN KEY ("agent_id") REFERENCES "public"."ai_agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_agents" ADD CONSTRAINT "ai_agents_provider_id_foreign" FOREIGN KEY ("provider_id") REFERENCES "public"."ai_providers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_agent_versions" ADD CONSTRAINT "ai_agent_versions_agent_id_foreign" FOREIGN KEY ("agent_id") REFERENCES "public"."ai_agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_agent_versions" ADD CONSTRAINT "ai_agent_versions_created_by_foreign" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_invocations" ADD CONSTRAINT "ai_invocations_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_invocations" ADD CONSTRAINT "ai_invocations_agent_id_foreign" FOREIGN KEY ("agent_id") REFERENCES "public"."ai_agents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_invocations" ADD CONSTRAINT "ai_invocations_provider_id_foreign" FOREIGN KEY ("provider_id") REFERENCES "public"."ai_providers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_invocation_cache" ADD CONSTRAINT "ai_invocation_cache_agent_id_foreign" FOREIGN KEY ("agent_id") REFERENCES "public"."ai_agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_invocation_cache" ADD CONSTRAINT "ai_invocation_cache_provider_id_foreign" FOREIGN KEY ("provider_id") REFERENCES "public"."ai_providers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mortgage_sheets" ADD CONSTRAINT "mortgage_sheets_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sessions_last_activity_index" ON "sessions" USING btree ("last_activity" int4_ops);--> statement-breakpoint
CREATE INDEX "sessions_user_id_index" ON "sessions" USING btree ("user_id" int8_ops);--> statement-breakpoint
CREATE INDEX "jobs_queue_index" ON "jobs" USING btree ("queue" text_ops);--> statement-breakpoint
CREATE INDEX "price_history_tracked_product_id_checked_at_index" ON "price_history" USING btree ("tracked_product_id" int8_ops,"checked_at" int8_ops);--> statement-breakpoint
CREATE INDEX "price_check_schedules_is_active_frequency_index" ON "price_check_schedules" USING btree ("is_active" text_ops,"frequency" text_ops);--> statement-breakpoint
CREATE INDEX "price_alerts_tracked_product_id_triggered_at_index" ON "price_alerts" USING btree ("tracked_product_id" int8_ops,"triggered_at" int8_ops);--> statement-breakpoint
CREATE INDEX "bug_reports_user_id_status_index" ON "bug_reports" USING btree ("user_id" int8_ops,"status" int8_ops);--> statement-breakpoint
CREATE INDEX "phone_verification_codes_user_id_phone_number_index" ON "phone_verification_codes" USING btree ("user_id" int8_ops,"phone_number" int8_ops);--> statement-breakpoint
CREATE INDEX "personal_access_tokens_tokenable_type_tokenable_id_index" ON "personal_access_tokens" USING btree ("tokenable_type" int8_ops,"tokenable_id" int8_ops);--> statement-breakpoint
CREATE INDEX "user_devices_user_id_is_active_index" ON "user_devices" USING btree ("user_id" int8_ops,"is_active" int8_ops);--> statement-breakpoint
CREATE INDEX "tracked_products_retailer_id_sku_upc_index" ON "tracked_products" USING btree ("retailer_id" int8_ops,"sku_upc" text_ops);--> statement-breakpoint
CREATE INDEX "tracked_products_user_id_is_active_index" ON "tracked_products" USING btree ("user_id" bool_ops,"is_active" int8_ops);--> statement-breakpoint
CREATE INDEX "ai_agent_routes_context_key_priority_index" ON "ai_agent_routes" USING btree ("context_key" int4_ops,"priority" int4_ops);--> statement-breakpoint
CREATE INDEX "ai_invocations_agent_id_created_at_index" ON "ai_invocations" USING btree ("agent_id" int8_ops,"created_at" int8_ops);--> statement-breakpoint
CREATE INDEX "ai_invocations_request_hash_index" ON "ai_invocations" USING btree ("request_hash" bpchar_ops);--> statement-breakpoint
CREATE INDEX "ai_invocations_status_created_at_index" ON "ai_invocations" USING btree ("status" timestamp_ops,"created_at" text_ops);--> statement-breakpoint
CREATE INDEX "ai_invocation_cache_agent_id_agent_version_index" ON "ai_invocation_cache" USING btree ("agent_id" int4_ops,"agent_version" int4_ops);
*/