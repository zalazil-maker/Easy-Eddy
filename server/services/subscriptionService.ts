import type { User, SubscriptionPlan } from "@shared/schema";
import { db } from "../db";
import { users, subscriptionPlans, subscriptionHistory } from "@shared/schema";
import { eq } from "drizzle-orm";

// Subscription limits configuration
export const SUBSCRIPTION_LIMITS = {
  free: {
    applicationsPerDay: 0,
    applicationsPerWeek: 10,
    features: ['Basic job search', 'CV upload', 'Weekly applications']
  },
  weekly: {
    applicationsPerDay: 10,
    applicationsPerWeek: 70, // 10 per day * 7 days
    features: ['Daily applications', 'Priority support', 'Advanced matching']
  },
  monthly: {
    applicationsPerDay: 15,
    applicationsPerWeek: 105, // 15 per day * 7 days  
    features: ['Premium applications', 'Priority support', 'Advanced matching', 'Custom templates']
  }
};

export class SubscriptionService {
  
  /**
   * Initialize default subscription plans in database
   */
  async initializeSubscriptionPlans(): Promise<void> {
    try {
      // Check if plans already exist
      const existingPlans = await db.select().from(subscriptionPlans);
      if (existingPlans.length > 0) {
        return; // Plans already initialized
      }

      // Create the three subscription plans
      const plans = [
        {
          planType: 'free',
          name: 'Free Plan',
          description: 'Perfect for getting started with job applications',
          price: 0,
          currency: 'EUR',
          interval: null,
          applicationsPerDay: 10,
          applicationsPerWeek: 10,
          stripePriceId: null,
          features: SUBSCRIPTION_LIMITS.free.features,
        },
        {
          planType: 'weekly',
          name: 'Weekly Café En Terrasse',
          description: 'For active job seekers who want daily applications',
          price: 220, // €2.20 in cents
          currency: 'EUR',
          interval: 'week',
          applicationsPerDay: 10,
          applicationsPerWeek: 70,
          stripePriceId: null, // Will be set when Stripe keys are provided
          features: SUBSCRIPTION_LIMITS.weekly.features,
        },
        {
          planType: 'monthly',
          name: 'Monthly Coca En Terrasse',
          description: 'Best value for serious job seekers with premium features',
          price: 499, // €4.99 in cents
          currency: 'EUR',
          interval: 'month',
          applicationsPerDay: 10,
          applicationsPerWeek: 70,
          stripePriceId: null, // Will be set when Stripe keys are provided
          features: SUBSCRIPTION_LIMITS.monthly.features,
        }
      ];

      await db.insert(subscriptionPlans).values(plans);
      console.log('✅ Subscription plans initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize subscription plans:', error);
    }
  }

  /**
   * Get all available subscription plans
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true));
  }

  /**
   * Check if user can make application based on their subscription
   */
  async canUserApply(userId: number): Promise<{
    canApply: boolean;
    reason?: string;
    applicationsLeft: number;
    resetTime?: Date;
  }> {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user.length) {
      return { canApply: false, reason: 'User not found', applicationsLeft: 0 };
    }

    const userRecord = user[0];
    const subscriptionType = userRecord.subscriptionType || 'free';
    const limits = SUBSCRIPTION_LIMITS[subscriptionType as keyof typeof SUBSCRIPTION_LIMITS];

    // Reset counters if needed
    await this.resetApplicationCountersIfNeeded(userId, userRecord);

    // Refresh user data after potential reset
    const updatedUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const currentUser = updatedUser[0];

    let canApply = false;
    let applicationsLeft = 0;
    let resetTime: Date | undefined;

    if (subscriptionType === 'free') {
      // Free users: 10 applications per week
      applicationsLeft = Math.max(0, limits.applicationsPerWeek - (currentUser.applicationsUsedThisWeek || 0));
      canApply = applicationsLeft > 0;
      resetTime = this.getNextWeeklyReset();
    } else {
      // Paid users: daily applications
      applicationsLeft = Math.max(0, limits.applicationsPerDay - (currentUser.applicationsUsedToday || 0));
      canApply = applicationsLeft > 0;
      resetTime = this.getNextDailyReset();
    }

    return {
      canApply,
      reason: canApply ? undefined : 'Application limit reached for your subscription',
      applicationsLeft,
      resetTime
    };
  }

  /**
   * Record a job application for subscription tracking
   */
  async recordJobApplication(userId: number): Promise<void> {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user.length) return;

    const userRecord = user[0];
    const subscriptionType = userRecord.subscriptionType || 'free';

    // Reset counters if needed
    await this.resetApplicationCountersIfNeeded(userId, userRecord);

    // Increment appropriate counter
    if (subscriptionType === 'free') {
      // Free users: increment weekly counter
      await db.update(users)
        .set({ 
          applicationsUsedThisWeek: (userRecord.applicationsUsedThisWeek || 0) + 1 
        })
        .where(eq(users.id, userId));
    } else {
      // Paid users: increment both daily and weekly counters
      await db.update(users)
        .set({ 
          applicationsUsedToday: (userRecord.applicationsUsedToday || 0) + 1,
          applicationsUsedThisWeek: (userRecord.applicationsUsedThisWeek || 0) + 1 
        })
        .where(eq(users.id, userId));
    }
  }

  /**
   * Reset application counters based on subscription type and time
   */
  private async resetApplicationCountersIfNeeded(userId: number, user: any): Promise<void> {
    const now = new Date();
    const lastReset = user.lastApplicationReset ? new Date(user.lastApplicationReset) : new Date(0);

    let needsReset = false;
    let resetDaily = false;
    let resetWeekly = false;

    // Check if daily reset is needed (for paid users)
    const daysSinceReset = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceReset >= 1) {
      resetDaily = true;
      needsReset = true;
    }

    // Check if weekly reset is needed (for all users)
    const weeksSinceReset = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24 * 7));
    if (weeksSinceReset >= 1) {
      resetWeekly = true;
      needsReset = true;
    }

    if (needsReset) {
      const updateData: any = { lastApplicationReset: now };
      
      if (resetDaily) {
        updateData.applicationsUsedToday = 0;
      }
      
      if (resetWeekly) {
        updateData.applicationsUsedThisWeek = 0;
      }

      await db.update(users).set(updateData).where(eq(users.id, userId));
    }
  }

  /**
   * Get next daily reset time (midnight)
   */
  private getNextDailyReset(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  /**
   * Get next weekly reset time (Monday midnight)
   */
  private getNextWeeklyReset(): Date {
    const nextWeek = new Date();
    const daysUntilMonday = (7 - nextWeek.getDay() + 1) % 7 || 7;
    nextWeek.setDate(nextWeek.getDate() + daysUntilMonday);
    nextWeek.setHours(0, 0, 0, 0);
    return nextWeek;
  }

  /**
   * Upgrade user subscription
   */
  async upgradeUserSubscription(
    userId: number, 
    planType: 'weekly' | 'monthly',
    stripeSubscriptionId?: string
  ): Promise<void> {
    const startDate = new Date();
    let endDate: Date;

    if (planType === 'weekly') {
      endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week
    } else {
      endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }

    // Update user subscription
    await db.update(users)
      .set({
        subscriptionType: planType,
        subscriptionStatus: 'active',
        stripeSubscriptionId,
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate,
        applicationsUsedToday: 0,
        applicationsUsedThisWeek: 0,
        lastApplicationReset: startDate,
      })
      .where(eq(users.id, userId));

    // Record in subscription history
    await db.insert(subscriptionHistory).values({
      userId,
      planType,
      stripeSubscriptionId,
      status: 'active',
      startDate,
      endDate,
    });
  }

  /**
   * Cancel user subscription
   */
  async cancelUserSubscription(userId: number): Promise<void> {
    const now = new Date();

    await db.update(users)
      .set({
        subscriptionStatus: 'canceled',
      })
      .where(eq(users.id, userId));

    // Update subscription history
    const activeSubscription = await db.select()
      .from(subscriptionHistory)
      .where(eq(subscriptionHistory.userId, userId))
      .orderBy(subscriptionHistory.createdAt)
      .limit(1);

    if (activeSubscription.length > 0) {
      await db.update(subscriptionHistory)
        .set({
          status: 'canceled',
          canceledAt: now,
        })
        .where(eq(subscriptionHistory.id, activeSubscription[0].id));
    }
  }

  /**
   * Get user's current subscription info
   */
  async getUserSubscriptionInfo(userId: number): Promise<{
    plan: SubscriptionPlan | null;
    status: string;
    applicationsUsedToday: number;
    applicationsUsedThisWeek: number;
    applicationsLeft: number;
    resetTime: Date;
  }> {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user.length) {
      throw new Error('User not found');
    }

    const userRecord = user[0];
    const subscriptionType = userRecord.subscriptionType || 'free';
    
    const plan = await db.select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.planType, subscriptionType))
      .limit(1);

    const limits = SUBSCRIPTION_LIMITS[subscriptionType as keyof typeof SUBSCRIPTION_LIMITS];
    
    let applicationsLeft = 0;
    let resetTime: Date;

    if (subscriptionType === 'free') {
      applicationsLeft = Math.max(0, limits.applicationsPerWeek - (userRecord.applicationsUsedThisWeek || 0));
      resetTime = this.getNextWeeklyReset();
    } else {
      applicationsLeft = Math.max(0, limits.applicationsPerDay - (userRecord.applicationsUsedToday || 0));
      resetTime = this.getNextDailyReset();
    }

    return {
      plan: plan.length > 0 ? plan[0] : null,
      status: userRecord.subscriptionStatus || 'active',
      applicationsUsedToday: userRecord.applicationsUsedToday || 0,
      applicationsUsedThisWeek: userRecord.applicationsUsedThisWeek || 0,
      applicationsLeft,
      resetTime
    };
  }
}

export const subscriptionService = new SubscriptionService();