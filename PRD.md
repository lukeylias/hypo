# AB Test Setup Guide - Product Requirements Document

## Product Overview

A comprehensive web application that guides users through creating effective AB test plans using an 8-step progressive form with clean, professional UI and data persistence.

## Core Requirements

### 1. Application Structure & Framework

**Task 1.1: Create HTML Foundation**

- Build single-page application using vanilla HTML5, CSS3, and JavaScript
- Implement semantic HTML structure with proper accessibility attributes
- Use CSS Grid and Flexbox for responsive layout
- Target modern browsers (Chrome 90+, Firefox 88+, Safari 14+)

**Task 1.2: Icon Implementation**

- Use Lucide icons via CDN (https://unpkg.com/lucide@latest/dist/umd/lucide.js)
- Implement icons: Target, Lightbulb, FlaskConical, BarChart, TrendingUp, Zap, Calculator, Clock, Edit2, Send, Copy

### 2. Visual Design & Theme

**Task 2.1: Color Scheme Implementation**

- Primary background: Light grey gradient (`#f9fafb` to `#f3f4f6`)
- Card backgrounds: White (`#ffffff`) for active/completed steps, light grey (`#f3f4f6`) for pending
- Text colors: Dark grey (`#111827`) for headings, medium grey (`#374151`) for body text
- Interactive elements: Black (`#000000`) borders for active states, grey (`#9ca3af`) for inactive
- Buttons: Dark grey (`#111827`) background with white text

**Task 2.2: Typography & Spacing**

- Font family: Inter (load from Google Fonts)
- Heading sizes: H1 (2.25rem), H2 (1.25rem), body (1rem)
- Consistent spacing using 8px grid system
- Line height: 1.5 for body text, 1.2 for headings

**Task 2.3: Interactive States**

- Hover effects: Subtle background color changes, scale transforms (1.02x)
- Focus states: Clear outline for accessibility
- Smooth transitions: 300ms ease for all state changes
- Active step highlighting with black border and subtle shadow

### 3. Progressive Form Flow

**Task 3.1: Step Navigation Logic**

- Implement 8-step sequential form with validation
- Only show current and completed steps
- Prevent navigation to future steps until current is completed
- Add edit functionality for completed steps with visual edit icons

**Task 3.2: Visual Flow Indicators**

- Central vertical line connecting all steps
- Step numbers in circles for completed steps
- Icons for each step type
- Smooth scrolling to active step on progression

### 4. Form Field Implementation

**Task 4.1: Step 1 - Problem/Opportunity Identification**

- Input type: Text input
- Placeholder: "e.g., ContentSquare shows 70% of users abandon our checkout page at the payment step"
- Include 5 quick example buttons:
  - "High cart abandonment at payment step"
  - "Low email signup conversion on landing page"
  - "Poor mobile navigation engagement"
  - "Low feature adoption in dashboard"
  - "High bounce rate on product pages"

**Task 4.2: Step 2 - Solution Proposal**

- Input type: Textarea (3 rows)
- Placeholder: "e.g., Add trust badges and security icons above the payment form to reduce anxiety"

**Task 4.3: Step 3 - Hypothesis Formation**

- Input type: Textarea (3 rows)
- Placeholder: "e.g., I believe adding trust badges will increase payment completion by 15% BECAUSE users will feel more confident about security"
- Description: "I believe [solution] will [outcome] BECAUSE [reasoning]"

**Task 4.4: Step 4 - Long-term Metric Selection**

- Input type: Select dropdown
- Options:
  - "Join Completes"
  - "Conversion Rate"
  - "Revenue per Visitor"
  - "Customer Lifetime Value"
  - "Retention Rate"
  - "Subscription Signups"
  - "Purchase Completions"
  - "User Engagement Score"

**Task 4.5: Step 5 - Proxy Metric Identification**

- Input type: Select dropdown
- Options:
  - "Click-through Rate"
  - "Add to Cart Rate"
  - "Email Signups"
  - "Page Views per Session"
  - "Time on Page"
  - "Form Completion Rate"
  - "Download Rate"
  - "Video Watch Time"
  - "Feature Usage Rate"

**Task 4.6: Step 6 - Change Impact Assessment**

- Input type: Radio buttons with labels
- Options:
  - Minor: "Minor (small visual changes, copy tweaks)"
  - Moderate: "Moderate (layout changes, new content sections)"
  - Major: "Major (complete redesign, new features)"

**Task 4.7: Step 7 - MDA Calculation**

- Input type: Textarea (3 rows)
- Placeholder: "e.g., Need 50,000 visitors per variant over 3 weeks for 95% confidence to detect 5% lift"

**Task 4.8: Step 8 - Timeline & Plan Setting**

- Input type: Textarea (3 rows)
- Placeholder: "e.g., Run for 4 weeks minimum. If no significance, consider running for 2 more weeks or redesigning the test"

### 5. Data Persistence

**Task 5.1: Session Storage Implementation**

- Store all form data in browser sessionStorage
- Auto-save on each field change
- Restore data on page refresh/reload
- Clear data only when user explicitly starts new test or clears browser cache

**Task 5.2: Data Structure**

```javascript
{
  "currentStep": 0,
  "formData": {
    "problem": "",
    "solution": "",
    "hypothesis": "",
    "longTermMetric": "",
    "proxyMetric": "",
    "changeImpact": "",
    "mdaCalculation": "",
    "timeline": ""
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 6. Summary & Export Features

**Task 6.1: Summary Generation**

- Display comprehensive summary after step 8 completion
- Show all 8 sections with step titles and user responses
- Include "Ready to Launch" checklist with 5 action items
- Add visual completion indicator (flask icon in circle)

**Task 6.2: Markdown Export Functionality**

- Add "Copy as Markdown" button in summary section
- Generate clean markdown format:

```markdown
# AB Test Plan

## Problem/Opportunity Identification

[User's problem statement]

## Solution Proposal

[User's solution]

## Hypothesis Formation

[User's hypothesis]

## Long-term Metric Selection

[Selected metric]

## Proxy Metric Identification

[Selected proxy metric]

## Change Impact Assessment

[Selected impact level]

## MDA Calculation

[User's calculation details]

## Timeline & Plan Setting

[User's timeline and plan]

---

_Generated by AB Test Setup Guide_
```

**Task 6.3: Clipboard Integration**

- Use Clipboard API for modern browsers
- Show success/failure feedback after copy attempt
- Fallback for older browsers using text selection method

### 7. User Experience Enhancements

**Task 7.1: Animation & Microinteractions**

- Smooth step transitions with scale animations
- Auto-scroll to current step
- Loading states for any processing
- Hover effects on interactive elements

**Task 7.2: Responsive Design**

- Mobile-first responsive design
- Breakpoints: 640px (mobile), 768px (tablet), 1024px (desktop)
- Touch-friendly buttons and inputs on mobile
- Optimized typography scaling

**Task 7.3: Accessibility**

- WCAG 2.1 AA compliance
- Proper heading hierarchy
- ARIA labels for form fields
- Keyboard navigation support
- Screen reader compatibility

### 8. Technical Implementation

**Task 8.1: File Structure**

```
/ab-test-guide/
├── index.html
├── styles.css
├── script.js
└── README.md
```

**Task 8.2: Performance Requirements**

- Page load time under 2 seconds
- Minimal external dependencies (only Google Fonts and Lucide icons)
- Optimized CSS and JavaScript
- Progressive enhancement approach

**Task 8.3: Browser Compatibility**

- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Graceful degradation for older browsers
- Feature detection for modern APIs

### 9. Content Guidelines

**Task 9.1: Tone & Voice**

- Professional but approachable
- Clear, actionable language
- Avoid jargon while maintaining technical accuracy
- Concise placeholder text and descriptions

**Task 9.2: Error Handling**

- Validation messages for required fields
- Clear feedback for incomplete sections
- Graceful handling of clipboard copy failures
- User-friendly error messages

### 10. Testing Requirements

**Task 10.1: Functional Testing**

- Test all form progressions and validations
- Verify data persistence across page refreshes
- Test edit functionality for completed steps
- Validate markdown export functionality
