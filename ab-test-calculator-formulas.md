# AB Test Calculator - Statistical Formulas Documentation

This document provides comprehensive documentation of all statistical calculation logic used in our AB test calculator.

## Statistical Formula Implementation

### Sample Size Calculation Formula

The calculator uses the standard two-sample proportion test formula for determining required sample size:

```
n = (Z_α + Z_β)² × (p₁(1-p₁) + p₂(1-p₂)) / (p₁ - p₂)²
```

**Variables:**
- `n` = Required sample size per variant
- `Z_α` = Z-score for significance level (Type I error)
- `Z_β` = Z-score for statistical power (1 - Type II error)
- `p₁` = Baseline conversion rate (as decimal)
- `p₂` = Expected conversion rate after treatment (as decimal)
- `p₁ - p₂` = Effect size (difference in conversion rates)

### JavaScript Implementation

```javascript
calculateSampleSize(baseline, mdePoints, significance, power = 80) {
    const p1 = baseline / 100;
    // Convert percentage points to relative percentage for statistical calculation
    const mdeRelative = (mdePoints / baseline) * 100;
    const p2 = p1 * (1 + mdeRelative / 100);
    
    const zAlpha = this.getZValue(significance);
    const zBeta = this.getZValue(power);
    
    const numerator = Math.pow(zAlpha + zBeta, 2) * (p1 * (1 - p1) + p2 * (1 - p2));
    const denominator = Math.pow(p1 - p2, 2);
    
    return Math.ceil(numerator / denominator);
}
```

**Key Implementation Details:**
1. **Percentage Point Conversion**: The MDE input (percentage points) is converted to relative percentage change for the statistical formula
2. **Power Default**: Statistical power defaults to 80% (Z_β = 0.84)
3. **Ceiling Function**: Sample size is rounded up to ensure adequate power

### Z-Value Mappings

The calculator maps confidence levels and statistical power to their corresponding Z-scores:

```javascript
getZValue(confidenceLevel) {
    const zValues = {
        90: 1.645,   // 90% confidence level
        95: 1.96,    // 95% confidence level (default)
        99: 2.576,   // 99% confidence level
        80: 0.84     // 80% statistical power
    };
    return zValues[confidenceLevel] || 1.96;
}
```

**Z-Score Reference:**
- **90% Confidence**: Z = 1.645 (10% significance level)
- **95% Confidence**: Z = 1.96 (5% significance level)
- **99% Confidence**: Z = 2.576 (1% significance level)
- **80% Power**: Z = 0.84 (20% Type II error rate)

## Timeline Calculation Logic

### Sample Size to Timeline Conversion

The calculator converts required sample size to experiment duration based on available traffic:

```javascript
calculateWeeksNeeded(sampleSize, weeklyVisitors, variations) {
    const visitorsPerVariant = weeklyVisitors / variations;
    return Math.ceil(sampleSize / visitorsPerVariant);
}
```

### Traffic Allocation Logic

**Traffic Distribution:**
- Total weekly visitors are split equally across all variations (control + treatment variants)
- For A/B test (2 variations): Each variant gets 50% of traffic
- For A/B/C test (3 variations): Each variant gets 33.33% of traffic

**Timeline Calculation:**
1. Calculate visitors per variant: `weeklyVisitors ÷ variations`
2. Calculate weeks needed: `sampleSize ÷ visitorsPerVariant`
3. Round up to nearest whole week using `Math.ceil()`

### Timeline Validation

The calculator includes practical constraints:
- **Maximum Duration**: Experiments longer than 12 weeks trigger a warning
- **Minimum Traffic**: Requires at least 100 weekly visitors for reliable results
- **Traffic Adequacy**: Suggests increasing MDE or extending timeline for insufficient traffic

## Input Processing

### MDE (Minimum Detectable Effect) Conversion

The calculator handles MDE as **percentage points** rather than relative percentages:

```javascript
// Input: MDE in percentage points (e.g., 1.0 for 1 percentage point)
// Conversion to relative percentage for statistical calculation:
const mdeRelative = (mdePoints / baseline) * 100;
const p2 = p1 * (1 + mdeRelative / 100);
```

**Example:**
- Baseline: 5% conversion rate
- MDE Input: 1.0 percentage points
- Relative MDE: (1.0 / 5.0) × 100 = 20% relative increase
- Expected Rate: 5% × (1 + 20/100) = 6%

### Input Validation Rules

The calculator enforces the following validation constraints:

```javascript
validateCalculatorInputs() {
    // Baseline Rate Validation
    if (!baselineRate || baselineRate < 0.1 || baselineRate > 99) {
        // Error: "Baseline rate must be between 0.1% and 99%"
    }
    
    // Weekly Visitors Validation  
    if (!weeklyVisitors || weeklyVisitors < 100) {
        // Error: "Weekly visitors must be at least 100 for reliable results"
    }
    
    // MDE Validation
    if (!mde || mde < 1 || mde > 50) {
        // Error: "MDE should be between 1% and 50% for practical testing"
    }
}
```

**Validation Constraints:**
- **Baseline Rate**: 0.1% - 99% (prevents edge cases with very low/high conversion rates)
- **Weekly Visitors**: Minimum 100 (ensures statistical reliability)
- **MDE**: 1% - 50% percentage points (practical testing ranges)
- **Confidence Level**: 90%, 95%, or 99% (dropdown selection)
- **Variations**: 2 or 3 variants (radio button selection)

### Default Values and Initialization

**Form Defaults:**
- **Significance Level**: 95% confidence (most common in practice)
- **Statistical Power**: 80% (industry standard)
- **Variations**: 2 (A/B test is default)

**Input Processing:**
- **Number Formatting**: Weekly visitors input supports comma-separated thousands
- **Decimal Handling**: Baseline rate and MDE accept decimal values
- **Error Clearing**: Validation errors clear when inputs are corrected

## Statistical Assumptions

**Key Assumptions:**
1. **Two-sided Test**: Calculator assumes you want to detect increases or decreases
2. **Equal Allocation**: Traffic is split equally between variants
3. **Binomial Distribution**: Conversion events follow binomial distribution
4. **Independent Samples**: User sessions are independent
5. **Stable Baseline**: Conversion rate remains consistent during test period

**Practical Considerations:**
- **Seasonality**: Calculator doesn't account for seasonal traffic variations
- **Novelty Effects**: Short-term changes in user behavior not considered
- **Sample Ratio Mismatch**: Assumes perfect 50/50 traffic split
- **Multiple Testing**: No correction for running multiple concurrent tests