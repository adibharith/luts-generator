import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { generateCubeLUT, generateXMPLUT, downloadLUT } from './utils/lutGenerator';
import { Wand2 } from 'lucide-react';

type ExportFormat = 'cube' | 'xmp';

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('cube');
  const [lutName, setLutName] = useState('my_lut');

  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleGenerateLUT = useCallback(async () => {
    if (!image) return;

    setIsGenerating(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (!imageData) return;

        const lutContent = await (exportFormat === 'cube' 
          ? generateCubeLUT(imageData) 
          : generateXMPLUT(imageData));
        
        downloadLUT(lutContent, exportFormat, lutName);
        setIsGenerating(false);
      };

      img.src = image;
    } catch (error) {
      console.error('Error generating LUT:', error);
      setIsGenerating(false);
    }
  }, [image, exportFormat, lutName]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Generate LUTS</h1>
          <p className="text-lg text-gray-600">
            Upload a photo to generate a LUT file for Adobe Premiere Pro
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {image ? (
            <div className="space-y-6">
              <img
                src={image}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    LUT Name:
                  </label>
                  <input
                    type="text"
                    value={lutName}
                    onChange={(e) => setLutName(e.target.value)}
                    placeholder="Enter LUT name"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Export Format:
                  </label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                  >
                    <option value="cube">.cube (3D LUT)</option>
                    <option value="xmp">.xmp (Adobe)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerateLUT}
                disabled={isGenerating}
                className="w-full py-3 px-6 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wand2 className="w-5 h-5" />
                <span>
                  {isGenerating ? 'Generating LUTS...' : 'Generate LUTS'}
                </span>
              </button>
              
              <button
                onClick={() => setImage(null)}
                className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Upload Different Image
              </button>
            </div>
          ) : (
            <ImageUploader onImageUpload={handleImageUpload} />
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Supported formats: JPEG, PNG</p>
          <p className="mt-1">Export formats: .cube (3D LUT), .xmp (Adobe)</p>
        </div>
      </div>
    </div>
  );
}

export default App;