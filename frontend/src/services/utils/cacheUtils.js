// Cache utility functions following SOLID principles
export const CACHE_TTL = 60 * 60 * 1000; // 60 minutes in milliseconds

export const cacheKeys = {
  userProgress: (userId) => `user-progress-${userId}`,
  basicStats: (userId) => `basic-stats-${userId}`,
  monthlyProgress: (userId) => `monthly-progress-${userId}`,
  recentStudyTime: (userId) => `recent-study-time-${userId}`
};

export const cacheUtils = {
  get: (key) => {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        return data;
      }
      // Clean up stale cache
      localStorage.removeItem(key);
      return null;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  },

  set: (key, data) => {
    try {
      const cacheData = {
        timestamp: Date.now(),
        data
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Cache write error:', error);
    }
  },

  clear: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
};
