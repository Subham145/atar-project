import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

/**
 * @typedef {{
 *   files: File[],
 *   setFiles: (files: File[]) => void,
 *   onProcess: () => void,
 *   isProcessing: boolean
 * }} FileUploaderProps
 */

/**
 * @param {FileUploaderProps} props
 */
export default function FileUploader({ files, setFiles, onProcess, isProcessing }) {
  /**
   * @param {import('react').ChangeEvent<HTMLInputElement>} e
   */
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <label htmlFor="pdf-upload" className="cursor-pointer">
          <span className="text-blue-600 hover:text-blue-700 font-medium">
            Click to upload PDFs
          </span>
          <input
            id="pdf-upload"
            type="file"
            multiple
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        <p className="text-sm text-gray-500 mt-2">
          Upload multiple auto insurance PDF files
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-gray-700">
            Selected Files ({files.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
              >
                <span className="text-sm text-gray-700 truncate flex-1">
                  {file.name}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                  disabled={isProcessing}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            onClick={onProcess}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isProcessing ? 'Processing...' : 'Process All PDFs'}
          </Button>
        </div>
      )}
    </div>
  );
}
