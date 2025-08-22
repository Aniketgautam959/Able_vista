import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db'
import Review from '../../../../models/Review'

interface ReviewResponse {
  success: boolean
  message: string
  data?: any
}

// GET /api/reviews/[id] - Get review by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ReviewResponse>> {
  try {
    await dbConnect()

    const review = await Review.findById(params.id)
      .populate('user', 'name')
      .populate('course', 'title description')
      .populate('instructor', 'name title')

    if (!review) {
      return NextResponse.json({
        success: false,
        message: 'Review not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Review retrieved successfully',
      data: review
    })

  } catch (error) {
    console.error('Get review error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve review'
    }, { status: 500 })
  }
}

// PUT /api/reviews/[id] - Update review
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ReviewResponse>> {
  try {
    await dbConnect()

    const body = await request.json()
    const { rating, title, comment, isPublished } = body

    const review = await Review.findById(params.id)
    if (!review) {
      return NextResponse.json({
        success: false,
        message: 'Review not found'
      }, { status: 404 })
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json({
        success: false,
        message: 'Rating must be between 1 and 5'
      }, { status: 400 })
    }

    // Update fields
    const updatedReview = await Review.findByIdAndUpdate(
      params.id,
      {
        rating,
        title,
        comment,
        isPublished
      },
      { new: true, runValidators: true }
    )

    return NextResponse.json({
      success: true,
      message: 'Review updated successfully',
      data: updatedReview
    })

  } catch (error) {
    console.error('Update review error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to update review'
    }, { status: 500 })
  }
}

// DELETE /api/reviews/[id] - Delete review
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ReviewResponse>> {
  try {
    await dbConnect()

    const review = await Review.findById(params.id)
    if (!review) {
      return NextResponse.json({
        success: false,
        message: 'Review not found'
      }, { status: 404 })
    }

    await Review.findByIdAndDelete(params.id)

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    })

  } catch (error) {
    console.error('Delete review error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to delete review'
    }, { status: 500 })
  }
}
