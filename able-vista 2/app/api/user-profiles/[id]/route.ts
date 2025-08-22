import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../../lib/db'
import UserProfile from '../../../../models/UserProfile'

interface UserProfileResponse {
  success: boolean
  message: string
  data?: any
}

// GET /api/user-profiles/[id] - Get user profile by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<UserProfileResponse>> {
  try {
    await dbConnect()

    const userProfile = await UserProfile.findById(params.id)
      .populate('user', 'name email')

    if (!userProfile) {
      return NextResponse.json({
        success: false,
        message: 'User profile not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'User profile retrieved successfully',
      data: userProfile
    })

  } catch (error) {
    console.error('Get user profile error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve user profile'
    }, { status: 500 })
  }
}

// PUT /api/user-profiles/[id] - Update user profile
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<UserProfileResponse>> {
  try {
    await dbConnect()

    const body = await request.json()
    const { bio, avatar, location, timezone, learningGoal, interests, skillLevel, preferredLearningStyle, socialLinks, preferences } = body

    const userProfile = await UserProfile.findById(params.id)
    if (!userProfile) {
      return NextResponse.json({
        success: false,
        message: 'User profile not found'
      }, { status: 404 })
    }

    // Update fields
    const updatedProfile = await UserProfile.findByIdAndUpdate(
      params.id,
      {
        bio,
        avatar,
        location,
        timezone,
        learningGoal,
        interests,
        skillLevel,
        preferredLearningStyle,
        socialLinks,
        preferences
      },
      { new: true, runValidators: true }
    )

    return NextResponse.json({
      success: true,
      message: 'User profile updated successfully',
      data: updatedProfile
    })

  } catch (error) {
    console.error('Update user profile error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to update user profile'
    }, { status: 500 })
  }
}

// DELETE /api/user-profiles/[id] - Delete user profile
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<UserProfileResponse>> {
  try {
    await dbConnect()

    const userProfile = await UserProfile.findById(params.id)
    if (!userProfile) {
      return NextResponse.json({
        success: false,
        message: 'User profile not found'
      }, { status: 404 })
    }

    await UserProfile.findByIdAndDelete(params.id)

    return NextResponse.json({
      success: true,
      message: 'User profile deleted successfully'
    })

  } catch (error) {
    console.error('Delete user profile error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to delete user profile'
    }, { status: 500 })
  }
}
