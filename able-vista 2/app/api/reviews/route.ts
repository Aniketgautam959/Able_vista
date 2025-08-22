import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../lib/db'
import Review from '../../../models/Review'

interface ReviewResponse {
  success: boolean
  message: string
  data?: any
}

// GET /api/reviews - Get all reviews
export async function GET(request: NextRequest): Promise<NextResponse<ReviewResponse>> {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const course = searchParams.get('course')
    const instructor = searchParams.get('instructor')
    const user = searchParams.get('user')
    const rating = searchParams.get('rating')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build filter object
    const filter: any = { isPublished: true }
    if (course) filter.course = course
    if (instructor) filter.instructor = instructor
    if (user) filter.user = user
    if (rating) filter.rating = parseInt(rating)

    const reviews = await Review.find(filter)
      .populate('user', 'name')
      .populate('course', 'title')
      .populate('instructor', 'name title')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })

    const total = await Review.countDocuments(filter)

    return NextResponse.json({
      success: true,
      message: 'Reviews retrieved successfully',
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve reviews'
    }, { status: 500 })
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest): Promise<NextResponse<ReviewResponse>> {
  try {
    await dbConnect()

    const body = await request.json()
    const { user, course, instructor, rating, title, comment } = body

    // Validate required fields
    if (!user || !course || !instructor || !rating || !comment) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 })
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json({
        success: false,
        message: 'Rating must be between 1 and 5'
      }, { status: 400 })
    }

    // Check if user has already reviewed this course
    const existingReview = await Review.findOne({ user, course })
    if (existingReview) {
      return NextResponse.json({
        success: false,
        message: 'User has already reviewed this course'
      }, { status: 400 })
    }

    const review = await Review.create({
      user,
      course,
      instructor,
      rating,
      title,
      comment,
      isPublished: true
    })

    return NextResponse.json({
      success: true,
      message: 'Review created successfully',
      data: review
    }, { status: 201 })

  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to create review'
    }, { status: 500 })
  }
}
