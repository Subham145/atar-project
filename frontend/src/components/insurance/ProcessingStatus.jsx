import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

/**
 * @typedef {{
 *   fileName: string,
 *   status: "processing" | "success" | "error",
 *   errorMessage?: string
 * }} ProcessingResult
 */

/**
 * @typedef {{
 *   results: ProcessingResult[]
 * }} ProcessingStatusProps
 */

/**
 * @param {ProcessingStatusProps} props
 */
export default function ProcessingStatus({ results }) {
  if (results.length === 0) return null;

  const completed = results.filter(r => r.status !== 'processing').length;
  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'error').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Processing Status</span>
          <span className="text-sm font-normal text-gray-600">
            {completed}/{results.length} completed
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {results.map((result, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-gray-700">
                  {result.fileName}
                </p>
                {result.errorMessage && (
                  <p className="mt-1 text-xs text-red-600">
                    {result.errorMessage}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {result.status === 'processing' && (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                )}
                {result.status === 'success' && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                {result.status === 'error' && (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
          ))}
        </div>
        {completed === results.length && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              ✓ Successfully processed: {successful} files
              {failed > 0 && ` • Failed: ${failed} files`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
