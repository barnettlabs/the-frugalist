import { relations } from "drizzle-orm/relations";
import { users, vehicleLeaseSheets, vehicleFinanceSheets, notifications, trackedProducts, priceHistory, priceAlerts, priceCheckSchedules, userDevices, bugReports, phoneVerificationCodes, retailers, aiProviders, aiAgents, aiAgentVersions, aiAgentRoutes, aiInvocations, aiInvocationCache, mortgageSheets, authSessions, authAccounts } from "./schema.js";

export const vehicleLeaseSheetsRelations = relations(vehicleLeaseSheets, ({one}) => ({
	user: one(users, {
		fields: [vehicleLeaseSheets.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	vehicleLeaseSheets: many(vehicleLeaseSheets),
	vehicleFinanceSheets: many(vehicleFinanceSheets),
	notifications: many(notifications),
	priceCheckSchedules: many(priceCheckSchedules),
	userDevices: many(userDevices),
	bugReports: many(bugReports),
	phoneVerificationCodes: many(phoneVerificationCodes),
	trackedProducts: many(trackedProducts),
	aiAgentVersions: many(aiAgentVersions),
	aiInvocations: many(aiInvocations),
	mortgageSheets: many(mortgageSheets),
	authSessions: many(authSessions),
	authAccounts: many(authAccounts),
}));

export const vehicleFinanceSheetsRelations = relations(vehicleFinanceSheets, ({one}) => ({
	user: one(users, {
		fields: [vehicleFinanceSheets.userId],
		references: [users.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	}),
}));

export const priceHistoryRelations = relations(priceHistory, ({one}) => ({
	trackedProduct: one(trackedProducts, {
		fields: [priceHistory.trackedProductId],
		references: [trackedProducts.id]
	}),
}));

export const trackedProductsRelations = relations(trackedProducts, ({one, many}) => ({
	priceHistories: many(priceHistory),
	priceAlerts: many(priceAlerts),
	user: one(users, {
		fields: [trackedProducts.userId],
		references: [users.id]
	}),
	retailer: one(retailers, {
		fields: [trackedProducts.retailerId],
		references: [retailers.id]
	}),
}));

export const priceAlertsRelations = relations(priceAlerts, ({one}) => ({
	trackedProduct: one(trackedProducts, {
		fields: [priceAlerts.trackedProductId],
		references: [trackedProducts.id]
	}),
}));

export const priceCheckSchedulesRelations = relations(priceCheckSchedules, ({one}) => ({
	user: one(users, {
		fields: [priceCheckSchedules.userId],
		references: [users.id]
	}),
}));

export const userDevicesRelations = relations(userDevices, ({one}) => ({
	user: one(users, {
		fields: [userDevices.userId],
		references: [users.id]
	}),
}));

export const bugReportsRelations = relations(bugReports, ({one}) => ({
	user: one(users, {
		fields: [bugReports.userId],
		references: [users.id]
	}),
}));

export const phoneVerificationCodesRelations = relations(phoneVerificationCodes, ({one}) => ({
	user: one(users, {
		fields: [phoneVerificationCodes.userId],
		references: [users.id]
	}),
}));

export const retailersRelations = relations(retailers, ({many}) => ({
	trackedProducts: many(trackedProducts),
}));

export const aiAgentsRelations = relations(aiAgents, ({one, many}) => ({
	aiProvider: one(aiProviders, {
		fields: [aiAgents.providerId],
		references: [aiProviders.id]
	}),
	aiAgentVersions: many(aiAgentVersions),
	aiAgentRoutes: many(aiAgentRoutes),
	aiInvocations: many(aiInvocations),
	aiInvocationCaches: many(aiInvocationCache),
}));

export const aiProvidersRelations = relations(aiProviders, ({many}) => ({
	aiAgents: many(aiAgents),
	aiInvocations: many(aiInvocations),
	aiInvocationCaches: many(aiInvocationCache),
}));

export const aiAgentVersionsRelations = relations(aiAgentVersions, ({one}) => ({
	aiAgent: one(aiAgents, {
		fields: [aiAgentVersions.agentId],
		references: [aiAgents.id]
	}),
	user: one(users, {
		fields: [aiAgentVersions.createdBy],
		references: [users.id]
	}),
}));

export const aiAgentRoutesRelations = relations(aiAgentRoutes, ({one}) => ({
	aiAgent: one(aiAgents, {
		fields: [aiAgentRoutes.agentId],
		references: [aiAgents.id]
	}),
}));

export const aiInvocationsRelations = relations(aiInvocations, ({one}) => ({
	user: one(users, {
		fields: [aiInvocations.userId],
		references: [users.id]
	}),
	aiAgent: one(aiAgents, {
		fields: [aiInvocations.agentId],
		references: [aiAgents.id]
	}),
	aiProvider: one(aiProviders, {
		fields: [aiInvocations.providerId],
		references: [aiProviders.id]
	}),
}));

export const aiInvocationCacheRelations = relations(aiInvocationCache, ({one}) => ({
	aiAgent: one(aiAgents, {
		fields: [aiInvocationCache.agentId],
		references: [aiAgents.id]
	}),
	aiProvider: one(aiProviders, {
		fields: [aiInvocationCache.providerId],
		references: [aiProviders.id]
	}),
}));

export const mortgageSheetsRelations = relations(mortgageSheets, ({one}) => ({
	user: one(users, {
		fields: [mortgageSheets.userId],
		references: [users.id]
	}),
}));

export const authSessionsRelations = relations(authSessions, ({one}) => ({
	user: one(users, {
		fields: [authSessions.userId],
		references: [users.id]
	}),
}));

export const authAccountsRelations = relations(authAccounts, ({one}) => ({
	user: one(users, {
		fields: [authAccounts.userId],
		references: [users.id]
	}),
}));