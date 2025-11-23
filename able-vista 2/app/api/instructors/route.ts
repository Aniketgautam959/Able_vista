import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../lib/db'
import Instructor from '../../../models/Instructor'

interface InstructorResponse {
  success: boolean
  message: string
  data?: any
}

// GET /api/instructors - Get all instructors
export async function GET(request: NextRequest): Promise<NextResponse<InstructorResponse>> {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const expertise = searchParams.get('expertise')
    const verified = searchParams.get('verified')
    const user = searchParams.get('user')
    console.log(user)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build filter object
    const filter: any = { isActive: true }
    if (expertise) filter.expertise = { $in: [expertise] }
    if (verified) filter.isVerified = verified === 'true'
    if (user) filter.user = user

    const instructors = await Instructor.find(filter)
      .populate('user', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ rating: -1, totalStudents: -1 })

    const total = await Instructor.countDocuments(filter)

    return NextResponse.json({
      success: true,
      message: 'Instructors retrieved successfully',
      data: {
        instructors,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Get instructors error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve instructors'
    }, { status: 500 })
  }
}

// POST /api/instructors - Create a new instructor
export async function POST(request: NextRequest): Promise<NextResponse<InstructorResponse>> {
  try {
    await dbConnect()

    const body = await request.json()
    const { user, title, company, bio, expertise, experience, avatar, socialLinks } = body

    // Validate required fields
    if (!user || !title || !expertise) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 })
    }

    const instructor = await Instructor.create({
      user,
      title,
      company,
      bio,
      expertise,
      experience,
      avatar: avatar || '/placeholder-user.jpg',
      socialLinks: socialLinks || {},
      rating: 0,
      totalStudents: 0,
      totalCourses: 0,
      totalReviews: 0,
      isVerified: false,
      isActive: true
    })

    return NextResponse.json({
      success: true,
      message: 'Instructor created successfully',
      data: instructor
    }, { status: 201 })

  } catch (error) {
    console.error('Create instructor error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to create instructor'
    }, { status: 500 })
  }
}
