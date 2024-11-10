import { analyzeImageColors } from './colorAnalysis';
import { RGBColor } from './types';

const applyColorTransform = (
  input: RGBColor,
  transform: ReturnType<typeof analyzeImageColors>
): RGBColor => {
  const { weights, ranges, averageColor } = transform;

  const transformed: RGBColor = {
    r: Math.pow(input.r, 1 + weights.r) * (averageColor.r / 255),
    g: Math.pow(input.g, 1 + weights.g) * (averageColor.g / 255),
    b: Math.pow(input.b, 1 + weights.b) * (averageColor.b / 255)
  };

  return {
    r: Math.max(0, Math.min(1, transformed.r)),
    g: Math.max(0, Math.min(1, transformed.g)),
    b: Math.max(0, Math.min(1, transformed.b))
  };
};

export const generateCubeLUT = async (imageData: ImageData): Promise<string> => {
  const lutSize = 32;
  let cubeContent = '';

  const colorTransform = analyzeImageColors(imageData);

  cubeContent += 'TITLE "Generated LUT"\n';
  cubeContent += `# Generated from image analysis\n`;
  cubeContent += `# Average RGB: ${colorTransform.averageColor.r.toFixed(2)}, ${colorTransform.averageColor.g.toFixed(2)}, ${colorTransform.averageColor.b.toFixed(2)}\n`;
  cubeContent += 'LUT_3D_SIZE ' + lutSize + '\n\n';

  for (let b = 0; b < lutSize; b++) {
    for (let g = 0; g < lutSize; g++) {
      for (let r = 0; r < lutSize; r++) {
        const input: RGBColor = {
          r: r / (lutSize - 1),
          g: g / (lutSize - 1),
          b: b / (lutSize - 1)
        };

        const transformed = applyColorTransform(input, colorTransform);
        cubeContent += `${transformed.r.toFixed(6)} ${transformed.g.toFixed(6)} ${transformed.b.toFixed(6)}\n`;
      }
    }
  }

  return cubeContent;
};

export const generateXMPLUT = async (imageData: ImageData): Promise<string> => {
  const colorTransform = analyzeImageColors(imageData);
  const lutSize = 32;
  
  let xmpContent = `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 5.6-c140 79.160451, 2017/05/06-01:08:21">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
      xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/">
      <crs:LookTable>
        <rdf:Seq>
          <rdf:li>
            ${Array(lutSize * lutSize * lutSize).fill(0).map((_, index) => {
              const r = Math.floor(index / (lutSize * lutSize)) / (lutSize - 1);
              const g = Math.floor((index % (lutSize * lutSize)) / lutSize) / (lutSize - 1);
              const b = (index % lutSize) / (lutSize - 1);
              
              const transformed = applyColorTransform({ r, g, b }, colorTransform);
              return `            <rdf:li>${transformed.r.toFixed(6)}, ${transformed.g.toFixed(6)}, ${transformed.b.toFixed(6)}</rdf:li>`;
            }).join('\n')}
          </rdf:li>
        </rdf:Seq>
      </crs:LookTable>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;

  return xmpContent;
};

export const downloadLUT = (content: string, format: 'cube' | 'xmp', filename: string = 'generated_lut') => {
  const sanitizedFilename = filename.replace(/[^a-z0-9-_]/gi, '_').toLowerCase();
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizedFilename}.${format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};