import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../lib/db'
import Enrollment from '../../../models/Enrollment'
import Course from '../../../models/Course'
import { validateAuth } from '../../../lib/auth'

interface CourseData {
  _id: string
  title: string
  description: string
  category: string
  level: string
  price: number
  duration: string
  estimatedHours: number
  image: string
  skills: string[]
  rating: number
  totalReviews: number
  totalStudents: number
  isPublished: boolean
}

interface EnrollmentData {
  _id: string
  status: string
  progress: number
  completedLessons: Array<{
    lesson: string
    completedAt: Date
    score?: number
    timeSpent?: number
  }>
  totalTimeSpent: number
  currentLesson?: string
  lastAccessedAt: Date
  enrolledAt: Date
  completedAt?: Date
}

interface MyCourseResponse {
  courses: Array<{
    course: CourseData
    enrollment: EnrollmentData
  }>
  error: { message: string } | null
}

export async function GET(request: NextRequest): Promise<NextResponse<MyCourseResponse>> {
  try {
    await dbConnect()

    // Validate authentication
    const authResult = await validateAuth(request)
    if (!authResult.isValid) {
      return NextResponse.json({
        courses: [],
        error: { message: authResult.error }
      }, { status: 401 })
    }

    // Find all enrollments for the user with populated course data
    const enrollments = await (Enrollment as any).find({ 
      user: authResult.user!.userId 
    })
    .populate({
      path: 'course',
      select: 'title description category level price duration estimatedHours image skills rating totalReviews totalStudents isPublished'
    })
    .sort({ lastAccessedAt: -1 })
    .lean()

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({
        courses: [],
        error: null
      })
    }

    // Transform the data to match the expected response format
    const courses = enrollments.map(enrollment => {
      const course = enrollment.course as any; // Type assertion for populated course
      return {
        course: {
          _id: course._id.toString(),
          title: course.title,
          description: course.description,
          category: course.category,
          level: course.level,
          price: course.price,
          duration: course.duration,
          estimatedHours: course.estimatedHours,
          image: course.image,
          skills: course.skills,
          rating: course.rating,
          totalReviews: course.totalReviews,
          totalStudents: course.totalStudents,
          isPublished: course.isPublished
        },
        enrollment: {
          _id: enrollment._id.toString(),
          status: enrollment.status,
          progress: enrollment.progress,
          completedLessons: enrollment.completedLessons.map(lesson => ({
            lesson: lesson.lesson.toString(),
            completedAt: lesson.completedAt,
            score: lesson.score,
            timeSpent: lesson.timeSpent
          })),
          totalTimeSpent: enrollment.totalTimeSpent,
          currentLesson: enrollment.currentLesson?.toString(),
          lastAccessedAt: enrollment.lastAccessedAt,
          enrolledAt: enrollment.enrolledAt,
          completedAt: enrollment.completedAt
        }
      };
    });

    return NextResponse.json({
      courses: courses,
      error: null
    })

  } catch (error) {
    console.error('MyCourses error:', error)
    return NextResponse.json({
      courses: [],
      error: { message: 'Internal server error' }
    }, { status: 500 })
  }
}
