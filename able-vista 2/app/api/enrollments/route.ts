import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../lib/db'
import { Enrollment } from '../../../models'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user')
    const courseId = searchParams.get('course')
    
    if (!userId || !courseId) {
      return NextResponse.json(
        { success: false, message: 'User ID and Course ID are required' },
        { status: 400 }
      )
    }
    
    // Check if enrollment exists
    const enrollment = await Enrollment.findOne({ user: userId, course: courseId }).lean()
    
    if (enrollment) {
      return NextResponse.json({
        success: true,
        message: 'Enrollment found',
        data: enrollment
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Enrollment not found',
        data: null
      })
    }
  } catch (error) {
    console.error('Error checking enrollment:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { user, course } = body
    
    if (!user || !course) {
      return NextResponse.json(
        { success: false, message: 'User ID and Course ID are required' },
        { status: 400 }
      )
    }
    
    // Check if enrollment already exists
    const existingEnrollment = await Enrollment.findOne({ user, course })
    if (existingEnrollment) {
      return NextResponse.json(
        { success: false, message: 'User is already enrolled in this course' },
        { status: 409 }
      )
    }
    
    // Create new enrollment
    const enrollment = new Enrollment({
      user,
      course,
      status: 'active',
      progress: 0,
      completedLessons: [],
      totalTimeSpent: 0,
      enrolledAt: new Date(),
      lastAccessedAt: new Date()
    })
    
    await enrollment.save()
    
    return NextResponse.json({
      success: true,
      message: 'Enrollment created successfully',
      data: enrollment
    })
  } catch (error) {
    console.error('Error creating enrollment:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
