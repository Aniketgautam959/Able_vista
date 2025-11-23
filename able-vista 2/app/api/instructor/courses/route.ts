import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db'
import { Course, Chapter, Instructor } from '../../../../models'
import { validateAuth } from '../../../../lib/auth'
import mongoose from 'mongoose'

interface CourseResponse {
  success: boolean
  message: string
  data?: any
}

// GET /api/instructor/courses - Get courses for authenticated instructor
export async function GET(request: NextRequest): Promise<NextResponse<CourseResponse>> {
  try {
    await dbConnect()

    // Validate authentication
    const authResult = await validateAuth(request)
    if (!authResult.isValid) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 })
    }

    // Check if user is an instructor
    const instructor = await Instructor.findOne({ user: authResult.user?.userId })
    if (!instructor) {
      return NextResponse.json({
        success: false,
        message: 'Instructor not found'
      }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Get courses for this instructor
    let courses = await Course.find({ instructor: instructor._id })
      .populate('instructor', 'name title avatar')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean()

    // Manually populate chapters and lessons for each course
    const populatedCourses = await Promise.all(
      courses.map(async (course: any) => {
        // Get chapters for this course
        const chapters = await Chapter.find({ course: course._id })
          .populate({
            path: 'lessons',
            select: 'title description type duration durationMinutes isPublished isFree order',
            options: { sort: { order: 1 } }
          })
          .sort({ order: 1 })
          .lean()
        
        course.chapters = chapters
        return course
      })
    )

    const total = await Course.countDocuments({ instructor: instructor._id })

    return NextResponse.json({
      success: true,
      message: 'Courses retrieved successfully',
      data: {
        courses: populatedCourses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Get instructor courses error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve courses'
    }, { status: 500 })
  }
}

// POST /api/instructor/courses - Create a new course for authenticated instructor
export async function POST(request: NextRequest): Promise<NextResponse<CourseResponse>> {
  try {
    await dbConnect()

    // Validate authentication
    const authResult = await validateAuth(request)
    if (!authResult.isValid) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 })
    }

    // Check if user is an instructor
    const instructor = await Instructor.findOne({ user: authResult.user?.userId })
    if (!instructor) {
      return NextResponse.json({
        success: false,
        message: 'Instructor not found'
      }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, category, level, duration, estimatedHours, skills, requirements, whatYouLearn } = body

    // Validate required fields
    if (!title || !description || !category || !level || !duration || !estimatedHours) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 })
    }

    const course = await Course.create({
      title,
      description,
      category,
      instructor: instructor._id,
      level,
      duration,
      estimatedHours,
      skills: skills || [],
      requirements: requirements || [],
      whatYouLearn: whatYouLearn || [],
      image: body.image || 'from-blue-500 to-purple-600',
      isPublished: false
    })

    return NextResponse.json({
      success: true,
      message: 'Course created successfully',
      data: course
    }, { status: 201 })

  } catch (error) {
    console.error('Create instructor course error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to create course'
    }, { status: 500 })
  }
}
