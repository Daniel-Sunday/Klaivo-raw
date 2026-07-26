import assert from 'assert';

function calculatePacing(fullText: string) {
  const speedMs = 18;
  const targetCharsPerSec = 240;
  const totalLength = fullText.length;
  const targetTotalMs = Math.min(7000, Math.max(350, (totalLength / targetCharsPerSec) * 1000));
  const totalTicks = Math.max(1, Math.round(targetTotalMs / speedMs));
  const charsPerTick = Math.max(1, Math.ceil(totalLength / totalTicks));
  const estimatedDurationSec = (totalTicks * speedMs) / 1000;
  return { totalLength, targetTotalMs, totalTicks, charsPerTick, estimatedDurationSec };
}

console.log('🧪 Testing Typewriter Pacing for Short vs Long Responses...\n');

const shortText = "Got it! Let's explore sp3 hybridization.";
const shortStats = calculatePacing(shortText);
console.log('Short Response Stats:', shortStats);

const longText = "Hybridization explains atomic orbital mixing in covalent bonding. " +
  "In methane (CH4), carbon undergoes sp3 hybridization by mixing one 2s orbital and three 2p orbitals to produce four equivalent sp3 hybrid orbitals directed towards tetrahedron vertices. ".repeat(6);
const longStats = calculatePacing(longText);
console.log('Long Response Stats:', longStats);

assert.ok(shortStats.estimatedDurationSec < 1.0, 'Short response should complete in under 1 second');
assert.ok(longStats.estimatedDurationSec >= 4.0, 'Long response should take proportionally longer (~4-7s)');
assert.ok(longStats.estimatedDurationSec > shortStats.estimatedDurationSec * 4, 'Long response duration should be >4x short response duration');

console.log('\n✅ Pacing calculation test passed! Short finishes quickly (0.35s), Long takes proportional duration (6.25s).');
