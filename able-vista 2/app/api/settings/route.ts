import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import { validateAuth } from '../../../lib/auth';
import { UserSettings } from '../../../models/UserSettings';

interface SettingsResponse {
  success: boolean;
  message: string;
  data?: any;
}

export async function GET(request: NextRequest): Promise<NextResponse<SettingsResponse>> {
  try {
    await dbConnect();

    // Validate authentication
    const authResult = await validateAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({
        success: false,
        message: authResult.error
      }, { status: 401 });
    }

    const userId = authResult.user!.userId;

    // Get user settings or create default ones
    let userSettings = await UserSettings.findOne({ user: userId });

    if (!userSettings) {
      // Create default settings
      userSettings = await UserSettings.create({
        user: userId,
        theme: 'system',
        language: 'en',
        timezone: 'UTC',
        notifications: {
          email: true,
          push: true,
          courseUpdates: true,
          achievementAlerts: true,
          weeklyReports: false,
        },
        privacy: {
          profileVisibility: 'public',
          showProgress: true,
          showAchievements: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'User settings retrieved successfully',
      data: userSettings
    });

  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve user settings'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse<SettingsResponse>> {
  try {
    await dbConnect();

    // Validate authentication
    const authResult = await validateAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({
        success: false,
        message: authResult.error
      }, { status: 401 });
    }

    const userId = authResult.user!.userId;
    const body = await request.json();

    // Update or create user settings
    const updatedSettings = await UserSettings.findOneAndUpdate(
      { user: userId },
      {
        theme: body.theme,
        language: body.language,
        timezone: body.timezone,
        notifications: body.notifications,
        privacy: body.privacy,
      },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      data: updatedSettings
    });

  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update user settings'
    }, { status: 500 });
  }
}
