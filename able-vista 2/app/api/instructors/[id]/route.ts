import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db'
import Instructor from '../../../../models/Instructor'

interface InstructorResponse {
  success: boolean
  message: string
  data?: any
}

// GET /api/instructors/[id] - Get instructor by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<InstructorResponse>> {
  try {
    await dbConnect()

    const instructor = await Instructor.findById(params.id)
      .populate('user', 'name email')

    if (!instructor) {
      return NextResponse.json({
        success: false,
        message: 'Instructor not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Instructor retrieved successfully',
      data: instructor
    })

  } catch (error) {
    console.error('Get instructor error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve instructor'
    }, { status: 500 })
  }
}

// PUT /api/instructors/[id] - Update instructor
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<InstructorResponse>> {
  try {
    await dbConnect()

    const body = await request.json()
    const { title, company, bio, expertise, experience, avatar, socialLinks, isVerified, isActive } = body

    const instructor = await Instructor.findById(params.id)
    if (!instructor) {
      return NextResponse.json({
        success: false,
        message: 'Instructor not found'
      }, { status: 404 })
    }

    // Update fields
    const updatedInstructor = await Instructor.findByIdAndUpdate(
      params.id,
      {
        title,
        company,
        bio,
        expertise,
        experience,
        avatar,
        socialLinks,
        isVerified,
        isActive
      },
      { new: true, runValidators: true }
    )

    return NextResponse.json({
      success: true,
      message: 'Instructor updated successfully',
      data: updatedInstructor
    })

  } catch (error) {
    console.error('Update instructor error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to update instructor'
    }, { status: 500 })
  }
}

// DELETE /api/instructors/[id] - Delete instructor
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<InstructorResponse>> {
  try {
    await dbConnect()

    const instructor = await Instructor.findById(params.id)
    if (!instructor) {
      return NextResponse.json({
        success: false,
        message: 'Instructor not found'
      }, { status: 404 })
    }

    await Instructor.findByIdAndDelete(params.id)

    return NextResponse.json({
      success: true,
      message: 'Instructor deleted successfully'
    })

  } catch (error) {
    console.error('Delete instructor error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to delete instructor'
    }, { status: 500 })
  }
}
