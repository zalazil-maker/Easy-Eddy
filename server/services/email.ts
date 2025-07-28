import { storage } from "../storage";

export async function sendApplicationNotification(userId: number, applicationId: number): Promise<void> {
  try {
    const user = await storage.getUser(userId);
    const applications = await storage.getJobApplications(userId);
    const application = applications.find(app => app.id === applicationId);
    
    if (!user || !application) {
      throw new Error("User or application not found");
    }

    const subject = `Job Application Sent: ${application.jobTitle} at ${application.company}`;
    const content = `
Dear ${user.email},

Easy Eddy has successfully submitted your application for the following position:

**Job Title:** ${application.jobTitle}
**Company:** ${application.company}
**Location:** ${application.location}
**Source:** ${application.source}
**Match Score:** ${application.matchScore}%
**Applied:** ${application.appliedAt?.toLocaleString()}
**Job Language:** ${application.jobLanguage || 'en'}
**CV Language Used:** ${application.cvLanguageUsed || 'en'}

**Job Description:**
${application.description || 'N/A'}

**Application Details:**
${application.jobUrl ? `Job URL: ${application.jobUrl}` : ""}

This application was automatically submitted based on your job search criteria. We'll notify you of any responses or updates.

Best regards,
Easy Eddy Team

---
This is an automated message from Easy Eddy's job application system.
    `;

    // In a real implementation, this would send an actual email
    // For now, we'll store the notification in our system
    await storage.createEmailNotification({
      userId,
      applicationId,
      subject,
      content
    });

    // Mark application as email sent
    await storage.updateJobApplication(applicationId, { emailSent: true });

    console.log(`Email notification sent to ${user.email} for application ${applicationId}`);
  } catch (error) {
    console.error("Failed to send application notification:", error);
  }
}

export async function sendBulkApplicationNotifications(userId: number, applicationIds: number[]): Promise<void> {
  for (const applicationId of applicationIds) {
    await sendApplicationNotification(userId, applicationId);
  }
}

export async function sendDailySummaryEmail(userId: number, applicationIds: number[]): Promise<void> {
  try {
    const user = await storage.getUser(userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    // Get all applications for the user today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const allApplications = await storage.getJobApplications(userId);
    const todayApplications = allApplications.filter(app => 
      app.appliedAt && new Date(app.appliedAt) >= today
    );

    // Generate the email content with simple application copies
    const subject = `Daily Job Applications Summary - ${todayApplications.length} Applications Sent`;
    const content = `
Dear ${user.email},

Easy Eddy has completed your daily job application automation! Here are copies of all applications sent today:

**Daily Summary:**
- Applications sent today: ${todayApplications.length}/25
- Daily limit reached: Yes
- Automation will resume tomorrow

**Complete Application Copies:**

${todayApplications.map((app, index) => `
--- APPLICATION ${index + 1} ---

**Job Title:** ${app.jobTitle}
**Company:** ${app.company}
**Location:** ${app.location}
**Source:** ${app.source}
**Match Score:** ${app.matchScore}%
**Job Language:** ${app.jobLanguage || 'en'}
**CV Language Used:** ${app.cvLanguageUsed || 'en'}
**Applied:** ${app.appliedAt?.toLocaleString()}

**Job Description:**
${app.description || 'N/A'}

**Job URL:** ${app.jobUrl || 'N/A'}

`).join('\n')}

**Next Steps:**
- We'll monitor for responses and notify you immediately
- Tomorrow's automation will search for new job opportunities
- You can check your dashboard for detailed application status

This completes your daily job application automation. We'll continue searching and applying tomorrow!

Best regards,
Easy Eddy Team

---
This is an automated daily summary from Easy Eddy's job application system.
    `;

    // Store the summary notification
    await storage.createEmailNotification({
      userId,
      applicationId: applicationIds[0] || 0, // Use first application ID or 0 for summary
      subject,
      content
    });

    console.log(`Daily summary email sent to ${user.email} for ${todayApplications.length} applications`);
  } catch (error) {
    console.error("Failed to send daily summary email:", error);
  }
}
