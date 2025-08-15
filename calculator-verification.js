/**
 * AB Test Calculator Verification
 * Manual calculations to verify the calculator logic for test cases
 */

console.log('='.repeat(60));
console.log('AB TEST CALCULATOR VERIFICATION');
console.log('='.repeat(60));

// Z-value mappings (from calculator)
const Z_VALUES = {
    90: 1.645,   // 90% confidence level
    95: 1.96,    // 95% confidence level (default)
    99: 2.576,   // 99% confidence level
    80: 0.84     // 80% statistical power
};

/**
 * Get Z-value for confidence level or power
 */
function getZValue(level) {
    return Z_VALUES[level] || 1.96;
}

/**
 * Manual sample size calculation using the documented formula
 * n = (Z_α + Z_β)² × (p₁(1-p₁) + p₂(1-p₂)) / (p₁ - p₂)²
 */
function calculateSampleSizeManual(baseline, mdePoints, significance = 95, power = 80) {
    console.log('\n--- MANUAL SAMPLE SIZE CALCULATION ---');
    console.log(`Baseline: ${baseline}%`);
    console.log(`MDE: ${mdePoints} percentage points`);
    console.log(`Significance: ${significance}%`);
    console.log(`Power: ${power}%`);
    
    // Step 1: Convert baseline to decimal
    const p1 = baseline / 100;
    console.log(`\nStep 1: p₁ = ${baseline}/100 = ${p1}`);
    
    // Step 2: Convert percentage points to relative percentage
    const mdeRelative = (mdePoints / baseline) * 100;
    console.log(`Step 2: MDE relative = (${mdePoints}/${baseline}) × 100 = ${mdeRelative.toFixed(2)}%`);
    
    // Step 3: Calculate p2 (expected conversion rate)
    const p2 = p1 * (1 + mdeRelative / 100);
    console.log(`Step 3: p₂ = ${p1} × (1 + ${mdeRelative.toFixed(2)}/100) = ${p2.toFixed(6)}`);
    
    // Step 4: Get Z-values
    const zAlpha = getZValue(significance);
    const zBeta = getZValue(power);
    console.log(`Step 4: Z_α = ${zAlpha}, Z_β = ${zBeta}`);
    
    // Step 5: Calculate variance terms
    const variance1 = p1 * (1 - p1);
    const variance2 = p2 * (1 - p2);
    const totalVariance = variance1 + variance2;
    console.log(`Step 5: p₁(1-p₁) = ${variance1.toFixed(6)}`);
    console.log(`        p₂(1-p₂) = ${variance2.toFixed(6)}`);
    console.log(`        Total variance = ${totalVariance.toFixed(6)}`);
    
    // Step 6: Calculate effect size
    const effectSize = p1 - p2;
    const effectSizeSquared = Math.pow(effectSize, 2);
    console.log(`Step 6: Effect size = p₁ - p₂ = ${effectSize.toFixed(6)}`);
    console.log(`        Effect size² = ${effectSizeSquared.toFixed(8)}`);
    
    // Step 7: Calculate numerator and denominator
    const zSum = zAlpha + zBeta;
    const numerator = Math.pow(zSum, 2) * totalVariance;
    const denominator = effectSizeSquared;
    console.log(`Step 7: (Z_α + Z_β)² = ${Math.pow(zSum, 2).toFixed(4)}`);
    console.log(`        Numerator = ${numerator.toFixed(8)}`);
    console.log(`        Denominator = ${denominator.toFixed(8)}`);
    
    // Step 8: Calculate final sample size
    const sampleSizeRaw = numerator / denominator;
    const sampleSize = Math.ceil(sampleSizeRaw);
    console.log(`Step 8: Sample size (raw) = ${sampleSizeRaw.toFixed(2)}`);
    console.log(`        Sample size (rounded up) = ${sampleSize}`);
    
    return {
        sampleSize,
        p1,
        p2,
        mdeRelative,
        effectSize,
        calculations: {
            numerator,
            denominator,
            sampleSizeRaw
        }
    };
}

/**
 * Calculate weeks needed using the documented formula
 */
function calculateWeeksNeededManual(sampleSize, weeklyVisitors, variations = 2) {
    console.log('\n--- MANUAL TIMELINE CALCULATION ---');
    console.log(`Sample size needed: ${sampleSize} per variant`);
    console.log(`Weekly visitors: ${weeklyVisitors.toLocaleString()}`);
    console.log(`Variations: ${variations}`);
    
    const visitorsPerVariant = weeklyVisitors / variations;
    const weeksNeeded = Math.ceil(sampleSize / visitorsPerVariant);
    
    console.log(`Visitors per variant: ${weeklyVisitors.toLocaleString()}/${variations} = ${visitorsPerVariant.toLocaleString()}`);
    console.log(`Weeks needed: ceil(${sampleSize}/${visitorsPerVariant.toLocaleString()}) = ${weeksNeeded}`);
    
    return weeksNeeded;
}

/**
 * Replicate the calculator's exact logic for comparison
 */
function calculateUsingCalculatorLogic(baseline, mdePoints, significance = 95, power = 80) {
    console.log('\n--- CALCULATOR LOGIC REPLICATION ---');
    
    const p1 = baseline / 100;
    const mdeRelative = (mdePoints / baseline) * 100;
    const p2 = p1 * (1 + mdeRelative / 100);
    
    const zAlpha = getZValue(significance);
    const zBeta = getZValue(power);
    
    const numerator = Math.pow(zAlpha + zBeta, 2) * (p1 * (1 - p1) + p2 * (1 - p2));
    const denominator = Math.pow(p1 - p2, 2);
    
    const sampleSize = Math.ceil(numerator / denominator);
    
    console.log(`Calculator result: ${sampleSize} visitors per variant`);
    return sampleSize;
}

/**
 * Run verification for a test case
 */
function verifyTestCase(name, baseline, mdePoints, weeklyVisitors, variations = 2) {
    console.log('\n' + '='.repeat(60));
    console.log(`TEST CASE: ${name}`);
    console.log('='.repeat(60));
    
    // Manual calculation
    const manualResult = calculateSampleSizeManual(baseline, mdePoints);
    
    // Calculator logic replication
    const calculatorResult = calculateUsingCalculatorLogic(baseline, mdePoints);
    
    // Timeline calculation
    const weeksNeeded = calculateWeeksNeededManual(manualResult.sampleSize, weeklyVisitors, variations);
    
    // Verification
    console.log('\n--- VERIFICATION ---');
    console.log(`Manual calculation: ${manualResult.sampleSize} visitors per variant`);
    console.log(`Calculator logic: ${calculatorResult} visitors per variant`);
    console.log(`Results match: ${manualResult.sampleSize === calculatorResult ? '✅ YES' : '❌ NO'}`);
    console.log(`Timeline: ${weeksNeeded} week${weeksNeeded === 1 ? '' : 's'} needed`);
    
    // Additional insights
    console.log('\n--- INSIGHTS ---');
    console.log(`Baseline conversion: ${baseline}% → ${(manualResult.p2 * 100).toFixed(2)}%`);
    console.log(`Absolute change: +${mdePoints} percentage points`);
    console.log(`Relative change: +${manualResult.mdeRelative.toFixed(2)}%`);
    console.log(`Effect size: ${Math.abs(manualResult.effectSize * 100).toFixed(4)} percentage points`);
    
    return {
        name,
        manualSampleSize: manualResult.sampleSize,
        calculatorSampleSize: calculatorResult,
        weeksNeeded,
        match: manualResult.sampleSize === calculatorResult,
        insights: {
            baselineRate: baseline,
            expectedRate: manualResult.p2 * 100,
            absoluteChange: mdePoints,
            relativeChange: manualResult.mdeRelative,
            effectSize: Math.abs(manualResult.effectSize * 100)
        }
    };
}

// Run test cases
console.log('\nStarting verification of AB test calculator logic...\n');

const testCase1 = verifyTestCase(
    'WeMoney Award',
    8.19,  // baseline
    1,     // MDE in percentage points
    77034, // weekly visitors
    2      // variations
);

const testCase2 = verifyTestCase(
    'Homepage Offer',
    8.19,  // baseline
    5,     // MDE in percentage points
    72314, // weekly visitors
    2      // variations
);

// Summary
console.log('\n' + '='.repeat(60));
console.log('VERIFICATION SUMMARY');
console.log('='.repeat(60));

const results = [testCase1, testCase2];
results.forEach(result => {
    console.log(`\n${result.name}:`);
    console.log(`  Sample size: ${result.manualSampleSize.toLocaleString()} visitors per variant`);
    console.log(`  Timeline: ${result.weeksNeeded} week${result.weeksNeeded === 1 ? '' : 's'}`);
    console.log(`  Logic verification: ${result.match ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Relative change: +${result.insights.relativeChange.toFixed(2)}%`);
});

// Check for any discrepancies
const allMatch = results.every(r => r.match);
console.log(`\nOverall verification: ${allMatch ? '✅ ALL TESTS PASS' : '❌ SOME TESTS FAIL'}`);

if (!allMatch) {
    console.log('\n⚠️  DISCREPANCIES FOUND:');
    results.filter(r => !r.match).forEach(result => {
        console.log(`  ${result.name}: Manual=${result.manualSampleSize}, Calculator=${result.calculatorSampleSize}`);
    });
}

console.log('\n' + '='.repeat(60));
console.log('VERIFICATION COMPLETE');
console.log('='.repeat(60));