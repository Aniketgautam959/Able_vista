import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db'
import Course from '../../../../models/Course'

interface CourseResponse {
  success: boolean
  message: string
  data?: any
}

// GET /api/courses/[id] - Get course by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<CourseResponse>> {
  try {
    await dbConnect()

    // First get the course without populate to check raw data
    const rawCourse = await Course.findById(params.id)
    console.log('Raw course chapters:', rawCourse?.chapters)

    // Then get with populate
    const course = await Course.findById(params.id)
      .populate('instructor', 'name title avatar bio expertise')
      .populate({
        path: 'chapters',
        select: 'title description order duration isPublished lessons',
        populate: {
          path: 'lessons',
          select: 'title description type duration durationMinutes isPublished isFree'
        }
      })

    if (!course) {
      return NextResponse.json({
        success: false,
        message: 'Course not found'
      }, { status: 404 })
    }

    // Debug logging
    console.log('Course found:', course.title)
    console.log('Chapters count:', course.chapters?.length || 0)
    console.log('Chapters:', course.chapters)

    return NextResponse.json({
      success: true,
      message: 'Course retrieved successfully',
      data: course
    })

  } catch (error) {
    console.error('Get course error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve course'
    }, { status: 500 })
  }
}

// PUT /api/courses/[id] - Update course
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<CourseResponse>> {
  try {
    await dbConnect()

    const body = await request.json()
    const { title, description, category, level, price, duration, estimatedHours, skills, requirements, whatYouLearn, image, isPublished } = body

    const course = await Course.findById(params.id)
    if (!course) {
      return NextResponse.json({
        success: false,
        message: 'Course not found'
      }, { status: 404 })
    }

    // Update fields
    const updatedCourse = await Course.findByIdAndUpdate(
      params.id,
      {
        title,
        description,
        category,
        level,
        price,
        duration,
        estimatedHours,
        skills,
        requirements,
        whatYouLearn,
        image,
        isPublished
      },
      { new: true, runValidators: true }
    )

    return NextResponse.json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse
    })

  } catch (error) {
    console.error('Update course error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to update course'
    }, { status: 500 })
  }
}

// DELETE /api/courses/[id] - Delete course
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<CourseResponse>> {
  try {
    await dbConnect()

    const course = await Course.findById(params.id)
    if (!course) {
      return NextResponse.json({
        success: false,
        message: 'Course not found'
      }, { status: 404 })
    }

    await Course.findByIdAndDelete(params.id)

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully'
    })

  } catch (error) {
    console.error('Delete course error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to delete course'
    }, { status: 500 })
  }
}
