# Sample Size Calculation Documentation

This document explains how sample sizes are calculated in the AB test calculator, including the statistical formulas, implementation details, and multiple comparison corrections.

## Overview

The calculator uses the standard two-sample proportion test formula to determine the required sample size for detecting a specified effect size with given confidence and statistical power. For multi-variant tests (3+ variations), it automatically applies Bonferroni correction to control family-wise error rate.

## Basic Sample Size Formula

### Statistical Foundation

The sample size calculation is based on the two-sample proportion test:

```
n = (Z_α + Z_β)² × (p₁(1-p₁) + p₂(1-p₂)) / (p₁ - p₂)²
```

**Where:**
- `n` = Required sample size per variant
- `Z_α` = Z-score for significance level (Type I error)
- `Z_β` = Z-score for statistical power (1 - Type II error)
- `p₁` = Baseline conversion rate (control)
- `p₂` = Expected conversion rate after treatment
- `(p₁ - p₂)` = Effect size (difference in conversion rates)

### Key Parameters

**Z-Score Mappings:**
- 90% Confidence: Z_α = 1.645
- 95% Confidence: Z_α = 1.96 (default)
- 99% Confidence: Z_α = 2.576
- 80% Power: Z_β = 0.84
- 90% Power: Z_β = 1.282 (default)

## Input Processing

### MDE (Minimum Detectable Effect) Conversion

The calculator accepts MDE as **percentage points** and converts to relative percentage for the statistical calculation:

```javascript
const p1 = baseline / 100;  // Convert baseline % to decimal
const mdeRelative = (mdePoints / baseline) * 100;  // Convert to relative %
const p2 = p1 * (1 + mdeRelative / 100);  // Calculate expected rate
```

**Example:**
- Baseline: 8.19%
- MDE Input: 1.0 percentage points
- Relative MDE: (1.0 / 8.19) × 100 = 12.21%
- Expected Rate: 8.19% × (1 + 12.21/100) = 9.19%

## Implementation

### Standard A/B Test Calculation

```javascript
function calculateSampleSize(baseline, mdePoints, significance, power = 90) {
    const p1 = baseline / 100;
    const mdeRelative = (mdePoints / baseline) * 100;
    const p2 = p1 * (1 + mdeRelative / 100);
    
    const zAlpha = getZValue(significance);
    const zBeta = getZValue(power);
    
    const numerator = Math.pow(zAlpha + zBeta, 2) * (p1 * (1 - p1) + p2 * (1 - p2));
    const denominator = Math.pow(p1 - p2, 2);
    
    return Math.ceil(numerator / denominator);
}
```

### Multiple Comparison Correction

For tests with 3 or more variations, the calculator applies **Bonferroni correction** to maintain family-wise error rate:

```javascript
function calculateBonferroniSampleSize(baseline, mdePoints, significance, variations, power = 90) {
    const numComparisons = variations - 1;  // Each variant vs control
    const alpha = (100 - significance) / 100;  // Convert to alpha level
    const adjustedAlpha = alpha / numComparisons;  // Bonferroni correction
    const adjustedSignificance = (1 - adjustedAlpha) * 100;  // Back to confidence %
    
    // Use adjusted significance in standard calculation
    return calculateSampleSize(baseline, mdePoints, adjustedSignificance, power);
}
```

## Correction Methods

### Bonferroni Correction

**Purpose:** Controls family-wise error rate when making multiple comparisons

**Formula:** α_adjusted = α / k
- Where k = number of comparisons (variants - 1)

**Example with 5 variations:**
- Original α = 0.05 (95% confidence)
- Comparisons = 4 (V1, V2, V3, V4 vs Control)
- Adjusted α = 0.05 / 4 = 0.0125
- Adjusted confidence = 98.75%

**Impact:** More conservative (larger sample sizes) but stronger error control

### When Applied

- **A/B Tests (2 variations):** No correction applied
- **Multi-variant Tests (3+ variations):** Bonferroni correction automatically applied
- **Comparison Type:** Each variant compared against control (not all pairwise)

## Timeline Calculation

### Visitors Per Variant

Traffic is split equally across all variations:

```javascript
function calculateWeeksNeeded(sampleSize, weeklyVisitors, variations) {
    const visitorsPerVariant = weeklyVisitors / variations;
    return Math.ceil(sampleSize / visitorsPerVariant);
}
```

### Business Recommendations

The calculator provides both statistical and business-recommended timelines:

```javascript
const statisticalWeeks = calculateWeeksNeeded(sampleSize, weeklyVisitors, variations);
const recommendedWeeks = Math.max(2, statisticalWeeks);
```

**Minimum 2-week recommendation** accounts for:
- Weekday/weekend cycle coverage
- Novelty effect detection
- Sample ratio mismatch (SRM) validation
- Tracking system validation

## Example Calculations

### Test Case 1: Homepage Offer (High Traffic, Large Effect)

**Inputs:**
- Baseline: 8.19%
- MDE: 5 percentage points
- Weekly Visitors: 72,314
- Variations: 5
- Confidence: 95%
- Power: 90%

**Calculation:**
1. **No Correction (A/B):** 595 visitors per variant
2. **With Bonferroni:** 1,154 visitors per variant
3. **Timeline:** 1 week (still sufficient with high traffic)

### Test Case 2: WeMoney Award (High Traffic, Small Effect)

**Inputs:**
- Baseline: 8.19%
- MDE: 1 percentage point
- Weekly Visitors: 77,034
- Variations: 4
- Confidence: 95%
- Power: 90%

**Calculation:**
1. **No Correction (A/B):** 12,438 visitors per variant
2. **With Bonferroni:** 20,618 visitors per variant
3. **Timeline:** 2-3 weeks

## Statistical Assumptions

**Key Assumptions:**
1. **Binomial Distribution:** Conversion events follow binomial distribution
2. **Independent Samples:** User sessions are statistically independent
3. **Stable Baseline:** Conversion rate remains consistent during test
4. **Equal Allocation:** Traffic split equally between variants
5. **Two-sided Test:** Detects both increases and decreases

**Limitations:**
- No correction for seasonal traffic variations
- Assumes perfect traffic splitting (no SRM)
- Does not account for novelty effects in sample size
- No adjustment for multiple concurrent tests

## Validation Rules

**Input Constraints:**
- **Baseline Rate:** 0.1% - 99%
- **Weekly Visitors:** Minimum 100 (for statistical reliability)
- **MDE:** 1% - 50% percentage points
- **Variations:** 2-6 variants supported
- **Confidence:** 90%, 95%, or 99%
- **Power:** 80%, 90%, or 95%

**Output Validation:**
- Sample sizes rounded up to nearest integer
- Timeline capped at 12 weeks (triggers traffic warning)
- Minimum 2-week business recommendation applied

## References

- **Statistical Power Analysis:** Cohen, J. (1988)
- **Multiple Comparisons:** Bonferroni, C. E. (1936)
- **A/B Testing:** Kohavi, R., Tang, D., Xu, Y. (2020) "Trustworthy Online Controlled Experiments"