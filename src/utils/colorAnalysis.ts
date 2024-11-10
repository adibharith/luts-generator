import { RGBColor, ColorTransform } from './types';

export const analyzeImageColors = (imageData: ImageData): ColorTransform => {
  const { data, width, height } = imageData;
  let rSum = 0, gSum = 0, bSum = 0;
  let rMin = 255, gMin = 255, bMin = 255;
  let rMax = 0, gMax = 0, bMax = 0;

  // Analyze color distribution
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    rSum += r;
    gSum += g;
    bSum += b;

    rMin = Math.min(rMin, r);
    gMin = Math.min(gMin, g);
    bMin = Math.min(bMin, b);

    rMax = Math.max(rMax, r);
    gMax = Math.max(gMax, g);
    bMax = Math.max(bMax, b);
  }

  const pixelCount = (width * height);
  const avgColor: RGBColor = {
    r: rSum / pixelCount,
    g: gSum / pixelCount,
    b: bSum / pixelCount
  };

  // Calculate color ranges
  const ranges = {
    r: rMax - rMin,
    g: gMax - gMin,
    b: bMax - bMin
  };

  // Calculate color weights based on distribution
  const weights = {
    r: ranges.r / (ranges.r + ranges.g + ranges.b),
    g: ranges.g / (ranges.r + ranges.g + ranges.b),
    b: ranges.b / (ranges.r + ranges.g + ranges.b)
  };

  return {
    averageColor: avgColor,
    ranges,
    weights,
    minValues: { r: rMin, g: gMin, b: bMin },
    maxValues: { r: rMax, g: gMax, b: bMax }
  };
};