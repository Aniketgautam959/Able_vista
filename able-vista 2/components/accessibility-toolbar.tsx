'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Volume2,
  VolumeX,
  Type,
  Sun,
  Moon,
  Monitor,
  Eye,
  Zap,
  Settings,
  Plus,
  Minus,
  Accessibility
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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

interface AccessibilityToolbarProps {
  className?: string
}

export const AccessibilityToolbar: React.FC<AccessibilityToolbarProps> = ({ className }) => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    textToSpeech: { enabled: false, rate: 1, pitch: 1, voice: 'default' },
    fontSize: { base: 16, headings: 20, body: 16 },
    theme: 'system',
    highContrast: false,
    reducedMotion: false,
    focusIndicator: true
  })
  const [isOpen, setIsOpen] = useState(false)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)
  const { toast } = useToast()

  // Load preferences on mount
  useEffect(() => {
    loadPreferences()
    loadVoices()
  }, [])

  // Apply accessibility settings
  useEffect(() => {
    applyAccessibilitySettings()
  }, [preferences])

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/accessibility')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setPreferences(data.data)
        }
      }
    } catch (error) {
      console.error('Failed to load accessibility preferences:', error)
    }
  }

  const loadVoices = () => {
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      setAvailableVoices(voices)
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        setAvailableVoices(window.speechSynthesis.getVoices())
      }
    }
  }

  const applyAccessibilitySettings = () => {
    // Apply font sizes
    document.documentElement.style.setProperty('--font-size-base', `${preferences.fontSize.base}px`)
    document.documentElement.style.setProperty('--font-size-headings', `${preferences.fontSize.headings}px`)
    document.documentElement.style.setProperty('--font-size-body', `${preferences.fontSize.body}px`)

    // Apply theme
    if (preferences.theme === 'dark' || (preferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Apply high contrast
    if (preferences.highContrast) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }

    // Apply reduced motion
    if (preferences.reducedMotion) {
      document.documentElement.classList.add('reduced-motion')
    } else {
      document.documentElement.classList.remove('reduced-motion')
    }

    // Apply focus indicator
    if (preferences.focusIndicator) {
      document.documentElement.classList.add('focus-visible')
    } else {
      document.documentElement.classList.remove('focus-visible')
    }
  }

  const savePreferences = async () => {
    try {
      const response = await fetch('/api/accessibility', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      })

      if (response.ok) {
        toast({
          title: "Preferences Saved",
          description: "Your accessibility preferences have been saved successfully.",
        })
      } else {
        throw new Error('Failed to save preferences')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save accessibility preferences.",
        variant: "destructive"
      })
    }
  }

  const toggleTextToSpeech = () => {
    const newEnabled = !preferences.textToSpeech.enabled
    setPreferences(prev => ({
      ...prev,
      textToSpeech: { ...prev.textToSpeech, enabled: newEnabled }
    }))

    if (newEnabled) {
      toast({
        title: "Text-to-Speech Enabled",
        description: "Click on any text to hear it read aloud.",
      })
    } else {
      stopSpeaking()
      toast({
        title: "Text-to-Speech Disabled",
        description: "Text-to-speech has been turned off.",
      })
    }
  }

  const speakText = (text: string) => {
    if (!preferences.textToSpeech.enabled) return

    stopSpeaking()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = preferences.textToSpeech.rate
    utterance.pitch = preferences.textToSpeech.pitch
    
    if (preferences.textToSpeech.voice !== 'default') {
      const voice = availableVoices.find(v => v.name === preferences.textToSpeech.voice)
      if (voice) utterance.voice = voice
    }

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    speechRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    if (speechRef.current) {
      window.speechSynthesis.cancel()
      speechRef.current = null
      setIsSpeaking(false)
    }
  }

  const increaseFontSize = () => {
    setPreferences(prev => ({
      ...prev,
      fontSize: {
        base: Math.min(prev.fontSize.base + 1, 24),
        headings: Math.min(prev.fontSize.headings + 1, 32),
        body: Math.min(prev.fontSize.body + 1, 24)
      }
    }))
  }

  const decreaseFontSize = () => {
    setPreferences(prev => ({
      ...prev,
      fontSize: {
        base: Math.max(prev.fontSize.base - 1, 12),
        headings: Math.max(prev.fontSize.headings - 1, 16),
        body: Math.max(prev.fontSize.body - 1, 12)
      }
    }))
  }

  const resetFontSize = () => {
    setPreferences(prev => ({
      ...prev,
      fontSize: { base: 16, headings: 20, body: 16 }
    }))
  }

  const toggleTheme = () => {
    const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(preferences.theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    
    setPreferences(prev => ({ ...prev, theme: nextTheme }))
  }

  const getThemeIcon = () => {
    switch (preferences.theme) {
      case 'light': return <Sun className="w-4 h-4" />
      case 'dark': return <Moon className="w-4 h-4" />
      default: return <Monitor className="w-4 h-4" />
    }
  }

  const getThemeLabel = () => {
    switch (preferences.theme) {
      case 'light': return 'Light'
      case 'dark': return 'Dark'
      default: return 'System'
    }
  }

  return (
    <div className={`fixed bottom-6 left-6 z-50 accessibility-toolbar ${className}`}>
      {/* Quick Access Buttons */}
      <div className="flex flex-col gap-2 mb-2">
        <Button
          size="icon"
          variant={preferences.textToSpeech.enabled ? "default" : "secondary"}
          onClick={toggleTextToSpeech}
          className="w-12 h-12 shadow-lg border-0"
          title={preferences.textToSpeech.enabled ? "Disable Text-to-Speech" : "Enable Text-to-Speech"}
        >
          {preferences.textToSpeech.enabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </Button>

        <Button
          size="icon"
          variant="secondary"
          onClick={increaseFontSize}
          className="w-12 h-12 shadow-lg border-0"
          title="Increase Font Size"
        >
          <Plus className="w-5 h-5" />
        </Button>

        <Button
          size="icon"
          variant="secondary"
          onClick={decreaseFontSize}
          className="w-12 h-12 shadow-lg border-0"
          title="Decrease Font Size"
        >
          <Minus className="w-5 h-5" />
        </Button>

        <Button
          size="icon"
          variant="secondary"
          onClick={toggleTheme}
          className="w-12 h-12 shadow-lg border-0"
          title={`Current Theme: ${getThemeLabel()}`}
        >
          {getThemeIcon()}
        </Button>
      </div>

      {/* Main Accessibility Panel */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            variant="default"
            className="w-12 h-12 shadow-lg border-0"
            title="Accessibility Settings"
          >
            <Accessibility className="w-5 h-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" side="top" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Accessibility Tools</h3>
              <Badge variant="secondary">Learning</Badge>
            </div>

            {/* Text-to-Speech Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Text-to-Speech</span>
                <Switch
                  checked={preferences.textToSpeech.enabled}
                  onCheckedChange={toggleTextToSpeech}
                />
              </div>
              
              {preferences.textToSpeech.enabled && (
                <div className="space-y-2 pl-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Speed</span>
                    <span className="text-xs font-mono">{preferences.textToSpeech.rate}x</span>
                  </div>
                  <Slider
                    value={[preferences.textToSpeech.rate]}
                    onValueChange={([value]) => setPreferences(prev => ({
                      ...prev,
                      textToSpeech: { ...prev.textToSpeech, rate: value }
                    }))}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Pitch</span>
                    <span className="text-xs font-mono">{preferences.textToSpeech.pitch}x</span>
                  </div>
                  <Slider
                    value={[preferences.textToSpeech.pitch]}
                    onValueChange={([value]) => setPreferences(prev => ({
                      ...prev,
                      textToSpeech: { ...prev.textToSpeech, pitch: value }
                    }))}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />

                  <Select
                    value={preferences.textToSpeech.voice}
                    onValueChange={(value) => setPreferences(prev => ({
                      ...prev,
                      textToSpeech: { ...prev.textToSpeech, voice: value }
                    }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Voice" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default Voice</SelectItem>
                      {availableVoices.map((voice) => (
                        <SelectItem key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Separator />

            {/* Font Size Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Font Size</span>
                <Button size="sm" variant="outline" onClick={resetFontSize}>
                  Reset
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Base: {preferences.fontSize.base}px</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Headings: {preferences.fontSize.headings}px</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Body: {preferences.fontSize.body}px</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Visual Preferences */}
            <div className="space-y-3">
              <span className="text-sm font-medium">Visual Preferences</span>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">High Contrast</span>
                <Switch
                  checked={preferences.highContrast}
                  onCheckedChange={(checked) => setPreferences(prev => ({
                    ...prev,
                    highContrast: checked
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Reduced Motion</span>
                <Switch
                  checked={preferences.reducedMotion}
                  onCheckedChange={(checked) => setPreferences(prev => ({
                    ...prev,
                    reducedMotion: checked
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Focus Indicator</span>
                <Switch
                  checked={preferences.focusIndicator}
                  onCheckedChange={(checked) => setPreferences(prev => ({
                    ...prev,
                    focusIndicator: checked
                  }))}
                />
              </div>
            </div>

            <Separator />

            {/* Save Button */}
            <Button onClick={savePreferences} className="w-full">
              <Settings className="w-4 h-4 mr-2" />
              Save Preferences
            </Button>

            {/* Demo Text */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Demo Text:</strong> Click this text to test text-to-speech functionality.
                Adjust font sizes and themes to see immediate changes.
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default AccessibilityToolbar
