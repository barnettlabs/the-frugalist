/**
 * Database schema, introspected from Postgres with `pnpm db:pull`.
 *
 * Do not hand-edit. Laravel still owns the schema for the whole strangler-fig
 * period - both services run against one database and Laravel keeps migrating
 * it until Phase 6 - so this file is regenerated rather than authored. Two
 * migration tools writing the same schema would be a real hazard.
 *
 * Timestamps are normalised to { mode: 'date' } by tools/normalize-schema.mjs;
 * drizzle-kit introspects them as strings, which rejects the Date objects
 * Better Auth writes.
 *
 * The money columns are not uniform, and that is deliberate for now: the
 * vehicle sheets store `double precision` while the price-tracking tables store
 * `numeric(10,2)`, which Postgres returns as a *string*. Read those through
 * `fromNumericColumn` in @frugalist/contracts rather than relying on implicit
 * coercion - see src/db/money.ts.
 */

import { pgTable, serial, varchar, integer, timestamp, index, bigint, text, bigserial, smallint, unique, foreignKey, check, doublePrecision, json, boolean, numeric, char } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const migrations = pgTable("migrations", {
	id: serial().primaryKey().notNull(),
	migration: varchar({ length: 255 }).notNull(),
	batch: integer().notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
	email: varchar({ length: 255 }).primaryKey().notNull(),
	token: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'date' }),
});

export const sessions = pgTable("sessions", {
	id: varchar({ length: 255 }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }),
	ipAddress: varchar("ip_address", { length: 45 }),
	userAgent: text("user_agent"),
	payload: text().notNull(),
	lastActivity: integer("last_activity").notNull(),
}, (table) => [
	index().using("btree", table.lastActivity.asc().nullsLast().op("int4_ops")),
	index().using("btree", table.userId.asc().nullsLast().op("int8_ops")),
]);

export const cache = pgTable("cache", {
	key: varchar({ length: 255 }).primaryKey().notNull(),
	value: text().notNull(),
	expiration: integer().notNull(),
});

export const cacheLocks = pgTable("cache_locks", {
	key: varchar({ length: 255 }).primaryKey().notNull(),
	owner: varchar({ length: 255 }).notNull(),
	expiration: integer().notNull(),
});

export const jobs = pgTable("jobs", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	queue: varchar({ length: 255 }).notNull(),
	payload: text().notNull(),
	attempts: smallint().notNull(),
	reservedAt: integer("reserved_at"),
	availableAt: integer("available_at").notNull(),
	createdAt: integer("created_at").notNull(),
}, (table) => [
	index().using("btree", table.queue.asc().nullsLast().op("text_ops")),
]);

export const jobBatches = pgTable("job_batches", {
	id: varchar({ length: 255 }).primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	totalJobs: integer("total_jobs").notNull(),
	pendingJobs: integer("pending_jobs").notNull(),
	failedJobs: integer("failed_jobs").notNull(),
	failedJobIds: text("failed_job_ids").notNull(),
	options: text(),
	cancelledAt: integer("cancelled_at"),
	createdAt: integer("created_at").notNull(),
	finishedAt: integer("finished_at"),
});

export const failedJobs = pgTable("failed_jobs", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	uuid: varchar({ length: 255 }).notNull(),
	connection: text().notNull(),
	queue: text().notNull(),
	payload: text().notNull(),
	exception: text().notNull(),
	failedAt: timestamp("failed_at", { mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	unique("failed_jobs_uuid_unique").on(table.uuid),
]);

export const vehicleLeaseSheets = pgTable("vehicle_lease_sheets", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }).notNull(),
	sheetName: varchar("sheet_name", { length: 255 }),
	salesConsultant: varchar("sales_consultant", { length: 255 }),
	dealershipName: varchar("dealership_name", { length: 255 }),
	vehicleType: varchar("vehicle_type", { length: 255 }).default('CAR').notNull(),
	shareableKey: varchar("shareable_key", { length: 255 }),
	vehicleYear: varchar("vehicle_year", { length: 255 }),
	vehicleMake: varchar("vehicle_make", { length: 255 }),
	vehicleModel: varchar("vehicle_model", { length: 255 }),
	vehicleTrim: varchar("vehicle_trim", { length: 255 }),
	msrp: doublePrecision(),
	dealerContribution: doublePrecision("dealer_contribution"),
	tradeIn: doublePrecision("trade_in"),
	docFee: doublePrecision("doc_fee"),
	acquisitionFee: doublePrecision("acquisition_fee"),
	miscFees: doublePrecision("misc_fees"),
	leaseCash: doublePrecision("lease_cash"),
	downPayment: doublePrecision("down_payment"),
	moneyFactor: doublePrecision("money_factor"),
	salesTaxPercent: doublePrecision("sales_tax_percent"),
	residualPercent: doublePrecision("residual_percent"),
	leaseTerm: smallint("lease_term"),
	startDate: timestamp("start_date", { mode: 'date' }),
	contactEmail: varchar("contact_email", { length: 255 }),
	contactPhone: varchar("contact_phone", { length: 255 }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'date' }),
	updatedAt: timestamp("updated_at", { mode: 'date' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "vehicle_lease_sheets_user_id_foreign"
		}).onDelete("cascade"),
	check("vehicle_lease_sheets_vehicle_type_check", sql`(vehicle_type)::text = ANY ((ARRAY['CAR'::character varying, 'TRUCK'::character varying, 'SUV'::character varying])::text[])`),
]);

export const announcements = pgTable("announcements", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	title: varchar({ length: 255 }),
	message: text(),
	createdAt: timestamp("created_at", { mode: 'date' }),
	updatedAt: timestamp("updated_at", { mode: 'date' }),
});

export const retailers = pgTable("retailers", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	apiBaseUrl: varchar("api_base_url", { length: 255 }).notNull(),
	apiKey: varchar("api_key", { length: 255 }),
	apiConfig: json("api_config"),
	isActive: boolean("is_active").default(true).notNull(),
	rateLimitPerHour: integer("rate_limit_per_hour").default(1000).notNull(),
	createdAt: timestamp("created_at", { mode: 'date' }),
	updatedAt: timestamp("updated_at", { mode: 'date' }),
	logoUrl: varchar("logo_url", { length: 255 }),
	comingSoon: boolean("coming_soon").default(false).notNull(),
}, (table) => [
	unique("retailers_name_unique").on(table.name),
	unique("retailers_slug_unique").on(table.slug),
]);

export const vehicleFinanceSheets = pgTable("vehicle_finance_sheets", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }).notNull(),
	sheetName: varchar("sheet_name", { length: 255 }),
	salesConsultant: varchar("sales_consultant", { length: 255 }),
	dealershipName: varchar("dealership_name", { length: 255 }),
	vehicleType: varchar("vehicle_type", { length: 255 }).default('CAR').notNull(),
	shareableKey: varchar("shareable_key", { length: 255 }),
	vehicleYear: varchar("vehicle_year", { length: 255 }),
	vehicleMake: varchar("vehicle_make", { length: 255 }),
	vehicleModel: varchar("vehicle_model", { length: 255 }),
	vehicleTrim: varchar("vehicle_trim", { length: 255 }),
	msrp: doublePrecision(),
	fees: doublePrecision(),
	discounts: doublePrecision(),
	rebates: doublePrecision(),
	downPayment: doublePrecision("down_payment"),
	salesTaxPercent: doublePrecision("sales_tax_percent"),
	interestRate: doublePrecision("interest_rate"),
	financeTerm: smallint("finance_term"),
	startDate: timestamp("start_date", { mode: 'date' }),
	contactEmail: varchar("contact_email", { length: 255 }),
	contactPhone: varchar("contact_phone", { length: 255 }),
	extraPaymentsJson: text("extra_payments_json"),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'date' }),
	updatedAt: timestamp("updated_at", { mode: 'date' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "vehicle_finance_sheets_user_id_foreign"
		}).onDelete("cascade"),
	check("vehicle_finance_sheets_vehicle_type_check", sql`(vehicle_type)::text = ANY ((ARRAY['CAR'::character varying, 'TRUCK'::character varying, 'SUV'::character varying])::text[])`),
]);

export const notifications = pgTable("notifications", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }).notNull(),
	title: varchar({ length: 255 }),
	message: text(),
	createdAt: timestamp("created_at", { mode: 'date' }),
	updatedAt: timestamp("updated_at", { mode: 'date' }),
	readAt: timestamp("read_at", { mode: 'date' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notifications_user_id_foreign"
		}).onDelete("cascade"),
]);

export const users = pgTable("users", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	emailVerifiedAt: timestamp("email_verified_at", { mode: 'date' }),
	password: varchar({ length: 255 }),
	rememberToken: varchar("remember_token", { length: 100 }),
	createdAt: timestamp("created_at", { mode: 'date' }),
	updatedAt: timestamp("updated_at", { mode: 'date' }),
	username: varchar({ length: 255 }),
	avatarUrl: varchar("avatar_url", { length: 255 }),
	website: varchar({ length: 255 }),
	firstName: varchar("first_name", { length: 255 }),
	lastName: varchar("last_name", { length: 255 }),
	phoneNumber: varchar("phone_number", { length: 255 }),
	phoneVerifiedAt: timestamp("phone_verified_at", { mode: 'date' }),
	isAdmin: boolean("is_admin").default(false).notNull(),
	name: varchar({ length: 255 }),
	emailVerified: boolean("email_verified").default(false).notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
	unique("users_username_unique").on(table.username),
]);

export const priceHistory = pgTable("price_history", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	trackedProductId: bigint("tracked_product_id", { mode: "number" }).notNull(),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	inStock: boolean("in_stock").default(true).notNull(),
	apiResponse: json("api_response"),
	checkedAt: timestamp("checked_at", { mode: 'date' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'date' }),
	updatedAt: timestamp("updated_at", { mode: 'date' }),
}, (table) => [
	index().using("btree", table.trackedProductId.asc().nullsLast().op("int8_ops"), table.checkedAt.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.trackedProductId],
			foreignColumns: [trackedProducts.id],
			name: "price_history_tracked_product_id_foreign"
		}).onDelete("cascade"),
]);

export const priceAlerts = pgTable("price_alerts", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	trackedProductId: bigint("tracked_product_id", { mode: "number" }).notNull(),
	oldPrice: numeric("old_price", { precision: 10, scale:  2 }).notNull(),
	newPrice: numeric("new_price", { precision: 10, scale:  2 }).notNull(),
	alertType: varchar("alert_type", { length: 255 }).notNull(),
	notificationSent: boolean("notification_sent").default(false).notNull(),
	triggeredAt: timestamp("triggered_at", { mode: 'date' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'date' }),
	updatedAt: timestamp("updated_at", { mode: 'date' }),
}, (table) => [
	index().using("btree", table.trackedProductId.asc().nullsLast().op("int8_ops"), table.triggeredAt.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.trackedProductId],
			foreignColumns: [trackedProducts.id],
			name: "price_alerts_tracked_product_id_foreign"
		}).onDelete("cascade"),
	check("price_alerts_alert_type_check", sql`(alert_type)::text = ANY ((ARRAY['price_drop'::character varying, 'target_reached'::character varying, 'back_in_stock'::character varying])::text[])`),
]);

export const priceCheckSchedules = pgTable("price_check_schedules", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	frequency: varchar({ length: 255 }).default('daily').notNull(),
	minuteOffset: integer("minute_offset").default(0).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }),
	createdAt: timestamp("created_at", { mode: 'date' }),
	updatedAt: timestamp("updated_at", { mode: 'date' }),
}, (table) => [
	index().using("btree", table.isActive.asc().nullsLast().op("text_ops"), table.frequency.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "price_check_schedules_user_id_foreign"
		}).onDelete("cascade"),
	unique("price_check_schedules_name_unique").on(table.name),
	check("price_check_schedules_frequency_check", sql`(frequency)::text = ANY ((ARRAY['hourly'::character varying, 'every_2_hours'::character varying, 'every_6_hours'::character varying, 'daily'::character varying])::text[])`),
]);

export const userDevices = pgTable("user_devices", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }).notNull(),
	deviceName: varchar("device_name", { length: 255 }),
	deviceType: varchar("device_type", { length: 255 }).notNull(),
	pushToken: varchar("push_token", { length: 255 }).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	lastUsedAt: timestamp("last_used_at", { mode: 'date' }),
	createdAt: timestamp("created_at", { mode: 'date' }),
	updatedAt: timestamp("updated_at", { mode: 'date' }),
}, (table) => [
	index().using("btree", table.userId.asc().nullsLast().op("int8_ops"), table.isActive.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_devices_user_id_foreign"
		}).onDelete("cascade"),
	unique("user_devices_push_token_unique").on(table.pushToken),
]);

export const bugReports = pgTable("bug_reports", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }),
	pageUrl: varchar("page_url", { length: 255 }).notNull(),
	subject: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	status: varchar({ length: 255 }).default('new').notNull(),
	metadata: json(),
	createdAt: timestamp("created_at", { mode: 'date' }),
	updatedAt: timestamp("updated_at", { mode: 'date' }),
}, (table) => [
	index().using("btree", table.userId.asc().nullsLast().op("int8_ops"), table.status.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "bug_reports_user_id_foreign"
		}).onDelete("set null"),
	check("bug_reports_status_check", sql`(status)::text = ANY ((ARRAY['new'::character varying, 'in_progress'::character varying, 'resolved'::character varying, 'closed'::character varying])::text[])`),
]);

export const phoneVerificationCodes = pgTable("phone_verification_codes", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }).notNull(),
	phoneNumber: varchar("phone_number", { length: 255 }).notNull(),
	code: varchar({ length: 6 }).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'date' }).notNull(),
	verifiedAt: timestamp("verified_at", { mode: 'date' }),
	createdAt: timestamp("created_at", { mode: 'date' }),
	updatedAt: timestamp("updated_at", { mode: 'date' }),
}, (table) => [
	index().using("btree", table.userId.asc().nullsLast().op("int8_ops"), table.phoneNumber.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "phone_verification_codes_user_id_foreign"
		}).onDelete("cascade"),
]);

export const personalAccessTokens = pgTable("personal_access_tokens", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	tokenableType: varchar("tokenable_type", { length: 255 }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	tokenableId: bigint("tokenable_id", { mode: "number" }).notNull(),
	name: text().notNull(),
	token: varchar({ length: 64 }).notNull(),
	abilities: text(),
	lastUsedAt: timestamp("last_used_at", { mode: 'date' }),
	expiresAt: timestamp("expires_at", { mode: 'date' }),
	createdAt: timestamp("created_at", { mode: 'date' }),
	updatedAt: timestamp("updated_at", { mode: 'date' }),
}, (table) => [
	index().using("btree", table.tokenableType.asc().nullsLast().op("int8_ops"), table.tokenableId.asc().nullsLast().op("int8_ops")),
	unique("personal_access_tokens_token_unique").on(table.token),
]);

export const trackedProducts = pgTable("tracked_products", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	retailerId: bigint("retailer_id", { mode: "number" }).notNull(),
	skuUpc: varchar("sku_upc", { length: 255 }).notNull(),
	productName: varchar("product_name", { length: 255 }).notNull(),
	productVariant: varchar("product_variant", { length: 255 }),
	productDescription: text("product_description"),
	productImageUrl: varchar("product_image_url", { length: 255 }),
	retailPrice: numeric("retail_price", { precision: 10, scale:  2 }).notNull(),
	currentPrice: numeric("current_price", { precision: 10, scale:  2 }).notNull(),
	targetPrice: numeric("target_price", { precision: 10, scale:  2 }).notNull(),
	trackingStartDate: timestamp("tracking_start_date", { mode: 'date' }).notNull(),
	trackingEndDate: timestamp("tracking_end_date", { mode: 'date' }),
	isActive: boolean("is_active").default(true).notNull(),
	productMetadata: json("product_metadata"),
	lastCheckedAt: timestamp("last_checked_at", { mode: 'date' }),
	createdAt: timestamp("created_at", { mode: 'date' }),
	updatedAt: timestamp("updated_at", { mode: 'date' }),
	deletedAt: timestamp("deleted_at", { mode: 'date' }),
	notificationMethod: json("notification_method"),
	lastScraperError: text("last_scraper_error"),
	lastErrorAt: timestamp("last_error_at", { mode: 'date' }),
	watchType: varchar("watch_type", { length: 255 }).default('price').notNull(),
	checkInterval: integer("check_interval").default(60).notNull(),
	inStock: boolean("in_stock").default(true).notNull(),
}, (table) => [
	index().using("btree", table.retailerId.asc().nullsLast().op("int8_ops"), table.skuUpc.asc().nullsLast().op("text_ops")),
	index().using("btree", table.userId.asc().nullsLast().op("bool_ops"), table.isActive.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "tracked_products_user_id_foreign"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.retailerId],
			foreignColumns: [retailers.id],
			name: "tracked_products_retailer_id_foreign"
		}).onDelete("cascade"),
	check("tracked_products_watch_type_check", sql`(watch_type)::text = ANY ((ARRAY['price'::character varying, 'stock'::character varying, 'both'::character varying])::text[])`),
]);

export const aiProviders = pgTable("ai_providers", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	slug: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	baseUrl: varchar("base_url", { length: 255 }).notNull(),
	apiKey: text("api_key"),
	defaultModel: varchar("default_model", { length: 255 }),
	enabled: boolean().default(true).notNull(),
	isDefault: boolean("is_default").default(false).notNull(),
	sendsDataExternally: boolean("sends_data_externally").default(false).notNull(),
	timeoutSeconds: integer("timeout_seconds").default(20).notNull(),
	settings: json(),
	createdAt: timestamp("created_at", { mode: 'date' }),
	updatedAt: timestamp("updated_at", { mode: 'date' }),
}, (table) => [
	unique("ai_providers_slug_unique").on(table.slug),
]);

export const aiAgents = pgTable("ai_agents", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	slug: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	providerId: bigint("provider_id", { mode: "number" }),
	model: varchar({ length: 255 }),
	systemPrompt: text("system_prompt").notNull(),
	userPromptTemplate: text("user_prompt_template").notNull(),
	responseFormat: varchar("response_format", { length: 255 }).default('json_object').notNull(),
	outputSchema: json("output_schema"),
	temperature: numeric({ precision: 4, scale:  2 }).default('0.2').notNull(),
	topP: numeric("top_p", { precision: 4, scale:  2 }).default('0.9').notNull(),
	maxTokens: integer("max_tokens").default(500).notNull(),
	version: integer().default(1).notNull(),
	enabled: boolean().default(true).notNull(),
	rateLimitPerUserDay: integer("rate_limit_per_user_day").default(50).notNull(),
	settings: json(),
	createdAt: timestamp("created_at", { mode: 'date' }),
	updatedAt: timestamp("updated_at", { mode: 'date' }),
}, (table) => [
	foreignKey({
			columns: [table.providerId],
			foreignColumns: [aiProviders.id],
			name: "ai_agents_provider_id_foreign"
		}).onDelete("set null"),
	unique("ai_agents_slug_unique").on(table.slug),
]);

export const aiAgentVersions = pgTable("ai_agent_versions", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	agentId: bigint("agent_id", { mode: "number" }).notNull(),
	version: integer().notNull(),
	snapshot: json().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	createdBy: bigint("created_by", { mode: "number" }),
	createdAt: timestamp("created_at", { mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.agentId],
			foreignColumns: [aiAgents.id],
			name: "ai_agent_versions_agent_id_foreign"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "ai_agent_versions_created_by_foreign"
		}).onDelete("set null"),
	unique("ai_agent_versions_agent_id_version_unique").on(table.agentId, table.version),
]);

export const aiAgentRoutes = pgTable("ai_agent_routes", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	contextKey: varchar("context_key", { length: 255 }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	agentId: bigint("agent_id", { mode: "number" }).notNull(),
	priority: integer().default(0).notNull(),
	enabled: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'date' }),
	updatedAt: timestamp("updated_at", { mode: 'date' }),
}, (table) => [
	index().using("btree", table.contextKey.asc().nullsLast().op("int4_ops"), table.priority.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.agentId],
			foreignColumns: [aiAgents.id],
			name: "ai_agent_routes_agent_id_foreign"
		}).onDelete("cascade"),
]);

export const aiInvocations = pgTable("ai_invocations", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	agentId: bigint("agent_id", { mode: "number" }),
	agentVersion: integer("agent_version"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	providerId: bigint("provider_id", { mode: "number" }),
	model: varchar({ length: 255 }),
	contextKey: varchar("context_key", { length: 255 }),
	requestHash: char("request_hash", { length: 64 }),
	requestPayload: json("request_payload"),
	response: json(),
	rawResponse: text("raw_response"),
	status: varchar({ length: 255 }).default('pending').notNull(),
	error: text(),
	latencyMs: integer("latency_ms"),
	promptTokens: integer("prompt_tokens"),
	completionTokens: integer("completion_tokens"),
	cached: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index().using("btree", table.agentId.asc().nullsLast().op("int8_ops"), table.createdAt.asc().nullsLast().op("int8_ops")),
	index().using("btree", table.requestHash.asc().nullsLast().op("bpchar_ops")),
	index().using("btree", table.status.asc().nullsLast().op("timestamp_ops"), table.createdAt.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "ai_invocations_user_id_foreign"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.agentId],
			foreignColumns: [aiAgents.id],
			name: "ai_invocations_agent_id_foreign"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.providerId],
			foreignColumns: [aiProviders.id],
			name: "ai_invocations_provider_id_foreign"
		}).onDelete("set null"),
]);

export const aiInvocationCache = pgTable("ai_invocation_cache", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	cacheKey: char("cache_key", { length: 64 }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	agentId: bigint("agent_id", { mode: "number" }).notNull(),
	agentVersion: integer("agent_version").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	providerId: bigint("provider_id", { mode: "number" }),
	model: varchar({ length: 255 }),
	requestHash: char("request_hash", { length: 64 }).notNull(),
	response: json().notNull(),
	hitCount: integer("hit_count").default(0).notNull(),
	lastHitAt: timestamp("last_hit_at", { mode: 'date' }),
	createdAt: timestamp("created_at", { mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index().using("btree", table.agentId.asc().nullsLast().op("int4_ops"), table.agentVersion.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.agentId],
			foreignColumns: [aiAgents.id],
			name: "ai_invocation_cache_agent_id_foreign"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.providerId],
			foreignColumns: [aiProviders.id],
			name: "ai_invocation_cache_provider_id_foreign"
		}).onDelete("set null"),
	unique("ai_invocation_cache_cache_key_unique").on(table.cacheKey),
]);

export const mortgageSheets = pgTable("mortgage_sheets", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }).notNull(),
	sheetName: varchar("sheet_name", { length: 255 }),
	propertyAddress: varchar("property_address", { length: 255 }),
	propertyType: varchar("property_type", { length: 255 }).default('HOUSE').notNull(),
	shareableKey: varchar("shareable_key", { length: 255 }),
	propertyValue: doublePrecision("property_value"),
	downPayment: doublePrecision("down_payment"),
	interestRate: doublePrecision("interest_rate"),
	loanTermYears: smallint("loan_term_years"),
	startDate: timestamp("start_date", { mode: 'date' }),
	monthlyHoa: doublePrecision("monthly_hoa"),
	annualInsurance: doublePrecision("annual_insurance"),
	annualPropertyTax: doublePrecision("annual_property_tax"),
	extraExpensesJson: text("extra_expenses_json"),
	extraPaymentsJson: text("extra_payments_json"),
	contactEmail: varchar("contact_email", { length: 255 }),
	contactPhone: varchar("contact_phone", { length: 255 }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'date' }),
	updatedAt: timestamp("updated_at", { mode: 'date' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "mortgage_sheets_user_id_foreign"
		}).onDelete("cascade"),
	check("mortgage_sheets_property_type_check", sql`(property_type)::text = ANY ((ARRAY['HOUSE'::character varying, 'CONDO'::character varying, 'TOWNHOUSE'::character varying, 'MULTI_FAMILY'::character varying, 'LAND'::character varying])::text[])`),
]);

export const authSessions = pgTable("auth_sessions", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }).notNull(),
	token: varchar({ length: 255 }).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'date' }).notNull(),
	ipAddress: varchar("ip_address", { length: 255 }),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { mode: 'date' }),
	updatedAt: timestamp("updated_at", { mode: 'date' }),
}, (table) => [
	index().using("btree", table.expiresAt.asc().nullsLast().op("timestamp_ops")),
	index().using("btree", table.userId.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "auth_sessions_user_id_foreign"
		}).onDelete("cascade"),
	unique("auth_sessions_token_unique").on(table.token),
]);

export const authAccounts = pgTable("auth_accounts", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }).notNull(),
	accountId: varchar("account_id", { length: 255 }).notNull(),
	providerId: varchar("provider_id", { length: 255 }).notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'date' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'date' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'date' }),
	updatedAt: timestamp("updated_at", { mode: 'date' }),
}, (table) => [
	index().using("btree", table.userId.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "auth_accounts_user_id_foreign"
		}).onDelete("cascade"),
	unique("auth_accounts_provider_id_account_id_unique").on(table.accountId, table.providerId),
]);

export const authVerifications = pgTable("auth_verifications", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	identifier: varchar({ length: 255 }).notNull(),
	value: varchar({ length: 255 }).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'date' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'date' }),
	updatedAt: timestamp("updated_at", { mode: 'date' }),
}, (table) => [
	index().using("btree", table.identifier.asc().nullsLast().op("text_ops")),
]);
