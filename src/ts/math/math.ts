const mathAngleDiff = (a: number, b: number) => mathSafeMod(b - a + Math.PI, Math.PI * 2) - Math.PI;

const mathSafeMod = (a: number, n: number) => a - Math.floor(a/n) * n;