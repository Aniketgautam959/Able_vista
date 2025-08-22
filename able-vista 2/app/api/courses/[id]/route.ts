import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db'
import Course from '../../../../models/Course'
import { Chapter, Instructor, Lesson } from '../../../../models'
import mongoose from 'mongoose'

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

    // First get the course with basic populate
    const course = await Course.findById(params.id)
      .populate('instructor', 'name title avatar bio expertise')
      .lean()

    if (!course) {
      return NextResponse.json({
        success: false,
        message: 'Course not found'
      }, { status: 404 })
    }

    // Manually populate chapters and lessons for this course
    const chapters = await Chapter.find({ course: course._id })
      .populate({
        path: 'lessons',
        select: 'title description type duration durationMinutes isPublished isFree order',
        options: { sort: { order: 1 } }
      })
      .sort({ order: 1 })
      .lean()

    // Debug: Check if lessons exist in the database
    const allLessons = await Lesson.find({ course: course._id }).lean()
    console.log('All lessons for course:', allLessons.length)
    console.log('All lessons:', allLessons)

    // If lessons exist but aren't being populated, try alternative approach
    if (allLessons.length > 0 && chapters.every(chapter => !chapter.lessons || chapter.lessons.length === 0)) {
      console.log('Lessons exist but not populated, trying alternative approach...')
      
      // Manually attach lessons to chapters based on chapter ID
      const chaptersWithLessons = chapters.map(chapter => {
        const chapterLessons = allLessons.filter(lesson => lesson.chapter.toString() === chapter._id.toString())
        return {
          ...chapter,
          lessons: chapterLessons.sort((a, b) => a.order - b.order)
        }
      })
      
      course.chapters = chaptersWithLessons
      console.log('Chapters with manually attached lessons:', chaptersWithLessons)
    } else {
      // Add chapters to the course object
      course.chapters = chapters
    }

    // Debug logging
    console.log('Course found:', course.title)
    console.log('Chapters count:', course.chapters.length)
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
