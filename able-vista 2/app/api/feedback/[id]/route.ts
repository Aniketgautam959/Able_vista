import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db'
import Feedback from '../../../../models/Feedback'

interface FeedbackResponse {
  success: boolean
  message: string
  data?: any
}

// GET /api/feedback/[id] - Get feedback by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<FeedbackResponse>> {
  try {
    await dbConnect()

    const feedback = await Feedback.findById(params.id)
      .populate('user', 'name email')
      .populate('relatedTo.course', 'title')
      .populate('relatedTo.lesson', 'title')
      .populate('relatedTo.instructor', 'name title')

    if (!feedback) {
      return NextResponse.json({
        success: false,
        message: 'Feedback not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback retrieved successfully',
      data: feedback
    })

  } catch (error) {
    console.error('Get feedback error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve feedback'
    }, { status: 500 })
  }
}

// PUT /api/feedback/[id] - Update feedback
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<FeedbackResponse>> {
  try {
    await dbConnect()

    const body = await request.json()
    const { title, description, category, priority, status } = body

    const feedback = await Feedback.findById(params.id)
    if (!feedback) {
      return NextResponse.json({
        success: false,
        message: 'Feedback not found'
      }, { status: 404 })
    }

    // Update fields
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      params.id,
      {
        title,
        description,
        category,
        priority,
        status
      },
      { new: true, runValidators: true }
    )

    return NextResponse.json({
      success: true,
      message: 'Feedback updated successfully',
      data: updatedFeedback
    })

  } catch (error) {
    console.error('Update feedback error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to update feedback'
    }, { status: 500 })
  }
}

// DELETE /api/feedback/[id] - Delete feedback
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<FeedbackResponse>> {
  try {
    await dbConnect()

    const feedback = await Feedback.findById(params.id)
    if (!feedback) {
      return NextResponse.json({
        success: false,
        message: 'Feedback not found'
      }, { status: 404 })
    }

    await Feedback.findByIdAndDelete(params.id)

    return NextResponse.json({
      success: true,
      message: 'Feedback deleted successfully'
    })

  } catch (error) {
    console.error('Delete feedback error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to delete feedback'
    }, { status: 500 })
  }
}
