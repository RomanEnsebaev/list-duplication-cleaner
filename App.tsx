
import React, { useState, useCallback, useRef } from 'react';
import { processWords, downloadAsFile } from './utils/wordProcessing';
import { ProcessingResult } from './types';
import { Stats } from './components/Stats';

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [results, setResults] = useState<ProcessingResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<'cleaned' | 'deleted'>('cleaned');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [smartDedupe, setSmartDedupe] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputText(content);
    };
    reader.readAsText(file);
  };

  const handleProcess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const res = processWords(inputText, caseSensitive, smartDedupe);
      setResults(res);
      setIsProcessing(false);
    }, 50);
  };

  const handleDownload = () => {
    if (!results) return;
    const content = results.cleanedList.join('\n');
    downloadAsFile(content, 'cleaned_list.txt');
  };

  const clearAll = () => {
    setInputText('');
    setResults(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen pb-12 px-4 md:px-8">
      <header className="max-w-6xl mx-auto pt-10 pb-8 flex flex-col md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Word Deduplicator Pro</h1>
          <p className="text-slate-500 mt-1">Smart processing for massive word lists.</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800">Input Source</h2>
                <button onClick={clearAll} className="text-sm text-slate-400 hover:text-red-500 transition-colors">Clear</button>
              </div>
              
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Upload File</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.csv"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer"
                />
              </div>

              <div className="flex-grow">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Editor</label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Example:
apple
banana
apple banana"
                  className="w-full h-80 lg:h-full min-h-[300px] p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono text-sm text-slate-900 placeholder:text-slate-400 resize-none"
                />
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={caseSensitive}
                      onChange={(e) => setCaseSensitive(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-600">Case sensitive</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={smartDedupe}
                      onChange={(e) => setSmartDedupe(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-600 font-medium">Smart Dedupe (Remove atoms if phrase exists)</span>
                  </label>
                  <p className="text-[10px] text-slate-400 ml-6">Example: If "apple banana" exists, "apple" and "banana" are removed from separate lines.</p>
                </div>
                
                <button
                  disabled={!inputText || isProcessing}
                  onClick={handleProcess}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {isProcessing ? 'Processing...' : 'Remove Duplicates'}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            {!results ? (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900">Ready to clean</h3>
                <p className="mt-2 text-sm text-slate-400">Your processed results will appear here.</p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Stats original={results.originalCount} cleaned={results.cleanedCount} deleted={results.deletedCount} />

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                      <button
                        onClick={() => setViewMode('cleaned')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'cleaned' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        Cleaned List
                      </button>
                      <button
                        onClick={() => setViewMode('deleted')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'deleted' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        Deleted
                      </button>
                    </div>

                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      Download {viewMode === 'cleaned' ? 'Cleaned' : 'Deleted'} (.txt)
                    </button>
                  </div>

                  <div className="p-0 max-h-[600px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-slate-50 shadow-sm">
                        <tr>
                          <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase w-16">#</th>
                          <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(viewMode === 'cleaned' ? results.cleanedList : results.deletedList).slice(0, 1000).map((word, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-3 text-xs font-mono text-slate-400">{idx + 1}</td>
                            <td className={`px-6 py-3 text-sm font-medium ${viewMode === 'deleted' ? 'text-red-500' : 'text-slate-700'}`}>
                              {word}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(viewMode === 'cleaned' ? results.cleanedList : results.deletedList).length > 1000 && (
                      <div className="px-6 py-8 text-center text-slate-400 text-sm">Showing first 1,000 items.</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
