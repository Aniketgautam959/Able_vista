import { useState, useEffect } from 'react';

interface CourseData {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  estimatedHours: number;
  image: string;
  skills: string[];
  rating: number;
  totalReviews: number;
  totalStudents: number;
  isPublished: boolean;
}

interface CompletedLesson {
  lesson: string;
  completedAt: Date;
  score?: number;
  timeSpent?: number;
}

interface EnrollmentData {
  _id: string;
  status: 'active' | 'completed' | 'dropped' | 'paused';
  progress: number;
  completedLessons: CompletedLesson[];
  totalTimeSpent: number;
  currentLesson?: string;
  lastAccessedAt: Date;
  enrolledAt: Date;
  completedAt?: Date;
}

interface MyCourse {
  course: CourseData;
  enrollment: EnrollmentData;
}

interface UseMyCoursesReturn {
  courses: MyCourse[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useMyCourses = (): UseMyCoursesReturn => {
  const [courses, setCourses] = useState<MyCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/my-courses', {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch courses');
      }

      if (data.error) {
        throw new Error(data.error.message);
      }

      setCourses(data.courses || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch courses';
      setError(errorMessage);
      console.error('Error fetching my courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const refetch = async () => {
    await fetchCourses();
  };

  return {
    courses,
    loading,
    error,
    refetch,
  };
};

// Utility functions for working with the courses data
export const useMyCoursesUtils = (courses: MyCourse[]) => {
  const getActiveCourses = () => 
    courses.filter(course => course.enrollment.status === 'active');

  const getCompletedCourses = () => 
    courses.filter(course => course.enrollment.status === 'completed');

  const getCourseById = (courseId: string) => 
    courses.find(course => course.course._id === courseId);

  const getCoursesByCategory = (category: string) => 
    courses.filter(course => course.course.category === category);

  const getCoursesByLevel = (level: string) => 
    courses.filter(course => course.course.level === level);

  const getTotalProgress = () => {
    if (courses.length === 0) return 0;
    const totalProgress = courses.reduce((sum, course) => sum + course.enrollment.progress, 0);
    return Math.round(totalProgress / courses.length);
  };

  const getTotalTimeSpent = () => 
    courses.reduce((total, course) => total + course.enrollment.totalTimeSpent, 0);

  const getRecentlyAccessedCourses = (limit: number = 5) => 
    [...courses]
      .sort((a, b) => new Date(b.enrollment.lastAccessedAt).getTime() - new Date(a.enrollment.lastAccessedAt).getTime())
      .slice(0, limit);

  return {
    getActiveCourses,
    getCompletedCourses,
    getCourseById,
    getCoursesByCategory,
    getCoursesByLevel,
    getTotalProgress,
    getTotalTimeSpent,
    getRecentlyAccessedCourses,
  };
};
