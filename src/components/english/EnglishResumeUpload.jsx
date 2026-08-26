import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  Sparkles, 
  Briefcase, 
  Code, 
  GraduationCap 
} from 'lucide-react';
import api from '../../api';

export const EnglishResumeUpload = ({
  candidate,
  onUploadSuccess,
  onStartInterview,
  showToast
}) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelection = (selectedFile) => {
    if (!selectedFile) return;
    setErrorMsg('');
    const ext = (selectedFile?.name || '').split('.').pop().toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext)) {
      setErrorMsg('Please upload a PDF, DOC, or DOCX resume.');
      return;
    }
    if (selectedFile.size > 15 * 1024 * 1024) {
      setErrorMsg('File size must be under 15MB.');
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) {
      setErrorMsg('Please select a resume file first.');
      return;
    }

    setUploading(true);
    setUploadProgress(15);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      setUploadProgress(45);
      const res = await api.post('/api/english-assessment/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(Math.min(90, Math.max(20, percent)));
          }
        }
      });

      setUploadProgress(100);
      setAnalysisResult(res.data?.analysis || {});
      if (onUploadSuccess) {
        onUploadSuccess(res.data);
      }
      if (showToast) {
        showToast("Resume uploaded and analyzed successfully!");
      }
    } catch (err) {
      console.error("Resume upload error:", err);
      const msg = err.response?.data?.detail || "Failed to upload and analyze resume. Please try again.";
      setErrorMsg(msg);
      if (showToast) {
        showToast(msg);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl"
      >
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-4 border border-indigo-100 dark:border-indigo-800/40 shadow-inner">
            <FileText className="w-7 h-7" />
          </div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800/60 inline-block mb-2">
            Step 1 of 2: Profile Context
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-outfit">
            Upload Your Resume
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            Our AI interviewer analyzes your projects and skills so your 30-minute English Assessment is customized to your actual experience.
          </p>
        </div>

        {/* Upload Box or Analysis Result */}
        {!analysisResult ? (
          <div className="space-y-6">
            {/* Drag & Drop Area */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragOver
                  ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 scale-[1.01]'
                  : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileSelection(e.target.files[0])}
              />

              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-4">
                <UploadCloud className="w-8 h-8" />
              </div>

              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                {file ? file.name : "Click to select or drag and drop your resume"}
              </h4>
              <p className="text-xs text-slate-500 mb-3">
                Supported formats: PDF, DOC, DOCX (Max 15MB)
              </p>

              {file && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Uploading progress state */}
            {uploading && (
              <div className="space-y-2 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    {uploadProgress < 90 ? "Uploading resume..." : "AI analyzing resume projects & skills..."}
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit / Upload Button */}
            <div className="flex justify-end pt-2">
              <button
                disabled={!file || uploading}
                onClick={handleUploadAndAnalyze}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Resume...</span>
                  </>
                ) : (
                  <>
                    <span>Upload & Process Resume</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Resume Analyzed Successfully: Summary View */
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  Resume Analyzed & Indexed
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  {file?.name || "Resume file"} processed successfully.
                </p>
              </div>
            </div>

            {/* Extracted Profile Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Technical Skills */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">
                  <Code className="w-4 h-4 text-indigo-500" />
                  <span>Technical Skills</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(analysisResult.technical_skills || analysisResult.skills || ["Software Development"]).map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-100 dark:border-indigo-800/40"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">
                  <Briefcase className="w-4 h-4 text-purple-500" />
                  <span>Identified Projects</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {(analysisResult.projects && analysisResult.projects.length > 0
                    ? analysisResult.projects
                    : ["Practical Application Project", "System Architecture"]
                  ).slice(0, 3).map((proj, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      <span className="truncate">{typeof proj === "object" ? (proj.name || proj.title || proj.description || "Project") : proj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Summary */}
            {analysisResult.resume_summary && (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  AI Context Overview:
                </span>
                {analysisResult.resume_summary}
              </div>
            )}

            {/* CTA to start AI Interview */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500">
                Ready for your 30-minute AI English Interview
              </span>
              <button
                onClick={onStartInterview}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all duration-200 shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start AI English Interview</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default EnglishResumeUpload;