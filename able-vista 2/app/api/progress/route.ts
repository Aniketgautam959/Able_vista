import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../lib/db'
import Progress from '../../../models/Progress'
import { validateAuth } from '../../../lib/auth'

interface ProgressData {
  _id: string
  user: string
  course: string
  lesson: string
  bestScore: number
  lastAccessedAt: string
  isCompleted: boolean
}

interface ProgressResponse {
  success: boolean
  message: string
  data?: ProgressData | ProgressData[]
  error?: string
}

// GET /api/progress - Get progress for a specific lesson or all lessons in a course
export async function GET(request: NextRequest): Promise<NextResponse<ProgressResponse>> {
  try {
    await dbConnect()
    const authResult = await validateAuth(request)
    if (!authResult.isValid) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized',
        error: authResult.error 
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get('lesson')
    const courseId = searchParams.get('course')

    if (lessonId) {
      // Get progress for a specific lesson
      const progress = await Progress.findOne({
        user: authResult.user!.userId,
        lesson: lessonId
      }).lean()

      if (!progress) {
        return NextResponse.json({
          success: true,
          message: 'No progress found for this lesson',
          data: {
            _id: '',
            user: authResult.user!.userId,
            course: courseId || '',
            lesson: lessonId,
            bestScore: 0,
            lastAccessedAt: new Date().toISOString(),
            isCompleted: false
          }
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Progress retrieved successfully',
        data: {
          ...progress,
          isCompleted: progress.bestScore > 0 // Consider completed if bestScore > 0
        }
      })
    } else if (courseId) {
      // Get all progress for a course
      const progressList = await Progress.find({
        user: authResult.user!.userId,
        course: courseId
      }).lean()

      const progressData = progressList.map(progress => ({
        ...progress,
        isCompleted: progress.bestScore > 0
      }))

      return NextResponse.json({
        success: true,
        message: 'Course progress retrieved successfully',
        data: progressData
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Lesson ID or Course ID is required',
        error: 'Missing lesson or course parameter'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Get progress error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve progress',
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// POST /api/progress - Create or update progress
export async function POST(request: NextRequest): Promise<NextResponse<ProgressResponse>> {
  try {
    await dbConnect()
    const authResult = await validateAuth(request)
    if (!authResult.isValid) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized',
        error: authResult.error 
      }, { status: 401 })
    }

    const body = await request.json()
    const { course, lesson, bestScore = 0, markCompleted = false } = body

    if (!course || !lesson) {
      return NextResponse.json({
        success: false,
        message: 'Course and lesson are required',
        error: 'Missing required fields'
      }, { status: 400 })
    }

    // Find existing progress or create new one
    let progress = await Progress.findOne({
      user: authResult.user!.userId,
      course,
      lesson
    })

    if (!progress) {
      // Create new progress
      progress = new Progress({
        user: authResult.user!.userId,
        course,
        lesson,
        bestScore: markCompleted ? 1 : bestScore,
        lastAccessedAt: new Date()
      })
    } else {
      // Update existing progress
      if (markCompleted) {
        progress.bestScore = 1
        progress.markCompleted()
      } else if (bestScore > progress.bestScore) {
        progress.bestScore = bestScore
      }
      progress.lastAccessedAt = new Date()
    }

    await progress.save()

    return NextResponse.json({
      success: true,
      message: markCompleted ? 'Lesson marked as completed' : 'Progress updated successfully',
      data: {
        ...progress.toObject(),
        isCompleted: progress.bestScore > 0
      }
    })
  } catch (error) {
    console.error('Create/update progress error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to update progress',
      error: 'Internal server error'
    }, { status: 500 })
  }
}
