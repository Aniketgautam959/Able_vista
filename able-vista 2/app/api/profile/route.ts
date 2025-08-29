import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../lib/db'
import { validateAuth } from '../../../lib/auth'
import { UserProfile } from '../../../models'

interface ProfileResponse {
  success: boolean
  message: string
  data?: any
}

// GET /api/profile - Get user profile
export async function GET(request: NextRequest): Promise<NextResponse<ProfileResponse>> {
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

    const userId = authResult.user!.userId

    // Get user profile
    const profile = await UserProfile.findOne({ user: userId })
      .populate('user', 'name email')
      .lean()

    if (!profile) {
      return NextResponse.json({
        success: false,
        message: 'Profile not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: profile
    })

  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve profile'
    }, { status: 500 })
  }
}

// PUT /api/profile - Update user profile
export async function PUT(request: NextRequest): Promise<NextResponse<ProfileResponse>> {
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

    const userId = authResult.user!.userId
    const body = await request.json()
    
    const { bio, location, timezone, learningGoal, interests, skillLevel, preferredLearningStyle, avatar } = body

    // Update profile
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { user: userId },
      {
        bio,
        location,
        timezone,
        learningGoal,
        interests,
        skillLevel,
        preferredLearningStyle,
        avatar
      },
      { new: true, runValidators: true }
    ).populate('user', 'name email')

    if (!updatedProfile) {
      return NextResponse.json({
        success: false,
        message: 'Profile not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile
    })

  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to update profile'
    }, { status: 500 })
  }
}
