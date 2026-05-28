module.exports = {
  platforms: {
    facebook: { apiVersion: 'v18.0', rateLimit: 10, maxPostsPerDay: 2 },
    google: { apiVersion: 'v3', rateLimit: 100, maxPostsPerDay: 1 },
    linkedin: { apiVersion: 'v2', rateLimit: 50, maxPostsPerDay: 1 },
    twitter: { apiVersion: '2', rateLimit: 300, maxPostsPerDay: 5 },
    instagram: { apiVersion: 'v1', rateLimit: 200, maxPostsPerDay: 3 },
  },
  defaultBudgets: {
    free: 0,
    starter: 5000,
    professional: 15000,
    enterprise: 50000,
  },
  abTestDefaults: {
    durationDays: 7,
    confidenceThreshold: 0.95,
  },
  truthfulMarketing: {
    noUrgencyWords: true,
    noFalseClaims: true,
    noCountdowns: true,
    noSpecials: true,
    noDirectContact: true,
  }
};
