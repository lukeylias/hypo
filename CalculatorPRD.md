# MDA Calculator Feature - Product Requirements Document

## Feature Overview

Replace Step 7 (MDA Calculation) text field with an interactive calculator that guides users through data collection and automatically calculates experiment duration.

## Step 7: MDA Calculation & Timeline Calculator

### Task 7.1: ContentSquare Data Collection Interface

**UI Structure:**

```html
<div class="data-collection-section">
  <h3>ContentSquare Data Collection</h3>
  <p>
    Use these prompts in ContentSquare AI Agent to gather your baseline data:
  </p>

  <div class="prompt-box">
    <label>Getting baseline conversion rate:</label>
    <div class="copyable-prompt">
      "What's the conversion rate from [PROXY_METRIC] to Join Complete over the
      last 90 days?"
    </div>
    <button class="copy-btn">Copy Prompt</button>
  </div>

  <div class="prompt-box">
    <label>Getting weekly traffic volume:</label>
    <div class="copyable-prompt">
      "How many weekly sessions reach [PROXY_METRIC] on average over the last 90
      days?"
    </div>
    <button class="copy-btn">Copy Prompt</button>
  </div>
</div>
```

### Task 7.2: Calculator Input Fields

**Form Structure:**

```html
<div class="calculator-inputs">
  <div class="input-group">
    <label>Baseline Conversion Rate</label>
    <input type="number" step="0.01" placeholder="15.90" suffix="%" />
  </div>

  <div class="input-group">
    <label>Weekly Visitors</label>
    <input type="number" placeholder="1970" suffix="sessions" />
  </div>

  <div class="input-group">
    <label>Minimum Detectable Effect (MDE)</label>
    <input type="number" value="10" step="1" suffix="%" />
  </div>

  <div class="input-group">
    <label>Statistical Significance</label>
    <select>
      <option value="90">90%</option>
      <option value="95">95%</option>
      <option value="99">99%</option>
    </select>
  </div>

  <div class="input-group">
    <label>Number of Variations</label>
    <input type="number" value="2" min="2" max="5" />
  </div>
</div>
```

### Task 7.3: Dynamic Proxy Metric Population

**Logic Requirements:**

- Read selected proxy metric from Step 5 (Proxy Metric Identification)
- Replace `[PROXY_METRIC]` placeholder in both ContentSquare prompts
- Update prompts dynamically if user changes proxy metric selection

**Mapping Logic:**

```javascript
const proxyMetricMapping = {
  "Join Start": "Join ARHI Personal Details",
  "Payment Details Reached": "Join ARHI Payment Details",
  "Click-through Rate": "[User's specific page/element]",
  // ... other mappings
};
```

### Task 7.4: Statistical Calculation Engine

**Formula Implementation:**

```javascript
function calculateSampleSize(baseline, mde, significance, power = 80) {
  const p1 = baseline / 100;
  const p2 = p1 * (1 + mde / 100);

  const zAlpha = getZValue(significance);
  const zBeta = getZValue(power);

  const numerator =
    Math.pow(zAlpha + zBeta, 2) * (p1 * (1 - p1) + p2 * (1 - p2));
  const denominator = Math.pow(p1 - p2, 2);

  return Math.ceil(numerator / denominator);
}

function calculateWeeksNeeded(sampleSize, weeklyVisitors, variations) {
  const visitorsPerVariant = weeklyVisitors / variations;
  return Math.ceil(sampleSize / visitorsPerVariant);
}
```

**Z-Value Reference:**

- 90% confidence: 1.645
- 95% confidence: 1.96
- 99% confidence: 2.576
- 80% power: 0.84
- 90% power: 1.28

### Task 7.5: Calculate Timeline Button

**Button Behavior:**

- Validate all required fields are completed
- Perform statistical calculation
- Auto-advance to Step 8 with pre-filled timeline
- Show calculation result in button or nearby display

**Button States:**

```html
<!-- Default state -->
<button class="calculate-btn" disabled>Calculate Timeline</button>

<!-- Ready state -->
<button class="calculate-btn" onclick="calculateAndAdvance()">
  Calculate Timeline
</button>

<!-- Calculating state -->
<button class="calculate-btn" disabled>Calculating...</button>

<!-- Result state -->
<button class="calculate-btn success">✓ 3 weeks needed - Continue</button>
```

### Task 7.6: Step 8 Auto-Population

**Timeline Prefill Logic:**

- Calculate weeks needed from statistical formula
- Generate timeline text template
- Auto-populate Step 8 textarea field
- Auto-advance to Step 8

**Timeline Template:**

```
Experiment Duration: {calculatedWeeks} weeks minimum

Based on your proxy metric ({proxyMetric}) with {baseline}% baseline conversion rate and {weeklyVisitors} weekly visitors, you need {calculatedWeeks} weeks to detect a {mde}% lift with {significance}% confidence.

Recommended Plan:
• Week 1-{calculatedWeeks}: Run experiment
• If statistical significance reached: Implement winning variant
• If no significance: Consider extending 1-2 weeks or redesigning test
• Monitor both proxy metric and long-term metric alignment
```

### Task 7.7: Copy to Clipboard Functionality

**Implementation Requirements:**

- Add copy buttons next to each ContentSquare prompt
- Use Clipboard API for modern browsers
- Fallback text selection for older browsers
- Visual feedback on successful copy

**Copy Button Behavior:**

```javascript
async function copyPrompt(promptText) {
  try {
    await navigator.clipboard.writeText(promptText);
    showCopySuccess();
  } catch (err) {
    fallbackCopyMethod(promptText);
  }
}
```

### Task 7.8: Validation & Error Handling

**Field Validation:**

- Baseline rate: 0.1% - 99%
- Weekly visitors: Minimum 100
- MDE: 1% - 50%
- All fields required before calculation

**Error Messages:**

- "Baseline rate must be between 0.1% and 99%"
- "Weekly visitors must be at least 100 for reliable results"
- "MDE should be between 1% and 50% for practical testing"
- "Not enough weekly traffic - consider extending timeline or increasing MDE"

### Task 7.9: Visual Design Requirements

**Styling Guidelines:**

- Maintain existing black/white/grey theme
- Clear visual separation between data collection and calculator sections
- Highlight copyable prompts with distinct styling
- Success states use subtle green accents
- Error states use subtle red accents

**Responsive Behavior:**

- Stack inputs vertically on mobile
- Ensure copy buttons remain accessible
- Maintain readability of prompts on small screens

## Technical Requirements

### Dependencies

- No additional external libraries required
- Use existing Clipboard API integration
- Leverage existing form validation patterns

### Performance

- Calculation should complete instantly (<100ms)
- Copy functionality should respond within 50ms
- No impact on existing form flow performance
