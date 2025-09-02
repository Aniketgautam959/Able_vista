# Instructor Dashboard

This page provides instructors with a comprehensive interface to manage their courses, chapters, and lessons.

## Features

### Authentication & Authorization
- Checks if the user is authenticated
- Verifies if the user is registered as an instructor
- Redirects to login if not authenticated
- Shows 404 page if user is not an instructor

### Course Management
- View all courses created by the instructor
- Create new courses with detailed information:
  - Title, description, category, level
  - Price, duration, estimated hours
  - Skills, requirements, and learning outcomes
- See course status (Published/Draft)
- View course statistics (chapters, lessons count)

### Chapter Management
- Add chapters to existing courses
- Set chapter order and duration
- View chapters with their lessons

### Lesson Management
- Add lessons to specific chapters
- Support for different lesson types:
  - Video lessons (with URL)
  - Reading lessons (with text content)
  - Project lessons
- Set lesson order and duration
- View lessons with type indicators

## API Routes

### `/api/instructor/courses`
- `GET`: Retrieve all courses for authenticated instructor
- `POST`: Create new course for authenticated instructor

### `/api/instructor/chapters`
- `GET`: Retrieve chapters for instructor's courses
- `POST`: Create new chapter for authenticated instructor

### `/api/instructor/lessons`
- `GET`: Retrieve lessons for instructor's courses
- `POST`: Create new lesson for authenticated instructor

## Security Features

- All API routes require authentication
- Instructor verification on all operations
- Course ownership validation
- Chapter ownership validation
- Proper error handling and user feedback

## UI Components

- Modern, responsive design
- Modal dialogs for creation forms
- Real-time form validation
- Toast notifications for success/error feedback
- Loading states and skeleton screens
- Hierarchical display of courses → chapters → lessons

## Navigation

- Integrated with main application navigation
- Instructor portal link appears only for registered instructors
- Consistent header across all pages
