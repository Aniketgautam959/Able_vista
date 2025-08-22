import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../lib/db'
import Lesson from '../../../models/Lesson'

interface LessonResponse {
  success: boolean
  message: string
  data?: any
}

// GET /api/lessons - Get all lessons
export async function GET(request: NextRequest): Promise<NextResponse<LessonResponse>> {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const course = searchParams.get('course')
    const chapter = searchParams.get('chapter')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build filter object
    const filter: any = {}
    if (course) filter.course = course
    if (chapter) filter.chapter = chapter
    if (type) filter.type = type

    const lessons = await Lesson.find(filter)
      .populate('course', 'title')
      .populate('chapter', 'title')
      .skip(skip)
      .limit(limit)
      .sort({ order: 1 })

    const total = await Lesson.countDocuments(filter)

    return NextResponse.json({
      success: true,
      message: 'Lessons retrieved successfully',
      data: {
        lessons,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Get lessons error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve lessons'
    }, { status: 500 })
  }
}

// POST /api/lessons - Create a new lesson
export async function POST(request: NextRequest): Promise<NextResponse<LessonResponse>> {
  try {
    await dbConnect()

    const body = await request.json()
    const { title, description, chapter, course, order, type, duration, durationMinutes, content } = body

    // Validate required fields
    if (!title || !chapter || !course || !order || !type || !duration || !durationMinutes) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 })
    }

    const lesson = await Lesson.create({
      title,
      description,
      chapter,
      course,
      order,
      type,
      duration,
      durationMinutes,
      content: content || {},
      isPublished: false,
      isFree: false
    })

    return NextResponse.json({
      success: true,
      message: 'Lesson created successfully',
      data: lesson
    }, { status: 201 })

  } catch (error) {
    console.error('Create lesson error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to create lesson'
    }, { status: 500 })
  }
}
