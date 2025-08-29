import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../lib/db'
import { validateAuth } from '../../../lib/auth'
import { Enrollment } from '../../../models'

interface UserStatsResponse {
  success: boolean
  message: string
  data?: {
    totalHours: number
    enrolledCourses: number
    completedCourses: number
    inProgressCourses: number
    totalLessons: number
    completedLessons: number
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<UserStatsResponse>> {
  try {
    await dbConnect()

    // Validate authentication
    const authResult = await validateAuth(request)
    if (!authResult.isValid) {
      return NextResponse.json({
        success: false,
        message: authResult.error
      }, { status: 401 })
    }

    const userId = authResult.user!.userId

    // Get all enrollments for the user
    const enrollments = await Enrollment.find({ user: userId })
      .populate({
        path: 'course',
        select: 'chapters'
      })
      .populate({
        path: 'course.chapters',
        select: 'lessons'
      })
      .populate({
        path: 'course.chapters.lessons',
        select: 'durationMinutes'
      })
      .lean()

    // Debug logging
    console.log(`Found ${enrollments.length} enrollments for user ${userId}`)
    enrollments.forEach((enrollment, index) => {
      console.log(`Enrollment ${index + 1}:`, {
        id: enrollment._id,
        status: enrollment.status,
        courseId: enrollment.course?._id,
        hasCourse: !!enrollment.course
      })
    })

    // Calculate statistics
    let totalHours = 0
    let totalLessons = 0
    let completedLessons = 0
    let completedCourses = 0
    let inProgressCourses = 0
    let activeEnrollments = 0

    enrollments.forEach(enrollment => {
      // Add time spent from enrollment
      totalHours += enrollment.totalTimeSpent || 0
      
      // Count completed courses
      if (enrollment.status === 'completed') {
        completedCourses++
        activeEnrollments++
      } else if (enrollment.status === 'active') {
        inProgressCourses++
        activeEnrollments++
      }
      // Note: 'dropped' and 'paused' enrollments are not counted as active

      // Count lessons and completed lessons
      if (enrollment.course && enrollment.course.chapters) {
        enrollment.course.chapters.forEach((chapter: any) => {
          if (chapter.lessons) {
            totalLessons += chapter.lessons.length
          }
        })
      }

      // Count completed lessons
      completedLessons += enrollment.completedLessons?.length || 0
    })

    // Convert seconds to hours and round to 2 decimal places
    totalHours = Math.round((totalHours / 3600) * 100) / 100

    const stats = {
      totalHours,
      enrolledCourses: activeEnrollments, // Only count active enrollments
      completedCourses,
      inProgressCourses,
      totalLessons,
      completedLessons
    }

    console.log('Calculated stats:', stats)

    return NextResponse.json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: stats
    })

  } catch (error) {
    console.error('Get user stats error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve user statistics'
    }, { status: 500 })
  }
}
