import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../lib/db'
import UserProfile from '../../../models/UserProfile'

interface UserProfileResponse {
  success: boolean
  message: string
  data?: any
}

// GET /api/user-profiles - Get all user profiles
export async function GET(request: NextRequest): Promise<NextResponse<UserProfileResponse>> {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const user = searchParams.get('user')
    const skillLevel = searchParams.get('skillLevel')
    const learningStyle = searchParams.get('learningStyle')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build filter object
    const filter: any = {}
    if (user) filter.user = user
    if (skillLevel) filter.skillLevel = skillLevel
    if (learningStyle) filter.preferredLearningStyle = learningStyle

    const userProfiles = await UserProfile.find(filter)
      .populate('user', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })

    const total = await UserProfile.countDocuments(filter)

    return NextResponse.json({
      success: true,
      message: 'User profiles retrieved successfully',
      data: {
        userProfiles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Get user profiles error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve user profiles'
    }, { status: 500 })
  }
}

// POST /api/user-profiles - Create a new user profile
export async function POST(request: NextRequest): Promise<NextResponse<UserProfileResponse>> {
  try {
    await dbConnect()

    const body = await request.json()
    const { user, bio, avatar, location, timezone, learningGoal, interests, skillLevel, preferredLearningStyle, socialLinks } = body

    // Validate required fields
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
      }, { status: 400 })
    }

    // Check if user profile already exists
    const existingProfile = await UserProfile.findOne({ user })
    if (existingProfile) {
      return NextResponse.json({
        success: false,
        message: 'User profile already exists'
      }, { status: 400 })
    }

    const userProfile = await UserProfile.create({
      user,
      bio,
      avatar: avatar || '/placeholder-user.jpg',
      location,
      timezone: timezone || 'UTC',
      learningGoal,
      interests: interests || [],
      skillLevel: skillLevel || 'beginner',
      preferredLearningStyle: preferredLearningStyle || 'visual',
      socialLinks: socialLinks || {},
      preferences: {
        showProfile: true,
        showProgress: true
      },
      stats: {
        totalCourses: 0,
        completedCourses: 0,
        inProgressCourses: 0,
        totalLessons: 0,
        completedLessons: 0,
        totalHours: 0,
        currentStreak: 0,
        longestStreak: 0
      }
    })

    return NextResponse.json({
      success: true,
      message: 'User profile created successfully',
      data: userProfile
    }, { status: 201 })

  } catch (error) {
    console.error('Create user profile error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to create user profile'
    }, { status: 500 })
  }
}
