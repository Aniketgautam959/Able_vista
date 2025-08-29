import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db'
import { validateAuth } from '../../../../lib/auth'
import { Enrollment, Course, Chapter, Lesson } from '../../../../models'

interface InProgressResponse {
  success: boolean
  message: string
  data?: {
    inProgressCourses: Array<{
      course: {
        _id: string
        title: string
        description: string
        image: string
        category: string
        level: string
        duration: string
        estimatedHours: number
      }
      enrollment: {
        _id: string
        progress: number
        totalTimeSpent: number
        lastAccessedAt: Date
        currentLesson?: string
        completedLessons: Array<{
          lesson: string
          completedAt: Date
          score?: number
        }>
      }
      nextLesson?: {
        _id: string
        title: string
        description: string
        type: string
        duration: string
      }
      timeToComplete: number // estimated hours remaining
    }>
    totalInProgress: number
    totalTimeSpent: number
    averageProgress: number
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<InProgressResponse>> {
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

    // Get in-progress enrollments
    const enrollments = await Enrollment.find({ 
      user: userId,
      status: 'active' // Only active enrollments
    })
    .populate({
      path: 'course',
      select: 'title description image category level duration estimatedHours chapters'
    })
    .populate({
      path: 'currentLesson',
      select: 'title description type duration'
    })
    .populate({
      path: 'course.chapters',
      select: 'lessons order'
    })
    .populate({
      path: 'course.chapters.lessons',
      select: 'title description type duration order'
    })
    .sort({ lastAccessedAt: -1 })
    .lean()

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No in-progress courses found',
        data: {
          inProgressCourses: [],
          totalInProgress: 0,
          totalTimeSpent: 0,
          averageProgress: 0
        }
      })
    }

    // Process each enrollment to get detailed information
    const inProgressCourses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = enrollment.course as any
        
        // Find the next lesson to complete
        let nextLesson = null
        if (course.chapters && course.chapters.length > 0) {
          // Sort chapters and lessons by order
          const sortedChapters = course.chapters.sort((a: any, b: any) => a.order - b.order)
          
          for (const chapter of sortedChapters) {
            if (chapter.lessons && chapter.lessons.length > 0) {
              const sortedLessons = chapter.lessons.sort((a: any, b: any) => a.order - b.order)
              
              // Find the first lesson that hasn't been completed
              for (const lesson of sortedLessons) {
                const isCompleted = enrollment.completedLessons.some(
                  (completed: any) => completed.lesson.toString() === lesson._id.toString()
                )
                
                if (!isCompleted) {
                  nextLesson = lesson
                  break
                }
              }
              if (nextLesson) break
            }
          }
        }

        // Calculate time to complete (estimated hours remaining)
        const totalLessons = course.chapters?.reduce((total: number, chapter: any) => 
          total + (chapter.lessons?.length || 0), 0) || 0
        const completedLessons = enrollment.completedLessons.length
        const remainingLessons = totalLessons - completedLessons
        
        const timeToComplete = totalLessons > 0 
          ? Math.round((remainingLessons / totalLessons) * course.estimatedHours * 100) / 100
          : 0

        return {
          course: {
            _id: course._id.toString(),
            title: course.title,
            description: course.description,
            image: course.image,
            category: course.category,
            level: course.level,
            duration: course.duration,
            estimatedHours: course.estimatedHours
          },
          enrollment: {
            _id: enrollment._id.toString(),
            progress: enrollment.progress,
            totalTimeSpent: enrollment.totalTimeSpent,
            lastAccessedAt: enrollment.lastAccessedAt,
            currentLesson: enrollment.currentLesson?.toString(),
            completedLessons: enrollment.completedLessons.map((lesson: any) => ({
              lesson: lesson.lesson.toString(),
              completedAt: lesson.completedAt,
              score: lesson.score
            }))
          },
          nextLesson: nextLesson ? {
            _id: nextLesson._id.toString(),
            title: nextLesson.title,
            description: nextLesson.description,
            type: nextLesson.type,
            duration: nextLesson.duration
          } : null,
          timeToComplete
        }
      })
    )

    // Calculate summary statistics
    const totalInProgress = inProgressCourses.length
    const totalTimeSpent = inProgressCourses.reduce((total, course) => 
      total + course.enrollment.totalTimeSpent, 0) / 3600 // Convert to hours
    const averageProgress = inProgressCourses.length > 0 
      ? Math.round(inProgressCourses.reduce((total, course) => 
          total + course.enrollment.progress, 0) / inProgressCourses.length)
      : 0

    return NextResponse.json({
      success: true,
      message: 'In-progress courses retrieved successfully',
      data: {
        inProgressCourses,
        totalInProgress,
        totalTimeSpent: Math.round(totalTimeSpent * 100) / 100,
        averageProgress
      }
    })

  } catch (error) {
    console.error('Get in-progress courses error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve in-progress courses'
    }, { status: 500 })
  }
}
