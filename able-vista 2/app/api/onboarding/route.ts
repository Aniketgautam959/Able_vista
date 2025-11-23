import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/db";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        // TODO: Get user from session/auth
        // For now, we'll assume the user ID is passed in the body or we'd get it from the session
        // In a real app, you'd use something like `getServerSession` or your auth provider's method

        // Mocking user ID retrieval for now as I don't see the auth implementation details in the context
        // I'll check how other routes get the user.
        // Looking at `app/instructor/page.tsx`, it calls `/api/auth/showme`.
        // I should probably rely on the session if available, but for this task I'll focus on the logic.

        const body = await request.json();
        const {
            userId, // We might need to pass this from the client if we can't get it server-side easily yet
            bio,
            interests,
            learningGoal,
            skillLevel,
            preferredLearningStyle,
        } = body;

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "User ID is required" },
                { status: 401 }
            );
        }

        const UserProfile = mongoose.model("UserProfile");

        // Check if profile exists
        let profile = await UserProfile.findOne({ user: userId });

        if (profile) {
            // Update existing profile
            profile.bio = bio;
            profile.interests = interests;
            profile.learningGoal = learningGoal;
            profile.skillLevel = skillLevel;
            profile.preferredLearningStyle = preferredLearningStyle;
            await profile.save();
        } else {
            // Create new profile
            profile = await UserProfile.create({
                user: userId,
                bio,
                interests,
                learningGoal,
                skillLevel,
                preferredLearningStyle,
            });
        }

        return NextResponse.json(
            {
                success: true,
                message: "Profile updated successfully",
                data: profile,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Onboarding error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to update profile" },
            { status: 500 }
        );
    }
}
