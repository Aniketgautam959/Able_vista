import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/db";
import { Course, Chapter, Instructor } from "../../../../models";
import { validateAuth } from "../../../../lib/auth";
import mongoose from "mongoose";

interface LessonResponse {
  success: boolean;
  message: string;
  data?: any;
}

// GET /api/instructor/lessons - Get lessons for authenticated instructor's courses
export async function GET(
  request: NextRequest
): Promise<NextResponse<LessonResponse>> {
  try {
    await dbConnect();

    // Validate authentication
    const authResult = await validateAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({
        success: false,
        message: "Authentication required",
      }, { status: 401 });
    }

    // Check if user is an instructor
    const instructor = await Instructor.findOne({ user: authResult.user?.userId });
    if (!instructor) {
      return NextResponse.json({
        success: false,
        message: "Instructor not found",
      }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const course = searchParams.get("course");
    const chapter = searchParams.get("chapter");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};
    
    if (course) {
      // Verify the course belongs to this instructor
      const courseDoc = await Course.findOne({ _id: course, instructor: instructor._id });
      if (!courseDoc) {
        return NextResponse.json({
          success: false,
          message: "Course not found or access denied",
        }, { status: 404 });
      }
      filter.course = course;
    } else {
      // Get all courses for this instructor
      const instructorCourses = await Course.find({ instructor: instructor._id }).select("_id");
      const courseIds = instructorCourses.map((c) => c._id);
      filter.course = { $in: courseIds };
    }

    if (chapter) {
      // Verify the chapter belongs to one of the instructor's courses
      const chapterDoc = await Chapter.findOne({ _id: chapter, course: { $in: instructorCourses.map(c => c._id) } });
      if (!chapterDoc) {
        return NextResponse.json({
          success: false,
          message: "Chapter not found or access denied",
        }, { status: 404 });
      }
      filter.chapter = chapter;
    }

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
    console.error("Get instructor lessons error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve lessons",
      },
      { status: 500 }
    );
  }
}

// POST /api/instructor/lessons - Create a new lesson for authenticated instructor
export async function POST(
  request: NextRequest
): Promise<NextResponse<LessonResponse>> {
  try {
    await dbConnect();

    // Validate authentication
    const authResult = await validateAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({
        success: false,
        message: "Authentication required",
      }, { status: 401 });
    }

    // Check if user is an instructor
    const instructor = await Instructor.findOne({ user: authResult.user?.userId });
    if (!instructor) {
      return NextResponse.json({
        success: false,
        message: "Instructor not found",
      }, { status: 404 });
    }

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
      videoUrl,
      textContent,
      attachments,
    } = body;

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

    // Verify the course belongs to this instructor
    const courseDoc = await Course.findOne({ _id: course, instructor: instructor._id });
    if (!courseDoc) {
      return NextResponse.json({
        success: false,
        message: "Course not found or access denied",
      }, { status: 404 });
    }

    // Verify the chapter belongs to this course
    const chapterDoc = await Chapter.findOne({ _id: chapter, course: course });
    if (!chapterDoc) {
      return NextResponse.json({
        success: false,
        message: "Chapter not found or access denied",
      }, { status: 404 });
    }

    // Ensure attachments is always an array
    const lessonAttachments = Array.isArray(attachments) ? attachments : [];

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
      textContent: textContent || "",
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
    console.error("Create instructor lesson error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create lesson",
      },
      { status: 500 }
    );
  }
}
