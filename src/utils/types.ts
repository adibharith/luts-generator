export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface ColorTransform {
  averageColor: RGBColor;
  ranges: RGBColor;
  weights: RGBColor;
  minValues: RGBColor;
  maxValues: RGBColor;
}