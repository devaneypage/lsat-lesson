const pairs = [
  ["foreground / background", "#1E2130", "#F7F4EF", 7],
  ["muted foreground / background", "#5B6072", "#F7F4EF", 4.5],
  ["primary foreground / primary", "#FFFFFF", "#0052CC", 4.5],
  ["secondary foreground / secondary", "#1E2130", "#C8860A", 4.5],
  ["accent foreground / accent", "#FFFFFF", "#C94D12", 4.5],
  ["destructive foreground / destructive", "#FFFFFF", "#B84030", 4.5],
  ["success foreground / success", "#FFFFFF", "#2E7D52", 4.5],
  ["warning foreground / warning", "#3A2A00", "#E7B62A", 4.5],
  ["info foreground / info", "#FFFFFF", "#5B4A8A", 4.5],
];

function luminance(hex) {
  const channels = hex.match(/[a-f\d]{2}/gi).map(value => Number.parseInt(value, 16) / 255);
  const linear = channels.map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function ratio(first, second) {
  const bright = Math.max(luminance(first), luminance(second));
  const dark = Math.min(luminance(first), luminance(second));
  return (bright + 0.05) / (dark + 0.05);
}

let failed = false;
for (const [name, foreground, background, minimum] of pairs) {
  const value = ratio(foreground, background);
  const passes = value >= minimum;
  if (!passes) failed = true;
  console.log(`${passes ? "PASS" : "FAIL"} ${name}: ${value.toFixed(2)}:1 (minimum ${minimum}:1)`);
}

if (failed) process.exitCode = 1;
