-- Lease sheets follow a lease contract's disclosure: the agreed value separate
-- from MSRP, cap cost items (capitalized taxes, title and registration, prior
-- balance, add-on products), each fee either rolled in or paid at signing, the
-- trade-in payoff, how sales tax is charged, a security deposit, and the
-- end-of-lease terms. A residual can now be kept in dollars.
ALTER TABLE "vehicle_lease_sheets" ADD COLUMN "agreed_value" double precision;--> statement-breakpoint
ALTER TABLE "vehicle_lease_sheets" ADD COLUMN "residual_amount" double precision;--> statement-breakpoint
ALTER TABLE "vehicle_lease_sheets" ADD COLUMN "capitalized_taxes" double precision;--> statement-breakpoint
ALTER TABLE "vehicle_lease_sheets" ADD COLUMN "title_registration_fees" double precision;--> statement-breakpoint
ALTER TABLE "vehicle_lease_sheets" ADD COLUMN "prior_balance" double precision;--> statement-breakpoint
ALTER TABLE "vehicle_lease_sheets" ADD COLUMN "add_ons_json" text;--> statement-breakpoint
ALTER TABLE "vehicle_lease_sheets" ADD COLUMN "acquisition_fee_upfront" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "vehicle_lease_sheets" ADD COLUMN "doc_fee_upfront" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "vehicle_lease_sheets" ADD COLUMN "title_registration_fees_upfront" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "vehicle_lease_sheets" ADD COLUMN "misc_fees_upfront" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "vehicle_lease_sheets" ADD COLUMN "trade_in_payoff" double precision;--> statement-breakpoint
ALTER TABLE "vehicle_lease_sheets" ADD COLUMN "tax_method" varchar(16) DEFAULT 'monthly' NOT NULL;--> statement-breakpoint
ALTER TABLE "vehicle_lease_sheets" ADD COLUMN "security_deposit" double precision;--> statement-breakpoint
ALTER TABLE "vehicle_lease_sheets" ADD COLUMN "purchase_option_fee" double precision;--> statement-breakpoint
ALTER TABLE "vehicle_lease_sheets" ADD COLUMN "disposition_fee" double precision;--> statement-breakpoint
ALTER TABLE "vehicle_lease_sheets" ADD COLUMN "miles_per_year" integer;--> statement-breakpoint
ALTER TABLE "vehicle_lease_sheets" ADD COLUMN "excess_mile_rate" double precision;--> statement-breakpoint
ALTER TABLE "vehicle_lease_sheets" ADD CONSTRAINT "vehicle_lease_sheets_tax_method_check" CHECK ((tax_method)::text = ANY ((ARRAY['monthly'::character varying, 'upfront'::character varying])::text[]));--> statement-breakpoint
-- The cap cost used to start from MSRP less the dealer contribution; carry that
-- forward as the agreed value so existing sheets keep their figures.
UPDATE "vehicle_lease_sheets" SET "agreed_value" = "msrp" - COALESCE("dealer_contribution", 0) WHERE "msrp" IS NOT NULL;
