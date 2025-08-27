# API Documentation

## My Courses API

### GET /api/my-courses

Returns all courses that the authenticated user is enrolled in, along with their enrollment details.

#### Authentication
This endpoint requires authentication via JWT token in cookies.

#### Request
```http
GET /api/my-courses
Cookie: token=your_jwt_token
```

#### Response

**Success (200)**
```json
{
  "courses": [
    {
      "course": {
        "_id": "course_id",
        "title": "React Fundamentals",
        "description": "Learn React basics",
        "category": "Web Development",
        "level": "Beginner",
        "price": 49.99,
        "duration": "8 weeks",
        "estimatedHours": 40,
        "image": "course_image_url",
        "skills": ["JavaScript", "React", "JSX"],
        "rating": 4.5,
        "totalReviews": 120,
        "totalStudents": 500,
        "isPublished": true
      },
      "enrollment": {
        "_id": "enrollment_id",
        "status": "active",
        "progress": 75,
        "completedLessons": [
          {
            "lesson": "lesson_id",
            "completedAt": "2024-01-15T10:30:00Z",
            "score": 85,
            "timeSpent": 1800
          }
        ],
        "totalTimeSpent": 7200,
        "currentLesson": "current_lesson_id",
        "lastAccessedAt": "2024-01-15T10:30:00Z",
        "enrolledAt": "2024-01-01T09:00:00Z",
        "completedAt": null
      }
    }
  ],
  "error": null
}
```

**No Enrollments (200)**
```json
{
  "courses": [],
  "error": null
}
```

**Unauthorized (401)**
```json
{
  "courses": [],
  "error": {
    "message": "No authentication token provided"
  }
}
```

**Invalid Token (401)**
```json
{
  "courses": [],
  "error": {
    "message": "Invalid or expired token"
  }
}
```

**Server Error (500)**
```json
{
  "courses": [],
  "error": {
    "message": "Internal server error"
  }
}
```

#### Features

- **Authentication**: Uses JWT token from cookies for user identification
- **Course Details**: Returns complete course information including title, description, category, level, price, etc.
- **Enrollment Status**: Shows enrollment status (active, completed, dropped, paused)
- **Progress Tracking**: Includes progress percentage and completed lessons
- **Time Tracking**: Shows total time spent and individual lesson completion times
- **Sorting**: Results are sorted by last accessed date (most recent first)

#### Usage Examples

**JavaScript/Fetch**
```javascript
const response = await fetch('/api/my-courses', {
  method: 'GET',
  credentials: 'include' // Include cookies
});

const data = await response.json();
console.log(data.courses);
```

**React Hook Example**
```javascript
import { useState, useEffect } from 'react';

const useMyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/my-courses', {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (data.error) {
          setError(data.error.message);
        } else {
          setCourses(data.courses);
        }
      } catch (err) {
        setError('Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return { courses, loading, error };
};
```

#### Integration Notes

- The API automatically handles user authentication through the JWT token
- Courses are returned with their full details and enrollment information
- Progress is calculated automatically based on completed lessons
- The endpoint supports all enrollment statuses and provides comprehensive course data

## Course Enrollment Count API

### GET /api/courses/:id/enrollment-count

Returns the enrollment statistics for a specific course.

#### Request
```http
GET /api/courses/68a93fc56f03809bae993756/enrollment-count
```

#### Response

**Success (200)**
```json
{
  "courseId": "68a93fc56f03809bae993756",
  "enrollmentCount": 150,
  "activeEnrollments": 120,
  "completedEnrollments": 30,
  "error": null
}
```

**Course Not Found (200)**
```json
{
  "courseId": "68a93fc56f03809bae993756",
  "enrollmentCount": 0,
  "activeEnrollments": 0,
  "completedEnrollments": 0,
  "error": null
}
```

**Bad Request (400)**
```json
{
  "courseId": "",
  "enrollmentCount": 0,
  "activeEnrollments": 0,
  "completedEnrollments": 0,
  "error": {
    "message": "Course ID is required"
  }
}
```

**Server Error (500)**
```json
{
  "courseId": "68a93fc56f03809bae993756",
  "enrollmentCount": 0,
  "activeEnrollments": 0,
  "completedEnrollments": 0,
  "error": {
    "message": "Internal server error"
  }
}
```

#### Features

- **Total Enrollments**: Returns the total number of students enrolled in the course
- **Active Enrollments**: Shows how many students are currently actively learning
- **Completed Enrollments**: Shows how many students have completed the course
- **Real-time Data**: Provides up-to-date enrollment statistics
- **Error Handling**: Comprehensive error handling for various scenarios

#### Usage Examples

**JavaScript/Fetch**
```javascript
const response = await fetch('/api/courses/68a93fc56f03809bae993756/enrollment-count');
const data = await response.json();
console.log(`Total enrollments: ${data.enrollmentCount}`);
console.log(`Active students: ${data.activeEnrollments}`);
console.log(`Completed: ${data.completedEnrollments}`);
```

**React Hook Example**
```javascript
import { useState, useEffect } from 'react';

const useEnrollmentCount = (courseId) => {
  const [enrollmentStats, setEnrollmentStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEnrollmentCount = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}/enrollment-count`);
        const data = await response.json();
        
        if (data.error) {
          setError(data.error.message);
        } else {
          setEnrollmentStats(data);
        }
      } catch (err) {
        setError('Failed to fetch enrollment count');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchEnrollmentCount();
    }
  }, [courseId]);

  return { enrollmentStats, loading, error };
};
```

#### Integration Notes

- No authentication required - this is a public endpoint
- Returns real-time enrollment data from the database
- Useful for displaying course popularity and completion rates
- Can be used to show enrollment statistics on course pages
