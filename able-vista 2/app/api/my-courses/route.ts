import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../lib/db'
import { validateAuth } from '../../../lib/auth'
// Import models index to ensure all models are registered
import { Enrollment, Course } from '../../../models/index'

interface CourseData {
  _id: string
  title: string
  description: string
  category: string
  level: string
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

    console.log('Auth result:', authResult)
    console.log('User ID:', authResult.user!.userId)

    // Find all enrollments for the user with status 'active' or 'completed'
    const enrollments = await Enrollment.find({ 
      user: authResult.user!.userId,
      status: { $in: ['active', 'completed'] }
    }).lean()
    
    console.log(`Found ${enrollments.length} active enrollments for user ${authResult.user!.userId}`)
    
    // Get course IDs
    const courseIds = enrollments.map(e => e.course)
    
    // Fetch courses separately
    const courseData = await Course.find({ _id: { $in: courseIds } }).lean()
    
    console.log(`Found ${courseData.length} courses for ${courseIds.length} enrollments`)
    
    // Create a map for quick lookup
    const courseMap = new Map(courseData.map(c => [c._id.toString(), c]))
    
    // Combine enrollments with course data
    const populatedEnrollments = enrollments.map(enrollment => ({
      ...enrollment,
      course: courseMap.get(enrollment.course.toString())
    }))
    
    // Sort by last accessed date
    populatedEnrollments.sort((a, b) => 
      new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime()
    )



    // Transform the data to match the expected response format
    const courses = populatedEnrollments
      .filter(enrollment => enrollment.course) // Only include enrollments with valid course data
      .map(enrollment => {
        const course = enrollment.course as any; // Type assertion for populated course
        return {
          course: {
            _id: course._id.toString(),
            title: course.title,
            description: course.description,
            category: course.category,
            level: course.level,
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
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return NextResponse.json({
      courses: [],
      error: { message: error instanceof Error ? error.message : 'Internal server error' }
    }, { status: 500 })
  }
}
