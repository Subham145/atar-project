import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function Base44ConfigError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-slate-50 px-6">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="h-8 w-8 text-amber-700" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-slate-900">Base44 App Not Configured</h1>
          <p className="mb-6 text-slate-600">
            This frontend is calling Base44 with an empty app ID, so requests are being sent to
            <span className="font-mono text-slate-800"> /api/apps/null/... </span>
            and the API returns "App not found".
          </p>
        </div>

        <div className="space-y-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Fix</p>
          <p>Add your Base44 app ID to the project .env file:</p>
          <pre className="overflow-x-auto rounded-md bg-slate-900 p-3 text-slate-100">
VITE_BASE44_APP_ID=your-base44-app-id
VITE_BASE44_APP_BASE_URL=https://app.base44.com
          </pre>
          <p>
            If you previously opened the app with <span className="font-mono">?app_id=null</span> or a bad value,
            clear that value from local storage and reload.
          </p>
        </div>
      </div>
    </div>
  );
}
