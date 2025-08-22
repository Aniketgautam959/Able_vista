import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../lib/db'
import Course from '../../../models/Course'
import { Chapter, Instructor } from '../../../models'
import mongoose from 'mongoose'

interface CourseResponse {
  success: boolean
  message: string
  data?: any
}

// GET /api/courses - Get all courses
export async function GET(request: NextRequest): Promise<NextResponse<CourseResponse>> {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const level = searchParams.get('level')
    const instructor = searchParams.get('instructor')
    const all = searchParams.get('all')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build filter object
    const filter: any = {}
    
    // Only filter by published status if 'all' is not true
    if (all !== 'true') {
      filter.isPublished = true
    }
    
    if (category) filter.category = category
    if (level) filter.level = level
    if (instructor) filter.instructor = instructor

    // First get courses with basic populate
    let courses = await Course.find(filter)
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

    const total = await Course.countDocuments(filter)

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
    console.error('Get courses error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve courses'
    }, { status: 500 })
  }
}

// POST /api/courses - Create a new course
export async function POST(request: NextRequest): Promise<NextResponse<CourseResponse>> {
  try {
    await dbConnect()

    const body = await request.json()
    const { title, description, category, instructor, level, price, duration, estimatedHours, skills, requirements, whatYouLearn } = body

    // Validate required fields
    if (!title || !description || !category || !instructor || !level || !price || !duration || !estimatedHours) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 })
    }

    const course = await Course.create({
      title,
      description,
      category,
      instructor,
      level,
      price,
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
    console.error('Create course error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to create course'
    }, { status: 500 })
  }
}
