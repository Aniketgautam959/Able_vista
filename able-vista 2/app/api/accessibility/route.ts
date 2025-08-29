import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../lib/db'
import { validateAuth } from '../../../lib/auth'
import { UserSettings } from '../../../models'

interface AccessibilityPreferences {
  textToSpeech: {
    enabled: boolean
    rate: number
    pitch: number
    voice: string
  }
  fontSize: {
    base: number
    headings: number
    body: number
  }
  theme: 'light' | 'dark' | 'system'
  highContrast: boolean
  reducedMotion: boolean
  focusIndicator: boolean
}

interface AccessibilityResponse {
  success: boolean
  message: string
  data?: AccessibilityPreferences
}

export async function GET(request: NextRequest): Promise<NextResponse<AccessibilityResponse>> {
  try {
    await dbConnect()
    
    const authResult = await validateAuth(request)
    if (!authResult.isValid) {
      return NextResponse.json({
        success: false,
        message: authResult.error
      }, { status: 401 })
    }

    const userId = authResult.user!.userId
    
    // Get or create user settings
    let userSettings = await UserSettings.findOne({ user: userId })
    if (!userSettings) {
      userSettings = await UserSettings.create({
        user: userId,
        theme: 'system',
        language: 'en',
        timezone: 'UTC',
        notifications: { email: true, push: true, courseUpdates: true, achievementAlerts: true, weeklyReports: false },
        privacy: { profileVisibility: 'public', showProgress: true, showAchievements: true },
        accessibility: {
          textToSpeech: { enabled: false, rate: 1, pitch: 1, voice: 'default' },
          fontSize: { base: 16, headings: 20, body: 16 },
          theme: 'system',
          highContrast: false,
          reducedMotion: false,
          focusIndicator: true
        }
      })
    }

    // Return accessibility preferences
    const accessibilityData = userSettings.accessibility || {
      textToSpeech: { enabled: false, rate: 1, pitch: 1, voice: 'default' },
      fontSize: { base: 16, headings: 20, body: 16 },
      theme: 'system',
      highContrast: false,
      reducedMotion: false,
      focusIndicator: true
    }

    return NextResponse.json({
      success: true,
      message: 'Accessibility preferences retrieved successfully',
      data: accessibilityData
    })

  } catch (error) {
    console.error('Get accessibility preferences error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve accessibility preferences'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse<AccessibilityResponse>> {
  try {
    await dbConnect()
    
    const authResult = await validateAuth(request)
    if (!authResult.isValid) {
      return NextResponse.json({
        success: false,
        message: authResult.error
      }, { status: 401 })
    }

    const userId = authResult.user!.userId
    const body = await request.json()
    
    // Update accessibility preferences
    const updatedSettings = await UserSettings.findOneAndUpdate(
      { user: userId },
      { 
        $set: { 
          'accessibility.textToSpeech': body.textToSpeech,
          'accessibility.fontSize': body.fontSize,
          'accessibility.theme': body.theme,
          'accessibility.highContrast': body.highContrast,
          'accessibility.reducedMotion': body.reducedMotion,
          'accessibility.focusIndicator': body.focusIndicator
        }
      },
      { new: true, upsert: true, runValidators: true }
    )

    return NextResponse.json({
      success: true,
      message: 'Accessibility preferences updated successfully',
      data: updatedSettings.accessibility
    })

  } catch (error) {
    console.error('Update accessibility preferences error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to update accessibility preferences'
    }, { status: 500 })
  }
}
