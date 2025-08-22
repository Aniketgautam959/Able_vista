import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../lib/db'
import Feedback from '../../../models/Feedback'

interface FeedbackResponse {
  success: boolean
  message: string
  data?: any
}

// GET /api/feedback - Get all feedback
export async function GET(request: NextRequest): Promise<NextResponse<FeedbackResponse>> {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build filter object
    const filter: any = {}
    if (type) filter.type = type
    if (category) filter.category = category
    if (status) filter.status = status
    if (priority) filter.priority = priority

    const feedback = await Feedback.find(filter)
      .populate('user', 'name email')
      .populate('relatedTo.course', 'title')
      .populate('relatedTo.lesson', 'title')
      .populate('relatedTo.instructor', 'name title')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })

    const total = await Feedback.countDocuments(filter)

    return NextResponse.json({
      success: true,
      message: 'Feedback retrieved successfully',
      data: {
        feedback,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Get feedback error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve feedback'
    }, { status: 500 })
  }
}

// POST /api/feedback - Create a new feedback
export async function POST(request: NextRequest): Promise<NextResponse<FeedbackResponse>> {
  try {
    await dbConnect()

    const body = await request.json()
    const { user, type, relatedTo, title, description, category, priority } = body

    // Validate required fields
    if (!user || !type || !title || !description || !category) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 })
    }

    const feedback = await Feedback.create({
      user,
      type,
      relatedTo: relatedTo || {},
      title,
      description,
      category,
      priority: priority || 'medium',
      status: 'open',
      tags: [],
      upvotes: 0,
      upvotedBy: []
    })

    return NextResponse.json({
      success: true,
      message: 'Feedback created successfully',
      data: feedback
    }, { status: 201 })

  } catch (error) {
    console.error('Create feedback error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to create feedback'
    }, { status: 500 })
  }
}
