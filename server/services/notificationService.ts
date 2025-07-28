import { storage } from "../storage";
import type { InsertNotification } from "@shared/schema";

export class NotificationService {
  
  /**
   * Send immediate notification after job applications are sent
   */
  async sendJobApplicationsNotification(userId: number, applicationIds: number[]): Promise<void> {
    try {
      const applicationsCount = applicationIds.length;
      
      await storage.createNotification({
        userId,
        type: "job_applications_sent",
        title: `${applicationsCount} Job Applications Sent!`,
        message: `Great news! We've successfully sent ${applicationsCount} job applications for you today. Check your recent applications to see the details.`,
        data: {
          applicationIds,
          applicationsCount,
          timestamp: new Date().toISOString()
        }
      });
      
      console.log(`📱 Immediate notification sent to user ${userId}: ${applicationsCount} applications`);
    } catch (error) {
      console.error("Error sending job applications notification:", error);
    }
  }

  /**
   * Schedule follow-up notification 3 hours after applications
   */
  async scheduleFollowupNotification(userId: number, applicationIds: number[]): Promise<void> {
    try {
      const scheduledTime = new Date();
      scheduledTime.setHours(scheduledTime.getHours() + 3);
      
      await storage.createNotification({
        userId,
        type: "daily_followup",
        title: "Job Applications Update",
        message: `Your ${applicationIds.length} job applications from today are being processed. Companies typically review applications within 24-48 hours. Keep an eye on your email for responses!`,
        data: {
          applicationIds,
          applicationsCount: applicationIds.length,
          originalTime: new Date().toISOString()
        },
        scheduledFor: scheduledTime
      });
      
      console.log(`⏰ Follow-up notification scheduled for ${scheduledTime.toLocaleTimeString()}`);
    } catch (error) {
      console.error("Error scheduling follow-up notification:", error);
    }
  }

  /**
   * Schedule evening summary notification
   */
  async scheduleEveningSummary(userId: number, applicationIds: number[]): Promise<void> {
    try {
      const eveningTime = new Date();
      eveningTime.setHours(20, 0, 0, 0); // 8 PM
      
      // If it's already past 8 PM, schedule for tomorrow
      if (new Date() > eveningTime) {
        eveningTime.setDate(eveningTime.getDate() + 1);
      }
      
      const applications = await Promise.all(
        applicationIds.map(id => storage.getJobApplications(userId).then(apps => 
          apps.find(app => app.id === id)
        ))
      );
      
      const validApplications = applications.filter(app => app !== undefined);
      const topCompanies = [...new Set(validApplications.map(app => app.company))].slice(0, 3);
      
      await storage.createNotification({
        userId,
        type: "evening_summary",
        title: "Daily Job Search Summary",
        message: `Today's job search complete! Applied to ${applicationIds.length} positions including roles at ${topCompanies.join(", ")}. Your automated job search will continue tomorrow with fresh opportunities.`,
        data: {
          applicationIds,
          applicationsCount: applicationIds.length,
          topCompanies,
          searchDate: new Date().toISOString().split('T')[0]
        },
        scheduledFor: eveningTime
      });
      
      console.log(`🌙 Evening summary scheduled for ${eveningTime.toLocaleTimeString()}`);
    } catch (error) {
      console.error("Error scheduling evening summary:", error);
    }
  }

  /**
   * Process scheduled notifications that are ready to be sent
   */
  async processScheduledNotifications(): Promise<void> {
    try {
      // In a real implementation, this would be called by a cron job or background worker
      // For now, we'll simulate it being called periodically
      console.log("🔄 Processing scheduled notifications...");
      
      // This is a mock implementation - in production you'd query for scheduled notifications
      // that are ready to be sent and move them to active notifications
    } catch (error) {
      console.error("Error processing scheduled notifications:", error);
    }
  }

  /**
   * Send all three notifications for a job application session
   */
  async sendJobApplicationNotifications(userId: number, applicationIds: number[]): Promise<void> {
    // Send immediate notification
    await this.sendJobApplicationsNotification(userId, applicationIds);
    
    // Schedule 3-hour follow-up
    await this.scheduleFollowupNotification(userId, applicationIds);
    
    // Schedule evening summary
    await this.scheduleEveningSummary(userId, applicationIds);
  }

  /**
   * Get notifications for a user (for displaying in the app)
   */
  async getUserNotifications(userId: number): Promise<any[]> {
    try {
      const notifications = await storage.getNotifications(userId);
      return notifications.map(notification => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
        scheduledFor: notification.scheduledFor,
        readAt: notification.readAt
      }));
    } catch (error) {
      console.error("Error getting user notifications:", error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: number): Promise<void> {
    try {
      await storage.markNotificationAsRead(notificationId);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: number): Promise<void> {
    try {
      await storage.markAllNotificationsAsRead(userId);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }
}

export const notificationService = new NotificationService();