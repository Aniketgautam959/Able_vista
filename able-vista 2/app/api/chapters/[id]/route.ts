import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db'
import Chapter from '../../../../models/Chapter'
import mongoose from 'mongoose'

interface ChapterResponse {
  success: boolean
  message: string
  data?: any
}

// GET /api/chapters/[id] - Get chapter by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ChapterResponse>> {
  try {
    await dbConnect()

    // Get chapter with basic populate
    const chapter = await Chapter.findById(params.id)
      .populate('course', 'title description')

    if (!chapter) {
      return NextResponse.json({
        success: false,
        message: 'Chapter not found'
      }, { status: 404 })
    }

    // Manually populate lessons for this chapter
    const chapterObj = chapter.toObject()
    const Lesson = mongoose.model('Lesson')
    const lessons = await Lesson.find({ chapter: chapter._id })
      .select('title description type duration durationMinutes isPublished isFree order')
      .sort({ order: 1 })
    
    chapterObj.lessons = lessons

    return NextResponse.json({
      success: true,
      message: 'Chapter retrieved successfully',
      data: chapterObj
    })

  } catch (error) {
    console.error('Get chapter error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve chapter'
    }, { status: 500 })
  }
}

// PUT /api/chapters/[id] - Update chapter
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ChapterResponse>> {
  try {
    await dbConnect()

    const body = await request.json()
    const { title, description, order, duration, isPublished } = body

    const chapter = await Chapter.findById(params.id)
    if (!chapter) {
      return NextResponse.json({
        success: false,
        message: 'Chapter not found'
      }, { status: 404 })
    }

    // Update fields
    const updatedChapter = await Chapter.findByIdAndUpdate(
      params.id,
      {
        title,
        description,
        order,
        duration,
        isPublished
      },
      { new: true, runValidators: true }
    )

    return NextResponse.json({
      success: true,
      message: 'Chapter updated successfully',
      data: updatedChapter
    })

  } catch (error) {
    console.error('Update chapter error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to update chapter'
    }, { status: 500 })
  }
}

// DELETE /api/chapters/[id] - Delete chapter
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ChapterResponse>> {
  try {
    await dbConnect()

    const chapter = await Chapter.findById(params.id)
    if (!chapter) {
      return NextResponse.json({
        success: false,
        message: 'Chapter not found'
      }, { status: 404 })
    }

    await Chapter.findByIdAndDelete(params.id)

    return NextResponse.json({
      success: true,
      message: 'Chapter deleted successfully'
    })

  } catch (error) {
    console.error('Delete chapter error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to delete chapter'
    }, { status: 500 })
  }
}
