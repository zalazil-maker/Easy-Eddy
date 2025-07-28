import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
export * from "./notificationSchema";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  // Contact Information
  fullName: text("full_name"),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // Encrypted password
  phone: text("phone"),
  linkedinProfile: text("linkedin_profile"),
  
  // Demographics
  age: integer("age"),
  gender: text("gender"), // "male", "female", "non-binary", "prefer-not-to-say"
  location: text("location"), // Current location/city
  nationality: text("nationality"),
  
  // Professional Information
  currentJobTitle: text("current_job_title"),
  yearsOfExperience: integer("years_of_experience"),
  educationLevel: text("education_level"), // "high-school", "bachelor", "master", "phd", "other"
  spokenLanguages: json("spoken_languages").$type<string[]>().default(["en"]),
  
  // System Fields
  privacyPolicyAccepted: boolean("privacy_policy_accepted").notNull().default(false),
  automationActive: boolean("automation_active").notNull().default(false),
  isApproved: boolean("is_approved").notNull().default(true), // Auto-approve all users
  approvedAt: timestamp("approved_at").defaultNow(), // Auto-set approval time
  approvedBy: text("approved_by").default("system"), // Auto-approval by system
  
  // Session Management
  lastLoginIp: text("last_login_ip"),
  sessionToken: text("session_token"),
  
  // Subscription fields
  subscriptionType: text("subscription_type").default("free"), // "free", "weekly", "monthly", "premium"
  subscriptionStatus: text("subscription_status").default("active"), // "active", "canceled", "expired"
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  preferredLanguage: text("preferred_language").default("english"), // "english", "french"
  applicationsUsedToday: integer("applications_used_today").default(0),
  applicationsUsedThisWeek: integer("applications_used_this_week").default(0),
  lastApplicationReset: timestamp("last_application_reset").defaultNow(),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User sessions table for IP-based authentication
export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  ipAddress: text("ip_address").notNull(),
  sessionToken: text("session_token").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  lastAccessed: timestamp("last_accessed").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobCriteria = pgTable("job_criteria", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  
  // Job Preferences
  jobTitles: json("job_titles").$type<string[]>().notNull().default([]),
  industries: json("industries").$type<string[]>().default([]), // "technology", "finance", "healthcare", etc.
  companyTypes: json("company_types").$type<string[]>().default([]), // "startup", "corporate", "non-profit", etc.
  companySizes: json("company_sizes").$type<string[]>().default([]), // "1-10", "11-50", "51-200", "201-1000", "1000+"
  
  // Location & Remote Preferences
  locations: json("locations").$type<string[]>().notNull().default([]),
  remotePreference: text("remote_preference"), // "remote-only", "hybrid", "on-site", "flexible"
  willingToRelocate: boolean("willing_to_relocate").default(false),
  
  // Compensation
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  currencyPreference: text("currency_preference").default("USD"),
  
  // Experience & Skills
  experienceLevel: text("experience_level"), // "entry", "mid", "senior", "lead", "executive"
  skills: json("skills").$type<string[]>().default([]),
  requiredSkills: json("required_skills").$type<string[]>().default([]),
  
  // Work Preferences
  jobTypes: json("job_types").$type<string[]>().default([]), // "full-time", "part-time", "contract", "freelance"
  workSchedule: text("work_schedule"), // "standard", "flexible", "night-shift", "weekend"
  
  // Domain-Specific Search Criteria
  keywords: json("keywords").$type<string[]>().default([]),
  excludeKeywords: json("exclude_keywords").$type<string[]>().default([]),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const jobApplications = pgTable("job_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  jobTitle: text("job_title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  source: text("source").notNull(), // LinkedIn, Indeed, etc.
  jobUrl: text("job_url"),
  description: text("description"),
  matchScore: integer("match_score"),
  status: text("status").notNull().default("applied"), // applied, viewed, response, interview, rejected
  appliedAt: timestamp("applied_at").defaultNow(),
  responseAt: timestamp("response_at"),
  emailSent: boolean("email_sent").notNull().default(false),
  jobLanguage: text("job_language").default("en"), // Language of the job posting
  cvLanguageUsed: text("cv_language_used").default("en"), // Language of CV used for application
});

export const userCVs = pgTable("user_cvs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  language: text("language").notNull(), // e.g., "en", "fr", "es", "de"
  cvContent: text("cv_content").notNull(),
  fileName: text("file_name"), // Original file name
  filePath: text("file_path"), // Server file path for uploaded PDF
  coverLetterTemplate: text("cover_letter_template"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emailNotifications = pgTable("email_notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  applicationId: integer("application_id").references(() => jobApplications.id).notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
});

// User Preferences and Search Behavior
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  
  // Search Behavior Preferences
  maxApplicationsPerDay: integer("max_applications_per_day").default(25),
  preferredSearchTime: text("preferred_search_time").default("morning"), // "morning", "afternoon", "evening", "any"
  autoApplyEnabled: boolean("auto_apply_enabled").default(true),
  
  // Notification Preferences
  emailNotifications: boolean("email_notifications").default(true),
  smsNotifications: boolean("sms_notifications").default(false),
  dailySummaryEmail: boolean("daily_summary_email").default(true),
  instantNotifications: boolean("instant_notifications").default(true),
  
  // Search Strategy
  aggressiveSearch: boolean("aggressive_search").default(false), // Apply to more jobs with lower match scores
  conservativeSearch: boolean("conservative_search").default(true), // Only apply to high-match jobs
  minMatchScore: integer("min_match_score").default(70), // Minimum match score to apply
  
  // Domain-Specific Preferences
  preferredJobBoards: json("preferred_job_boards").$type<string[]>().default([]),
  excludedCompanies: json("excluded_companies").$type<string[]>().default([]),
  priorityCompanies: json("priority_companies").$type<string[]>().default([]),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Search History and Analytics
export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  
  // Search Parameters Used
  searchQuery: text("search_query"),
  filtersApplied: json("filters_applied").$type<Record<string, any>>(),
  
  // Search Results
  jobsFound: integer("jobs_found").default(0),
  jobsAppliedTo: integer("jobs_applied_to").default(0),
  averageMatchScore: integer("average_match_score"),
  
  // Performance Metrics
  searchDuration: integer("search_duration_ms"), // Time taken in milliseconds
  successRate: integer("success_rate"), // Percentage of applications that got responses
  
  searchedAt: timestamp("searched_at").defaultNow(),
});

// Subscription plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  planType: text("plan_type").notNull().unique(), // "free", "weekly", "monthly"
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price"), // in cents (e.g., 199 for €1.99)
  currency: text("currency").default("EUR"),
  interval: text("interval"), // "week", "month", null for free
  applicationsPerDay: integer("applications_per_day"),
  applicationsPerWeek: integer("applications_per_week"),
  stripePriceId: text("stripe_price_id"), // Stripe price ID for subscriptions
  isActive: boolean("is_active").default(true),
  features: json("features").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User subscriptions history table  
export const subscriptionHistory = pgTable("subscription_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  planType: text("plan_type").notNull(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: text("status").notNull(), // "active", "canceled", "expired", "incomplete"
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  canceledAt: timestamp("canceled_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  jobCriteria: one(jobCriteria, {
    fields: [users.id],
    references: [jobCriteria.userId],
  }),
  jobApplications: many(jobApplications),
  emailNotifications: many(emailNotifications),
  userCVs: many(userCVs),
  userPreferences: one(userPreferences, {
    fields: [users.id],
    references: [userPreferences.userId],
  }),
  searchHistory: many(searchHistory),
  subscriptionHistory: many(subscriptionHistory),
}));

export const jobCriteriaRelations = relations(jobCriteria, ({ one }) => ({
  user: one(users, {
    fields: [jobCriteria.userId],
    references: [users.id],
  }),
}));

export const jobApplicationsRelations = relations(jobApplications, ({ one, many }) => ({
  user: one(users, {
    fields: [jobApplications.userId],
    references: [users.id],
  }),
  emailNotifications: many(emailNotifications),
}));

export const userCVsRelations = relations(userCVs, ({ one }) => ({
  user: one(users, {
    fields: [userCVs.userId],
    references: [users.id],
  }),
}));

export const emailNotificationsRelations = relations(emailNotifications, ({ one }) => ({
  user: one(users, {
    fields: [emailNotifications.userId],
    references: [users.id],
  }),
  jobApplication: one(jobApplications, {
    fields: [emailNotifications.applicationId],
    references: [jobApplications.id],
  }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

export const searchHistoryRelations = relations(searchHistory, ({ one }) => ({
  user: one(users, {
    fields: [searchHistory.userId],
    references: [users.id],
  }),
}));

export const subscriptionHistoryRelations = relations(subscriptionHistory, ({ one }) => ({
  user: one(users, {
    fields: [subscriptionHistory.userId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  fullName: true,
  email: true,
  phone: true,
  linkedinProfile: true,
  privacyPolicyAccepted: true,
  age: true,
  gender: true,
  location: true,
  nationality: true,
  currentJobTitle: true,
  yearsOfExperience: true,
  educationLevel: true,
  spokenLanguages: true,
});

// Extended user schema for comprehensive onboarding
export const extendedUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isApproved: true,
  approvedAt: true,
  approvedBy: true,
  automationActive: true,
}).extend({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  age: z.number().min(16, "Must be at least 16 years old").max(100),
  gender: z.enum(["male", "female", "non-binary", "prefer-not-to-say"]),
  location: z.string().min(1, "Location is required"),
  currentJobTitle: z.string().optional(),
  yearsOfExperience: z.number().min(0).max(50).optional(),
  educationLevel: z.enum(["high-school", "bachelor", "master", "phd", "other"]),
  privacyPolicyAccepted: z.boolean().refine(val => val === true, "You must accept the privacy policy"),
});

export const insertJobCriteriaSchema = createInsertSchema(jobCriteria).pick({
  userId: true,
  jobTitles: true,
  industries: true,
  companyTypes: true,
  companySizes: true,
  locations: true,
  remotePreference: true,
  willingToRelocate: true,
  salaryMin: true,
  salaryMax: true,
  currencyPreference: true,
  experienceLevel: true,
  skills: true,
  requiredSkills: true,
  jobTypes: true,
  workSchedule: true,
  keywords: true,
  excludeKeywords: true,
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).pick({
  userId: true,
  jobTitle: true,
  company: true,
  location: true,
  source: true,
  jobUrl: true,
  description: true,
  matchScore: true,
  status: true,
  jobLanguage: true,
  cvLanguageUsed: true,
});

export const insertUserCVSchema = createInsertSchema(userCVs).pick({
  userId: true,
  language: true,
  cvContent: true,
  fileName: true,
  filePath: true,
  coverLetterTemplate: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).pick({
  userId: true,
  maxApplicationsPerDay: true,
  preferredSearchTime: true,
  autoApplyEnabled: true,
  emailNotifications: true,
  smsNotifications: true,
  dailySummaryEmail: true,
  instantNotifications: true,
  aggressiveSearch: true,
  conservativeSearch: true,
  minMatchScore: true,
  preferredJobBoards: true,
  excludedCompanies: true,
  priorityCompanies: true,
});

export const insertSearchHistorySchema = createInsertSchema(searchHistory).pick({
  userId: true,
  searchQuery: true,
  filtersApplied: true,
  jobsFound: true,
  jobsAppliedTo: true,
  averageMatchScore: true,
  searchDuration: true,
  successRate: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ExtendedInsertUser = z.infer<typeof extendedUserSchema>;
export type JobCriteria = typeof jobCriteria.$inferSelect;
export type InsertJobCriteria = z.infer<typeof insertJobCriteriaSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type EmailNotification = typeof emailNotifications.$inferSelect;
export type UserCV = typeof userCVs.$inferSelect;
export type InsertUserCV = z.infer<typeof insertUserCVSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type SearchHistory = typeof searchHistory.$inferSelect;
export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type SubscriptionHistory = typeof subscriptionHistory.$inferSelect;

// Re-export notification types
export type { Notification, InsertNotification } from "./notificationSchema";
