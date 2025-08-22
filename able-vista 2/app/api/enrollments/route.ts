import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../lib/db'
import Enrollment from '../../../models/Enrollment'

interface EnrollmentResponse {
  success: boolean
  message: string
  data?: any
}

// GET /api/enrollments - Get all enrollments
export async function GET(request: NextRequest): Promise<NextResponse<EnrollmentResponse>> {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const user = searchParams.get('user')
    const course = searchParams.get('course')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build filter object
    const filter: any = {}
    if (user) filter.user = user
    if (course) filter.course = course
    if (status) filter.status = status

    const enrollments = await Enrollment.find(filter)
      .populate('user', 'name email')
      .populate('course', 'title description image')
      .populate('currentLesson', 'title')
      .skip(skip)
      .limit(limit)
      .sort({ enrolledAt: -1 })

    const total = await Enrollment.countDocuments(filter)

    return NextResponse.json({
      success: true,
      message: 'Enrollments retrieved successfully',
      data: {
        enrollments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Get enrollments error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve enrollments'
    }, { status: 500 })
  }
}

// POST /api/enrollments - Create a new enrollment
export async function POST(request: NextRequest): Promise<NextResponse<EnrollmentResponse>> {
  try {
    await dbConnect()

    const body = await request.json()
    const { user, course } = body

    // Validate required fields
    if (!user || !course) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 })
    }

    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({ user, course })
    if (existingEnrollment) {
      return NextResponse.json({
        success: false,
        message: 'User is already enrolled in this course'
      }, { status: 400 })
    }

    const enrollment = await Enrollment.create({
      user,
      course,
      status: 'active',
      progress: 0,
      completedLessons: [],
      totalTimeSpent: 0,
      enrolledAt: new Date()
    })

    return NextResponse.json({
      success: true,
      message: 'Enrollment created successfully',
      data: enrollment
    }, { status: 201 })

  } catch (error) {
    console.error('Create enrollment error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to create enrollment'
    }, { status: 500 })
  }
}
