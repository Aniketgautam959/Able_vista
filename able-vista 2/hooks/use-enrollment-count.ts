import { useState, useEffect } from 'react';

interface EnrollmentCountData {
  courseId: string;
  enrollmentCount: number;
  activeEnrollments: number;
  completedEnrollments: number;
  error: string | null;
}

interface UseEnrollmentCountReturn {
  enrollmentStats: EnrollmentCountData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useEnrollmentCount = (courseId: string): UseEnrollmentCountReturn => {
  const [enrollmentStats, setEnrollmentStats] = useState<EnrollmentCountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnrollmentCount = async () => {
    if (!courseId) {
      setError('Course ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/courses/${courseId}/enrollment-count`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch enrollment count');
      }

      if (data.error) {
        throw new Error(data.error.message);
      }

      setEnrollmentStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch enrollment count';
      setError(errorMessage);
      console.error('Error fetching enrollment count:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollmentCount();
  }, [courseId]);

  const refetch = async () => {
    await fetchEnrollmentCount();
  };

  return {
    enrollmentStats,
    loading,
    error,
    refetch,
  };
};

// Utility functions for working with enrollment statistics
export const useEnrollmentStatsUtils = (enrollmentStats: EnrollmentCountData | null) => {
  const getCompletionRate = () => {
    if (!enrollmentStats || enrollmentStats.enrollmentCount === 0) return 0;
    return Math.round((enrollmentStats.completedEnrollments / enrollmentStats.enrollmentCount) * 100);
  };

  const getActiveRate = () => {
    if (!enrollmentStats || enrollmentStats.enrollmentCount === 0) return 0;
    return Math.round((enrollmentStats.activeEnrollments / enrollmentStats.enrollmentCount) * 100);
  };

  const getDropoutRate = () => {
    if (!enrollmentStats || enrollmentStats.enrollmentCount === 0) return 0;
    const droppedEnrollments = enrollmentStats.enrollmentCount - enrollmentStats.activeEnrollments - enrollmentStats.completedEnrollments;
    return Math.round((droppedEnrollments / enrollmentStats.enrollmentCount) * 100);
  };

  const formatEnrollmentCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const getEnrollmentTrend = () => {
    if (!enrollmentStats) return 'neutral';
    
    const completionRate = getCompletionRate();
    const activeRate = getActiveRate();
    
    if (completionRate >= 70) return 'excellent';
    if (completionRate >= 50) return 'good';
    if (activeRate >= 60) return 'active';
    return 'needs_attention';
  };

  return {
    getCompletionRate,
    getActiveRate,
    getDropoutRate,
    formatEnrollmentCount,
    getEnrollmentTrend,
  };
};
