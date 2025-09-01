import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db'
import { Enrollment } from '../../../../models'
import { validateAuth } from '../../../../lib/auth'
import Progress from '../../../../models/Progress'

interface EnrollmentResponse {
  success: boolean
  message: string
  data?: any
}

// GET /api/enrollments/[id] - Get enrollment by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<EnrollmentResponse>> {
  try {
    await dbConnect()

    // Validate authentication
    const authResult = await validateAuth(request)
    if (!authResult.isValid) {
      return NextResponse.json({
        success: false,
        message: authResult.error
      }, { status: 401 })
    }

    const enrollment = await Enrollment.findById(params.id)
      .populate('user', 'name email')
      .populate('course', 'title description image')
      .populate('currentLesson', 'title description')
      .populate('completedLessons.lesson', 'title description type')

    if (!enrollment) {
      return NextResponse.json({
        success: false,
        message: 'Enrollment not found'
      }, { status: 404 })
    }

    // Verify the enrollment belongs to the authenticated user
    if (enrollment.user._id.toString() !== authResult.user!.userId) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access to enrollment'
      }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      message: 'Enrollment retrieved successfully',
      data: enrollment
    })

  } catch (error) {
    console.error('Get enrollment error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve enrollment'
    }, { status: 500 })
  }
}

// PUT /api/enrollments/[id] - Update enrollment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<EnrollmentResponse>> {
  try {
    await dbConnect()

    // Validate authentication
    const authResult = await validateAuth(request)
    if (!authResult.isValid) {
      return NextResponse.json({
        success: false,
        message: authResult.error
      }, { status: 401 })
    }

    const body = await request.json()
    const { status, currentLesson, completedLessons } = body

    const enrollment = await Enrollment.findById(params.id)
    if (!enrollment) {
      return NextResponse.json({
        success: false,
        message: 'Enrollment not found'
      }, { status: 404 })
    }

    // Verify the enrollment belongs to the authenticated user
    if (enrollment.user.toString() !== authResult.user!.userId) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access to enrollment'
      }, { status: 403 })
    }

    // Update fields
    const updatedEnrollment = await Enrollment.findByIdAndUpdate(
      params.id,
      {
        status,
        currentLesson,
        completedLessons
      },
      { new: true, runValidators: true }
    )

    // Recalculate progress
    if (updatedEnrollment) {
      await updatedEnrollment.calculateProgress()
    }

    return NextResponse.json({
      success: true,
      message: 'Enrollment updated successfully',
      data: updatedEnrollment
    })

  } catch (error) {
    console.error('Update enrollment error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to update enrollment'
    }, { status: 500 })
  }
}

// DELETE /api/enrollments/[id] - Delete enrollment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<EnrollmentResponse>> {
  try {
    await dbConnect()

    // Validate authentication
    const authResult = await validateAuth(request)
    if (!authResult.isValid) {
      return NextResponse.json({
        success: false,
        message: authResult.error
      }, { status: 401 })
    }

    const enrollment = await Enrollment.findById(params.id)
    if (!enrollment) {
      return NextResponse.json({
        success: false,
        message: 'Enrollment not found'
      }, { status: 404 })
    }

    // Verify the enrollment belongs to the authenticated user
    if (enrollment.user.toString() !== authResult.user!.userId) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access to enrollment'
      }, { status: 403 })
    }

    // Delete all progress records for this user and course
    const progressResult = await Progress.deleteMany({
      user: authResult.user!.userId,
      course: enrollment.course
    })

    console.log(`Deleted ${progressResult.deletedCount} progress records for course ${enrollment.course}`)

    // Delete the enrollment
    await Enrollment.findByIdAndDelete(params.id)

    return NextResponse.json({
      success: true,
      message: 'Enrollment deleted successfully'
    })

  } catch (error) {
    console.error('Delete enrollment error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to delete enrollment'
    }, { status: 500 })
  }
}
