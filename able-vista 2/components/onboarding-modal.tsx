"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, User, Target, MapPin, Clock, BookOpen, Star } from "lucide-react"

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (profileData: UserProfileData) => void
  loading?: boolean
}

interface UserProfileData {
  bio: string
  location: string
  timezone: string
  learningGoal: string
  interests: string[]
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  preferredLearningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
}

const skillLevels = [
  { value: 'beginner', label: 'Beginner', description: 'New to programming' },
  { value: 'intermediate', label: 'Intermediate', description: 'Some experience' },
  { value: 'advanced', label: 'Advanced', description: 'Experienced developer' }
]

const learningStyles = [
  { value: 'visual', label: 'Visual', description: 'Learn through diagrams and videos' },
  { value: 'auditory', label: 'Auditory', description: 'Learn through listening and discussion' },
  { value: 'kinesthetic', label: 'Kinesthetic', description: 'Learn through hands-on practice' },
  { value: 'reading', label: 'Reading', description: 'Learn through text and documentation' }
]

const popularInterests = [
  'Web Development', 'JavaScript', 'React', 'Node.js', 'Python', 'Data Science',
  'Machine Learning', 'Mobile Development', 'DevOps', 'UI/UX Design', 'Cybersecurity',
  'Blockchain', 'Cloud Computing', 'Database Design', 'API Development'
]

export function OnboardingModal({ isOpen, onClose, onSubmit, loading = false }: OnboardingModalProps) {
  const [formData, setFormData] = useState<UserProfileData>({
    bio: '',
    location: '',
    timezone: 'UTC',
    learningGoal: '',
    interests: [],
    skillLevel: 'beginner',
    preferredLearningStyle: 'visual'
  })

  const [step, setStep] = useState(1)
  const totalSteps = 3

  const handleInputChange = (field: keyof UserProfileData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps))
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1))

  const handleSubmit = () => {
    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-border">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
          <CardTitle className="text-2xl text-center">Welcome to Able Vista! 🎉</CardTitle>
          <p className="text-center text-muted-foreground">
            Let's set up your profile to personalize your learning experience
          </p>
          
          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2 mt-4">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
          <div className="text-center text-sm text-muted-foreground mt-2">
            Step {step} of {totalSteps}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <User className="w-12 h-12 mx-auto mb-2 text-primary" />
                <h3 className="text-lg font-semibold">Tell us about yourself</h3>
                <p className="text-muted-foreground">Help us understand your background and goals</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us a bit about yourself and your learning journey..."
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="City, Country"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                      <SelectItem value="America/New_York">EST (Eastern Time)</SelectItem>
                      <SelectItem value="America/Chicago">CST (Central Time)</SelectItem>
                      <SelectItem value="America/Denver">MST (Mountain Time)</SelectItem>
                      <SelectItem value="America/Los_Angeles">PST (Pacific Time)</SelectItem>
                      <SelectItem value="Europe/London">GMT (Greenwich Mean Time)</SelectItem>
                      <SelectItem value="Europe/Paris">CET (Central European Time)</SelectItem>
                      <SelectItem value="Asia/Tokyo">JST (Japan Standard Time)</SelectItem>
                      <SelectItem value="Asia/Shanghai">CST (China Standard Time)</SelectItem>
                      <SelectItem value="Asia/Kolkata">IST (India Standard Time)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Learning Goals */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <Target className="w-12 h-12 mx-auto mb-2 text-primary" />
                <h3 className="text-lg font-semibold">What are your learning goals?</h3>
                <p className="text-muted-foreground">This helps us recommend the right courses for you</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="learningGoal">Learning Goal</Label>
                  <Textarea
                    id="learningGoal"
                    placeholder="e.g., Become a full-stack developer, Learn data science, Master React..."
                    value={formData.learningGoal}
                    onChange={(e) => handleInputChange('learningGoal', e.target.value)}
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Skill Level</Label>
                  <div className="grid gap-3 mt-2">
                    {skillLevels.map((level) => (
                      <div
                        key={level.value}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          formData.skillLevel === level.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => handleInputChange('skillLevel', level.value)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{level.label}</div>
                            <div className="text-sm text-muted-foreground">{level.description}</div>
                          </div>
                          {formData.skillLevel === level.value && (
                            <Star className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Interests and Learning Style */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <BookOpen className="w-12 h-12 mx-auto mb-2 text-primary" />
                <h3 className="text-lg font-semibold">What interests you?</h3>
                <p className="text-muted-foreground">Select topics that interest you and your preferred learning style</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Areas of Interest</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {popularInterests.map((interest) => (
                      <Badge
                        key={interest}
                        variant={formData.interests.includes(interest) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/10"
                        onClick={() => handleInterestToggle(interest)}
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Selected: {formData.interests.length} interests
                  </p>
                </div>

                <div>
                  <Label>Preferred Learning Style</Label>
                  <div className="grid gap-3 mt-2">
                    {learningStyles.map((style) => (
                      <div
                        key={style.value}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          formData.preferredLearningStyle === style.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => handleInputChange('preferredLearningStyle', style.value)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{style.label}</div>
                            <div className="text-sm text-muted-foreground">{style.description}</div>
                          </div>
                          {formData.preferredLearningStyle === style.value && (
                            <Star className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
            >
              Previous
            </Button>

            {step < totalSteps ? (
              <Button onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Creating Profile...' : 'Complete Setup'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
