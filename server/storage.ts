import { 
  users, 
  jobCriteria, 
  jobApplications, 
  emailNotifications,
  userCVs,
  userPreferences,
  searchHistory,
  notifications,
  userSessions,
  subscriptionPlans,
  type User, 
  type InsertUser,
  type JobCriteria,
  type InsertJobCriteria,
  type JobApplication,
  type InsertJobApplication,
  type EmailNotification,
  type UserCV,
  type InsertUserCV,
  type UserPreferences,
  type InsertUserPreferences,
  type SearchHistory,
  type InsertSearchHistory,
  type Notification,
  type InsertNotification
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  approveUser(id: number, approvedBy: string): Promise<User>;
  getAllPendingUsers(): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  
  // Job criteria operations
  getJobCriteria(userId: number): Promise<JobCriteria | undefined>;
  createJobCriteria(criteria: InsertJobCriteria): Promise<JobCriteria>;
  updateJobCriteria(userId: number, updates: Partial<JobCriteria>): Promise<JobCriteria>;
  
  // Job application operations
  getJobApplications(userId: number): Promise<JobApplication[]>;
  createJobApplication(application: InsertJobApplication): Promise<JobApplication>;
  updateJobApplication(id: number, updates: Partial<JobApplication>): Promise<JobApplication>;
  
  // Email notification operations
  getEmailNotifications(userId: number): Promise<EmailNotification[]>;
  createEmailNotification(notification: { userId: number; applicationId: number; subject: string; content: string }): Promise<EmailNotification>;
  
  // User CV operations
  getUserCVs(userId: number): Promise<UserCV[]>;
  createUserCV(cv: InsertUserCV): Promise<UserCV>;
  updateUserCV(id: number, updates: Partial<UserCV>): Promise<UserCV>;
  deleteUserCV(id: number): Promise<void>;
  
  // User preferences operations
  getUserPreferences(userId: number): Promise<UserPreferences | undefined>;
  createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
  updateUserPreferences(userId: number, updates: Partial<UserPreferences>): Promise<UserPreferences>;
  
  // Search history operations
  getSearchHistory(userId: number): Promise<SearchHistory[]>;
  createSearchHistory(history: InsertSearchHistory): Promise<SearchHistory>;
  
  // Notification operations
  getNotifications(userId: number): Promise<Notification[]>;
  getUnreadNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
  
  // Additional methods for JobHackr
  getJobCriteriaByUserId(userId: number): Promise<JobCriteria | undefined>;
  getUserCV(userId: number): Promise<UserCV | undefined>;
  saveUserCV(cv: { userId: number; language: string; content: string; filename: string }): Promise<UserCV>;
  getTodayApplicationCount(userId: number, date: string): Promise<number>;
  updateDailyApplicationCount(userId: number, count: number): Promise<void>;
  resetDailyApplications(userId: number): Promise<void>;
  getApplicationsByUserAndDate(userId: number, date: string): Promise<JobApplication[]>;
  getJobApplicationsByUserId(userId: number, limit?: number, offset?: number): Promise<JobApplication[]>;
  getTotalApplicationsByUserId(userId: number): Promise<number>;
  
  // Session management operations
  createUserSession(userId: number, ipAddress: string, sessionToken: string): Promise<void>;
  getUserBySession(ipAddress: string, sessionToken?: string): Promise<User | undefined>;
  updateUserSession(userId: number, ipAddress: string): Promise<void>;
  invalidateUserSession(userId: number): Promise<void>;
  
  // Admin operations
  getAllApplications(): Promise<JobApplication[]>;
  getAdminStats(): Promise<{
    totalUsers: number;
    totalApplications: number;
    activeAutomations: number;
    successRate: number;
  }>;
  
  // Enhanced stats operations
  getUserStats(userId: number): Promise<{
    applicationsSent: number;
    responses: number;
    interviews: number;
    activeSearches: number;
    averageMatchScore: number;
    searchSuccessRate: number;
    mostActiveJobBoards: string[];
    topSkillsMatched: string[];
  }>;
  
  // Subscription operations
  updateUserSubscription(userId: number, updates: {
    subscriptionType?: string;
    subscriptionStatus?: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionStartDate?: Date;
    subscriptionEndDate?: Date;
    applicationsUsedToday?: number;
    applicationsUsedThisWeek?: number;
  }): Promise<User>;
  
  updateStripePrice(planType: string, stripePriceId: string): Promise<void>;
  getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined>;
  deleteUserCV(userId: number, cvId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: any): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        isApproved: true, // Auto-approve all users
        approvedAt: new Date(), // Auto-set approval time
        approvedBy: "system", // Auto-approval by system
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async approveUser(id: number, approvedBy: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        isApproved: true, 
        approvedAt: new Date(),
        approvedBy,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async getAllPendingUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isApproved, false));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getJobCriteria(userId: number): Promise<JobCriteria | undefined> {
    const [criteria] = await db.select().from(jobCriteria).where(eq(jobCriteria.userId, userId));
    return criteria || undefined;
  }

  async createJobCriteria(criteria: InsertJobCriteria): Promise<JobCriteria> {
    try {
      const [jobCriteriaResult] = await db
        .insert(jobCriteria)
        .values(criteria as any)
        .returning();
      return jobCriteriaResult;
    } catch (error) {
      console.error('Database insert error:', error);
      throw error;
    }
  }

  async updateJobCriteria(userId: number, updates: Partial<JobCriteria>): Promise<JobCriteria> {
    const [criteria] = await db
      .update(jobCriteria)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(jobCriteria.userId, userId))
      .returning();
    
    if (!criteria) {
      throw new Error("Job criteria not found");
    }
    return criteria;
  }

  async getJobApplications(userId: number): Promise<JobApplication[]> {
    return await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.userId, userId))
      .orderBy(desc(jobApplications.appliedAt));
  }

  async createJobApplication(application: InsertJobApplication): Promise<JobApplication> {
    try {
      const [jobApplication] = await db
        .insert(jobApplications)
        .values(application as any)
        .returning();
      return jobApplication;
    } catch (error) {
      console.error('Database insert error:', error);
      throw error;
    }
  }

  async updateJobApplication(id: number, updates: Partial<JobApplication>): Promise<JobApplication> {
    const [application] = await db
      .update(jobApplications)
      .set(updates)
      .where(eq(jobApplications.id, id))
      .returning();
    
    if (!application) {
      throw new Error("Job application not found");
    }
    return application;
  }

  async getEmailNotifications(userId: number): Promise<EmailNotification[]> {
    return await db
      .select()
      .from(emailNotifications)
      .where(eq(emailNotifications.userId, userId))
      .orderBy(desc(emailNotifications.sentAt));
  }

  async createEmailNotification(notification: { userId: number; applicationId: number; subject: string; content: string }): Promise<EmailNotification> {
    const [emailNotification] = await db
      .insert(emailNotifications)
      .values(notification)
      .returning();
    return emailNotification;
  }

  async getAllApplications(): Promise<JobApplication[]> {
    return await db
      .select()
      .from(jobApplications)
      .orderBy(desc(jobApplications.appliedAt));
  }

  async getAdminStats(): Promise<{
    totalUsers: number;
    totalApplications: number;
    activeAutomations: number;
    successRate: number;
  }> {
    const allUsers = await this.getAllUsers();
    const allApplications = await this.getAllApplications();
    
    const totalUsers = allUsers.length;
    const totalApplications = allApplications.length;
    const activeAutomations = allUsers.filter(u => u.automationActive).length;
    const successfulApplications = allApplications.filter(a => 
      a.status === "response" || a.status === "interview"
    ).length;
    const successRate = totalApplications > 0 ? 
      Math.round((successfulApplications / totalApplications) * 100) : 0;

    return {
      totalUsers,
      totalApplications,
      activeAutomations,
      successRate,
    };
  }

  async getUserStats(userId: number): Promise<{
    applicationsSent: number;
    responses: number;
    interviews: number;
    activeSearches: number;
    averageMatchScore: number;
    searchSuccessRate: number;
    mostActiveJobBoards: string[];
    topSkillsMatched: string[];
  }> {
    const applications = await this.getJobApplications(userId);
    const criteria = await this.getJobCriteria(userId);
    const history = await this.getSearchHistory(userId);
    
    const avgMatchScore = applications.length > 0 ? 
      Math.round(applications.reduce((sum, app) => sum + (app.matchScore || 0), 0) / applications.length) : 0;
    
    const successfulApplications = applications.filter(app => 
      app.status === "response" || app.status === "interview"
    ).length;
    
    const successRate = applications.length > 0 ? 
      Math.round((successfulApplications / applications.length) * 100) : 0;
    
    // Get most active job boards
    const jobBoardCounts = applications.reduce((acc, app) => {
      acc[app.source] = (acc[app.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostActiveJobBoards = Object.entries(jobBoardCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([board]) => board);
    
    // Get top skills from criteria
    const topSkills = criteria?.skills || [];
    
    return {
      applicationsSent: applications.length,
      responses: applications.filter(app => app.status === "response").length,
      interviews: applications.filter(app => app.status === "interview").length,
      activeSearches: criteria ? criteria.jobTitles.length : 0,
      averageMatchScore: avgMatchScore,
      searchSuccessRate: successRate,
      mostActiveJobBoards,
      topSkillsMatched: topSkills.slice(0, 5),
    };
  }

  // User preferences operations
  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return prefs || undefined;
  }

  async createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences> {
    const [prefs] = await db
      .insert(userPreferences)
      .values([preferences])
      .returning();
    return prefs;
  }

  async updateUserPreferences(userId: number, updates: Partial<UserPreferences>): Promise<UserPreferences> {
    const [prefs] = await db
      .update(userPreferences)
      .set(updates)
      .where(eq(userPreferences.userId, userId))
      .returning();
    
    if (!prefs) {
      throw new Error("User preferences not found");
    }
    return prefs;
  }

  // Search history operations
  async getSearchHistory(userId: number): Promise<SearchHistory[]> {
    return await db
      .select()
      .from(searchHistory)
      .where(eq(searchHistory.userId, userId))
      .orderBy(desc(searchHistory.searchedAt))
      .limit(50); // Limit to last 50 searches
  }

  async createSearchHistory(history: InsertSearchHistory): Promise<SearchHistory> {
    const [searchRecord] = await db
      .insert(searchHistory)
      .values(history)
      .returning();
    return searchRecord;
  }

  async getUserCVs(userId: number): Promise<UserCV[]> {
    return await db
      .select()
      .from(userCVs)
      .where(eq(userCVs.userId, userId))
      .orderBy(desc(userCVs.createdAt));
  }

  async createUserCV(cv: InsertUserCV): Promise<UserCV> {
    const [userCV] = await db
      .insert(userCVs)
      .values(cv)
      .returning();
    return userCV;
  }

  async updateUserCV(id: number, updates: Partial<UserCV>): Promise<UserCV> {
    const [userCV] = await db
      .update(userCVs)
      .set(updates)
      .where(eq(userCVs.id, id))
      .returning();
    
    if (!userCV) {
      throw new Error("User CV not found");
    }
    return userCV;
  }

  async deleteUserCV(id: number): Promise<void>;
  async deleteUserCV(userId: number, cvId: number): Promise<void>;
  async deleteUserCV(userIdOrId: number, cvId?: number): Promise<void> {
    if (cvId !== undefined) {
      await db
        .delete(userCVs)
        .where(and(eq(userCVs.userId, userIdOrId), eq(userCVs.id, cvId)));
    } else {
      await db
        .delete(userCVs)
        .where(eq(userCVs.id, userIdOrId));
    }
  }

  async getNotifications(userId: number): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    try {
      return await db.select().from(notifications)
        .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
        .orderBy(desc(notifications.createdAt));
    } catch (error) {
      console.error('getUnreadNotifications error:', error);
      return [];
    }
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return created;
  }

  async markNotificationAsRead(id: number): Promise<Notification> {
    const [updated] = await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(notifications.id, id))
      .returning();
    return updated;
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(notifications.userId, userId));
  }

  // Session management operations
  async createUserSession(userId: number, ipAddress: string, sessionToken: string): Promise<void> {
    // First, invalidate any existing active sessions for this user
    await db
      .update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.userId, userId));

    // Create new session
    await db.insert(userSessions).values({
      userId,
      ipAddress,
      sessionToken,
      isActive: true,
    });

    // Update user's last login IP and session token
    await db
      .update(users)
      .set({ 
        lastLoginIp: ipAddress,
        sessionToken,
      })
      .where(eq(users.id, userId));
  }



  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return user;
  }

  async getAllUserSessions(): Promise<Array<{userId: number, sessionToken: string, ipAddress: string}>> {
    const sessions = await db
      .select({
        userId: userSessions.userId,
        sessionToken: userSessions.sessionToken,
        ipAddress: userSessions.ipAddress
      })
      .from(userSessions)
      .where(eq(userSessions.isActive, true));
    return sessions;
  }

  async getUserBySession(ipAddress: string, sessionToken?: string): Promise<User | undefined> {
    if (sessionToken) {
      // First try to find by session token
      const sessionResult = await db
        .select()
        .from(userSessions)
        .innerJoin(users, eq(userSessions.userId, users.id))
        .where(and(eq(userSessions.sessionToken, sessionToken), eq(userSessions.isActive, true)));

      if (sessionResult.length > 0) {
        // Update last accessed time
        await db
          .update(userSessions)
          .set({ lastAccessed: new Date() })
          .where(eq(userSessions.sessionToken, sessionToken));
        
        return sessionResult[0].users;
      }
    }

    // Try to find any user by IP address (not just approved ones)
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.lastLoginIp, ipAddress));

    return user;
  }

  async updateUserSession(userId: number, ipAddress: string): Promise<void> {
    // Generate new session token
    const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    await this.createUserSession(userId, ipAddress, sessionToken);
  }

  async invalidateUserSession(userId: number): Promise<void> {
    await db
      .update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.userId, userId));

    await db
      .update(users)
      .set({ sessionToken: null })
      .where(eq(users.id, userId));
  }

  // Subscription operations implementation
  async updateUserSubscription(userId: number, updates: {
    subscriptionType?: string;
    subscriptionStatus?: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionStartDate?: Date;
    subscriptionEndDate?: Date;
    applicationsUsedToday?: number;
    applicationsUsedThisWeek?: number;
  }): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();
    
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async updateStripePrice(planType: string, stripePriceId: string): Promise<void> {
    await db
      .update(subscriptionPlans)
      .set({ stripePriceId })
      .where(eq(subscriptionPlans.planType, planType));
  }

  async getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.stripeCustomerId, stripeCustomerId));
    return user;
  }


  // Additional methods for JobHackr
  async getJobCriteriaByUserId(userId: number): Promise<JobCriteria | undefined> {
    return this.getJobCriteria(userId);
  }

  async getUserCV(userId: number): Promise<UserCV | undefined> {
    const cvs = await this.getUserCVs(userId);
    return cvs.length > 0 ? cvs[0] : undefined;
  }

  async saveUserCV(cv: { userId: number; language: string; content: string; filename: string }): Promise<UserCV> {
    return this.createUserCV({
      userId: cv.userId,
      language: cv.language,
      cvContent: cv.content,
      fileName: cv.filename
    });
  }

  async getTodayApplicationCount(userId: number, date: string): Promise<number> {
    const startOfDay = new Date(date + 'T00:00:00.000Z');
    const endOfDay = new Date(date + 'T23:59:59.999Z');
    
    const applications = await db
      .select()
      .from(jobApplications)
      .where(and(
        eq(jobApplications.userId, userId),
        and(
          // Note: This is a simplified date comparison for development
          // In production, you'd use proper date range queries
        )
      ));
    
    return applications.filter(app => {
      const appDate = app.appliedAt ? new Date(app.appliedAt) : new Date();
      return appDate >= startOfDay && appDate <= endOfDay;
    }).length;
  }

  async updateDailyApplicationCount(userId: number, count: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        applicationsUsedToday: count,
        lastApplicationReset: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async resetDailyApplications(userId: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        applicationsUsedToday: 0,
        lastApplicationReset: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async getApplicationsByUserAndDate(userId: number, date: string): Promise<JobApplication[]> {
    const startOfDay = new Date(date + 'T00:00:00.000Z');
    const endOfDay = new Date(date + 'T23:59:59.999Z');
    
    const applications = await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.userId, userId));
    
    return applications.filter(app => {
      if (!app.appliedAt) return false;
      const appDate = new Date(app.appliedAt);
      return appDate >= startOfDay && appDate <= endOfDay;
    });
  }

  async getJobApplicationsByUserId(userId: number, limit: number = 20, offset: number = 0): Promise<JobApplication[]> {
    return await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.userId, userId))
      .orderBy(desc(jobApplications.appliedAt))
      .limit(limit)
      .offset(offset);
  }

  async getTotalApplicationsByUserId(userId: number): Promise<number> {
    const applications = await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.userId, userId));
    return applications.length;
  }
}

export const storage = new DatabaseStorage();
