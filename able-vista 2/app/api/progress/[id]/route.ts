import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db'
import Progress from '../../../../models/Progress'

interface ProgressResponse {
  success: boolean
  message: string
  data?: any
}

// GET /api/progress/[id] - Get progress by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ProgressResponse>> {
  try {
    await dbConnect()

    const progress = await Progress.findById(params.id)
      .populate('user', 'name email')
      .populate('course', 'title description')
      .populate('lesson', 'title description type')

    if (!progress) {
      return NextResponse.json({
        success: false,
        message: 'Progress record not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Progress record retrieved successfully',
      data: progress
    })

  } catch (error) {
    console.error('Get progress error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve progress record'
    }, { status: 500 })
  }
}

// PUT /api/progress/[id] - Update progress
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ProgressResponse>> {
  try {
    await dbConnect()

    const body = await request.json()
    const { status, completionPercentage, timeSpent, lastPosition, bestScore } = body

    const progress = await Progress.findById(params.id)
    if (!progress) {
      return NextResponse.json({
        success: false,
        message: 'Progress record not found'
      }, { status: 404 })
    }

    // Update fields
    const updatedProgress = await Progress.findByIdAndUpdate(
      params.id,
      {
        status,
        completionPercentage,
        timeSpent,
        lastPosition,
        bestScore,
        lastAccessedAt: new Date()
      },
      { new: true, runValidators: true }
    )

    return NextResponse.json({
      success: true,
      message: 'Progress record updated successfully',
      data: updatedProgress
    })

  } catch (error) {
    console.error('Update progress error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to update progress record'
    }, { status: 500 })
  }
}

// DELETE /api/progress/[id] - Delete progress
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ProgressResponse>> {
  try {
    await dbConnect()

    const progress = await Progress.findById(params.id)
    if (!progress) {
      return NextResponse.json({
        success: false,
        message: 'Progress record not found'
      }, { status: 404 })
    }

    await Progress.findByIdAndDelete(params.id)

    return NextResponse.json({
      success: true,
      message: 'Progress record deleted successfully'
    })

  } catch (error) {
    console.error('Delete progress error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to delete progress record'
    }, { status: 500 })
  }
}
