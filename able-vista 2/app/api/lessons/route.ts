import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/db";
import mongoose from "mongoose";
import { summarizeYoutubeVideo } from "../../../services/ai/youtubetext";

interface LessonResponse {
  success: boolean;
  message: string;
  data?: any;
}

// GET /api/lessons - Get all lessons
export async function GET(
  request: NextRequest
): Promise<NextResponse<LessonResponse>> {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const course = searchParams.get("course");
    const chapter = searchParams.get("chapter");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};
    if (course) filter.course = course;
    if (chapter) filter.chapter = chapter;
    if (type) filter.type = type;

    // Get the Lesson model
    const Lesson = mongoose.model("Lesson");

    const lessons = await Lesson.find(filter)
      .populate("course", "title")
      .populate("chapter", "title")
      .skip(skip)
      .limit(limit)
      .sort({ order: 1 });

    const total = await Lesson.countDocuments(filter);

    return NextResponse.json({
      success: true,
      message: "Lessons retrieved successfully",
      data: {
        lessons,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get lessons error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve lessons",
      },
      { status: 500 }
    );
  }
}

// POST /api/lessons - Create a new lesson
export async function POST(
  request: NextRequest
): Promise<NextResponse<LessonResponse>> {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      title,
      description,
      chapter,
      course,
      order,
      type,
      duration,
      durationMinutes,
      attachments,
    } = body;

    // Extract videoUrl and textContent, handling potential nesting in 'content' object
    let videoUrl = body.videoUrl;
    let textContent = body.textContent;

    if (body.content && typeof body.content === 'object') {
      videoUrl = body.content.videoUrl || videoUrl;
      textContent = body.content.textContent || textContent;
    }

    // Validate required fields
    if (
      !title ||
      !chapter ||
      !course ||
      !order ||
      !type ||
      !duration ||
      !durationMinutes
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // Ensure attachments is always an array
    const lessonAttachments = Array.isArray(attachments) ? attachments : [];

    // Summarize YouTube video if videoUrl is provided and textContent is empty
    let finalTextContent = textContent;
    let videoSources: any[] = [];
    if (videoUrl && !finalTextContent) {
      try {
        const summaryResult = await summarizeYoutubeVideo(videoUrl);
        finalTextContent = summaryResult.summaryText;
        videoSources = summaryResult.sources;
      } catch (error) {
        console.error("Failed to summarize YouTube video:", error);
        // We continue without text content if summarization fails, 
        // or you could choose to throw to abort lesson creation.
        // For now, we'll just log it and proceed with empty text.
      }
    }

    // Get the Lesson model
    const Lesson = mongoose.model("Lesson");

    const lesson = await Lesson.create({
      title,
      description,
      chapter,
      course,
      order,
      type,
      duration,
      durationMinutes,
      videoUrl: videoUrl || "",
      textContent: finalTextContent || "",
      sources: videoSources,
      attachments: lessonAttachments,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Lesson created successfully",
        data: lesson,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create lesson error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create lesson",
      },
      { status: 500 }
    );
  }
}
