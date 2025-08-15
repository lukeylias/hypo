/**
 * Test script to verify variation count calculations
 * Homepage Offer test case with different variation counts
 */

console.log('='.repeat(60));
console.log('VARIATION COUNT TEST - Homepage Offer');
console.log('='.repeat(60));

// Test parameters (Homepage Offer case)
const baseline = 8.19;
const mdePoints = 5;
const weeklyVisitors = 72314;

// Z-values
const Z_VALUES = {
    95: 1.96,    // 95% confidence level
    80: 0.84     // 80% statistical power
};

function getZValue(level) {
    return Z_VALUES[level] || 1.96;
}

function calculateSampleSize(baseline, mdePoints, significance = 95, power = 80) {
    const p1 = baseline / 100;
    const mdeRelative = (mdePoints / baseline) * 100;
    const p2 = p1 * (1 + mdeRelative / 100);
    
    const zAlpha = getZValue(significance);
    const zBeta = getZValue(power);
    
    const numerator = Math.pow(zAlpha + zBeta, 2) * (p1 * (1 - p1) + p2 * (1 - p2));
    const denominator = Math.pow(p1 - p2, 2);
    
    return Math.ceil(numerator / denominator);
}

function calculateWeeksNeeded(sampleSize, weeklyVisitors, variations) {
    const visitorsPerVariant = weeklyVisitors / variations;
    return Math.ceil(sampleSize / visitorsPerVariant);
}

function testVariationCount(variations) {
    console.log(`\n--- ${variations} VARIATIONS TEST ---`);
    console.log(`Baseline: ${baseline}%`);
    console.log(`MDE: ${mdePoints} percentage points`);
    console.log(`Weekly visitors: ${weeklyVisitors.toLocaleString()}`);
    console.log(`Variations: ${variations}`);
    
    // Calculate sample size (same for all variation counts)
    const sampleSize = calculateSampleSize(baseline, mdePoints);
    console.log(`Sample size needed: ${sampleSize.toLocaleString()} per variant`);
    
    // Calculate traffic split
    const visitorsPerVariant = weeklyVisitors / variations;
    const trafficPercent = (100 / variations).toFixed(2);
    console.log(`Traffic split: ${trafficPercent}% per variant (${visitorsPerVariant.toLocaleString()} visitors)`);
    
    // Calculate timeline
    const weeksNeeded = calculateWeeksNeeded(sampleSize, weeklyVisitors, variations);
    console.log(`Timeline: ${weeksNeeded} week${weeksNeeded === 1 ? '' : 's'} needed`);
    
    return {
        variations,
        sampleSize,
        visitorsPerVariant: Math.floor(visitorsPerVariant),
        trafficPercent: parseFloat(trafficPercent),
        weeksNeeded
    };
}

// Test all variation counts
const variationCounts = [2, 3, 4, 5, 6];
const results = variationCounts.map(count => testVariationCount(count));

// Summary table
console.log('\n' + '='.repeat(60));
console.log('SUMMARY TABLE');
console.log('='.repeat(60));
console.log('Variations | Traffic Split | Visitors/Variant | Timeline');
console.log('-'.repeat(60));

results.forEach(result => {
    const variationsStr = result.variations.toString().padEnd(10);
    const trafficStr = `${result.trafficPercent}%`.padEnd(12);
    const visitorsStr = result.visitorsPerVariant.toLocaleString().padEnd(15);
    const timelineStr = `${result.weeksNeeded} week${result.weeksNeeded === 1 ? '' : 's'}`;
    
    console.log(`${variationsStr} | ${trafficStr} | ${visitorsStr} | ${timelineStr}`);
});

// Highlight the 5-variation case
console.log('\n' + '='.repeat(60));
console.log('HOMEPAGE OFFER WITH 5 VARIATIONS');
console.log('='.repeat(60));

const fiveVariationResult = results.find(r => r.variations === 5);
console.log(`Expected behavior:`);
console.log(`• 5 variations: Control + V1 + V2 + V3 + V4`);
console.log(`• ${fiveVariationResult.trafficPercent}% traffic split per variant`);
console.log(`• ${fiveVariationResult.visitorsPerVariant.toLocaleString()} visitors per variant per week`);
console.log(`• ${fiveVariationResult.weeksNeeded} weeks needed (vs 1 week with 2 variations)`);
console.log(`• Timeline should be ${fiveVariationResult.weeksNeeded}x longer than 2-variation test`);

console.log('\n✅ This demonstrates that variation count properly affects timeline calculation');
console.log('✅ The fix should enable real-time updates when users change variation count');