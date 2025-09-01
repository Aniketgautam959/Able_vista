import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db'
import Progress from '../../../../models/Progress'
import { validateAuth } from '../../../../lib/auth'

interface DeleteProgressResponse {
  success: boolean
  message: string
  deletedCount?: number
  error?: string
}

// DELETE /api/progress/delete-course - Delete all progress for a user in a specific course
export async function DELETE(request: NextRequest): Promise<NextResponse<DeleteProgressResponse>> {
  try {
    await dbConnect()
    
    // Validate authentication
    const authResult = await validateAuth(request)
    if (!authResult.isValid) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized',
        error: authResult.error
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('course')

    if (!courseId) {
      return NextResponse.json({
        success: false,
        message: 'Course ID is required',
        error: 'Missing course parameter'
      }, { status: 400 })
    }

    // Delete all progress records for this user and course
    const result = await Progress.deleteMany({
      user: authResult.user!.userId,
      course: courseId
    })

    return NextResponse.json({
      success: true,
      message: 'Course progress deleted successfully',
      deletedCount: result.deletedCount
    })

  } catch (error) {
    console.error('Delete course progress error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to delete course progress',
      error: 'Internal server error'
    }, { status: 500 })
  }
}
