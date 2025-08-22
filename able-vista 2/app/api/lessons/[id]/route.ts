import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db'
import Lesson from '../../../../models/Lesson'

interface LessonResponse {
  success: boolean
  message: string
  data?: any
}

// GET /api/lessons/[id] - Get lesson by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<LessonResponse>> {
  try {
    await dbConnect()

    const lesson = await Lesson.findById(params.id)
      .populate('course', 'title description')
      .populate('chapter', 'title description')

    if (!lesson) {
      return NextResponse.json({
        success: false,
        message: 'Lesson not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Lesson retrieved successfully',
      data: lesson
    })

  } catch (error) {
    console.error('Get lesson error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve lesson'
    }, { status: 500 })
  }
}

// PUT /api/lessons/[id] - Update lesson
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<LessonResponse>> {
  try {
    await dbConnect()

    const body = await request.json()
    const { title, description, order, type, duration, durationMinutes, content, isPublished, isFree } = body

    const lesson = await Lesson.findById(params.id)
    if (!lesson) {
      return NextResponse.json({
        success: false,
        message: 'Lesson not found'
      }, { status: 404 })
    }

    // Update fields
    const updatedLesson = await Lesson.findByIdAndUpdate(
      params.id,
      {
        title,
        description,
        order,
        type,
        duration,
        durationMinutes,
        content,
        isPublished,
        isFree
      },
      { new: true, runValidators: true }
    )

    return NextResponse.json({
      success: true,
      message: 'Lesson updated successfully',
      data: updatedLesson
    })

  } catch (error) {
    console.error('Update lesson error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to update lesson'
    }, { status: 500 })
  }
}

// DELETE /api/lessons/[id] - Delete lesson
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<LessonResponse>> {
  try {
    await dbConnect()

    const lesson = await Lesson.findById(params.id)
    if (!lesson) {
      return NextResponse.json({
        success: false,
        message: 'Lesson not found'
      }, { status: 404 })
    }

    await Lesson.findByIdAndDelete(params.id)

    return NextResponse.json({
      success: true,
      message: 'Lesson deleted successfully'
    })

  } catch (error) {
    console.error('Delete lesson error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to delete lesson'
    }, { status: 500 })
  }
}
