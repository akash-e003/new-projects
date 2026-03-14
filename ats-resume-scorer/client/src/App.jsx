import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, TrendingUp, Info } from 'lucide-react';
import { analyzeResume } from './api';

const App = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please upload a valid PDF file.');
    }
  };

  const handleAnalyze = async () => {
    if (!file || !jobDescription) {
      setError('Please provide both a resume and a job description.');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const data = await analyzeResume(file, jobDescription);
      setResult(data);
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        setError({
          message: err.response.data.error,
          details: err.response.data.details,
          suggestion: err.response.data.suggestion
        });
      } else {
        setError('Failed to analyze resume. Please check if the backend is running and your API key is valid.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">
          ATS <span className="neon-accent">RESUME</span> SCORER
        </h1>
        <p className="text-white/60 max-w-lg mx-auto">
          AI-powered analysis to help you beat the bots and land your dream job.
        </p>
      </motion.div>

      <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Upload className="w-5 h-5 neon-accent" /> Upload Resume
            </h2>
            <div 
              className={`border-2 border-dashed rounded-xl p-8 transition-colors text-center cursor-pointer
                ${file ? 'border-accent/40 bg-accent/5' : 'border-white/10 hover:border-white/20'}`}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <input 
                id="fileInput"
                type="file" 
                accept=".pdf" 
                className="hidden" 
                onChange={handleFileChange}
              />
              <FileText className={`w-12 h-12 mx-auto mb-4 ${file ? 'neon-accent' : 'text-white/20'}`} />
              <p className="text-sm">
                {file ? file.name : 'Click to select PDF resume'}
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 neon-accent" /> Job Description
            </h2>
            <textarea
              className="glass-input w-full h-48 resize-none text-sm"
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="neon-button flex items-center justify-center gap-2"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>Analyze Compatibility <TrendingUp className="w-5 h-5" /></>
            )}
          </motion.button>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs flex flex-col gap-2 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
            >
              <div className="flex items-center gap-2 font-bold uppercase tracking-wider mb-1">
                <AlertCircle className="w-4 h-4" /> {error.message || error}
              </div>
              {error.details && (
                <p className="opacity-70 font-mono text-[10px] bg-red-500/5 p-2 rounded-md border border-red-500/10">
                  {error.details}
                </p>
              )}
              {error.suggestion && (
                <p className="text-white/40 italic text-[10px]">
                  💡 {error.suggestion}
                </p>
              )}
            </motion.div>
          )}
        </div>

        {/* Results Section */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card h-full flex flex-col items-center justify-center text-center text-white/40"
              >
                <div className="w-20 h-20 rounded-full border border-white/5 flex items-center justify-center mb-6">
                  <Info className="w-8 h-8 opacity-20" />
                </div>
                <h3 className="text-lg font-medium mb-2">Awaiting Data</h3>
                <p className="text-sm max-w-[200px]">Upload your resume and the job description to get started.</p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card h-full flex flex-col items-center justify-center text-center"
              >
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
                  <div className="absolute inset-0 border-4 border-accent border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(0,255,136,0.3)]" />
                </div>
                <h3 className="text-lg font-medium neon-accent">Scanning System...</h3>
              </motion.div>
            )}

            {result && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col gap-6"
              >
                {/* Score Counter */}
                <div className="glass-card flex flex-col items-center justify-center">
                  <h3 className="text-white/60 text-sm uppercase font-bold tracking-widest mb-2">Match Score</h3>
                  <div className="text-7xl font-black neon-accent">
                    <AnimatedNumber value={result.score} />
                    <span className="text-3xl opacity-50">%</span>
                  </div>
                </div>

                {/* Keywords */}
                <div className="glass-card">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" /> Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {result.matched.map((kw, i) => (
                      <span key={i} className="text-[10px] md:text-xs px-2 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-md font-bold uppercase tracking-wider">
                        {kw}
                      </span>
                    ))}
                  </div>
                  
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400" /> Missing
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.missing.map((kw, i) => (
                      <span key={i} className="text-[10px] md:text-xs px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md font-bold uppercase tracking-wider">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div className="glass-card">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 neon-accent" /> Improvement Tips
                  </h3>
                  <ul className="flex flex-col gap-3">
                    {result.tips.map((tip, i) => (
                      <li key={i} className="text-sm text-white/80 pl-4 border-l-2 border-accent/20">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="mt-20 text-white/20 text-[10px] uppercase tracking-widest">
        &copy; 2026 AI Resume Analysis Engine // Production Grade
      </footer>
    </div>
  );
};

const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (start === end) return;

    let totalDuration = 1000;
    let incrementTime = (totalDuration / end);

    let timer = setInterval(() => {
      start += 1;
      setDisplayValue(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}</span>;
};

export default App;
