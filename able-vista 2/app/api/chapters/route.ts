import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../lib/db'
import Chapter from '../../../models/Chapter'
import mongoose from 'mongoose'

interface ChapterResponse {
  success: boolean
  message: string
  data?: any
}

// GET /api/chapters - Get all chapters
export async function GET(request: NextRequest): Promise<NextResponse<ChapterResponse>> {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const course = searchParams.get('course')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build filter object
    const filter: any = {}
    if (course) filter.course = course

    // First get chapters with basic populate
    let chapters = await Chapter.find(filter)
      .populate('course', 'title')
      .skip(skip)
      .limit(limit)
      .sort({ order: 1 })

    // Manually populate lessons for each chapter
    const populatedChapters = await Promise.all(
      chapters.map(async (chapter) => {
        const chapterObj = chapter.toObject()
        
        // Get lessons for this chapter
        const Lesson = mongoose.model('Lesson')
        const lessons = await Lesson.find({ chapter: chapter._id })
          .select('title description type duration durationMinutes isPublished isFree order')
          .sort({ order: 1 })
        
        chapterObj.lessons = lessons
        return chapterObj
      })
    )

    const total = await Chapter.countDocuments(filter)

    return NextResponse.json({
      success: true,
      message: 'Chapters retrieved successfully',
      data: {
        chapters: populatedChapters,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Get chapters error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve chapters'
    }, { status: 500 })
  }
}

// POST /api/chapters - Create a new chapter
export async function POST(request: NextRequest): Promise<NextResponse<ChapterResponse>> {
  try {
    await dbConnect()

    const body = await request.json()
    const { title, description, course, order, duration } = body

    // Validate required fields
    if (!title || !course || !order || !duration) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 })
    }

    const chapter = await Chapter.create({
      title,
      description,
      course,
      order,
      duration,
      lessons: [],
      isPublished: false
    })

    return NextResponse.json({
      success: true,
      message: 'Chapter created successfully',
      data: chapter
    }, { status: 201 })

  } catch (error) {
    console.error('Create chapter error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to create chapter'
    }, { status: 500 })
  }
}
