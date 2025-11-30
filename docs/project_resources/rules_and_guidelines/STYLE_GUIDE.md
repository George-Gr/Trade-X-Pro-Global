# Frontend Style Guide - Trade-X-Pro-Global

A comprehensive guide to design standards, coding conventions, and best practices for the Trade-X-Pro-Global frontend transformation project.

## Table of Contents

1. [Design System Guidelines](#design-system-guidelines)
2. [Typography System](#typography-system)
3. [Color Psychology & Usage](#color-psychology--usage)
4. [Component Architecture](#component-architecture)
5. [Code Standards](#code-standards)
6. [Implementation Rules](#implementation-rules)
7. [Dos and Don'ts](#dos-and-donts)
8. [Best Practices](#best-practices)
9. [Accessibility Standards](#accessibility-standards)
10. [Performance Guidelines](#performance-guidelines)
11. [Testing Requirements](#testing-requirements)
12. [Documentation Standards](#documentation-standards)

---

## 1. Design System Guidelines

### 1.1 Color Psychology Framework

#### Primary Color Palette
```
NAVY (#1E3A8A) - Trust, Professionalism, Authority
  Psychology: Banker aesthetic, institutional confidence
  Usage: Headers, primary buttons, navigation
  Application: 60% of interface elements

GOLD (#D4AF37) - Exclusivity, Premium, Luxury
  Psychology: Scarcity principle (Cialdini), wealth signal
  Usage: CTAs, badges, highlights, premium indicators
  Application: 10% of interface elements (accent only)

EMERALD (#10B981) - Growth, Success, Positive Action
  Psychology: Natural growth association, calm confidence
  Usage: Buy orders, profit indicators, success states
  Application: 15% of interface elements

CRIMSON (#DC2626) - Urgency, Loss, Action Required
  Psychology: Loss aversion (fear of loss > desire for gain)
  Usage: Sell orders, losses, warnings, errors
  Application: 10% of interface elements

WARM WHITE (#FAFAF5) - Approachability, Inviting
  Psychology: Warmth vs. clinical coldness
  Usage: Backgrounds, cards, creating breathing room
  Application: 70% of background elements
```

#### Color Application Rules

**Primary Color (Navy) Usage**:
- ✅ Headers, navigation, primary CTAs
- ✅ Form labels, body text, secondary elements
- ✅ Border elements, dividers
- ❌ Backgrounds (too heavy)
- ❌ Small text (reduces readability)

**Accent Color (Gold) Usage**:
- ✅ Premium CTAs, verified badges, highlights
- ✅ Hover states on primary elements
- ✅ Success indicators, achievement markers
- ❌ Backgrounds (too overwhelming)
- ❌ Body text (poor readability)
- ❌ Overuse (loses premium signal)

**Success Color (Emerald) Usage**:
- ✅ Buy orders, profit displays, positive metrics
- ✅ Success messages, confirmation states
- ✅ Growth indicators, progress bars
- ❌ Error states (psychological mismatch)
- ❌ Backgrounds (too dominant)

**Warning Color (Crimson) Usage**:
- ✅ Sell orders, loss indicators, error states
- ✅ Warning messages, critical alerts
- ✅ Delete actions, destructive operations
- ❌ Positive states (psychological mismatch)
- ❌ Backgrounds (too alarming)

### 1.2 Color Contrast Requirements

**WCAG AAA Compliance (Target)**:
- Body text: 7:1 contrast ratio minimum
- Large text: 4.5:1 contrast ratio minimum
- UI elements: 3:1 contrast ratio minimum

**Implementation**:
```css
/* Primary text on white */
--text-primary: hsl(220 13% 13%); /* Navy-based, 7:1 contrast */
--text-secondary: hsl(220 13% 30%); /* Medium contrast */
--text-muted: hsl(220 13% 50%); /* Low priority text */

/* Backgrounds */
--bg-primary: hsl(0 0% 99%); /* Warm white, accessible */
--bg-secondary: hsl(0 0% 97%); /* Slightly darker */
--bg-tertiary: hsl(0 0% 95%); /* Card backgrounds */

/* Interactive states */
--btn-primary: hsl(220 60% 20%); /* Navy button */
--btn-primary-hover: hsl(220 60% 15%); /* Darker on hover */
--btn-gold: hsl(43 74% 49%); /* Gold accent */
--btn-gold-hover: hsl(43 74% 42%); /* Darker gold */
```

### 1.3 Spacing & Layout Standards

#### Grid System
```
BASE GRID: 4px (all spacing multiples of 4)
SMALL SCALE: 4px, 8px, 12px, 16px (tight elements)
MEDIUM SCALE: 20px, 24px, 32px (card spacing)
LARGE SCALE: 40px, 48px, 64px (section spacing)
EXTRA LARGE: 80px, 96px, 128px (hero sections)
```

#### Component Spacing Rules

**Card Spacing**:
- Internal padding: 16px (md) for standard cards
- Internal padding: 24px (lg) for featured cards
- Internal padding: 32px (xl) for premium cards
- Margin between cards: 16px (md)
- Gap in grid layouts: 16px (md)

**Form Spacing**:
- Label to input: 6px
- Input to input: 12px
- Group spacing: 24px
- Form to button: 20px

**Typography Spacing**:
- Line height: 1.4-1.6 (body), 1.2-1.4 (headings)
- Paragraph spacing: 16px (md)
- Heading to content: 12px
- List item spacing: 8px

**Navigation Spacing**:
- Menu item height: 40px minimum
- Menu item padding: 12px 16px
- Dropdown spacing: 8px padding, 4px gaps
- Sidebar width: 240px-280px

### 1.4 Elevation & Depth System

#### Shadow Hierarchy
```
LEVEL 0 (Flat): No shadow
  Usage: Background elements, disabled states
  CSS: box-shadow: none;

LEVEL 1 (Subtle): 0 1px 2px rgba(0,0,0,0.05)
  Usage: Secondary cards, input fields
  Psychology: Slight separation, not prominent

LEVEL 2 (Standard): 0 4px 6px -1px rgba(0,0,0,0.1)
  Usage: Primary cards, buttons, modals
  Psychology: Standard elevation, important

LEVEL 3 (Prominent): 0 10px 15px -3px rgba(0,0,0,0.1)
  Usage: Featured content, primary CTAs
  Psychology: High importance, demands attention

LEVEL 4 (Premium): 0 20px 25px -5px rgba(0,0,0,0.1)
  Usage: Premium badges, hero elements
  Psychology: Maximum importance, exclusive

LEVEL 5 (Gold Glow): 0 0 20px hsl(43 74% 49% / 0.3)
  Usage: Premium indicators, success states
  Psychology: Luxury signal, achievement
```

#### Border Radius Standards
```
SMALL: 4px (sharp, technical elements)
  Usage: Input fields, checkboxes, radio buttons

MEDIUM: 8px (standard, friendly)
  Usage: Buttons, cards, modals, badges

LARGE: 12px (soft, approachable)
  Usage: Mobile cards, rounded elements

EXTRA LARGE: 16px (very soft)
  Usage: Mobile-first designs, pill shapes

CIRCULAR: 50% (perfect circles)
  Usage: Avatars, icons, progress indicators
```

---

## 2. Typography System

### 2.1 Font Selection & Hierarchy

#### Primary Font Stack
```
HEADINGS (Authority & Premium): Playfair Display
  Weights: 600 (Semibold), 700 (Bold)
  Usage: H1, H2, H3, premium badges, section titles
  Psychology: Serif = trust + authority (Nielsen Norman: +23% trust perception)
  Target: 60% of headings should use serif

BODY TEXT (Clarity & Readability): Manrope
  Weights: 400 (Regular), 500 (Medium), 600 (Semibold)
  Usage: Body text, labels, forms, navigation
  Psychology: Sans-serif = modern + approachable
  Target: 40% of headings + all body text

MONOSPACE (Data & Precision): JetBrains Mono
  Weights: 400 (Regular), 600 (Semibold)
  Usage: Numbers, prices, code, data displays
  Psychology: Technical precision, financial data
  Target: All trading data, statistics
```

#### Typography Scale (Desktop)

| Element | Font | Size | Weight | Line Height | Letter Spacing | Usage |
|---------|------|------|--------|-------------|----------------|-------|
| H1 (Page Title) | Playfair Display | 48px | 700 | 1.2 | -0.02em | Landing hero, main pages |
| H2 (Section) | Playfair Display | 36px | 600 | 1.33 | -0.01em | Major sections, cards |
| H3 (Subsection) | Playfair Display | 28px | 600 | 1.33 | 0 | Card titles, features |
| H4 (Component) | Manrope | 22px | 600 | 1.375 | 0 | Modal titles, headers |
| H5 (Label) | Manrope | 16px | 600 | 1.5 | 0 | Form labels, UI text |
| Body (Regular) | Manrope | 16px | 400 | 1.625 | 0 | Main content, descriptions |
| Body (Small) | Manrope | 14px | 400 | 1.6 | 0 | Secondary info, help text |
| Caption | Manrope | 12px | 500 | 1.4 | 0 | Timestamps, metadata |
| Mono (Data) | JetBrains Mono | 13px | 400 | 1.5 | 0 | Numbers, prices, code |

#### Typography Scale (Mobile)
```
H1: 36px (maintain hierarchy, fit screen)
H2: 28px
H3: 22px
H4: 18px
Body: 16px (iOS minimum for no zoom)
Small: 14px
Caption: 12px
```

### 2.2 Typography Application Rules

#### Font Weight Hierarchy
```
700 Bold:       Only H1 (page titles) in serif
600 Semibold:   Headers, button text, labels (emphasis)
500 Medium:     Captions, secondary text (hierarchy)
400 Regular:    Body text, form inputs (baseline)

Rule: Never use 4+ font weights in one view
Max 3: One bold, one semibold, one regular
```

#### Typography Psychology Guidelines

**Serif Usage (Playfair Display)**:
- ✅ Page titles (H1)
- ✅ Section headers (H2)
- ✅ Premium badges ("Verified Trader")
- ✅ Important metrics (profit/loss displays)
- ✅ Trust indicators (security badges)
- ❌ Body text (hard to read long-form)
- ❌ Form labels (feels out of place)
- ❌ Button text (too formal)
- ❌ Navigation items (too heavy)

**Sans-Serif Usage (Manrope)**:
- ✅ Body copy (excellent readability)
- ✅ Form inputs (technical, precise)
- ✅ Button text (action-oriented)
- ✅ Navigation (clean, scannable)
- ✅ Data/numbers (technical feel)
- ❌ Long headings (lacks authority)

**Monospace Usage (JetBrains Mono)**:
- ✅ Numbers, prices, statistics
- ✅ Code examples, API keys
- ✅ Trading data (prices, volumes)
- ✅ Technical specifications
- ❌ Body text (poor readability)

### 2.3 Typography Accessibility Standards

#### WCAG AAA Compliance
- **Font Size**: Minimum 16px for body text (14px for captions)
- **Line Height**: Minimum 1.5 for body, 1.2 for headings
- **Letter Spacing**: Increase by 0.12em for dyslexia-friendly
- **Word Spacing**: Increase by 0.16em for dyslexia-friendly
- **Contrast**: 7:1 for body text, 4.5:1 for large text

#### Typography for Cognitive Load
```
READING COMFORT:
- Line length: 45-75 characters (ideal: 66)
- Paragraph length: 3-4 lines maximum
- Column width: 600px maximum
- Text alignment: Left-aligned (never justified)

SCANNING FRIENDLINESS:
- Use bullet points for 3+ items
- Highlight keywords in headings
- Use consistent hierarchy
- White space around text blocks

MOBILE READABILITY:
- Font size: 16px minimum (iOS requirement)
- Line height: 1.5 minimum
- Touch targets: 44px height for text buttons
- No hover states (mobile limitation)
```

### 2.4 Typography CSS Custom Properties

```css
:root {
  /* Font families */
  --font-serif: 'Playfair Display', 'Georgia', serif;
  --font-sans: 'Manrope', 'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;
  
  /* Font sizes */
  --text-xs: 0.75rem;       /* 12px */
  --text-sm: 0.875rem;      /* 14px */
  --text-base: 1rem;        /* 16px */
  --text-lg: 1.125rem;      /* 18px */
  --text-xl: 1.25rem;       /* 20px */
  --text-2xl: 1.5rem;       /* 24px */
  --text-3xl: 1.875rem;     /* 30px */
  --text-4xl: 2.25rem;      /* 36px */
  --text-5xl: 3rem;         /* 48px */
  --text-6xl: 3.75rem;      /* 60px */
  
  /* Font weights */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
  
  /* Line heights */
  --leading-tight: 1.2;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 1.875;
  
  /* Heading-specific */
  --h1-size: 2rem;
  --h1-weight: 700;
  --h1-line-height: 1.2;
  --h1-letter-spacing: -0.02em;
  
  --h2-size: 1.5rem;
  --h2-weight: 600;
  --h2-line-height: 1.33;
  --h2-letter-spacing: -0.01em;
  
  --h3-size: 1.125rem;
  --h3-weight: 600;
  --h3-line-height: 1.33;
  --h3-letter-spacing: 0;
  
  --h4-size: 1rem;
  --h4-weight: 600;
  --h4-line-height: 1.375;
  --h4-letter-spacing: 0;
}
```

---

## 3. Color Psychology & Usage

### 3.1 Psychological Design Principles

#### Cialdini's 6 Principles of Influence

**1. Authority (Expert Perception)**
```
Application: Clean, organized interfaces → "Professional"
Color: Navy + Gold = banker aesthetic
Typography: Serif headers = institutional confidence
Micro-copy: "Bank-grade security", "Regulated platform"
```

**2. Social Proof (Community Validation)**
```
Application: Leaderboards, verified badges
Color: Gold for verified status, emerald for success
Typography: Bold statistics, user testimonials
Micro-copy: "2,500+ traders trading now", "Join our community"
```

**3. Reciprocity (Value-First Mentality)**
```
Application: Free tutorials, webinars before upsell
Color: Warm, inviting palette
Typography: Friendly, approachable
Micro-copy: "Learn for free", "No credit card required"
```

**4. Scarcity (Exclusivity Perception)**
```
Application: "Verified Trader" badge (premium status)
Color: Gold accents = luxury/premium
Typography: Elegant, premium fonts
Micro-copy: "Join our exclusive trading community"
```

**5. Consistency (Predictable Experience)**
```
Application: Every interaction feels familiar
Color: Consistent palette usage
Typography: Consistent hierarchy
Micro-copy: Consistent tone of voice
```

**6. Liking (Aesthetic Appeal)**
```
Application: Beautiful, not just functional
Color: Harmonious, warm palette
Typography: Pleasing combinations
Micro-copy: Friendly, helpful tone
```

#### Consumer Psychology Biases

**Loss Aversion**
```
Principle: Users fear losses ~2x more than gains appeal them
Application: Make stop-loss prominent in trading interface
Color: Use crimson for loss warnings, emerald for profit
Typography: Clear, urgent messaging for risk
Micro-copy: "Protect your capital", "Set stop-loss"
```

**Status Quo Bias**
```
Principle: Users fear complexity and change
Application: Gradual changes, progressive disclosure
Color: Familiar, trustworthy palette
Typography: Clear, reassuring messaging
Micro-copy: "Take your time", "We'll guide you"
```

**Availability Heuristic**
```
Principle: Easy-to-recall info feels trustworthy
Application: Real-time metrics prominently displayed
Color: High-contrast, attention-grabbing for key info
Typography: Large, bold for important metrics
Micro-copy: "Live prices", "Real-time updates"
```

**Anchoring Effect**
```
Principle: First number seen sets expectations
Application: Show starting balance as anchor point
Color: Gold for positive anchors, navy for neutral
Typography: Large, prominent for anchor points
Micro-copy: "Starting balance: $10,000", "You could earn 5%"
```

**Endowment Effect**
```
Principle: Users value what they have
Application: Portfolio growth visualization
Color: Emerald for growth, warm colors for ownership
Typography: Personal, possessive language
Micro-copy: "Your portfolio", "Your positions", "Your gains"
```

**Sunk Cost**
```
Principle: Users committed to invested time/money
Application: Gamification (badges, streaks)
Color: Gold for achievements, emerald for progress
Typography: Achievement-focused messaging
Micro-copy: "10-day streak!", "Level up", "Achievement unlocked"
```

### 3.2 Trading-Specific Psychology

#### Risk & Reward Psychology

**Margin Call Design**
```
Current Problem: Users panic, make poor decisions
Psychological Solution: Calm, solution-oriented design
Color: Gold warning (caution, not alarming)
Typography: Clear, instructional
Micro-copy: "Your margin is at 87%. Consider adding funds or closing positions."
Animation: Gentle pulse, not flashing
```

**Profit Visualization**
```
Current Problem: Users don't feel wins
Psychological Solution: Celebrate successes
Color: Emerald with gold accents
Typography: Bold, positive
Micro-copy: "Great job!", "You're up $245 today!"
Animation: Confetti, checkmarks, upward arrows
```

**Loss Display**
```
Current Problem: Users get discouraged
Psychological Solution: Educational, not punitive
Color: Crimson (acknowledge loss)
Typography: Calm, educational
Micro-copy: "Learn from this trade", "Every trader has losses"
Animation: Subtle, not jarring
```

#### Trust Building Through Design

**Security Perception**
```
Visual Elements:
- Lock icons (not overused)
- Shield badges (verified status)
- SSL indicators (subtle)
- Regulation mentions (prominent)

Color Psychology:
- Navy = stability, trust
- Gold = premium, exclusive
- Emerald = growth, safety

Typography:
- Serif = institutional trust
- Clean sans-serif = modern security

Micro-copy:
- "Bank-grade security"
- "Your funds are safe"
- "GDPR compliant"
```

**Expertise Signaling**
```
Visual Elements:
- Professional charts (TradingView)
- Clean data displays
- Expert testimonials
- Educational content

Color Psychology:
- Navy = professional, serious
- Gold = premium knowledge
- Neutral backgrounds = focus on content

Typography:
- Clear hierarchy = organized expertise
- Readable fonts = accessible knowledge
- Consistent styling = professional standards

Micro-copy:
- "Expert analysis"
- "Professional tools"
- "Learn from the best"
```

### 3.3 Micro-Interaction Psychology

#### Button Press Feedback
```
Psychology: Confirms action received (trust)
Trigger: User clicks button
Animation:
  1. Scale down 2% (0ms)
  2. Shadow increase (responsive tactile feel)
  3. Scale back (200ms ease-out)
  4. Result: Satisfying, game-like feedback

Implementation:
  @keyframes button-press {
    0% { transform: scale(0.98); box-shadow: 0 1px 2px; }
    100% { transform: scale(1); box-shadow: 0 4px 8px; }
  }
  animation: button-press 150ms ease-out;

Benefit: Makes interface feel responsive (+20% perceived speed)
```

#### Order Placement Success
```
Psychology: Peak-end rule (remember the high point)
Trigger: Order filled successfully
Sequence:
  1. Subtle gold flash on button (0ms)
  2. Checkmark animation (100ms)
  3. Success toast slides in from top (200ms)
  4. Card animates into positions table (300ms)
  5. Number counter animates from 0 to size (500ms)

Total Duration: 1.2 seconds (optimal for memory)

Benefit: Creates memorable positive moment (increases retention)
```

#### Loading State Confidence
```
Psychology: Reduces anxiety during wait times
Trigger: API call in progress
Visual Feedback:
  1. Skeleton loader (matches final layout exactly)
  2. Subtle pulse animation (not jarring)
  3. "Processing your order securely..." (reassurance copy)
  4. Real-time progress indicator (estimated 2 seconds)

Duration: Show spinner after 200ms delay (prevent flash)

Benefit: Users feel in control, reduce churn during wait
```

#### Profit/Loss Animation
```
Psychology: Makes gains visible, celebrates wins
Trigger: Real-time P&L update
Current Price Change:
  - Price increases: +2% scale briefly (drawing attention)
  - Color flash: Green tint (0.5s fade)
  - Number counter: Increments smoothly (visual satisfaction)
  
Profit Accumulation:
  - Equity metric grows with animation
  - Number counter from old → new value
  - Emerald highlight pulses (celebration)

Benefit: Gamification psychology (makes winning visible)
```

#### Margin Call Warning
```
Psychology: Urgency without panic
Trigger: Margin level < 100%
Visual Warning:
  1. Card border turns gold (caution, not alarming)
  2. Subtle pulse animation (recurring attention)
  3. Icon appears with animation
  4. Action button appears (solution-oriented)

Copy: "Your margin is at 87%. Consider closing positions or adding funds."
(Empowering, not panicking)

Duration: Persistent until resolved
Benefit: Prevents liquidation through early warning
```

---

## 4. Component Architecture

### 4.1 Component Design Principles

#### Premium Component Specifications

**Button Component (Enhanced)**
```
VARIANTS:
├── Primary (Navy base)
│   Default: Navy bg, white text
│   Hover:   Navy bg + gold glow, 2% scale
│   Active:  Navy bg darker, shadow inside
│   
├── Gold (Premium CTA)
│   Default: Gold bg, navy text
│   Hover:   Gold bg darker + glow, 2% scale
│   Active:  Gold bg darker, shadow inside
│   
├── Secondary (Outline)
│   Default: Transparent, navy border 1px
│   Hover:   Navy bg (5% opacity), navy border
│   Active:  Navy bg (10% opacity), navy border
│   
├── Danger (Sell/Warning)
│   Default: Red bg, white text
│   Hover:   Red darker, 2% scale
│   Active:  Red darker, shadow inside
│   
└── Ghost (Minimal)
    Default: Transparent, navy text
    Hover:   Navy bg (5% opacity)
    Active:  Navy bg (10% opacity)

SIZING:
├── Small:  32px height, 12px-16px padding
├── Medium: 40px height, 16px-24px padding (default)
├── Large:  48px height, 20px-32px padding
└── Icon:   40px square (perfect circle)

LOADING STATE:
├── Spinner: 1.25rem spinning inside button
├── Opacity: 70% while loading
├── Text:    "Loading..." or just spinner
├── Disabled: Yes (prevent double-click)

FOCUS STATE:
├── Ring: 3px solid focus-color
├── Offset: 2px
├── Animation: Pulse if needed (optional)

MICRO-INTERACTION:
@keyframes button-hover {
  0% { transform: translateY(0) }
  100% { transform: translateY(-2px); box-shadow: 0 8px 16px... }
}

animation: button-hover 200ms ease-out;
```

**Card Component (Premium Elevation)**
```
CARD HIERARCHY:
├── Level 1 (Content)
│   Shadow: --shadow-sm
│   Border-radius: 8px
│   Padding: 16px-24px
│   Background: card color
│   Use: Secondary info
│   
├── Level 2 (Primary)
│   Shadow: --shadow-md
│   Border-radius: 8px
│   Padding: 20px-24px
│   Background: card color
│   Use: Main content
│   
├── Level 3 (Featured)
│   Shadow: --shadow-lg
│   Border-radius: 8px
│   Padding: 24px
│   Background: card color + gradient overlay
│   Border: Gold accent (1px)
│   Use: Featured content
│   
└── Level 4 (Premium)
    Shadow: --shadow-xl + --shadow-gold
    Border-radius: 8px
    Padding: 24px-32px
    Background: card color + premium gradient
    Border: Gold (2px)
    Badge: "Premium" or icon

HOVER EFFECTS:
- Lift: Box-shadow upgrades (+1 level)
- Scale: 1.02x scale on hover
- Duration: 300ms ease-out
- Cursor: pointer

INTERACTIVE CARDS:
├── Positions Card
│   Layout: Grid (symbol | side | qty | entry | current | P&L)
│   Highlight: P&L column (green/red)
│   Border-left: 4px (buy=green, sell=red)
│   
├── Metrics Card
│   Layout: Single metric centered
│   Title: Serif font (Playfair Display)
│   Value: Largest text, navy or gold
│   Change: Sparkline or % with arrow
│   
└── Trading Card
    Layout: Input fields + Button
    Background: Slight tint (buy=green tint, sell=red)
    Border: 1px gold on focus
```

**Form Components (Enhanced Validation)**
```
INPUT FIELD:
├── Default State
│   Background: input color (light gray)
│   Border: 1px gray
│   Padding: 10px 12px
│   Border-radius: 6px
│   
├── Focus State
│   Border: 2px navy or gold
│   Box-shadow: 0 0 0 4px focus-color/10
│   Outline: None
│   
├── Valid State ✓
│   Border: 2px green
│   Icon: Checkmark (green)
│   Message: "Perfect! ✓"
│   
├── Invalid State ✗
│   Border: 2px red
│   Icon: X mark (red)
│   Message: "Email already taken"
│   
└── Loading State ⟳
    Border: 1px gold
    Icon: Spinner (gold)
    Message: "Checking availability..."

LABEL + INPUT:
├── Label
│   Font: Manrope, 12px-14px, 600 weight
│   Color: Navy (primary-contrast)
│   Margin-bottom: 6px
│   
└── Required Indicator
    Text: "*" in gold
    Margin-left: 2px

HELPER TEXT:
├── Below field
├── Font: 12px, muted
├── Color: secondary-contrast
├── Margin-top: 4px

ERROR MESSAGE:
├── Below field
├── Font: 12px bold, danger-contrast
├── Icon: Warning icon (red)
├── Animation: Shake + fade-in
```

**Modal/Dialog (Premium)**
```
MODAL STRUCTURE:
├── Backdrop
│   Color: rgba(0,0,0,0.5)
│   Animation: Fade-in 200ms
│   Click: Close modal (escape key too)
│   
├── Dialog Box
│   Background: Card color
│   Border-radius: 12px
│   Shadow: --shadow-xl
│   Max-width: 500px (desktop), 100% - 32px (mobile)
│   Position: Center screen
│   Animation: Scale-in + fade-in 300ms
│   
├── Header
│   Title: Serif (Playfair), navy, large
│   Close button: Top-right, minimal style
│   Divider: Subtle border-bottom
│   Padding: 24px
│   
├── Content
│   Scrollable if needed (max-height: 60vh)
│   Padding: 24px
│   Font: Regular Manrope
│   
└── Footer
    Actions: Buttons (right-aligned)
    Primary: Gold CTA
    Secondary: Navy outline
    Padding: 24px
    Border-top: Subtle

MODAL VARIANTS:
├── Confirmation: "Are you sure?"
├── Form: Input fields in modal
├── Alert: Info/warning/error message
├── Document viewer: Image/PDF preview
└── Settings: Toggles + sliders
```

**Badge/Status Component (New)**
```
STATUS BADGES:
├── Verified
│   Background: Gold (#D4AF37)
│   Foreground: Navy
│   Icon: Checkmark
│   Text: "Verified"
│   Border-radius: 20px
│   Padding: 6px 12px
│   Font: 12px semibold
│   
├── Active
│   Background: Green
│   Foreground: White
│   Icon: Dot (animated pulse)
│   Text: "Active" or just icon
│   
├── Warning
│   Background: Orange/amber
│   Foreground: Navy
│   Icon: Alert triangle
│   Text: "Warning"
│   
├── Error
│   Background: Red
│   Foreground: White
│   Icon: X or alert
│   Text: "Error"
│   
├── Neutral
│   Background: Gray
│   Foreground: Navy
│   Icon: None
│   Text: "Pending"
│   
└── Premium
    Background: Gold with glow
    Foreground: Navy
    Icon: Star or crown
    Text: "Verified Trader"
    Glow: Gold shadow

POSITIONING:
- Top-left: Status corner
- Top-right: Premium/featured
- Inline: Mid-sentence badges
- Stacked: Multiple badges separated by 4px
```

### 4.2 Component State Management

#### State Variants Matrix

**Button States (6 required)**:
```
Default → Hover → Active → Disabled → Loading → Focus
```

**Card States (4 required)**:
```
Default → Hover → Active → Disabled
```

**Form States (6 required)**:
```
Default → Focus → Valid → Invalid → Loading → Disabled
```

**Modal States (3 required)**:
```
Hidden → Visible → Animating
```

#### Component Props Interface Standards

```typescript
// ✅ Good: Consistent interface naming and structure
interface ButtonProps {
  // Content
  children: React.ReactNode;
  label?: string;
  
  // Behavior
  onClick?: () => void;
  disabled?: boolean;
  
  // Styling
  variant?: 'primary' | 'gold' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  className?: string;
  
  // State
  isLoading?: boolean;
  isActive?: boolean;
  
  // ARIA
  ariaLabel?: string;
  ariaDescribedBy?: string;
  
  // HTML attributes
  id?: string;
  dataTestId?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  isActive = false,
  onClick,
  className,
  ariaLabel,
  ...htmlProps
}) => {
  // Implementation
};
```

### 4.3 Component Composition Patterns

#### Layout Components
```
Container → Wrapper → Section → Card → Content
```

#### Interactive Components
```
Form → Fieldset → Label + Input + HelpText + ErrorMessage
```

#### Navigation Components
```
Nav → NavItem → NavLink + Submenu (optional)
```

#### Data Display Components
```
Table → TableRow → TableCell + TableHeader
```

#### Modal Components
```
Modal → ModalOverlay → ModalContent → ModalHeader/Body/Footer
```

### 4.4 Component Accessibility Standards

#### ARIA Roles & Properties
```typescript
// ✅ Good: Proper ARIA implementation
interface ButtonProps {
  role?: 'button' | 'link';
  ariaLabel?: string;
  ariaPressed?: boolean;
  ariaDisabled?: boolean;
  ariaExpanded?: boolean;
  ariaHaspopup?: boolean | 'dialog' | 'menu' | 'listbox' | 'tree' | 'grid';
}

// ✅ Good: Keyboard navigation
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    onClick?.();
  }
};
```

#### Focus Management
```typescript
// ✅ Good: Focus trap for modals
useEffect(() => {
  if (!isOpen) return;
  
  const focusableElements = modalRef.current?.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements?.[0] as HTMLElement;
  const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  firstElement?.focus();
  
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [isOpen]);
```

#### Screen Reader Support
```typescript
// ✅ Good: Screen reader announcements
const { toast } = useToast();

const handleSuccess = () => {
  toast({
    title: "Success",
    description: "Order placed successfully",
    ariaLive: "polite", // For screen readers
  });
};
```

---

## 5. Code Standards

### 5.1 TypeScript Standards

#### Type Configuration
```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true,
    "allowJs": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### Type Guidelines
```typescript
// ✅ Good: Use unknown then narrow
const parseData = (data: unknown): User => {
  if (typeof data === 'object' && data !== null && 'id' in data) {
    return data as User;
  }
  throw new Error('Invalid user data');
};

// ✅ Good: Import types from Supabase
import type { Database } from '@/integrations/supabase/types';
type User = Database['public']['Tables']['users']['Row'];

// ✅ Good: Path aliases
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

// ✅ Good: Type assertions (when necessary)
function isUser(data: unknown): data is User {
  return typeof data === 'object' && data !== null && 'id' in data;
}
```

### 5.2 React Component Conventions

#### Functional Components Only
```typescript
// ✅ Good: Functional component
export const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  return <div>Dashboard</div>;
};

// ❌ Bad: Class component
export class Dashboard extends React.Component {
  // ...
}
```

#### Component Structure Template
```typescript
import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import type { Order } from '@/types';

interface TradeFormProps {
  symbol: string;
  onSubmit: (order: Order) => Promise<void>;
  isDisabled?: boolean;
}

/**
 * TradeForm - Manages order creation and submission
 * 
 * @param symbol - The trading symbol (e.g., 'EURUSD')
 * @param onSubmit - Callback when order is submitted
 * @param isDisabled - Whether the form should be disabled
 */
export const TradeForm: React.FC<TradeFormProps> = ({ 
  symbol, 
  onSubmit, 
  isDisabled = false 
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (data: OrderInput) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [onSubmit]);

  if (!user) {
    return <div>Please log in first</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form content */}
    </form>
  );
};
```

#### Component Size & Modularity
- **Max 300 lines per component**: Refactor larger components into smaller, reusable pieces
- **Single responsibility**: Each component should have one clear purpose
- **Extract reusable logic**: Move business logic into custom hooks

#### Props Destructuring
```typescript
// ✅ Good: Destructured with types
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const CustomButton: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'primary' 
}) => {
  // ...
};

// ❌ Bad: Not destructured
export const CustomButton: React.FC<any> = (props) => {
  // ...
};
```

#### JSDoc Comments
```typescript
/**
 * OrderBook - Displays real-time order book for a symbol
 * 
 * Subscribes to Supabase Realtime for live updates.
 * 
 * @component
 * @example
 * return <OrderBook symbol="EURUSD" />
 * 
 * @param symbol - Trading symbol to display orders for
 * @returns React component showing bid/ask orders
 */
export const OrderBook: React.FC<{ symbol: string }> = ({ symbol }) => {
  // ...
};
```

#### Memoization Guidelines
```typescript
// ✅ Use only if Profiler shows repeated calculations
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

// ✅ Use only if dependencies are complex
const handleClick = useCallback(() => {
  processOrder(orderId, symbol);
}, [orderId, symbol]);

// ❌ Don't use without justification
const name = useMemo(() => user.name, [user.name]);
```

### 5.3 File Organization

#### Project Structure
```
src/
├── components/
│   ├── ui/                          # shadcn-ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── auth/                        # Feature components
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── __tests__/
│   │       └── LoginForm.test.tsx
│   ├── trading/
│   │   ├── TradeForm.tsx
│   │   ├── OrderBook.tsx
│   │   └── __tests__/
│   ├── kyc/
│   └── ...
├── contexts/
│   ├── notificationContext.tsx
│   └── errorContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── usePriceStream.ts
│   ├── use-toast.ts
│   └── __tests__/
│       └── useAuth.test.ts
├── pages/
│   ├── Trade.tsx
│   ├── Dashboard.tsx
│   ├── Admin.tsx
│   └── __tests__/
├── lib/
│   ├── trading/
│   │   ├── orderMatching.ts
│   │   ├── marginCalculations.ts
│   │   ├── commissionCalculation.ts
│   │   ├── liquidationEngine.ts
│   │   ├── pnlCalculation.ts
│   │   ├── slippageCalculation.ts
│   │   └── __tests__/
│   ├── kyc/
│   │   ├── kycService.ts
│   │   ├── documentValidation.ts
│   │   └── __tests__/
│   ├── export/
│   │   ├── csvExport.ts
│   │   ├── pdfExport.ts
│   │   └── __tests__/
│   ├── logger.ts
│   ├── utils.ts
│   └── supabaseClient.ts
├── integrations/
│   └── supabase/
│       ├── client.ts
│       └── types.ts                 # Auto-generated
├── types/
│   ├── orders.ts
│   ├── positions.ts
│   ├── users.ts
│   └── index.ts
├── assets/
│   ├── icons/
│   ├── images/
│   └── flags/
├── App.tsx
├── main.tsx
├── index.css
└── vite-env.d.ts
```

#### Feature-Based Organization
```
components/trading/
├── TradeForm.tsx
├── OrderBook.tsx
├── PositionList.tsx
├── ChartWidget.tsx
├── __tests__/
│   ├── TradeForm.test.tsx
│   └── OrderBook.test.tsx
└── index.ts               # Optional: re-export exports
```

#### Tests Co-location
```
hooks/
├── useAuth.ts
├── usePriceStream.ts
└── __tests__/
    ├── useAuth.test.ts
    └── usePriceStream.test.ts
```

### 5.4 Naming Conventions

#### Components (PascalCase)
```typescript
// ✅ Good
export const TradeForm: React.FC = () => { };         // File: TradeForm.tsx
export const OrderBook: React.FC = () => { };         // File: OrderBook.tsx
export const PositionList: React.FC = () => { };      // File: PositionList.tsx

// ❌ Bad
export const tradeForm: React.FC = () => { };         // File: tradeForm.tsx
export const trade_form: React.FC = () => { };        // File: trade_form.tsx
```

#### Hooks (camelCase with use prefix)
```typescript
// ✅ Good: Hooks use `use` prefix
export const useAuth = () => { };                     // File: useAuth.ts
export const usePriceStream = (symbols) => { };       // File: usePriceStream.ts
export const useRealtimePositions = (userId) => { };  // File: useRealtimePositions.ts

// ❌ Bad
export const auth = () => { };                        // Missing 'use' prefix
export const getPriceStream = () => { };              // Should use 'use' prefix
```

#### Utilities (camelCase)
```typescript
// ✅ Good
export const orderMatching = (orders) => { };         // File: orderMatching.ts
export const calculateMargin = (leverage, equity) => { };
export const validateKycDocument = (doc) => { };      // File: documentValidation.ts
export const exportPortfolioToCSV = (positions) => { };

// ❌ Bad
export const OrderMatching = () => { };               // Should be camelCase
export const calculate_margin = () => { };            // Snake_case
```

#### Constants (UPPER_SNAKE_CASE)
```typescript
// ✅ Good
const MAX_LEVERAGE = 50;
const MIN_ORDER_SIZE = 0.01;
const COMMISSION_RATE = 0.0002;
const KYC_VERIFICATION_TIMEOUT = 86400000; // ms
const API_BASE_URL = 'https://api.example.com';

// ❌ Bad
const maxLeverage = 50;           // Use UPPER_SNAKE_CASE
const max-leverage = 50;          // Invalid syntax
```

#### Types & Interfaces (PascalCase)
```typescript
// ✅ Good
interface User { }
interface Order { }
type OrderStatus = 'pending' | 'filled' | 'cancelled';
type PriceUpdate = { symbol: string; price: number };

// ❌ Bad
interface user { }
type order_status = 'pending' | 'filled';
```

#### Event Handlers (handle prefix)
```typescript
// ✅ Good
const handleSubmit = (e: React.FormEvent) => { };
const handleClick = () => { };
const handlePriceUpdate = (price: number) => { };
const handleError = (error: Error) => { };

// ❌ Bad
const submit = () => { };
const onClick = () => { };
const onPriceUpdate = (price: number) => { };
```
    throw new Error('Invalid user data');
  };
  ```

- **Avoid `any` when possible**: ESLint warns on `@typescript-eslint/no-explicit-any` but doesn't block it. Prefer `unknown` or proper types.

- **Import types from Supabase**: Never manually create database types—import auto-generated types:
  ```typescript
  import type { Database } from '@/integrations/supabase/types';
  
  type User = Database['public']['Tables']['users']['Row'];
  ```

- **Path Aliases**: Always use `@/` prefix (configured in `tsconfig.json`):
  ```typescript
  import { Button } from '@/components/ui/button';
  import { useAuth } from '@/hooks/useAuth';
  import { supabase } from '@/integrations/supabase/client';
  ```

### Type Assertions

Minimize type assertions. When necessary, be explicit:

```typescript
// ✅ Good: Explicit and narrow
const user = data as { id: string; name: string };

// ❌ Bad: Too broad
const user = data as any;

// ✅ Better: Use type guard
function isUser(data: unknown): data is User {
  return typeof data === 'object' && data !== null && 'id' in data;
}
```

---

## React Component Conventions

### Functional Components Only

**No class components.** All components must be functional components with hooks.

```typescript
// ✅ Good: Functional component
export const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  return <div>Dashboard</div>;
};

// ❌ Bad: Class component
export class Dashboard extends React.Component {
  // ...
}
```

### Component Structure

```typescript
import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import type { Order } from '@/types';

interface TradeFormProps {
  symbol: string;
  onSubmit: (order: Order) => Promise<void>;
  isDisabled?: boolean;
}

/**
 * TradeForm - Manages order creation and submission
 * 
 * @param symbol - The trading symbol (e.g., 'EURUSD')
 * @param onSubmit - Callback when order is submitted
 * @param isDisabled - Whether the form should be disabled
 */
export const TradeForm: React.FC<TradeFormProps> = ({ 
  symbol, 
  onSubmit, 
  isDisabled = false 
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (data: OrderInput) => {
    setIsLoading(true);
    setError(null);
    try {
      await onSubmit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [onSubmit]);

  if (!user) {
    return <div>Please log in first</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

### Component Size & Modularity

- **Max 300 lines per component**: Refactor larger components into smaller, reusable pieces
- **Single responsibility**: Each component should have one clear purpose
- **Extract reusable logic**: Move business logic into custom hooks

### Props Destructuring

Always destructure props with TypeScript types:

```typescript
// ✅ Good: Destructured with types
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const CustomButton: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'primary' 
}) => {
  // ...
};

// ❌ Bad: Not destructured
export const CustomButton: React.FC<any> = (props) => {
  // ...
};
```

### JSDoc Comments

Document components with JSDoc:

```typescript
/**
 * OrderBook - Displays real-time order book for a symbol
 * 
 * Subscribes to Supabase Realtime for live updates.
 * 
 * @component
 * @example
 * return <OrderBook symbol="EURUSD" />
 * 
 * @param symbol - Trading symbol to display orders for
 * @returns React component showing bid/ask orders
 */
export const OrderBook: React.FC<{ symbol: string }> = ({ symbol }) => {
  // ...
};
```

### Memoization

Use `useMemo` and `useCallback` only when proving performance issues with React Profiler:

```typescript
// ✅ Use only if Profiler shows repeated calculations
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

// ✅ Use only if dependencies are complex
const handleClick = useCallback(() => {
  processOrder(orderId, symbol);
}, [orderId, symbol]);

// ❌ Don't use without justification
const name = useMemo(() => user.name, [user.name]);
```

---

## Component API Consistency

### Props Interface Patterns

All components must follow a consistent props pattern for API predictability:

```typescript
// ✅ Good: Consistent interface naming and structure
interface ButtonProps {
  // Content
  children: React.ReactNode;
  label?: string;
  
  // Behavior
  onClick?: () => void;
  disabled?: boolean;
  
  // Styling
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  
  // State
  isLoading?: boolean;
  isDanger?: boolean;
  
  // ARIA
  ariaLabel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  ...props
}) => {
  // Implementation
};
```

### Props Organization Order

Follow this consistent order in every interface:

1. **Content props** (`children`, `label`, `title`, `description`)
2. **Event handlers** (`onClick`, `onChange`, `onSubmit`)
3. **Behavior props** (`disabled`, `readOnly`, `required`)
4. **Styling props** (`variant`, `size`, `className`)
5. **State props** (`isLoading`, `isActive`, `isDanger`)
6. **ARIA/accessibility** (`ariaLabel`, `ariaDescribedBy`)
7. **HTML attributes** (`id`, `data-*`, `ref`)

```typescript
// ✅ Good: Logical grouping
interface InputProps {
  // Content
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  
  // Events
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  
  // Behavior
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  
  // Styling
  variant?: 'default' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  
  // State
  isLoading?: boolean;
  error?: string;
  
  // Accessibility
  ariaLabel?: string;
  ariaErrorMessage?: string;
}
```

### Default Props

Always provide sensible defaults:

```typescript
// ✅ Good: Explicit defaults
interface CardProps {
  variant?: 'default' | 'elevated' | 'outline';
  padding?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',     // Explicit default
  padding = 'md',          // Explicit default
  children,
  className,
}) => {
  // Implementation
};

// ❌ Bad: No defaults, callers must specify everything
interface CardProps {
  variant: 'default' | 'elevated' | 'outline';
  padding: 'sm' | 'md' | 'lg';
}
```

### Optional vs Required Props

Use a consistent pattern for optional props:

```typescript
// ✅ Good: Optional props clearly marked with ?
interface ModalProps {
  isOpen: boolean;                    // Required, controls visibility
  onClose: () => void;                // Required, essential callback
  title: string;                      // Required, main content
  
  subtitle?: string;                  // Optional enhancement
  footer?: React.ReactNode;           // Optional, use rarely
  onConfirm?: () => void;             // Optional callback
  confirmText?: string;               // Optional label
}

// Rule: Only mark as required if absolutely needed for core functionality
```

### Event Handler Naming

Use consistent naming for event handlers:

```typescript
// ✅ Good: on* prefix for callbacks
interface FormProps {
  onSubmit: (data: FormData) => Promise<void>;
  onCancel?: () => void;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

interface SelectProps {
  onChange: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

// ❌ Bad: Inconsistent naming
interface FormProps {
  submit: (data: FormData) => void;      // Missing 'on'
  handleCancel?: () => void;             // Use 'on', not 'handle'
  onFormError?: (error: Error) => void;  // Too specific
}
```

### State Props Naming

Use consistent boolean prop naming:

```typescript
// ✅ Good: Consistent state naming
interface ButtonProps {
  isDisabled?: boolean;        // ✅ Use 'is' prefix
  isLoading?: boolean;         // ✅ Consistent
  isDanger?: boolean;          // ✅ Consistent
  isActive?: boolean;          // ✅ Consistent
}

interface InputProps {
  isRequired?: boolean;        // ✅ Use 'is' prefix
  isReadOnly?: boolean;        // ✅ Consistent
  isError?: boolean;           // ✅ Consistent
}

// ❌ Bad: Inconsistent naming
interface ButtonProps {
  disabled?: boolean;          // ❌ Missing 'is' prefix
  loading?: boolean;           // ❌ Should be 'isLoading'
  isDanger?: boolean;          // ✅ But conflicts with above
  active?: boolean;            // ❌ Should be 'isActive'
}
```

### Styling Props Consistency

All styling props should follow a standard pattern:

```typescript
// ✅ Good: Consistent styling props across all components
interface BaseComponentProps {
  variant?: 'default' | 'primary' | 'secondary';  // Predefined variants only
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';        // Consistent sizes
  className?: string;                              // For overrides only
}

// ✅ Size standard (use consistently everywhere)
const SIZES = {
  xs: 'h-6 w-6',      // 24px - very small
  sm: 'h-8 w-8',      // 32px - small
  md: 'h-10 w-10',    // 40px - medium (default)
  lg: 'h-12 w-12',    // 48px - large
  xl: 'h-16 w-16',    // 64px - extra large
};

// ✅ Variant standard (use consistently)
interface VariantConfig {
  primary: string;    // Primary action color
  secondary: string;  // Secondary action color
  ghost: string;      // Minimal style
  outline: string;    // Border style
  danger: string;     // Destructive action
}

// ❌ Bad: Each component has different variants
// Button: 'primary', 'secondary', 'outline'
// Card: 'flat', 'elevated', 'outlined'
// Input: 'default', 'error', 'success'
// ^ Inconsistent naming makes API unpredictable
```

### Return Type Consistency

All hooks and functions should have consistent return types:

```typescript
// ✅ Good: Consistent hook return shape
export const useForm = <T>(schema: ZodSchema) => {
  return {
    data: formData,
    errors: validationErrors,
    isValid: boolean,
    isSubmitting: boolean,
    register: (name: string) => ({ ... }),
    handleSubmit: (onSubmit: Callback) => void,
    reset: () => void,
  };
};

export const useAuth = () => {
  return {
    user: currentUser,
    isLoading: boolean,
    error: errorMessage,
    logout: () => Promise<void>,
    login: (creds) => Promise<void>,
  };
};

// ✅ Consistent pattern: data, isLoading, error, callbacks

// ❌ Bad: Inconsistent return shapes
export const useForm = () => {
  return [formData, submit];                    // Array, hard to remember order
};

export const useAuth = () => {
  return { currentUser, isAuth, handleLogout }; // Different prop names
};
```

### Component Composition Props

When components accept other components as props, use consistent naming:

```typescript
// ✅ Good: Descriptive component prop names
interface PageProps {
  header?: React.ComponentType<HeaderProps>;
  footer?: React.ComponentType<FooterProps>;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
}

interface LayoutProps {
  topBar?: React.ComponentType;
  leftPanel?: React.ComponentType;
  mainContent: React.ReactNode;
  rightPanel?: React.ReactNode;
}

// ❌ Bad: Generic component prop names
interface PageProps {
  component1?: React.ComponentType;    // Unclear purpose
  element2?: React.ReactNode;          // Vague naming
  comp3?: React.ComponentType;         // Non-descriptive
}
```

### Error Message Props

Consistent error handling across all components:

```typescript
// ✅ Good: Standard error props
interface FormFieldProps {
  error?: string;              // Error message
  errorDescription?: string;   // Additional context
  ariaErrorMessage?: string;   // Accessibility
  onErrorClear?: () => void;   // Clear error callback
}

interface InputProps {
  error?: string;              // Error message
  isError?: boolean;           // Error state (optional visual indicator)
}

// All components use 'error' for string message, consistent pattern
```

### Documentation Template

Every component should include JSDoc with consistent format:

```typescript
/**
 * Button - Interactive clickable element
 * 
 * Supports multiple variants and sizes. Can show loading state.
 * All styling options are predefined for consistency.
 * 
 * @component
 * @example
 * return (
 *   <Button variant="primary" size="md" onClick={handleClick}>
 *     Click Me
 *   </Button>
 * )
 * 
 * @param {ButtonProps} props - Component props
 * @param {React.ReactNode} props.children - Button text or content
 * @param {'primary'|'secondary'|'ghost'} [props.variant='primary'] - Visual style
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [props.size='md'] - Button size
 * @param {boolean} [props.isDisabled=false] - Disable interaction
 * @param {boolean} [props.isLoading=false] - Show loading indicator
 * @param {() => void} [props.onClick] - Click handler
 * @param {string} [props.className] - Additional CSS classes
 * 
 * @returns {React.ReactElement} Button element
 */
export const Button: React.FC<ButtonProps> = ({ ... }) => { };
```

### Prop Validation Checklist

Before finalizing any component API:

- [ ] Props interface clearly named with `Props` suffix
- [ ] Props grouped logically (content, events, behavior, styling, state, aria)
- [ ] All optional props marked with `?`
- [ ] Sensible defaults provided for optional props
- [ ] Event handlers use `on*` prefix
- [ ] Boolean state props use `is*` prefix
- [ ] Styling uses predefined `variant` and `size` enums only
- [ ] `className` reserved for component overrides only
- [ ] Return types consistent with similar components/hooks
- [ ] JSDoc with examples included
- [ ] Error props follow standard pattern

---

## File Organization

### Project Structure

```
src/
├── components/
│   ├── ui/                          # shadcn-ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── auth/                        # Feature components
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── __tests__/
│   │       └── LoginForm.test.tsx
│   ├── trading/
│   │   ├── TradeForm.tsx
│   │   ├── OrderBook.tsx
│   │   └── __tests__/
│   ├── kyc/
│   └── ...
├── contexts/
│   ├── notificationContext.tsx
│   └── errorContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── usePriceStream.ts
│   ├── use-toast.ts
│   └── __tests__/
│       └── useAuth.test.ts
├── pages/
│   ├── Trade.tsx
│   ├── Dashboard.tsx
│   ├── Admin.tsx
│   └── __tests__/
├── lib/
│   ├── trading/
│   │   ├── orderMatching.ts
│   │   ├── marginCalculations.ts
│   │   ├── commissionCalculation.ts
│   │   ├── liquidationEngine.ts
│   │   ├── pnlCalculation.ts
│   │   ├── slippageCalculation.ts
│   │   └── __tests__/
│   ├── kyc/
│   │   ├── kycService.ts
│   │   ├── documentValidation.ts
│   │   └── __tests__/
│   ├── export/
│   │   ├── csvExport.ts
│   │   ├── pdfExport.ts
│   │   └── __tests__/
│   ├── logger.ts
│   ├── utils.ts
│   └── supabaseClient.ts
├── integrations/
│   └── supabase/
│       ├── client.ts
│       └── types.ts                 # Auto-generated
├── types/
│   ├── orders.ts
│   ├── positions.ts
│   ├── users.ts
│   └── index.ts
├── assets/
│   ├── icons/
│   ├── images/
│   └── flags/
├── App.tsx
├── main.tsx
├── index.css
└── vite-env.d.ts
```

### Feature-Based Organization

Group related components in subdirectories by feature:

```
components/trading/
├── TradeForm.tsx
├── OrderBook.tsx
├── PositionList.tsx
├── ChartWidget.tsx
├── __tests__/
│   ├── TradeForm.test.tsx
│   └── OrderBook.test.tsx
└── index.ts               # Optional: re-export exports
```

### Tests Co-location

Place tests in `__tests__/` directory within the same folder as source:

```
hooks/
├── useAuth.ts
├── usePriceStream.ts
└── __tests__/
    ├── useAuth.test.ts
    └── usePriceStream.test.ts
```

### Index Files (Optional)

Use `index.ts` to re-export related exports if the module is complex:

```typescript
// components/trading/index.ts
export { TradeForm } from './TradeForm';
export { OrderBook } from './OrderBook';
export { PositionList } from './PositionList';
```

---

## Naming Conventions

### Components

Use **PascalCase** for component file names and exports:

```typescript
// ✅ Good
export const TradeForm: React.FC = () => { };         // File: TradeForm.tsx
export const OrderBook: React.FC = () => { };         // File: OrderBook.tsx
export const PositionList: React.FC = () => { };      // File: PositionList.tsx

// ❌ Bad
export const tradeForm: React.FC = () => { };         // File: tradeForm.tsx
export const trade_form: React.FC = () => { };        // File: trade_form.tsx
```

### Hooks

Use **camelCase** with `use` prefix for custom hooks:

```typescript
// ✅ Good: Hooks use `use` prefix
export const useAuth = () => { };                     // File: useAuth.ts
export const usePriceStream = (symbols) => { };       // File: usePriceStream.ts
export const useRealtimePositions = (userId) => { };  // File: useRealtimePositions.ts

// ❌ Bad
export const auth = () => { };                        // Missing 'use' prefix
export const getPriceStream = () => { };              // Should use 'use' prefix
```

### Utility Functions & Services

Use **camelCase** for utility functions and services:

```typescript
// ✅ Good
export const orderMatching = (orders) => { };         // File: orderMatching.ts
export const calculateMargin = (leverage, equity) => { };
export const validateKycDocument = (doc) => { };      // File: documentValidation.ts
export const exportPortfolioToCSV = (positions) => { };

// ❌ Bad
export const OrderMatching = () => { };               // Should be camelCase
export const calculate_margin = () => { };            // Snake_case
```

### Constants

Use **UPPER_SNAKE_CASE** for constants:

```typescript
// ✅ Good
const MAX_LEVERAGE = 50;
const MIN_ORDER_SIZE = 0.01;
const COMMISSION_RATE = 0.0002;
const KYC_VERIFICATION_TIMEOUT = 86400000; // ms
const API_BASE_URL = 'https://api.example.com';

// ❌ Bad
const maxLeverage = 50;           // Use UPPER_SNAKE_CASE
const max-leverage = 50;          // Invalid syntax
```

### Types & Interfaces

Use **PascalCase** for types and interfaces:

```typescript
// ✅ Good
interface User { }
interface Order { }
type OrderStatus = 'pending' | 'filled' | 'cancelled';
type PriceUpdate = { symbol: string; price: number };

// ❌ Bad
interface user { }
type order_status = 'pending' | 'filled';
```

### Event Handlers

Prefix event handlers with `handle`:

```typescript
// ✅ Good
const handleSubmit = (e: React.FormEvent) => { };
const handleClick = () => { };
const handlePriceUpdate = (price: number) => { };
const handleError = (error: Error) => { };

// ❌ Bad
const submit = () => { };
const onClick = () => { };
const onPriceUpdate = (price: number) => { };
```

---

## Tailwind CSS & Styling

### Configuration

Tailwind is configured in `tailwind.config.ts` with custom colors, spacing, and utilities:

```typescript
// tailwind.config.ts
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "hsl(var(--primary))",
        buy: "hsl(var(--buy))",
        sell: "hsl(var(--sell))",
        profit: "hsl(var(--profit))",
        loss: "hsl(var(--loss))",
      },
      spacing: {
        xs: '4px',    // Minimal gaps
        sm: '8px',    // Component gaps
        md: '16px',   // Section gaps
        lg: '24px',   // Major sections
        xl: '32px',   // Page padding
      },
    },
  },
};
```

### Color System

All colors are **CSS variables** defined in `index.css`:

```typescript
// ✅ Good: Use CSS variables
<button className="bg-primary text-primary-foreground" />
<div className="text-buy" />                           // Buy price green
<div className="bg-sell" />                            // Sell price red

// ❌ Bad: Hardcoded colors
<button className="bg-blue-500" />
<div style={{ color: '#22c55e' }} />
```

### Utility-First Approach

Use Tailwind utilities directly in `className` attributes:

```typescript
// ✅ Good: Utility-first
<div className="flex gap-4 p-6 rounded-lg bg-card border border-border">
  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90">
    Submit
  </button>
</div>

// ❌ Bad: CSS-in-JS or inline styles
<div style={{ display: 'flex', gap: '16px', padding: '24px' }}>
  <button style={{ backgroundColor: '#primary' }}>Submit</button>
</div>
```

### `cn()` Utility for Dynamic Classes

Import and use `cn()` (from `clsx`) for dynamic class combinations:

```typescript
import { cn } from '@/lib/utils';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  isActive?: boolean;
}

export const CustomButton: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  isActive = false 
}) => (
  <button 
    className={cn(
      'px-4 py-2 rounded-md transition-colors',
      variant === 'primary' 
        ? 'bg-primary text-primary-foreground' 
        : 'bg-secondary text-secondary-foreground',
      isActive && 'ring-2 ring-offset-2 ring-primary'
    )}
  >
    Click me
  </button>
);
```

### Responsive Design

Use Tailwind breakpoint prefixes for responsive layouts:

```typescript
// ✅ Good: Mobile-first responsive
<div className="
  grid grid-cols-1 gap-4
  sm:grid-cols-2
  md:grid-cols-3
  lg:grid-cols-4
  xl:grid-cols-5
  p-4 sm:p-6 md:p-8
">
  {items.map(item => <div key={item.id}>{item}</div>)}
</div>

// Breakpoints:
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1536px
```

### Border Radius

Use standardized border-radius scale only:

```typescript
// ✅ Good: Use only lg and md
<div className="rounded-lg" />      // 8px - cards, modals, containers
<button className="rounded-md" />  // 6px - buttons, inputs, badges

// ❌ Bad: Don't use rounded-xl, rounded-2xl, etc.
<div className="rounded-xl" />      // Not in design system
<div className="rounded-none" />    // Removed from system
```

### Icon Utilities

TradePro includes custom icon sizing utilities:

```typescript
// ✅ Good: Use icon utilities
<Icon className="icon-sm" />                    // 1rem
<MenuIcon className="icon-lg" />               // 1.5rem
<CheckIcon className="icon-xl" />              // 1.75rem

// Trading-specific utilities
<ArrowUpIcon className="text-buy" />           // Buy color (green)
<ArrowDownIcon className="text-sell" />        // Sell color (red)
<TrendingUpIcon className="trading-profit" />  // Profit green
<TrendingDownIcon className="trading-loss" />  // Loss red
```

### Dark Mode

Dark mode is already enabled via `darkMode: ["class"]`:

```typescript
// ✅ Good: Automatic dark mode support
<div className="
  bg-background text-foreground       // Auto switches in dark mode
  hover:bg-muted hover:text-muted-foreground
  dark:bg-slate-950
">
  Content
</div>

// Tailwind automatically handles light/dark:
// - Added 'dark' class to <html> element
// - CSS variables switch based on class presence
```

---

## Form Validation

### Schema-First Approach

Always define Zod schemas first, then infer TypeScript types:

```typescript
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// ✅ Good: Schema first
const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be 8+ characters'),
  rememberMe: z.boolean().optional(),
});

// Infer type from schema
type LoginInput = z.infer<typeof loginSchema>;

// Use in component
const LoginForm: React.FC = () => {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('email')} />
      {form.formState.errors.email && (
        <span className="text-destructive">
          {form.formState.errors.email.message}
        </span>
      )}
    </form>
  );
};
```

### Common Validations

```typescript
// Email validation
z.string().email('Invalid email address')

// Password strength
z.string()
  .min(8, 'Minimum 8 characters')
  .regex(/[A-Z]/, 'Must include uppercase')
  .regex(/[0-9]/, 'Must include numbers')

// Trading amounts
z.number().positive('Must be positive').max(1000000, 'Exceeds limit')

// Select fields
z.enum(['BUY', 'SELL'], { errorMap: () => ({ message: 'Invalid action' }) })

// Custom validation
z.string().refine(
  (val) => !isReservedSymbol(val),
  'This symbol is reserved'
)
```

### Form Field Patterns

Use the standard form component from shadcn-ui:

```typescript
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

export const TradeForm: React.FC = () => {
  const form = useForm<TradeInput>({
    resolver: zodResolver(tradeSchema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="symbol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Symbol</FormLabel>
              <Input {...field} placeholder="EURUSD" />
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  );
};
```

---

## Supabase Integration

### Client Import

**Always** use the correct import path:

```typescript
// ✅ Good
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

// ❌ Bad
import { supabase } from '@/lib/supabaseClient';        // Wrong path!
import type { Database } from '@supabase/supabase-js';  // Wrong import!
```

### Type Safety

Import auto-generated types from Supabase:

```typescript
import type { Database } from '@/integrations/supabase/types';

// Type a single table row
type User = Database['public']['Tables']['users']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];

// Type insertions
type UserInsert = Database['public']['Tables']['users']['Insert'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];

// Type updates
type UserUpdate = Database['public']['Tables']['users']['Update'];
```

### Querying Data

```typescript
// ✅ Good: Type-safe query
const { data: orders, error } = await supabase
  .from('orders')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });

if (error) {
  console.error('Failed to fetch orders:', error);
  return [];
}

// Use data safely
return orders ?? [];

// ❌ Bad: Unhandled error
const { data } = await supabase.from('orders').select('*');
console.log(data.map(order => order.id)); // Might crash if error!
```

### Realtime Subscriptions

**Critical**: Always unsubscribe in cleanup to prevent memory leaks:

```typescript
// ✅ Good: Proper cleanup
export const useRealtimePositions = (userId: string) => {
  const [positions, setPositions] = useState<Position[]>([]);

  useEffect(() => {
    const subscription = supabase
      .channel('positions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'positions', filter: `user_id=eq.${userId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPositions(prev => [...prev, payload.new as Position]);
          } else if (payload.eventType === 'UPDATE') {
            setPositions(prev =>
              prev.map(p => p.id === payload.new.id ? (payload.new as Position) : p)
            );
          } else if (payload.eventType === 'DELETE') {
            setPositions(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // ✅ CRITICAL: Unsubscribe on cleanup
    return () => subscription.unsubscribe();
  }, [userId]);

  return positions;
};

// ❌ Bad: No unsubscribe = memory leak
export const useRealtimePositions = (userId: string) => {
  const [positions, setPositions] = useState<Position[]>([]);

  supabase
    .channel('positions')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'positions' }, (payload) => {
      setPositions(prev => [...prev, payload.new as Position]);
    })
    .subscribe();  // ❌ Never unsubscribed!

  return positions;
};
```

### Realtime Type Safety

Use minimal type definitions for Realtime payloads to handle partial data:

```typescript
// ✅ Good: Optional fields for Realtime data
interface RealtimePosition {
  id?: string;
  symbol?: string;
  size?: number;
  entry_price?: number;
  updated_at?: string;
}

const handlePositionUpdate = (payload: any) => {
  const position: RealtimePosition = payload.new;
  if (position.id && position.symbol) {
    // Safe to use
  }
};
```

### Row-Level Security (RLS)

All Supabase tables use RLS policies to enforce user isolation. Queries auto-filter by authenticated user:

```sql
-- Example RLS policy (auto-enforced)
CREATE POLICY "Users can only see their own orders"
ON orders
FOR SELECT
USING (auth.uid() = user_id);
```

**Important**: Always verify RLS policies exist for new tables before pushing to production.

---

## Error Handling

### Error Boundaries

App-level error boundary in `src/components/ErrorBoundary.tsx`:

```typescript
// ✅ Good: Page wrapped with error boundary
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary>
  <TradePage />
</ErrorBoundary>

// Catches render errors and displays fallback UI
```

### Async Operations

Always wrap async operations in try-catch:

```typescript
// ✅ Good: Proper error handling
const handleSubmit = async (data: OrderInput) => {
  try {
    const order = await createOrder(data);
    toast({ title: 'Success', description: 'Order created' });
    return order;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast({ title: 'Error', description: message });
    logger.error('Order creation failed:', error);
    throw error;
  }
};

// ❌ Bad: Unhandled error
const handleSubmit = async (data: OrderInput) => {
  const order = await createOrder(data); // May throw!
  return order;
};
```

### Toast Notifications

Use `useToast()` for user-facing error messages:

```typescript
import { useToast } from '@/hooks/use-toast';

export const TradeForm: React.FC = () => {
  const { toast } = useToast();

  const handleError = (error: unknown) => {
    toast({
      title: 'Trade Failed',
      description: error instanceof Error ? error.message : 'Unknown error',
      variant: 'destructive',
    });
  };

  return (
    <button onClick={() => handleError(new Error('Insufficient margin'))}>
      Place Order
    </button>
  );
};
```

### Logging

Use `console.error()` or Sentry via `logger`:

```typescript
import { logger } from '@/lib/logger';

try {
  await risky
Operation();
} catch (error) {
  // Log to console (always)
  console.error('Operation failed:', error);
  
  // Log to Sentry (if configured)
  logger.error('Operation failed', { 
    error, 
    context: 'tradeForm',
    userId: user.id 
  });
}
```

---

## Testing Patterns

### Unit Tests

Use **Vitest** for unit testing:

```typescript
// src/lib/trading/__tests__/orderMatching.test.ts
import { describe, it, expect, vi } from 'vitest';
import { executeOrder } from '../orderMatching';
import type { Order } from '@/types';

describe('Order Matching', () => {
  it('should execute market order immediately', () => {
    const order: Order = {
      id: '1',
      symbol: 'EURUSD',
      type: 'market',
      size: 1.0,
      price: 1.0850,
    };

    const result = executeOrder(order);
    expect(result.status).toBe('filled');
    expect(result.executedPrice).toBe(1.0850);
  });

  it('should reject order exceeding max leverage', () => {
    const order: Order = {
      id: '2',
      symbol: 'EURUSD',
      type: 'limit',
      leverage: 100, // Exceeds MAX_LEVERAGE
      price: 1.0800,
    };

    expect(() => executeOrder(order)).toThrow('Leverage exceeds limit');
  });
});
```

### Mocking Supabase

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { vi as vitestVi } from 'vitest';
import * as supabase from '@/integrations/supabase/client';

describe('Auth Service', () => {
  beforeEach(() => {
    // Mock Supabase client
    vi.mock('@/integrations/supabase/client', () => ({
      supabase: {
        auth: {
          signInWithPassword: vi.fn(),
          signUp: vi.fn(),
        },
      },
    }));
  });

  it('should handle login failure', async () => {
    const mockSupabase = vi.mocked(supabase);
    mockSupabase.supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: new Error('Invalid credentials'),
    });

    // Test logic
  });
});
```

### React Component Tests

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TradeForm } from './TradeForm';

describe('TradeForm', () => {
  it('renders form fields', () => {
    render(<TradeForm symbol="EURUSD" onSubmit={vi.fn()} />);
    
    expect(screen.getByLabelText(/symbol/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
  });

  it('shows validation errors', async () => {
    const { user } = render(<TradeForm symbol="EURUSD" onSubmit={vi.fn()} />);
    
    await user.click(screen.getByText(/submit/i));
    expect(screen.getByText(/required/i)).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
npm run test                # Run tests once
npm run test:ui            # Interactive test UI
npm run test:watch        # Watch mode
```

---

## Performance Optimization

### Code Splitting

Vite automatically splits large dependencies. Configure manual chunks in `vite.config.ts`:

```typescript
// vite.config.ts - already configured
build: {
  rollupOptions: {
    output: {
      manualChunks: (id) => {
        if (id.includes('lightweight-charts')) return 'vendor-charts';
        if (id.includes('recharts')) return 'vendor-charts';
        if (id.includes('@supabase')) return 'vendor-supabase';
        if (id.includes('@radix-ui')) return 'vendor-ui';
        if (id.includes('react-hook-form')) return 'vendor-forms';
      },
    },
  },
}
```

**Bundle analysis**: Run `ANALYZE=true npm run build` to generate `dist/bundle-analysis.html`

### Lazy Loading Routes

All pages are lazy-loaded to reduce initial bundle size:

```typescript
// App.tsx
const Trade = lazy(() => import('@/pages/Trade'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Admin = lazy(() => import('@/pages/Admin'));

<Routes>
  <Route path="/trade" element={<Suspense><Trade /></Suspense>} />
  <Route path="/dashboard" element={<Suspense><Dashboard /></Suspense>} />
</Routes>
```

### Market Data Streaming

**For high-frequency price updates:**

1. **Selective Subscriptions** — Only subscribe to displayed symbols:
```typescript
// ✅ Good
const symbols = positions.map(p => p.symbol);
const subscription = usePriceStream(symbols);

// ❌ Bad: Subscribe to all symbols
const allSymbols = getAllAssets();
usePriceStream(allSymbols);
```

2. **Debounce State Updates** — Batch updates to prevent excessive re-renders:
```typescript
const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

channel.on('broadcast', { event: 'price_update' }, ({ payload }) => {
  if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
  updateTimeoutRef.current = setTimeout(() => {
    setPrices(prev => ({ ...prev, [payload.symbol]: payload.price }));
  }, 100);  // Batch every 100ms
});
```

3. **Memoized Price Cells** — Prevent individual rows from re-rendering:
```typescript
const PriceCell = React.memo(
  ({ price }: Props) => <span>{price}</span>,
  (prev, next) => prev.price === next.price
);
```

4. **Virtualized Lists** — For large order/position lists:
```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={positions.length}
  itemSize={40}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <PositionRow position={positions[index]} />
    </div>
  )}
</FixedSizeList>
```

### Memory Management

```typescript
// ✅ Always unsubscribe Realtime channels
useEffect(() => {
  const subscription = supabase.channel('positions').on(...).subscribe();
  return () => subscription.unsubscribe();  // CRITICAL
}, []);

// ✅ Clear timers
useEffect(() => {
  const timer = setTimeout(() => { }, 5000);
  return () => clearTimeout(timer);
}, []);

// ✅ Remove event listeners
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

---

## Common Pitfalls

### 1. Multiple React Instances

The Vite config deduplicates React. **Don't install React separately** in subdependencies.

```javascript
// vite.config.ts - already configured
resolve: {
  dedupe: ["react", "react-dom", "react/jsx-runtime"],
}
```

### 2. Stale Auth State

**Always use the `useAuth()` hook**; don't cache `user` outside React context:

```typescript
// ✅ Good: Fresh auth state
const { user } = useAuth();
if (!user) return <Login />;

// ❌ Bad: Stale state
const user = getUser();  // Cached, may be outdated
if (!user) return <Login />;
```

### 3. Missing RLS Policies

**All new tables require RLS policies.** Queries auto-filter by user:

```sql
-- ✅ Always add RLS policy
CREATE POLICY "Users see only their data"
ON my_table
FOR SELECT
USING (auth.uid() = user_id);
```

### 4. Unsubscribed Realtime

**Critical memory leak risk**: Always unsubscribe from channels:

```typescript
// ✅ Good
useEffect(() => {
  const sub = supabase.channel('positions').on(...).subscribe();
  return () => sub.unsubscribe();
}, []);

// ❌ Bad: Memory leak
supabase.channel('positions').on(...).subscribe();
```

### 5. Hardcoded Values

Use **environment variables or constants**:

```typescript
// ✅ Good
const API_URL = import.meta.env.VITE_SUPABASE_URL;
const MAX_LEVERAGE = 50;

// ❌ Bad
const url = 'https://hardcoded-url.com';
const maxLeverage = 50;
```

### 6. Prop Drilling

Extract to Context/hook if passing through 3+ levels:

```typescript
// ✅ Good: Use Context
const { user } = useAuth();
const { notifications } = useNotifications();

// ❌ Bad: Drilling through 5 layers
<ParentComponent user={user} notifications={notifications}>
  <ChildComponent user={user} notifications={notifications} />
</ParentComponent>
```

### 7. Wrong Supabase Import

**Always use the correct path**:

```typescript
// ✅ Good
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// ❌ Wrong paths
import { supabase } from '@/lib/supabaseClient';           // Wrong!
import type { Database } from '@supabase/supabase-js';     // Wrong!
```

### 8. Manually Edited Supabase Types

**Never manually edit** `@/integrations/supabase/types.ts`. Regenerate after schema changes:

```bash
npm run supabase:pull  # Regenerates types from schema
```

### 9. Race Conditions in Cleanup

Use refs to track component mount status:

```typescript
// ✅ Good: Prevents state updates on unmounted component
const isMountedRef = useRef(true);

useEffect(() => {
  return () => {
    isMountedRef.current = false;
  };
}, []);

const fetchData = async () => {
  const data = await supabase.from('orders').select();
  if (isMountedRef.current) {
    setOrders(data);  // Only update if still mounted
  }
};
```

### 10. Missing Error Boundaries

Wrap feature areas with error boundaries:

```typescript
// ✅ Good
<ErrorBoundary>
  <TradingPage />
</ErrorBoundary>

// ❌ Bad: No protection
<TradingPage />  // May crash entire app
```

---

## Code Examples

### Complete Component Example

```typescript
import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

/**
 * OrderForm - Creates new trading orders
 * 
 * Validates order inputs using Zod schema and submits to Supabase.
 * Handles async operations with proper error handling and loading states.
 */

// Schema first
const orderSchema = z.object({
  symbol: z.string().min(2, 'Invalid symbol'),
  size: z.number().positive('Size must be positive'),
  type: z.enum(['market', 'limit', 'stop']),
  price: z.number().positive('Price must be positive').optional(),
});

type OrderInput = z.infer<typeof orderSchema>;

interface OrderFormProps {
  onSubmitSuccess?: () => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({ onSubmitSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OrderInput>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      type: 'market',
    },
  });

  const handleSubmit = useCallback(async (data: OrderInput) => {
    if (!user) {
      toast({ title: 'Error', description: 'Please log in' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          symbol: data.symbol,
          size: data.size,
          type: data.type,
          price: data.price,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Order #${order.id} created`,
      });

      form.reset();
      onSubmitSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [user, toast, form, onSubmitSuccess]);

  if (!user) {
    return <div className="text-center py-8">Please log in to place orders</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="symbol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Symbol</FormLabel>
              <Input {...field} placeholder="EURUSD" />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Size (Lots)</FormLabel>
              <Input {...field} type="number" placeholder="1.0" step="0.01" />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order Type</FormLabel>
              <select {...field} className={cn('border rounded-md px-3 py-2')}>
                <option value="market">Market</option>
                <option value="limit">Limit</option>
                <option value="stop">Stop</option>
              </select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (if Limit/Stop)</FormLabel>
              <Input {...field} type="number" placeholder="1.0850" step="0.0001" />
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Placing...' : 'Place Order'}
        </Button>
      </form>
    </Form>
  );
};
```

### Custom Hook Example

```typescript
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Position = Tables<'positions'>['Row'];

/**
 * useRealtimePositions - Subscribes to real-time position updates
 * 
 * Automatically unsubscribes on unmount to prevent memory leaks.
 * 
 * @param userId - The user ID to subscribe for
 * @returns Current positions and loading state
 */
export const useRealtimePositions = (userId: string | undefined) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    // Initial fetch
    const fetchPositions = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('positions')
          .select('*')
          .eq('user_id', userId);

        if (fetchError) throw fetchError;
        setPositions(data ?? []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPositions();

    // Subscribe to updates
    const subscription = supabase
      .channel(`positions:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'positions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPositions(prev => [...prev, payload.new as Position]);
          } else if (payload.eventType === 'UPDATE') {
            setPositions(prev =>
              prev.map(p => p.id === payload.new.id ? (payload.new as Position) : p)
            );
          } else if (payload.eventType === 'DELETE') {
            setPositions(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // ✅ CRITICAL: Cleanup
    return () => subscription.unsubscribe();
  }, [userId]);

  return { positions, isLoading, error };
};
```

---

## Summary Checklist

Before submitting code:

- [ ] **TypeScript**: Used proper types, avoid `any` when possible
- [ ] **Components**: Functional, <300 lines, single responsibility
- [ ] **Props**: Destructured with types in signature
- [ ] **Naming**: PascalCase components, camelCase functions, UPPER_SNAKE_CASE constants
- [ ] **Styling**: Used Tailwind utilities, CSS variables for colors
- [ ] **Forms**: Zod schema first, React Hook Form integration
- [ ] **Supabase**: Used correct import paths, types from auto-generated file
- [ ] **Realtime**: Always unsubscribe in cleanup
- [ ] **Error Handling**: Try-catch wraps async operations, toast notifications for UI
- [ ] **Testing**: Tests co-located in `__tests__/`, proper mocking
- [ ] **Performance**: No unnecessary memoization, proper code splitting
- [ ] **Accessibility**: Semantic HTML, ARIA labels where needed
- [ ] **Documentation**: JSDoc for components, clear variable names

---

## References

- **Main Codebase Docs**: `/workspaces/Trade-X-Pro-Global/.github/copilot-instructions.md`
- **Tailwind Config**: `/workspaces/Trade-X-Pro-Global/tailwind.config.ts`
- **Vite Config**: `/workspaces/Trade-X-Pro-Global/vite.config.ts`
- **TypeScript Config**: `/workspaces/Trade-X-Pro-Global/tsconfig.json`
- **ESLint Config**: `/workspaces/Trade-X-Pro-Global/eslint.config.js`
- **Testing Setup**: `/workspaces/Trade-X-Pro-Global/vitest.config.ts`
