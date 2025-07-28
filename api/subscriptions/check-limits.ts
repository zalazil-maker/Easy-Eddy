import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from "../../server/storage";

interface SubscriptionLimits {
  dailyApplications: number;
  features: {
    languageDetection: boolean;
    translation: boolean;
    autoCoverLetter: boolean;
    onDemandCoverLetter: boolean;
    cvOptimization: boolean;
  };
}

const SUBSCRIPTION_LIMITS: Record<string, SubscriptionLimits> = {
  free: {
    dailyApplications: 10,
    features: {
      languageDetection: true,
      translation: true,
      autoCoverLetter: true,
      onDemandCoverLetter: false,
      cvOptimization: false
    }
  },
  weekly: {
    dailyApplications: 10,
    features: {
      languageDetection: true,
      translation: true,
      autoCoverLetter: true,
      onDemandCoverLetter: false,
      cvOptimization: false
    }
  },
  monthly: {
    dailyApplications: 10,
    features: {
      languageDetection: true,
      translation: true,
      autoCoverLetter: true,
      onDemandCoverLetter: false,
      cvOptimization: false
    }
  },
  premium: {
    dailyApplications: 30,
    features: {
      languageDetection: true,
      translation: true,
      autoCoverLetter: true,
      onDemandCoverLetter: true,
      cvOptimization: true
    }
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    const user = await storage.getUser(parseInt(userId as string));
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if subscription is active
    const isSubscriptionActive = user.subscriptionStatus === 'active' && 
      (!user.subscriptionEndDate || user.subscriptionEndDate > new Date());

    const currentTier = isSubscriptionActive ? user.subscriptionTier : 'free';
    const limits = SUBSCRIPTION_LIMITS[currentTier] || SUBSCRIPTION_LIMITS.free;

    // Check daily usage
    const today = new Date().toISOString().split('T')[0];
    const todayApplications = await storage.getTodayApplicationCount(parseInt(userId as string), today);

    // Check if daily limit reset is needed
    const lastReset = user.lastApplicationReset;
    const isNewDay = !lastReset || 
      lastReset.toISOString().split('T')[0] !== today;

    if (isNewDay) {
      await storage.resetDailyApplications(parseInt(userId as string));
    }

    const remainingApplications = Math.max(0, limits.dailyApplications - todayApplications);

    res.status(200).json({
      success: true,
      subscription: {
        tier: currentTier,
        status: user.subscriptionStatus,
        isActive: isSubscriptionActive,
        expiresAt: user.subscriptionEndDate
      },
      limits: {
        dailyApplications: limits.dailyApplications,
        remainingApplications,
        applicationsUsedToday: todayApplications
      },
      features: limits.features,
      resetTime: isNewDay ? new Date() : null
    });

  } catch (error) {
    console.error("Check limits error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}