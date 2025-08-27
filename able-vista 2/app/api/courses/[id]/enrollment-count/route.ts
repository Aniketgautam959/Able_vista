import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../../../lib/db'
import Enrollment from '../../../../../models/Enrollment'

interface EnrollmentCountResponse {
  courseId: string
  enrollmentCount: number
  activeEnrollments: number
  completedEnrollments: number
  error: { message: string } | null
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<EnrollmentCountResponse>> {
  try {
    await dbConnect()

    const courseId = params.id

    if (!courseId) {
      return NextResponse.json({
        courseId: '',
        enrollmentCount: 0,
        activeEnrollments: 0,
        completedEnrollments: 0,
        error: { message: 'Course ID is required' }
      }, { status: 400 })
    }

    // Get total enrollment count
    const totalEnrollments = await (Enrollment as any).countDocuments({ 
      course: courseId 
    })

    // Get active enrollments count
    const activeEnrollments = await (Enrollment as any).countDocuments({ 
      course: courseId,
      status: 'active'
    })

    // Get completed enrollments count
    const completedEnrollments = await (Enrollment as any).countDocuments({ 
      course: courseId,
      status: 'completed'
    })

    return NextResponse.json({
      courseId: courseId,
      enrollmentCount: totalEnrollments,
      activeEnrollments: activeEnrollments,
      completedEnrollments: completedEnrollments,
      error: null
    })

  } catch (error) {
    console.error('Enrollment count error:', error)
    return NextResponse.json({
      courseId: params.id || '',
      enrollmentCount: 0,
      activeEnrollments: 0,
      completedEnrollments: 0,
      error: { message: 'Internal server error' }
    }, { status: 500 })
  }
}
