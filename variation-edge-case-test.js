/**
 * Test edge case where variation count significantly impacts timeline
 * Using a smaller MDE to create larger sample size requirement
 */

console.log('='.repeat(60));
console.log('VARIATION COUNT EDGE CASE TEST');
console.log('='.repeat(60));

// Test parameters - smaller MDE to require larger sample size
const baseline = 8.19;
const mdePoints = 0.5;  // Smaller MDE = larger sample size
const weeklyVisitors = 72314;

// Z-values
const Z_VALUES = {
    95: 1.96,
    80: 0.84
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
    
    const sampleSize = calculateSampleSize(baseline, mdePoints);
    const visitorsPerVariant = weeklyVisitors / variations;
    const weeksNeeded = calculateWeeksNeeded(sampleSize, weeklyVisitors, variations);
    
    console.log(`Sample size needed: ${sampleSize.toLocaleString()} per variant`);
    console.log(`Visitors per variant: ${Math.floor(visitorsPerVariant).toLocaleString()}/week`);
    console.log(`Timeline: ${weeksNeeded} week${weeksNeeded === 1 ? '' : 's'} needed`);
    
    return { variations, sampleSize, visitorsPerVariant: Math.floor(visitorsPerVariant), weeksNeeded };
}

console.log(`Test case: Baseline ${baseline}%, MDE ${mdePoints} percentage points`);
console.log(`Weekly visitors: ${weeklyVisitors.toLocaleString()}`);

const variationCounts = [2, 3, 4, 5, 6];
const results = variationCounts.map(count => testVariationCount(count));

console.log('\n' + '='.repeat(60));
console.log('SUMMARY - DEMONSTRATING VARIATION IMPACT');
console.log('='.repeat(60));
console.log('Variations | Visitors/Variant/Week | Timeline');
console.log('-'.repeat(50));

results.forEach(result => {
    const variationsStr = result.variations.toString().padEnd(10);
    const visitorsStr = result.visitorsPerVariant.toLocaleString().padEnd(20);
    const timelineStr = `${result.weeksNeeded} week${result.weeksNeeded === 1 ? '' : 's'}`;
    
    console.log(`${variationsStr} | ${visitorsStr} | ${timelineStr}`);
});

// Show the actual issue we're trying to demonstrate
console.log('\n' + '='.repeat(60));
console.log('REAL WORLD EXAMPLE WITH LOWER TRAFFIC');
console.log('='.repeat(60));

const lowTrafficVisitors = 10000; // Lower traffic scenario
console.log(`\nScenario: ${lowTrafficVisitors.toLocaleString()} weekly visitors, MDE 1 percentage point`);

function testLowTraffic(variations) {
    const sampleSize = calculateSampleSize(baseline, 1); // 1 percentage point MDE
    const visitorsPerVariant = lowTrafficVisitors / variations;
    const weeksNeeded = calculateWeeksNeeded(sampleSize, lowTrafficVisitors, variations);
    
    return { variations, visitorsPerVariant: Math.floor(visitorsPerVariant), weeksNeeded };
}

const lowTrafficResults = variationCounts.map(count => testLowTraffic(count));

console.log('\nVariations | Visitors/Variant/Week | Timeline');
console.log('-'.repeat(50));

lowTrafficResults.forEach(result => {
    const variationsStr = result.variations.toString().padEnd(10);
    const visitorsStr = result.visitorsPerVariant.toLocaleString().padEnd(20);
    const timelineStr = `${result.weeksNeeded} week${result.weeksNeeded === 1 ? '' : 's'}`;
    
    console.log(`${variationsStr} | ${visitorsStr} | ${timelineStr}`);
});

console.log('\n✅ This clearly shows how variation count affects timeline!');
console.log('✅ More variations = fewer visitors per variant = longer timeline');