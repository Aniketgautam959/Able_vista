import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../lib/db'
import Progress from '../../../models/Progress'

interface ProgressResponse {
  success: boolean
  message: string
  data?: any
}

// GET /api/progress - Get all progress records
export async function GET(request: NextRequest): Promise<NextResponse<ProgressResponse>> {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const user = searchParams.get('user')
    const course = searchParams.get('course')
    const lesson = searchParams.get('lesson')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build filter object
    const filter: any = {}
    if (user) filter.user = user
    if (course) filter.course = course
    if (lesson) filter.lesson = lesson
    if (status) filter.status = status

    const progressRecords = await Progress.find(filter)
      .populate('user', 'name email')
      .populate('course', 'title')
      .populate('lesson', 'title description type')
      .skip(skip)
      .limit(limit)
      .sort({ lastAccessedAt: -1 })

    const total = await Progress.countDocuments(filter)

    return NextResponse.json({
      success: true,
      message: 'Progress records retrieved successfully',
      data: {
        progressRecords,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Get progress error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve progress records'
    }, { status: 500 })
  }
}

// POST /api/progress - Create a new progress record
export async function POST(request: NextRequest): Promise<NextResponse<ProgressResponse>> {
  try {
    await dbConnect()

    const body = await request.json()
    const { user, course, lesson, status, completionPercentage, timeSpent, lastPosition, bestScore } = body

    // Validate required fields
    if (!user || !course || !lesson) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 })
    }

    // Check if progress record already exists
    const existingProgress = await Progress.findOne({ user, course, lesson })
    if (existingProgress) {
      return NextResponse.json({
        success: false,
        message: 'Progress record already exists for this user, course, and lesson'
      }, { status: 400 })
    }

    const progress = await Progress.create({
      user,
      course,
      lesson,
      status: status || 'not_started',
      completionPercentage: completionPercentage || 0,
      timeSpent: timeSpent || 0,
      lastPosition: lastPosition || 0,
      bestScore: bestScore || 0,
      lastAccessedAt: new Date()
    })

    return NextResponse.json({
      success: true,
      message: 'Progress record created successfully',
      data: progress
    }, { status: 201 })

  } catch (error) {
    console.error('Create progress error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to create progress record'
    }, { status: 500 })
  }
}
