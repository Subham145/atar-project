import React, { useState } from 'react';
import { base44 } from '@/api/base44Client'; // Keep the same name
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { downloadInsuranceExcel } from '@/lib/insuranceExcel';
import { Download } from 'lucide-react';
import FileUploader from '../components/insurance/FileUploader';
import ProcessingStatus from '../components/insurance/ProcessingStatus';

/**
 * @typedef {{
 *   fileName: string,
 *   status: "processing" | "success" | "error",
 *   errorMessage?: string
 * }} ProcessingResult
 */

export default function InsuranceConverter() {
  const [files, setFiles] = useState(/** @type {File[]} */ ([]));
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResults, setProcessingResults] = useState(/** @type {ProcessingResult[]} */ ([]));
  const [extractedData, setExtractedData] = useState(/** @type {Array<{ [key: string]: any }>} */ ([]));

  const processFiles = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    const results = /** @type {ProcessingResult[]} */ (
      files.map((f) => ({ fileName: f.name, status: 'processing' }))
    );
    setProcessingResults(results);
    const allData = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        try {
          // Using base44 name but it now calls your local server
          const responseData = await base44.integrations.Core.UploadFile({ file });

          const dataWithFile = {
            serial_number: (i + 1).toString(),
            ...responseData,
            source_file: file.name
          };
          
          allData.push(dataWithFile);

          results[i].status = 'success';
        } catch (error) {
          results[i].status = 'error';
          results[i].errorMessage =
            error instanceof Error ? error.message : 'Local server error';
        }
        setProcessingResults([...results]);
      }
    } finally {
      setExtractedData(allData);
      setIsProcessing(false);
      const failedCount = files.length - allData.length;

      if (failedCount === 0) {
        toast({
          title: "Success",
          description: `Processed ${allData.length} files locally.`,
        });
      } else if (allData.length > 0) {
        toast({
          title: "Partial Success",
          description: `Processed ${allData.length} of ${files.length} files. ${failedCount} failed.`,
        });
      } else {
        toast({
          title: "Processing Failed",
          description: "No files were converted. Check the file status for the backend error.",
          variant: "destructive",
        });
      }
    }
  };

  const downloadExcel = () => {
    downloadInsuranceExcel(extractedData, 'insurance_extracted_data.xlsx');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full border border-blue-200">
            <p className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">📤 Upload & Extract</p>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Insurance Policy Converter
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload PDF insurance documents and extract structured data automatically
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold">1</span>
              Upload PDF Files
            </h2>
            <p className="text-gray-600 mt-2">Drag and drop or click to select insurance policy PDFs</p>
          </div>
          
          <FileUploader
            files={files}
            setFiles={setFiles}
            onProcess={processFiles}
            isProcessing={isProcessing}
          />
        </div>

        {/* Processing Status */}
        {processingResults.length > 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20 animate-slide-up">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-6">
              <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold">2</span>
              Processing Status
            </h2>
            <ProcessingStatus results={processingResults} />
          </div>
        )}

        {/* Download Section */}
        {extractedData.length > 0 && !isProcessing && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-xl p-8 border border-green-200 animate-slide-up text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Download className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">✨ Extraction Complete!</h2>
            <p className="text-gray-600 mb-6">Successfully extracted data from {extractedData.length} file(s)</p>
            <Button 
              onClick={downloadExcel} 
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Download className="w-5 h-5 mr-2" />
              Download {extractedData.length} Records to Excel
            </Button>
          </div>
        )}
      </div>

      {/* Add CSS animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
