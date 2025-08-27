'use client';

import React from 'react';
import { useMyCourses, useMyCoursesUtils } from '../hooks/use-my-courses';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Loader2, BookOpen, Clock, Star, Users } from 'lucide-react';

interface MyCoursesListProps {
  showActiveOnly?: boolean;
  maxCourses?: number;
}

export const MyCoursesList: React.FC<MyCoursesListProps> = ({ 
  showActiveOnly = false, 
  maxCourses 
}) => {
  const { courses, loading, error, refetch } = useMyCourses();
  const utils = useMyCoursesUtils(courses);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading your courses...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <Button onClick={refetch} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No courses enrolled</h3>
        <p className="text-gray-600 mb-4">
          You haven't enrolled in any courses yet. Start learning today!
        </p>
        <Button onClick={() => window.location.href = '/courses'}>
          Browse Courses
        </Button>
      </div>
    );
  }

  // Filter courses based on props
  let displayCourses = showActiveOnly ? utils.getActiveCourses() : courses;
  if (maxCourses) {
    displayCourses = displayCourses.slice(0, maxCourses);
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 text-blue-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold">{courses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="h-5 w-5 bg-green-500 rounded-full mr-2" />
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{utils.getActiveCourses().length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-orange-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Total Time</p>
                <p className="text-2xl font-bold">
                  {Math.round(utils.getTotalTimeSpent() / 3600)}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="h-5 w-5 bg-purple-500 rounded-full mr-2" />
              <div>
                <p className="text-sm text-gray-600">Avg Progress</p>
                <p className="text-2xl font-bold">{utils.getTotalProgress()}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayCourses.map(({ course, enrollment }) => (
          <Card key={course._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">
                    {course.description}
                  </CardDescription>
                </div>
                <Badge 
                  variant={enrollment.status === 'completed' ? 'default' : 
                          enrollment.status === 'active' ? 'secondary' : 'outline'}
                  className="ml-2 flex-shrink-0"
                >
                  {enrollment.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Course Meta */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1" />
                  <span>{course.rating}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{course.totalStudents}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {course.level}
                </Badge>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{enrollment.progress}%</span>
                </div>
                <Progress value={enrollment.progress} className="h-2" />
              </div>

              {/* Course Details */}
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{course.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span>{course.category}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last accessed:</span>
                  <span>
                    {new Date(enrollment.lastAccessedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button 
                  className="flex-1" 
                  size="sm"
                  onClick={() => window.location.href = `/courses/${course._id}`}
                >
                  Continue Learning
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = `/courses/${course._id}/lectures`}
                >
                  View Lectures
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Show More Button */}
      {maxCourses && courses.length > maxCourses && (
        <div className="text-center">
          <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
            View All Courses
          </Button>
        </div>
      )}
    </div>
  );
};

export default MyCoursesList;
