# Accessibility Features - Able Vista Learning Platform

## Overview
Able Vista is committed to providing an inclusive learning experience for all users. Our comprehensive accessibility toolkit ensures that learners with diverse needs can access and benefit from our educational content.

## 🎯 Core Accessibility Features

### 1. 🔊 Text-to-Speech (TTS)
- **Real-time text reading** for course content, descriptions, and interface elements
- **Customizable speech settings**:
  - Speed control (0.5x to 2x)
  - Pitch adjustment (0.5x to 2x)
  - Voice selection from available system voices
- **Multi-language support** based on available system voices
- **Interactive elements** that respond to TTS activation

### 2. 🅰 Font Size Controls
- **Dynamic font scaling** for all text elements
- **Three-tier system**:
  - Base font size (12px - 24px)
  - Heading font size (16px - 32px)
  - Body font size (12px - 24px)
- **Instant preview** of size changes
- **Reset functionality** to restore default sizes

### 3. 🌙 Theme Switching
- **Light Mode**: High contrast light theme for bright environments
- **Dark Mode**: Reduced eye strain in low-light conditions
- **System Mode**: Automatically follows user's system preferences
- **Persistent settings** saved across sessions

### 4. 🎨 Visual Accessibility
- **High Contrast Mode**: Enhanced contrast for better readability
- **Reduced Motion**: Minimizes animations for users with motion sensitivity
- **Focus Indicators**: Clear visual feedback for keyboard navigation
- **Color-blind friendly** design considerations

## 🛠️ How to Use

### Quick Access Toolbar
The accessibility toolbar is positioned on the left side of the screen and provides:

1. **Text-to-Speech Toggle** (🔊/🔇)
   - Click to enable/disable TTS
   - Visual indicator shows current status

2. **Font Size Controls** (+/-)
   - Plus button increases font sizes
   - Minus button decreases font sizes
   - Changes apply immediately

3. **Theme Switcher** (☀️/🌙/🖥️)
   - Cycles through Light → Dark → System
   - Icon indicates current theme

4. **Settings Panel** (⚙️)
   - Comprehensive accessibility preferences
   - Advanced TTS controls
   - Visual preference settings

### Detailed Settings Panel
Click the accessibility gear icon (⚙️) to access:

#### Text-to-Speech Settings
- Enable/disable TTS
- Speed adjustment slider
- Pitch adjustment slider
- Voice selection dropdown

#### Font Size Management
- Individual controls for base, headings, and body text
- Current size display
- Reset to defaults button

#### Visual Preferences
- High contrast toggle
- Reduced motion toggle
- Focus indicator toggle

#### Save & Apply
- Save preferences to user account
- Immediate application of changes
- Persistent across sessions

## 🔧 Technical Implementation

### API Endpoints
- `GET /api/accessibility` - Retrieve user preferences
- `PUT /api/accessibility` - Update accessibility settings

### Data Model
```typescript
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
```

### CSS Variables
```css
:root {
  --font-size-base: 16px;
  --font-size-headings: 20px;
  --font-size-body: 16px;
}
```

### Browser Support
- **Text-to-Speech**: Web Speech API (Chrome, Safari, Firefox, Edge)
- **CSS Variables**: All modern browsers
- **Theme Switching**: CSS custom properties
- **Font Scaling**: CSS rem units with JavaScript enhancement

## 📱 Mobile Accessibility

### Touch-Friendly Interface
- Large touch targets (minimum 44px)
- Adequate spacing between interactive elements
- Swipe gestures for mobile users

### Responsive Design
- Accessibility toolbar adapts to screen size
- Touch-optimized controls for mobile devices
- Maintains functionality across all device types

## 🎓 Learning Benefits

### For Students with Disabilities
- **Visual impairments**: High contrast, large fonts, TTS
- **Motor difficulties**: Keyboard navigation, focus indicators
- **Cognitive needs**: Clear layouts, reduced distractions
- **Hearing impairments**: Visual feedback, text alternatives

### For All Learners
- **Reading comfort**: Adjustable font sizes and themes
- **Learning preferences**: Multiple ways to consume content
- **Environment adaptation**: Light/dark themes for different conditions
- **Focus enhancement**: Reduced motion and clear indicators

## 🔍 Testing & Validation

### Accessibility Standards
- **WCAG 2.1 AA** compliance
- **Section 508** requirements
- **ARIA** labels and roles
- **Semantic HTML** structure

### Testing Tools
- Screen reader compatibility
- Keyboard navigation testing
- Color contrast validation
- Font size verification

## 🚀 Future Enhancements

### Planned Features
- **Screen reader optimization** for complex content
- **Keyboard shortcuts** for power users
- **Voice commands** for hands-free operation
- **Custom color schemes** for specific needs
- **Accessibility analytics** for usage insights

### Integration Opportunities
- **Learning Management System** compatibility
- **Third-party accessibility tools** integration
- **Accessibility plugins** for browsers
- **Mobile app** accessibility features

## 📞 Support & Feedback

### Getting Help
- **Documentation**: This guide and inline help
- **User Interface**: Tooltips and contextual information
- **Community**: User forums and support channels
- **Technical Support**: Direct assistance for complex issues

### Providing Feedback
- **Feature requests** for new accessibility tools
- **Bug reports** for accessibility issues
- **Usability feedback** for improvement suggestions
- **Success stories** for feature validation

## 🌟 Best Practices

### For Content Creators
- Use semantic HTML structure
- Provide alt text for images
- Ensure sufficient color contrast
- Test with accessibility tools

### For Developers
- Follow accessibility coding standards
- Implement ARIA attributes properly
- Test with screen readers
- Maintain keyboard navigation

### For Users
- Explore all available options
- Customize settings for your needs
- Provide feedback on features
- Share successful configurations

---

*This accessibility toolkit is continuously improved based on user feedback and accessibility research. We welcome suggestions for enhancements and new features.*
