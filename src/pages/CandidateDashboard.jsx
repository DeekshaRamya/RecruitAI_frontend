import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Editor from '@monaco-editor/react';
import logo from '../assets/systech.jpg';
import api from '../api';
import ActionButton from '../components/ActionButton';
import { useExamSecurity } from '../hooks/useExamSecurity';
import { ExamSecurityMonitor } from '../components/ExamSecurityMonitor';
import {
  Briefcase,
  LogOut,
  Menu,
  X,
  FileText,
  Award,
  TrendingUp,
  Volume2,
  Terminal,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight,
  ChevronLeft,
  UploadCloud,
  Play,
  Bell,
  Check,
  Loader2,
  Eye,
  Maximize2,
  Minimize2,
  RotateCcw,
  Code,
  Database,
  Table,
  Key,
  Send,
  Mic,
  MicOff,
  VolumeX,
  ShieldAlert,
  Lock,
  ListOrdered,
  Flag,
  HelpCircle,
  Edit3,
  Copy
} from 'lucide-react';

const MAX_QUESTIONS = 8;

const getAptitudeOutputFormat = (q) => {
  if (!q) return null;
  const subj = (q.subject || '').toUpperCase();
  const type = (q.type || '').toUpperCase();
  if (subj === 'PYTHON' || subj === 'PY' || type === 'CODING' || type === 'PYTHON_CODING' || type === 'SCENARIO_CODING') {
    return null;
  }
  let rawFmt = q.outputFormat || q.output_format || q.output_fmt;

  if (!rawFmt && q.problemStatement && typeof q.problemStatement === 'string' && q.problemStatement.includes("Output Format:")) {
    const parts = q.problemStatement.split(/Output Format:/i);
    if (parts.length > 1) {
      rawFmt = parts[1].trim();
    }
  }
  if (!rawFmt && q.question && typeof q.question === 'string' && q.question.includes("Output Format:")) {
    const parts = q.question.split(/Output Format:/i);
    if (parts.length > 1) {
      rawFmt = parts[1].trim();
    }
  }

  // Clean rawFmt if present to extract ONLY the answer data type
  if (rawFmt && typeof rawFmt === 'string' && rawFmt.trim()) {
    let clean = rawFmt.trim();
    if (clean.includes("Output Format:")) {
      clean = clean.split("Output Format:").pop().trim();
    }
    clean = clean.split('\n')[0].replace(/^[-*•\s]+/, '').replace(/^(Return a|Return an|Return)\s+/i, '').replace(/[\.:]$/, '').trim();
    if (clean) {
      const lower = clean.toLowerCase();
      if (lower.includes('int')) return 'Integer';
      if (lower.includes('dec')) return 'Decimal';
      if (lower.includes('percent')) return 'Percentage';
      if (lower.includes('fraction')) return 'Fraction';
      if (lower.includes('ratio')) return 'Ratio';
      if (lower.includes('time') || lower.includes('durat')) return 'Time';
      if (lower.includes('curr')) return 'Currency';
      if (lower.includes('bool')) return 'Boolean';
      if (lower.includes('str') || lower.includes('text')) return 'String';
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    }
  }

  // Dynamically analyze expectedAnswer to derive answer data type
  const expStr = String(q.expectedAnswer || q.correctAnswer || q.answer || '').trim();
  const topic = (q.topic || q.subject || '').toLowerCase();
  const isAptitude = topic.includes('aptitude') || (q.subject || '').toUpperCase() === 'APTITUDE';
  const isScenario = !q.options || !Array.isArray(q.options) || q.options.length === 0;

  if (isAptitude && isScenario) {
    if (expStr) {
      const expClean = expStr.replace(/,/g, '').trim();
      const expLower = expClean.toLowerCase();

      if (['true', 'false', 'yes', 'no'].includes(expLower)) {
        return 'Boolean';
      }
      if (/\b\d+\s*\/\s*\d+\b/.test(expClean)) {
        return 'Fraction';
      }
      if (expClean.includes(':') || /\b\d+\s*:\s*\d+\b/.test(expClean)) {
        return 'Ratio';
      }
      if (expStr.includes('%') || topic.includes('percentage') || topic.includes('profit')) {
        return 'Percentage';
      }
      if (/[\$,₹,€,£]/.test(expStr) || topic.includes('cost') || topic.includes('price') || topic.includes('salary')) {
        return 'Currency';
      }
      if (/\b(day|days|hour|hours|min|minute|minutes|sec|second|seconds|year|years)\b/i.test(expStr)) {
        return 'Time';
      }
      if (/\d/.test(expClean)) {
        const numClean = expClean.replace(/[^\d\.]/g, '');
        if (numClean.includes('.')) {
          const val = parseFloat(numClean);
          if (!isNaN(val) && val % 1 !== 0) {
            return 'Decimal';
          }
        }
        return 'Integer';
      }
    }

    const ansType = (q.answerType || '').toUpperCase();
    if (ansType === 'NUMBER') {
      return 'Integer';
    }
    return 'String';
  }
  return null;
};

const DatabaseSchemaVisualizer = ({ schemaLines, dataLines, liveSchemaMap }) => {
  const [parsedTables, setParsedTables] = React.useState([]);
  const [activeTableIdx, setActiveTableIdx] = React.useState(0);
  const [viewMode, setViewMode] = React.useState('schema'); // 'schema' | 'data'

  React.useEffect(() => {
    if (!schemaLines && !dataLines) {
      setParsedTables([]);
      return;
    }

    const tables = {};

    if (schemaLines && Array.isArray(schemaLines)) {
      schemaLines.forEach(sql => {
        const cleaned = sql.replace(/\s+/g, ' ').trim();
        const match = cleaned.match(/(?:CREATE\s+TABLE|--\s*Schema\s*table:?)\s+([a-zA-Z0-9_.\-\[\]]+)\s*\((.*)\)/i);
        if (match) {
          const tableName = match[1];
          const columnsText = match[2];

          const columns = [];
          let current = "";
          let parenCount = 0;
          for (let i = 0; i < columnsText.length; i++) {
            const char = columnsText[i];
            if (char === '(') parenCount++;
            if (char === ')') parenCount--;
            if (char === ',' && parenCount === 0) {
              columns.push(current.trim());
              current = "";
            } else {
              current += char;
            }
          }
          if (current.trim()) {
            columns.push(current.trim());
          }

          const parsedColumns = columns.map(col => {
            const parts = col.trim().split(/\s+/);
            const name = parts[0];
            let type = parts[1] || "";
            if (type.toUpperCase().startsWith("DECIMAL") || type.toUpperCase().startsWith("VARCHAR") || type.toUpperCase().startsWith("NUMERIC")) {
              const typeMatch = col.match(/(VARCHAR\s*\([^)]+\)|DECIMAL\s*\([^)]+\)|NUMERIC\s*\([^)]+\))/i);
              if (typeMatch) {
                type = typeMatch[1];
              }
            }
            const isPrimaryKey = col.toUpperCase().includes("PRIMARY KEY") || col.toUpperCase().includes(" PK");
            const isForeignKey = col.toUpperCase().includes("REFERENCES") || col.toUpperCase().includes(" FK");

            return { name, type, isPrimaryKey, isForeignKey };
          }).filter(c => c.name);

          let finalColumns = parsedColumns;
          if (liveSchemaMap && liveSchemaMap[tableName] && Array.isArray(liveSchemaMap[tableName].columns) && liveSchemaMap[tableName].columns.length > 0) {
            finalColumns = liveSchemaMap[tableName].columns.map(c => ({
              name: c.name,
              type: c.type,
              isPrimaryKey: c.is_pk || c.isPrimaryKey || false,
              isForeignKey: c.name.toLowerCase().includes('id') && !c.is_pk
            }));
          }

          tables[tableName] = {
            name: tableName,
            columns: finalColumns,
            rows: []
          };
        }
      });
    }

    if (dataLines && Array.isArray(dataLines)) {
      dataLines.forEach(sql => {
        const cleaned = sql.replace(/\s+/g, ' ').trim();
        const match = cleaned.match(/INSERT\s+INTO\s+([a-zA-Z0-9_.\-\[\]]+)\s+(?:VALUES\s*)?\((.*)\);?/i);
        if (match) {
          const tableName = match[1];

          if (tables[tableName]) {
            const rowsRaw = [];
            const valuesIndex = cleaned.toUpperCase().indexOf("VALUES");
            if (valuesIndex !== -1) {
              const afterValues = cleaned.substring(valuesIndex + 6).trim();
              let tuple = "";
              let inTuple = false;
              for (let i = 0; i < afterValues.length; i++) {
                const char = afterValues[i];
                if (char === '(') {
                  inTuple = true;
                  tuple = "";
                } else if (char === ')') {
                  inTuple = false;
                  rowsRaw.push(tuple);
                } else if (inTuple) {
                  tuple += char;
                }
              }
            } else {
              rowsRaw.push(match[2]);
            }

            rowsRaw.forEach(rowStr => {
              const rowValues = [];
              let curVal = "";
              let insideQuotes = false;
              for (let i = 0; i < rowStr.length; i++) {
                const char = rowStr[i];
                if (char === "'") {
                  insideQuotes = !insideQuotes;
                } else if (char === ',' && !insideQuotes) {
                  rowValues.push(curVal.trim().replace(/^'|'$/g, ''));
                  curVal = "";
                } else {
                  curVal += char;
                }
              }
              if (curVal.trim()) {
                rowValues.push(curVal.trim().replace(/^'|'$/g, ''));
              }
              tables[tableName].rows.push(rowValues);
            });
          }
        }
      });
    }

    setParsedTables(Object.values(tables));
    setActiveTableIdx(0);
  }, [schemaLines, dataLines, liveSchemaMap]);

  if (parsedTables.length === 0) {
    // If we have raw schemas/data but parser couldn't read them, show raw text
    if ((schemaLines && schemaLines.length > 0) || (dataLines && dataLines.length > 0)) {
      return (
        <div className="mt-4 flex flex-col gap-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Database size={16} className="text-dash-primary-purple" />
            <h4 className="text-xs font-bold text-dash-dark-purple uppercase tracking-wider">Database Tables Info</h4>
          </div>
          {schemaLines && schemaLines.length > 0 && (
            <div>
              <span className="block font-bold text-slate-400 uppercase tracking-wider text-[9px] mb-1">Schema Definition:</span>
              <pre className="text-xs font-mono font-semibold text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 overflow-x-auto whitespace-pre-wrap">
                {schemaLines.join('\n\n')}
              </pre>
            </div>
          )}
          {dataLines && dataLines.length > 0 && (
            <div>
              <span className="block font-bold text-slate-400 uppercase tracking-wider text-[9px] mb-1">Sample Data:</span>
              <pre className="text-xs font-mono font-semibold text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 overflow-x-auto whitespace-pre-wrap">
                {dataLines.join('\n\n')}
              </pre>
            </div>
          )}
        </div>
      );
    }
    return null;
  }

  const activeTable = parsedTables[activeTableIdx];

  return (
    <div className="mt-4 flex flex-col gap-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm select-text">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Database size={16} className="text-dash-primary-purple" />
          <h4 className="text-xs font-bold text-dash-dark-purple uppercase tracking-wider">Required Tables</h4>
        </div>

        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/40">
          <button
            type="button"
            onClick={() => setViewMode('schema')}
            className={`px-3 py-1 text-[10px] font-extrabold uppercase rounded-md tracking-wider transition-all cursor-pointer border-0 ${viewMode === 'schema'
              ? 'bg-white text-dash-dark-purple shadow-sm'
              : 'text-slate-500 hover:text-slate-700 bg-transparent'
              }`}
          >
            Schema
          </button>
          <button
            type="button"
            onClick={() => setViewMode('data')}
            className={`px-3 py-1 text-[10px] font-extrabold uppercase rounded-md tracking-wider transition-all cursor-pointer border-0 ${viewMode === 'data'
              ? 'bg-white text-dash-dark-purple shadow-sm'
              : 'text-slate-500 hover:text-slate-700 bg-transparent'
              }`}
          >
            Sample Data
          </button>
        </div>
      </div>

      {parsedTables.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          {parsedTables.map((tbl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveTableIdx(i)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${activeTableIdx === i
                ? 'bg-dash-primary-purple/10 border-dash-primary-purple text-dash-primary-purple'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
            >
              <Table size={12} />
              <span>{tbl.name}</span>
            </button>
          ))}
        </div>
      )}

      {activeTable && (
        <div className="mt-1 flex flex-col gap-2">
          {parsedTables.length >= 1 && (
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold text-slate-700 py-1">
              <div className="flex items-center gap-1.5 bg-purple-50 text-purple-900 px-3 py-1 rounded-lg border border-purple-200/60 font-mono shadow-2xs">
                <Database size={13} className="text-purple-600" />
                <span className="text-[10px] text-purple-500 uppercase tracking-wider font-extrabold mr-0.5">Schema:</span>
                <span>{activeTable.name.includes('.') ? activeTable.name.split('.')[0] : 'dbo'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-900 px-3 py-1 rounded-lg border border-indigo-200/60 font-mono shadow-2xs">
                <Table size={13} className="text-indigo-600" />
                <span className="text-[10px] text-indigo-500 uppercase tracking-wider font-extrabold mr-0.5">Table:</span>
                <span>{activeTable.name.includes('.') ? activeTable.name.split('.')[1] : activeTable.name}</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 font-normal">({activeTable.name})</span>
            </div>
          )}

          {viewMode === 'schema' ? (
            <div className="overflow-x-auto overflow-y-auto max-h-[260px] rounded-xl border border-slate-200/60 dashboard-scrollbar">
              <table className="min-w-full divide-y divide-slate-200/60 text-left text-xs text-slate-700">
                <thead className="bg-slate-50 font-bold uppercase tracking-wider text-[9px] text-slate-400 sticky top-0 z-10 shadow-xs">
                  <tr>
                    <th className="px-4 py-2">Column</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2 text-right">Key</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white font-medium">
                  {activeTable.columns.map((col, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 font-semibold font-mono text-slate-855">{col.name}</td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-slate-500">{col.type}</td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap">
                        {col.isPrimaryKey && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-200/50">
                            <Key size={8} /> PK
                          </span>
                        )}
                        {col.isForeignKey && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-200/50 ml-1">
                            FK
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200/60 max-h-[220px]">
              {activeTable.rows.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">No sample rows available.</div>
              ) : (
                <table className="min-w-full divide-y divide-slate-200/60 text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 font-bold uppercase tracking-wider text-[9px] text-slate-400 sticky top-0">
                    <tr>
                      {activeTable.columns.map((col, idx) => (
                        <th key={idx} className="px-4 py-2">{col.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white font-mono text-[11px] text-slate-650">
                    {activeTable.rows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-slate-50/50">
                        {row.map((val, valIdx) => (
                          <td key={valIdx} className="px-4 py-2.5 whitespace-nowrap">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ExpectedOutputTable = React.memo(({ rawOutput }) => {
  if (!rawOutput) return null;

  const lines = rawOutput.split('\n').map(l => l.trim()).filter(Boolean);
  const tableLines = lines.filter(l => l.startsWith('|') || (l.includes('|') && !l.toLowerCase().includes('showing')));

  let recordCountText = "";
  const countLine = lines.find(l => l.toLowerCase().includes('showing') || l.toLowerCase().includes('records returned') || l.toLowerCase().includes('top'));
  if (countLine) {
    recordCountText = countLine.replace(/[*#]/g, '').trim();
  }

  if (tableLines.length >= 2) {
    const headerCells = tableLines[0]
      .split('|')
      .map(cell => cell.trim())
      .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

    const dataRows = [];
    for (let i = 1; i < tableLines.length; i++) {
      const line = tableLines[i];
      if (/^[|:\- \t]+$/.test(line) || line.includes('---')) continue;
      const rowCells = line
        .split('|')
        .map(cell => cell.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (rowCells.length > 0) {
        dataRows.push(rowCells);
      }
    }

    if (headerCells.length > 0) {
      const displayFooterText = recordCountText || `Showing ${dataRows.length} of ${dataRows.length} returned records`;

      return (
        <div className="mt-3 flex flex-col bg-[#111111] border border-zinc-800 rounded-xl overflow-hidden shadow-inner text-white select-text font-mono text-xs">
          <div className="bg-[#171717] px-3.5 py-2 border-b border-zinc-800 flex items-center justify-between shrink-0">
            <span className="text-emerald-400 font-bold font-sans text-[11px] flex items-center gap-1.5 uppercase tracking-wider">
              <Table size={13} className="text-emerald-400" />
              <span>Expected Output (Table Format)</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-mono font-semibold">SQL Data Table</span>
          </div>
          <div className="overflow-x-auto overflow-y-auto max-h-[220px] scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
            <table className="min-w-full divide-y divide-zinc-800/80 text-left text-xs text-zinc-200 border-collapse">
              <thead className="bg-[#1a1a1a] font-extrabold uppercase tracking-wider text-[10px] text-zinc-400 sticky top-0 z-10 shadow-xs">
                <tr>
                  <th className="px-3 py-2 text-zinc-500 w-10 text-center bg-[#1a1a1a] border-r border-zinc-800/60 font-sans">#</th>
                  {headerCells.map((col, idx) => (
                    <th key={idx} className="px-3.5 py-2 whitespace-nowrap text-dash-primary-purple font-mono border-r border-zinc-800/40 last:border-0 bg-[#1a1a1a]">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 font-mono text-[11px] bg-[#111111]">
                {dataRows.length > 0 ? (
                  dataRows.map((row, rowIdx) => (
                    <tr key={rowIdx} className={`transition-colors hover:bg-zinc-800/80 ${rowIdx % 2 === 0 ? 'bg-[#121212]' : 'bg-[#181818]'}`}>
                      <td className="px-3 py-1.5 text-zinc-500 font-sans text-[10px] text-center bg-zinc-900/60 border-r border-zinc-800/60 font-bold">
                        {rowIdx + 1}
                      </td>
                      {headerCells.map((_, colIdx) => {
                        const val = row[colIdx] !== undefined ? row[colIdx] : "NULL";
                        const isNull = val === "NULL" || val === "" || val.toLowerCase() === "null";
                        return (
                          <td key={colIdx} className="px-3.5 py-1.5 whitespace-nowrap text-zinc-200 border-r border-zinc-800/30 last:border-0">
                            {isNull ? <em className="text-zinc-500 font-sans italic font-semibold">NULL</em> : val}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={headerCells.length + 1} className="px-4 py-6 text-center text-zinc-500 font-sans italic text-xs">
                      No records generated for sample output.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-[#171717] px-3.5 py-2 border-t border-zinc-800 text-zinc-400 text-[11px] font-sans font-semibold flex items-center justify-between shrink-0">
            <span>{displayFooterText}</span>
            <span className="text-emerald-400 font-mono text-[10px] uppercase font-extrabold tracking-wide bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
              Target Schema Matched
            </span>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="mt-3 bg-[#111111] border border-zinc-800 rounded-xl p-3.5 text-white shadow-inner">
      <span className="block font-extrabold text-zinc-400 uppercase tracking-wider text-[10px] mb-1.5 flex items-center gap-1.5">
        <Table size={13} className="text-emerald-400" />
        <span>Expected Output Format:</span>
      </span>
      <pre className="text-xs font-mono font-semibold text-zinc-300 bg-zinc-900 p-2.5 rounded border border-zinc-800 overflow-x-auto whitespace-pre-wrap max-h-[220px] overflow-y-auto scrollbar-thin">
        {rawOutput}
      </pre>
    </div>
  );
});

const QuestionCard = React.memo(({
  question,
  isSql,
  isCoding,
  liveSchemaMap,
  hasPrev,
  hasNext,
  goToQuestion,
  currentIdx,
  totalQuestions,
  toggleFlag,
  isFlagged,
  onOpenSubmitModal
}) => {
  if (!question) return null;

  return (
    <div className="flex flex-col justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 select-text max-h-[660px] h-[660px] shadow-xs">
      <div className="flex flex-col gap-3 overflow-y-auto pr-1 dashboard-scrollbar flex-1">
        {/* Header with Q Index & Flag toggle */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-dash-dark-purple flex items-center gap-2">
              {isSql ? <Database size={16} className="text-dash-primary-purple" /> : <Code size={16} className="text-indigo-600" />}
              <span>{isSql ? 'SQL Assessment Question' : 'Coding Challenge'}</span>
            </span>
            {totalQuestions && (
              <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 uppercase shadow-2xs">
                Q{currentIdx + 1} of {totalQuestions}
              </span>
            )}
          </div>

          {toggleFlag && (
            <button
              type="button"
              onClick={toggleFlag}
              className={`px-2.5 py-1 rounded-xl border text-[11px] font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${isFlagged
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 shadow-2xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
            >
              <Flag size={12} className={isFlagged ? "fill-amber-500 text-amber-500" : ""} />
              <span>{isFlagged ? 'Flagged' : 'Flag Question'}</span>
            </button>
          )}
        </div>

        {isSql ? (
          <div className="flex flex-col gap-3">
            {question.scenario && (
              <div>
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Scenario Context</h4>
                <p className="text-xs font-semibold text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 border border-slate-200/60 rounded-xl p-3 shadow-2xs">
                  {question.scenario}
                </p>
              </div>
            )}

            <div>
              <h4 className="text-xs font-extrabold text-dash-primary-purple uppercase tracking-wider mb-1.5">Problem Statement & Task</h4>
              <p className="text-sm font-extrabold text-slate-900 leading-relaxed whitespace-pre-wrap bg-indigo-50/40 border border-purple-100 rounded-xl p-3.5 shadow-2xs">
                {question.question || question.problemStatement}
              </p>
            </div>

            {question.constraints && question.constraints.length > 0 && (
              <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-3">
                <h4 className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider mb-1">Constraints & Requirements</h4>
                <ul className="list-disc pl-4 text-xs font-semibold text-amber-900 space-y-1">
                  {question.constraints.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}

            <DatabaseSchemaVisualizer
              schemaLines={question.databaseSchema}
              dataLines={question.sampleData}
              liveSchemaMap={liveSchemaMap}
            />

            <ExpectedOutputTable rawOutput={question.expectedOutput || question.exampleOutput} />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {question.scenario && (
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 shadow-2xs">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Scenario Context</h4>
                <p className="text-xs font-semibold text-slate-700 leading-relaxed whitespace-pre-line">
                  {question.scenario}
                </p>
              </div>
            )}
            <div>
              <h4 className="text-xs font-extrabold text-dash-primary-purple uppercase tracking-wider mb-1.5">Problem Description</h4>
              <p className="text-sm font-extrabold text-slate-900 leading-relaxed whitespace-pre-wrap bg-indigo-50/40 border border-purple-100 rounded-xl p-3.5 shadow-2xs">
                {question.question || question.problemStatement || question.title}
              </p>
            </div>
            {(question.function_name || question.functionName) && (
              <div className="bg-purple-50/70 border border-purple-200/50 rounded-xl p-2.5 flex items-center gap-2">
                <Code size={14} className="text-dash-primary-purple shrink-0" />
                <span className="text-xs font-bold text-dash-dark-purple">
                  Expected Function: <code className="font-mono text-purple-700 font-extrabold bg-white px-2 py-0.5 rounded border border-purple-200/50">{question.function_name || question.functionName}(...)</code>
                </span>
              </div>
            )}
            {question.inputFormat && (
              <div>
                <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Input Format</h4>
                <p className="text-xs font-medium text-slate-600 leading-normal">{question.inputFormat}</p>
              </div>
            )}
            {(() => {
              const fmt = getAptitudeOutputFormat(question);
              return fmt ? (
                <div>
                  <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Output Format</h4>
                  <span className="inline-block text-xs font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 rounded-lg shadow-2xs">
                    {fmt}
                  </span>
                </div>
              ) : null;
            })()}
            {question.constraints && question.constraints.length > 0 && (
              <div>
                <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Constraints</h4>
                <ul className="list-disc pl-4 text-xs font-medium text-slate-600 space-y-1">
                  {question.constraints.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 shadow-2xs">
                <span className="block font-bold text-slate-400 uppercase tracking-wider text-[9px] mb-1">Sample Input:</span>
                <pre className="text-xs font-mono font-semibold text-slate-700 bg-white p-2 rounded border border-slate-200/60 overflow-x-auto whitespace-pre-wrap">{question.sampleInput || question.exampleInput || "No input."}</pre>
              </div>
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 shadow-2xs">
                <span className="block font-bold text-slate-400 uppercase tracking-wider text-[9px] mb-1">Sample Output:</span>
                <pre className="text-xs font-mono font-semibold text-slate-700 bg-white p-2 rounded border border-slate-200/60 overflow-x-auto whitespace-pre-wrap">{question.sampleOutput || question.exampleOutput || "No output."}</pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QUESTION CONTAINER NAVIGATION FOOTER */}
      {goToQuestion && (
        <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => goToQuestion(currentIdx - 1)}
            disabled={!hasPrev}
            className={`px-4 py-2 rounded-xl border font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${hasPrev
              ? 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200 hover:scale-[1.01]'
              : 'opacity-40 cursor-not-allowed text-slate-400 border-slate-200 bg-slate-50'
              }`}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            {currentIdx + 1} of {totalQuestions}
          </span>

          {hasNext ? (
            <button
              type="button"
              onClick={() => goToQuestion(currentIdx + 1)}
              className="px-4 py-2 rounded-xl bg-dash-primary-purple hover:bg-dash-dark-purple text-white font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer border-0 shadow-xs hover:scale-[1.01]"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenSubmitModal && onOpenSubmitModal()}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer border-0 shadow-xs hover:scale-[1.01]"
            >
              <CheckCircle2 size={15} />
              <span>Finish</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
});

const getSqlDefaultStarter = (q) => {
  return "-- Write your SQL query here";
};

const getPythonStarter = (q) => {
  if (!q) return "";

  // 1. Direct starterCode or starter_code check
  const directStarter = q.starterCode || q.starter_code;
  if (directStarter && typeof directStarter === 'string' && directStarter.trim().startsWith('def ')) {
    return directStarter.trim();
  }

  // 2. Aggregate all possible text sources
  const fullText = `${q.starterCode || ''}\n${q.starter_code || ''}\n${q.functionSignature || ''}\n${q.function_signature || ''}\n${q.task || ''}\n${q.candidateTask || ''}\n${q.question || ''}\n${q.problemStatement || ''}`;

  // Match `def func_name(params)`
  let match = fullText.match(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)/);
  if (match) {
    return `def ${match[1]}(${match[2].trim()}):\n    pass`;
  }

  // Match `function `func_name(params)`` or `function func_name(params)`
  match = fullText.match(/function\s+`?([a-zA-Z_][a-zA-Z0-9_]*)`?\s*\(([^)]*)\)/i);
  if (match && !['python', 'write', 'def'].includes(match[1].toLowerCase())) {
    return `def ${match[1]}(${match[2].trim()}):\n    pass`;
  }

  // Match `func_name(params)` in backticks
  match = fullText.match(/`([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)`/);
  if (match) {
    return `def ${match[1]}(${match[2].trim()}):\n    pass`;
  }

  // Match general `func_name(params)`
  match = fullText.match(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]+)\)/);
  if (match) {
    const fn = match[1];
    const banned = new Set(['function', 'python', 'def', 'write', 'takes', 'returns', 'given', 'that', 'and', 'a', 'an', 'the', 'if', 'return', 'pass']);
    if (!banned.has(fn.toLowerCase())) {
      return `def ${fn}(${match[2].trim()}):\n    pass`;
    }
  }

  // Dynamic fallback based on topic/title
  const topicName = String(q.topic || q.title || 'solution').toLowerCase();
  const cleanWords = topicName.replace(/[^a-zA-Z0-9_\s]/g, '').split(/\s+/).filter(w => w.length > 2 && !['python', 'coding', 'challenge', 'task', 'section'].includes(w));
  const derivedFn = cleanWords.length > 0 ? cleanWords.slice(0, 3).join('_') : (q.functionName || 'solution');

  return `def ${derivedFn}(numbers):\n    pass`;
};

const getDynamicStarterForQuestion = (q) => {
  if (!q) return "";

  const typeUpper = String(q.type || q.question_type || '').toUpperCase().trim();
  const subjLower = String(q.subject || q.topic || q.language || '').toLowerCase().trim();
  const qHasOpts = Array.isArray(q.options) && q.options.length > 0;

  if (typeUpper === 'MCQ' || qHasOpts || subjLower.includes('aptitude') || typeUpper.includes('APTITUDE')) {
    return '';
  }

  // 1. Explicit Python check takes priority
  if (subjLower.includes('python') || subjLower.includes('coding') || typeUpper.includes('PYTHON') || typeUpper.includes('CODING')) {
    return getPythonStarter(q);
  }

  // 2. Explicit SQL check
  if (subjLower.includes('sql') || typeUpper.includes('SQL')) {
    return getSqlDefaultStarter(q);
  }

  // 3. Fallback based on question metadata
  if (q.starterCode && String(q.starterCode).includes('def ')) {
    return getPythonStarter(q);
  }
  if (q.starterCode && String(q.starterCode).includes('-- Write your SQL')) {
    return getSqlDefaultStarter(q);
  }

  return getPythonStarter(q);
};

const PythonCodeBlock = React.memo(({ code }) => {
  const renderSyntaxHighlighted = (rawCode) => {
    if (!rawCode) return null;
    const lines = rawCode.split('\n');

    const keywords = new Set([
      'def', 'return', 'if', 'else', 'elif', 'for', 'while', 'in', 'import', 'from',
      'as', 'class', 'try', 'except', 'finally', 'with', 'lambda', 'pass', 'break',
      'continue', 'True', 'False', 'None', 'and', 'or', 'not', 'is', 'raise',
      'yield', 'global', 'nonlocal', 'assert'
    ]);

    const builtins = new Set([
      'print', 'len', 'range', 'type', 'str', 'int', 'float', 'list', 'dict',
      'set', 'tuple', 'sum', 'max', 'min', 'sorted', 'enumerate', 'zip', 'input',
      'open', 'isinstance', 'abs', 'all', 'any', 'map', 'filter', 'append'
    ]);

    return lines.map((line, lineIdx) => {
      let commentIdx = -1;
      let inSingle = false;
      let inDouble = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === "'" && !inDouble && (i === 0 || line[i - 1] !== '\\')) {
          inSingle = !inSingle;
        } else if (char === '"' && !inSingle && (i === 0 || line[i - 1] !== '\\')) {
          inDouble = !inDouble;
        } else if (char === '#' && !inSingle && !inDouble) {
          commentIdx = i;
          break;
        }
      }

      let codePart = commentIdx !== -1 ? line.slice(0, commentIdx) : line;
      let commentPart = commentIdx !== -1 ? line.slice(commentIdx) : '';

      const tokens = [];
      const regex = /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b\d+(?:\.\d+)?\b|\b[a-zA-Z_][a-zA-Z0-9_]*\b|[==|!=|<=|>=|\+|\-|\*|\/|\%|=|<|>|:|\(|\)|\[|\]|\{|\}|,]+|\s+|[^\s\w])/g;

      let match;
      let lastDef = false;

      while ((match = regex.exec(codePart)) !== null) {
        const token = match[0];

        if (token.startsWith('"') || token.startsWith("'")) {
          tokens.push(<span key={tokens.length} className="text-[#ce9178]">{token}</span>);
          lastDef = false;
        } else if (/^\d+(?:\.\d+)?$/.test(token)) {
          tokens.push(<span key={tokens.length} className="text-[#b5cea8]">{token}</span>);
          lastDef = false;
        } else if (keywords.has(token)) {
          tokens.push(<span key={tokens.length} className="text-[#569cd6] font-bold">{token}</span>);
          if (token === 'def' || token === 'class') {
            lastDef = true;
          } else {
            lastDef = false;
          }
        } else if (builtins.has(token)) {
          tokens.push(<span key={tokens.length} className="text-[#4ec9b0]">{token}</span>);
          lastDef = false;
        } else if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(token)) {
          if (lastDef) {
            tokens.push(<span key={tokens.length} className="text-[#dcdcaa] font-bold">{token}</span>);
            lastDef = false;
          } else {
            tokens.push(<span key={tokens.length} className="text-[#9cdcfe]">{token}</span>);
          }
        } else if (/^[==|!=|<=|>=|\+|\-|\*|\/|\%|=|<|>|:]+$/.test(token)) {
          tokens.push(<span key={tokens.length} className="text-[#d4d4d4]">{token}</span>);
          lastDef = false;
        } else {
          tokens.push(<span key={tokens.length} className="text-[#d4d4d4]">{token}</span>);
          if (token.trim() !== '') lastDef = false;
        }
      }

      return (
        <div key={lineIdx} className="table-row">
          <span className="table-cell select-none pr-3 text-right text-zinc-600 font-mono text-xs w-7 border-r border-zinc-800/60 font-medium">
            {lineIdx + 1}
          </span>
          <span className="table-cell pl-3.5 whitespace-pre font-mono text-xs text-zinc-200">
            {tokens}
            {commentPart && <span className="text-[#6a9955] italic font-mono">{commentPart}</span>}
          </span>
        </div>
      );
    });
  };

  return (
    <div className="my-3.5 w-full rounded-xl overflow-hidden border border-zinc-800 bg-[#1e1e1e] shadow-lg text-left font-mono">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#181818] border-b border-zinc-800 text-xs select-none">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <span className="text-[10px] font-mono font-extrabold text-amber-400 bg-amber-950/70 border border-amber-800/60 px-2 py-0.5 rounded-md shadow-2xs flex items-center gap-1 uppercase tracking-wider">
            <Code size={11} className="text-amber-400" />
            Python
          </span>
        </div>
      </div>

      <div className="p-3 overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900 bg-[#1e1e1e] text-xs">
        <div className="table w-full border-collapse">
          {renderSyntaxHighlighted(code)}
        </div>
      </div>
    </div>
  );
});

const FormattedQuestionText = React.memo(({ text }) => {
  if (!text || typeof text !== 'string') return null;

  // 1. Markdown code blocks ``` python ... ``` or ``` ... ```
  const codeBlockRegex = /```(?:python|py)?([\s\S]*?)```/gi;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const textChunk = text.slice(lastIndex, match.index);
      if (textChunk.trim()) {
        parts.push({ type: 'text', content: textChunk });
      }
    }
    const codeContent = match[1].trim();
    parts.push({ type: 'code', content: codeContent });
    lastIndex = codeBlockRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    if (remainingText.trim()) {
      parts.push({ type: 'text', content: remainingText });
    }
  }

  if (parts.some(p => p.type === 'code')) {
    return (
      <div className="w-full flex flex-col gap-1">
        {parts.map((part, idx) => {
          if (part.type === 'code') {
            return <PythonCodeBlock key={idx} code={part.content} />;
          }
          return (
            <p key={idx} className="text-[#1e1b4b] leading-relaxed whitespace-pre-line font-semibold my-1">
              {part.content.trim()}
            </p>
          );
        })}
      </div>
    );
  }

  // 2. Un-fenced Python detection
  const lines = text.split('\n');
  const pythonTriggers = /^\s*(def\s+|class\s+|import\s+|from\s+|if\s+|for\s+|while\s+|try:|with\s+|print\(|[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*)/;
  
  let textBefore = [];
  let codeLines = [];
  let textAfter = [];
  let stage = 'before';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (stage === 'before') {
      if (pythonTriggers.test(line)) {
        stage = 'code';
        codeLines.push(line);
      } else {
        textBefore.push(line);
      }
    } else if (stage === 'code') {
      if (pythonTriggers.test(line) || line.startsWith('    ') || line.startsWith('\t') || trimmed === '' || trimmed === 'pass' || trimmed.startsWith('return') || trimmed.startsWith('#')) {
        codeLines.push(line);
      } else if (codeLines.length >= 1 && (trimmed.toLowerCase().startsWith('select ') || trimmed.toLowerCase().startsWith('what ') || trimmed.toLowerCase().startsWith('which ') || trimmed.includes('?'))) {
        stage = 'after';
        textAfter.push(line);
      } else {
        codeLines.push(line);
      }
    } else {
      textAfter.push(line);
    }
  }

  if (codeLines.length >= 1) {
    const cleanBefore = textBefore.join('\n').trim();
    const cleanCode = codeLines.join('\n').trim();
    const cleanAfter = textAfter.join('\n').trim();

    if (cleanCode && (cleanCode.includes('def ') || cleanCode.includes('print(') || cleanCode.includes(' = ') || cleanCode.includes('for ') || cleanCode.includes('if '))) {
      return (
        <div className="w-full flex flex-col gap-1">
          {cleanBefore && (
            <p className="text-[#1e1b4b] leading-relaxed whitespace-pre-line font-semibold my-1">
              {cleanBefore}
            </p>
          )}
          <PythonCodeBlock code={cleanCode} />
          {cleanAfter && (
            <p className="text-[#1e1b4b] leading-relaxed whitespace-pre-line font-semibold my-1">
              {cleanAfter}
            </p>
          )}
        </div>
      );
    }
  }

  return (
    <p className="text-[#1e1b4b] leading-relaxed whitespace-pre-line font-semibold">
      {text}
    </p>
  );
});

const SqlStudioEditor = React.memo(({ isSql, currentIdx, answerValue, onAnswerChange, isFullscreen, onReset, onToggleFullscreen, onRunCode, isExecuting, question }) => {
  const fallbackTemplate = getDynamicStarterForQuestion(question);
  const displayValue = (answerValue !== undefined && answerValue !== null && String(answerValue).trim() !== '') ? answerValue : fallbackTemplate;

  return (
    <div className="flex flex-col shrink-0 w-full shadow-lg rounded-xl overflow-hidden border border-zinc-800">
      <div className="flex flex-wrap items-center justify-between px-3.5 py-2 bg-[#171717] border-b border-zinc-800 gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-purple-950/80 text-purple-400 border border-purple-800/50 shadow-inner">
            <Code size={15} />
          </div>
          <span className="text-xs font-black tracking-wide text-zinc-200 font-sans">
            {isSql ? 'SQL Studio Editor (T-SQL)' : 'Python 3 Studio Editor'}
          </span>
          {isSql && (
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/70 px-2.5 py-0.5 rounded-md border border-emerald-800/60 ml-2 flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              AdventureWorks Live Connected
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onRunCode && (
            <ActionButton
              onClick={onRunCode}
              isLoading={isExecuting}
              loadingText="Executing..."
              disabled={isExecuting}
              icon={Play}
              iconSize={13}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-xs transition-all flex items-center gap-1 border-none cursor-pointer"
            >
              {isSql ? 'Execute Query' : 'Run Python Code'}
            </ActionButton>
          )}
          <button
            type="button"
            onClick={() => onReset(currentIdx)}
            title="Reset query template"
            className="px-2.5 py-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer bg-transparent border border-zinc-800/80 hover:border-zinc-700 flex items-center gap-1.5 text-[11px] font-bold"
          >
            <RotateCcw size={13} />
            <span>Reset Script</span>
          </button>
          <button
            type="button"
            onClick={onToggleFullscreen}
            title="Toggle Fullscreen Studio"
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer bg-transparent border border-zinc-800/80 hover:border-zinc-700"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      <div className={`w-full overflow-hidden bg-[#1e1e1e] relative shrink-0 ${isFullscreen ? 'h-[45vh]' : 'h-[340px] min-h-[340px] max-h-[340px]'}`}>
        <Editor
          key={`studio_editor_${currentIdx}_${isSql ? 'sql' : 'python'}`}
          height="100%"
          defaultLanguage={isSql ? "sql" : "python"}
          language={isSql ? "sql" : "python"}
          value={displayValue}
          onChange={(val) => onAnswerChange(val || '')}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: 'Fira Code, Source Code Pro, monospace',
            minimap: { enabled: false },
            lineNumbers: 'on',
            automaticLayout: true,
            cursorBlinking: 'smooth',
            tabSize: 4,
            bracketPairColorization: { enabled: true },
            autoIndent: 'advanced',
            scrollBeyondLastLine: false,
            padding: { top: 12, bottom: 12 },
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              useShadows: true
            }
          }}
        />
      </div>
    </div>
  );
});

const QueryResultGrid = React.memo(({ isSql, consoleTab, setConsoleTab, sqlQueryResult, consoleOutput, syntaxError, runtimeError, isExecuting, executionStatus, executionTime, customInput, setCustomInput, expectedOutputText, resultGridRef }) => {
  return (
    <div
      ref={resultGridRef}
      tabIndex={-1}
      className="flex flex-col flex-1 min-h-[220px] w-full bg-[#111111] border border-zinc-800 rounded-xl overflow-hidden shadow-xl focus:outline-none focus:ring-1 focus:ring-dash-primary-purple/50 select-text"
    >
      <div className="flex flex-wrap items-center justify-between bg-[#171717] px-3.5 py-2 border-b border-zinc-800 gap-2 shrink-0">
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => setConsoleTab('output')}
            className={`text-[11px] font-extrabold uppercase tracking-wider pb-0.5 transition-all cursor-pointer bg-transparent border-0 flex items-center gap-1.5 ${consoleTab === 'output' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Terminal size={13} className={consoleTab === 'output' ? 'text-emerald-400' : 'text-zinc-500'} />
            <span>{isSql ? 'Query Result Grid' : 'Console Output'}</span>
          </button>

          {isSql && expectedOutputText && (
            <button
              type="button"
              onClick={() => setConsoleTab('compare')}
              className={`text-[11px] font-extrabold uppercase tracking-wider pb-0.5 transition-all cursor-pointer bg-transparent border-0 flex items-center gap-1.5 ${consoleTab === 'compare' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Table size={13} className={consoleTab === 'compare' ? 'text-purple-400' : 'text-zinc-500'} />
              <span>Expected vs Actual Comparison</span>
            </button>
          )}

          {!isSql && (
            <button
              type="button"
              onClick={() => setConsoleTab('input')}
              className={`text-[11px] font-extrabold uppercase tracking-wider pb-0.5 transition-all cursor-pointer bg-transparent border-0 ${consoleTab === 'input' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Custom Input
            </button>
          )}
        </div>

        {executionStatus && (
          <div className="flex items-center gap-3.5 font-mono text-[11px]">
            {sqlQueryResult && (
              <span className="text-zinc-400 font-sans font-semibold">Rows: <strong className="text-emerald-400 font-mono">{sqlQueryResult.rowCount ?? sqlQueryResult.rows?.length ?? 0}</strong></span>
            )}
            <span className="text-zinc-400 font-sans font-semibold">Time: <strong className="text-zinc-200 font-mono">{Math.round(executionTime)}ms</strong></span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${executionStatus === 'Success'
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
              : executionStatus === 'Syntax Error'
                ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                : 'bg-red-950 text-red-400 border border-red-800/60'
              }`}>
              {executionStatus}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col font-mono text-xs p-2.5">
        {consoleTab === 'compare' && isSql ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 p-0.5">
            <div className="flex flex-col gap-1.5 border border-zinc-800/90 bg-[#0a0a0a] p-2.5 rounded-xl overflow-hidden shadow-inner">
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider font-sans border-b border-zinc-800/80 pb-1.5 flex items-center justify-between">
                <span>Expected Target Output</span>
                <span className="text-[9px] text-zinc-500">Benchmark</span>
              </span>
              <div className="flex-1 overflow-y-auto overflow-x-auto max-h-[195px]">
                <ExpectedOutputTable rawOutput={expectedOutputText} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 border border-zinc-800/90 bg-[#0a0a0a] p-2.5 rounded-xl overflow-hidden shadow-inner">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-sans border-b border-zinc-800/80 pb-1.5 flex items-center justify-between">
                <span>Actual Query Results ({sqlQueryResult?.rows?.length ?? 0} rows)</span>
                <span className="text-[9px] text-zinc-500">AdventureWorks DB</span>
              </span>
              <div className="flex-1 overflow-y-auto overflow-x-auto max-h-[195px] rounded-lg border border-zinc-800/80 bg-[#0d0d0d]">
                {sqlQueryResult && (sqlQueryResult.columns || sqlQueryResult.rows) ? (
                  <table className="min-w-full divide-y divide-zinc-800 text-left text-xs text-zinc-200 border-collapse">
                    <thead className="bg-[#1a1a1a] font-extrabold uppercase tracking-wider text-[10px] text-zinc-400 sticky top-0 z-10">
                      <tr>
                        <th className="px-2.5 py-1.5 text-zinc-500 w-8 text-center bg-[#1a1a1a] border-r border-zinc-800/60 font-sans">#</th>
                        {sqlQueryResult.columns?.map((col, idx) => (
                          <th key={idx} className="px-3 py-1.5 text-emerald-400 whitespace-nowrap border-r border-zinc-800/40 last:border-0 bg-[#1a1a1a] font-mono">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50 font-mono text-[11px] bg-[#111111]">
                      {sqlQueryResult.rows && sqlQueryResult.rows.length > 0 ? (
                        sqlQueryResult.rows.slice(0, 100).map((row, rowIdx) => (
                          <tr key={rowIdx} className={`hover:bg-zinc-800/80 transition-colors ${rowIdx % 2 === 0 ? 'bg-[#121212]' : 'bg-[#181818]'}`}>
                            <td className="px-2.5 py-1 text-zinc-500 font-sans text-[10px] text-center bg-zinc-900/50 border-r border-zinc-800/60 font-bold">{rowIdx + 1}</td>
                            {sqlQueryResult.columns.map((col, colIdx) => (
                              <td key={colIdx} className="px-3 py-1 whitespace-nowrap text-zinc-300 border-r border-zinc-800/30 last:border-0">
                                {row[col] !== null && row[col] !== undefined ? String(row[col]) : <em className="text-zinc-600 font-sans italic">NULL</em>}
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={(sqlQueryResult.columns?.length || 0) + 1} className="p-6 text-center text-zinc-500 font-sans italic text-xs">No records matched your criteria.</td></tr>
                      )}
                    </tbody>
                  </table>
                ) : syntaxError || runtimeError ? (
                  <div className="text-red-400 p-3 text-xs font-mono whitespace-pre-wrap">{syntaxError || runtimeError}</div>
                ) : (
                  <div className="p-8 text-center text-zinc-500 font-sans italic text-xs">Click <strong className="text-emerald-400 font-semibold">Execute Query</strong> below to compare Actual Output against Target Schema.</div>
                )}
              </div>
            </div>
          </div>
        ) : consoleTab === 'output' ? (
          <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
            {syntaxError && (
              <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3 flex flex-col gap-1.5 overflow-y-auto max-h-full">
                <span className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider font-sans">Syntax Error:</span>
                <pre className="text-amber-300 whitespace-pre-wrap leading-relaxed font-mono">{syntaxError}</pre>
              </div>
            )}

            {runtimeError && (
              <div className="bg-red-950/40 border border-red-800/60 rounded-xl p-3 flex flex-col gap-1.5 overflow-y-auto max-h-full">
                <span className="text-[10px] font-extrabold uppercase text-red-400 tracking-wider font-sans">Runtime Error:</span>
                <pre className="text-red-300 whitespace-pre-wrap leading-relaxed font-mono">{runtimeError}</pre>
              </div>
            )}

            {sqlQueryResult && (sqlQueryResult.columns || sqlQueryResult.rows) ? (
              <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
                <div className="flex items-center justify-between text-[11px] font-extrabold text-zinc-400 font-sans pb-2 shrink-0">
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                    AdventureWorks SQL Server Result Grid (Live)
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">Server: 172.176.122.4 | SSMS Studio Mode</span>
                </div>
                <div className="flex-1 w-full overflow-x-auto overflow-y-auto rounded-xl border border-zinc-800/90 bg-[#0d0d0d] shadow-inner scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
                  {sqlQueryResult.columns && sqlQueryResult.columns.length > 0 ? (
                    <table className="min-w-full divide-y divide-zinc-800/80 text-left text-xs text-zinc-200 border-collapse">
                      <thead className="bg-[#1a1a1a] font-extrabold uppercase tracking-wider text-[10px] text-zinc-400 sticky top-0 z-10 shadow-sm">
                        <tr>
                          <th className="px-3 py-2 text-zinc-500 w-10 text-center bg-[#1a1a1a] border-r border-zinc-800/60 font-sans">#</th>
                          {sqlQueryResult.columns.map((col, idx) => (
                            <th key={idx} className="px-3.5 py-2 whitespace-nowrap text-dash-primary-purple font-mono border-r border-zinc-800/40 last:border-0 bg-[#1a1a1a]">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/50 font-mono text-[11px] bg-[#111111]">
                        {sqlQueryResult.rows && sqlQueryResult.rows.length > 0 ? (
                          sqlQueryResult.rows.slice(0, 100).map((row, rowIdx) => (
                            <tr key={rowIdx} className={`hover:bg-zinc-800/80 transition-colors ${rowIdx % 2 === 0 ? 'bg-[#121212]' : 'bg-[#181818]'}`}>
                              <td className="px-3 py-1.5 text-zinc-500 font-sans text-[10px] text-center bg-zinc-900/50 border-r border-zinc-800/60 font-bold">{rowIdx + 1}</td>
                              {sqlQueryResult.columns.map((col, colIdx) => (
                                <td key={colIdx} className="px-3.5 py-1.5 whitespace-nowrap text-zinc-300 border-r border-zinc-800/30 last:border-0">
                                  {row[col] !== null && row[col] !== undefined ? String(row[col]) : <em className="text-zinc-600 font-sans italic">NULL</em>}
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={sqlQueryResult.columns.length + 1} className="px-4 py-8 text-center text-zinc-400 font-sans italic text-xs">
                              Query executed successfully. Zero records matched your criteria.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-6 text-center text-zinc-400 font-sans italic text-xs">
                      No records found.
                    </div>
                  )}
                </div>
              </div>
            ) : consoleOutput && (
              <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3 flex flex-col gap-1.5 overflow-y-auto max-h-full">
                <span className="text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider font-sans">Console Output:</span>
                <pre className="text-zinc-200 whitespace-pre-wrap leading-relaxed font-mono">{consoleOutput}</pre>
              </div>
            )}

            {!syntaxError && !runtimeError && !consoleOutput && !sqlQueryResult && !isExecuting && (
              <div className="flex-1 flex items-center justify-center p-4 border border-dashed border-zinc-800/80 rounded-xl bg-zinc-950/40 text-center">
                <span className="text-zinc-500 font-sans italic text-xs">
                  {isSql ? (
                    <>Click <strong className="text-emerald-400 font-semibold">Execute Query</strong> in the studio toolbar to execute T-SQL against the AdventureWorks database and display live results here.</>
                  ) : (
                    <>Click <strong className="text-emerald-400 font-semibold">Run Python Code</strong> in the studio toolbar to execute Python code and display output here.</>
                  )}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2 h-full">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">Piped directly to script stdin:</span>
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Enter custom stdin test arguments..."
              className="w-full flex-1 p-3 bg-[#0a0a0a] border border-zinc-800 text-zinc-200 text-xs font-mono rounded-xl focus:outline-none focus:border-dash-primary-purple transition-all resize-none shadow-inner"
            />
          </div>
        )}
      </div>
    </div>
  );
});

const sortQuestionsForCandidate = (rawQuestions) => {
  if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) return [];

  const subjectOrder = { aptitude: 0, sql: 1, python: 2, java: 3, javascript: 4, "c++": 5, "c#": 6 };

  const isMcq = (q) => {
    const t = String(q.type || q.question_type || 'MCQ').toUpperCase();
    if (t === 'MCQ') return true;
    if (Array.isArray(q.options) && q.options.length > 0 && t !== 'SCENARIO' && t !== 'CODING') return true;
    return false;
  };

  const mcqs = [];
  const scenarios = [];

  rawQuestions.forEach((q) => {
    const qCopy = { ...q };
    const mcqFlag = isMcq(qCopy);
    qCopy.type = mcqFlag ? 'MCQ' : 'SCENARIO';
    qCopy.question_type = qCopy.type;
    qCopy.topic = qCopy.topic || qCopy.subject || 'General';
    qCopy.subject = qCopy.subject || qCopy.topic || 'General';
    qCopy.difficulty = qCopy.difficulty || 'Medium';
    qCopy.marks = qCopy.marks || (mcqFlag ? 1 : 5);

    if (mcqFlag) {
      mcqs.push(qCopy);
    } else {
      scenarios.push(qCopy);
    }
  });

  const getSortKey = (q) => {
    const subj = String(q.subject || q.topic || 'General').toLowerCase().trim();
    const rank = subjectOrder[subj] !== undefined ? subjectOrder[subj] : 90;
    return rank;
  };

  mcqs.sort((a, b) => getSortKey(a) - getSortKey(b));
  scenarios.sort((a, b) => getSortKey(a) - getSortKey(b));

  const sorted = [...mcqs, ...scenarios];
  sorted.forEach((q, idx) => {
    q.sequence_order = idx + 1;
  });

  return sorted;
};



const isQuestionAnswered = (q, idx, answers, executionOutputs = {}) => {
  if (!q || answers === undefined || answers === null) return false;
  const ans = answers[idx];
  if (ans === undefined || ans === null || ans === '') return false;

  const isMcq = (q.type || q.question_type || '').toUpperCase() === 'MCQ' || (Array.isArray(q.options) && q.options.length > 0);
  if (isMcq) {
    return String(ans).trim() !== '';
  }

  const trimmedAns = String(ans).trim();
  if ((q.subject || '').toLowerCase() === 'aptitude') {
    return trimmedAns.length > 0;
  }

  const isSql = (q.subject || q.language || '').toLowerCase().includes('sql') || (q.question || '').toUpperCase().includes('SELECT') || (q.type || '').toUpperCase().includes('SQL');

  if (isSql) {
    const execOut = executionOutputs ? executionOutputs[idx] : null;
    const isExecutedSuccess = Boolean(execOut && (execOut.executionStatus === 'Success' || (execOut.sqlQueryResult && execOut.sqlQueryResult.status === 'Success')));
    const starter = q.starterCode || q.starter_code || q.codeTemplate || q.exampleCode || '';
    const isStarter = starter && trimmedAns === String(starter).trim();
    const isDefaultStarter = trimmedAns === '-- Write your SQL query here' || trimmedAns === getSqlDefaultStarter(q).trim() || trimmedAns.includes('Write your T-SQL query here');

    return isExecutedSuccess && trimmedAns.length > 0 && !isStarter && !isDefaultStarter;
  }

  // Check against dynamic starter code
  const starter = q.starterCode || q.starter_code || q.codeTemplate || q.exampleCode || getPythonStarter(q);
  if (starter && trimmedAns === String(starter).trim()) return false;

  return trimmedAns.length > 0;
};

const isAnswerFilled = (q, ans) => {
  if (!q || ans === undefined || ans === null) return false;
  const trimmedAns = String(ans).trim();
  if (!trimmedAns) return false;

  const isMcq = (q.type || q.question_type || '').toUpperCase() === 'MCQ' || (Array.isArray(q.options) && q.options.length > 0);
  if (isMcq) {
    return trimmedAns.length > 0;
  }

  if ((q.subject || '').toLowerCase() === 'aptitude') {
    return trimmedAns.length > 0;
  }

  const starter = q.starterCode || q.starter_code || q.codeTemplate || q.exampleCode || getPythonStarter(q);
  if (starter && trimmedAns === String(starter).trim()) return false;

  const defaultSqlStarter = getSqlDefaultStarter(q).trim();
  if (trimmedAns === '-- Write your SQL query here' || trimmedAns === defaultSqlStarter || (trimmedAns.includes('Write your T-SQL query here') && trimmedAns.startsWith('-- Write your T-SQL query here'))) {
    const lines = trimmedAns.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('--'));
    if (lines.length === 0 || (lines.length === 1 && lines[0].toUpperCase().startsWith('SELECT * FROM'))) {
      return false;
    }
  }

  return trimmedAns.length > 0;
};

const CandidateDashboard = ({ onLogout, initialTab = 'technical' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [toastMessage, setToastMessage] = useState('');

  const [candidate, setCandidate] = useState(() => {
    const saved = localStorage.getItem('current_candidate');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing current_candidate:", e);
      }
    }
    return {
      id: 3,
      name: 'Arjun Sharma',
      email: 'arjun.sharma@recruitai.com',
      role: 'Python Developer',
      date: '2026-07-06',
      resume: 84,
      python: 78,
      sql: 82,
      aptitude: 74,
      english: 88,
      final: 82,
      recommendation: 'Strong Hire',
      status: 'Completed'
    };
  });

  // English Speaking Assessment states
  const [englishLoading, setEnglishLoading] = useState(false);
  const [englishInterview, setEnglishInterview] = useState(null);
  const [englishText, setEnglishText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTextMode, setIsTextMode] = useState(false);
  const [userDeactivatedMic, setUserDeactivatedMic] = useState(false);
  const [englishTimeLeft, setEnglishTimeLeft] = useState(600); // 10 minutes = 600 seconds
  const [aiTyping, setAiTyping] = useState(false);
  const [voiceUsed, setVoiceUsed] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [techRedirectCountdown, setTechRedirectCountdown] = useState(null);
  const [aiIsSpeaking, setAiIsSpeaking] = useState(false);
  const [aiVoiceGender, setAiVoiceGender] = useState('male'); // Forcing male voice ('Puck')
  const [autoSubmitting, setAutoSubmitting] = useState(false);
  const [englishUploading, setEnglishUploading] = useState(false);
  const [englishUploadProgress, setEnglishUploadProgress] = useState(0);
  const [englishDragOver, setEnglishDragOver] = useState(false);
  const [englishUploadError, setEnglishUploadError] = useState('');
  const englishFileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const isNativeSRActiveRef = useRef(false);
  const mediaStreamRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const currentTextRef = useRef('');
  const finalTranscriptHistoryRef = useRef('');
  const currentSessionFinalRef = useRef('');
  const userDeactivatedMicRef = useRef(false);
  const isTextModeRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const isRecordingRef = useRef(false);
  const chatContainerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const silenceCheckFrameRef = useRef(null);
  const shouldSubmitAfterTranscribeRef = useRef(false);
  const isTranscribingRef = useRef(false);
  const activeAudioRef = useRef(null);
  const [isStartingTechnical, setIsStartingTechnical] = useState(false);
  const startingTechRef = useRef(false);
  const startingEnglishRef = useRef(false);

  // Load candidate profile on mount and handle unmount cleanup
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/candidate/profile');
        if (res.data) {
          setCandidate(res.data);
          localStorage.setItem('current_candidate', JSON.stringify(res.data));
        }
      } catch (err) {
        console.error("Failed to fetch candidate profile:", err);
      }
    };
    fetchProfile();

    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) { }
      }
      if (mediaStreamRef.current) {
        try {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
        } catch (e) { }
      }
      if (silenceCheckFrameRef.current) {
        cancelAnimationFrame(silenceCheckFrameRef.current);
      }
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch (e) { }
      }
      if (activeAudioRef.current) {
        try { activeAudioRef.current.pause(); } catch (e) { }
        activeAudioRef.current = null;
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Fetch candidate English interview status
  const fetchEnglishStatus = async () => {
    try {
      setEnglishLoading(true);
      const res = await api.get('/api/english-assessment/current');
      setEnglishInterview(res.data);
      if (res.data && res.data.resume_filename) {
        setCandidate(prev => ({
          ...prev,
          resume_filename: res.data.resume_filename
        }));
      }
      if (res.data && res.data.status === 'IN_PROGRESS') {
        // Calculate remaining time
        const startTime = new Date(res.data.start_time).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        const remaining = Math.max(0, 600 - elapsed);
        setEnglishTimeLeft(remaining);
      }
    } catch (err) {
      console.error("Failed to fetch English assessment status:", err);
    } finally {
      setEnglishLoading(false);
    }
  };

  // Start English Interview session
  const handleStartEnglish = async () => {
    if (startingEnglishRef.current || englishLoading) return;
    startingEnglishRef.current = true;
    if (englishInterview && englishInterview.status === 'COMPLETED') {
      showToast("You have already completed this assessment. Multiple attempts are not allowed.");
      startingEnglishRef.current = false;
      return;
    }

    // Require resume analysis before starting English assessment
    const hasResume = candidate && (candidate.resume_filename || (candidate.resume && candidate.resume > 0) || candidate.resume_url || candidate.resume_path);
    if (!hasResume) {
      showToast("Please upload and analyze your resume first! The AI generates personalized interview questions from your resume.");
      startingEnglishRef.current = false;
      if (englishFileInputRef.current) {
        englishFileInputRef.current.click();
      }
      return;
    }

    try {
      setEnglishLoading(true);
      setAiTyping(true);
      const res = await api.post('/api/english-assessment/start');
      setEnglishInterview(res.data);
      setEnglishTimeLeft(600);
      setEnglishText('');
      currentTextRef.current = '';
      finalTranscriptHistoryRef.current = '';
      currentSessionFinalRef.current = '';
      userDeactivatedMicRef.current = false;

      // Enable Full Screen Mode on start
      if (englishExamSecurity?.requestFullscreen) {
        await englishExamSecurity.requestFullscreen();
      }

      // Auto TTS first question if not muted
      if (res.data && res.data.ai_question && !isMuted) {
        setTimeout(() => speakQuestion(res.data.ai_question, res.data.audio_base64), 800);
      }

      showToast("English Interview started!");
    } catch (err) {
      console.error("Failed to start English Assessment:", err);
      const errMsg = err.response?.data?.detail || "Failed to start interview. Make sure your technical assessment is completed.";
      showToast(errMsg);
    } finally {
      setEnglishLoading(false);
      setAiTyping(false);
      startingEnglishRef.current = false;
    }
  };

  // Submit Answer to current question
  const handleRespondEnglish = async (textToSend) => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    const finalAnswer = (textToSend && typeof textToSend === 'string') ? textToSend : (englishText || currentTextRef.current);
    if (!finalAnswer || !finalAnswer.trim() || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setAutoSubmitting(true);

    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }

    try {
      setEnglishLoading(true);
      setAiTyping(true);
      const answerPayload = {
        answer: finalAnswer.trim(),
        voice_used: voiceUsed
      };

      const res = await api.post('/api/english-assessment/respond', answerPayload);

      setEnglishText('');
      currentTextRef.current = '';
      finalTranscriptHistoryRef.current = '';
      currentSessionFinalRef.current = '';

      // Fetch latest status to refresh conversation list
      await fetchEnglishStatus();

      showToast("Answer recorded!");
      // Speak next question out loud if not muted
      if (res.data && res.data.ai_question && !isMuted) {
        setTimeout(() => speakQuestion(res.data.ai_question, res.data.audio_base64), 600);
      }
    } catch (err) {
      console.error("Failed to submit English Assessment response:", err);
      const errMsg = err.response?.data?.detail || "Network connection error. Retrying auto-save...";
      showToast(errMsg);
    } finally {
      setEnglishLoading(false);
      setAiTyping(false);
      setAutoSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  // Conclude/Complete English Interview
  const handleCompleteEnglish = async () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (isRecording) {
      stopRecording();
    }

    try {
      setEnglishLoading(true);
      setAiTyping(true);
      await api.post('/api/english-assessment/complete', { voice_used: voiceUsed });
      showToast("English Assessment completed successfully!");
      stopSpeech();
      await fetchEnglishStatus();
    } catch (err) {
      console.error("Failed to complete English Assessment:", err);
      showToast("Error completing assessment. Please try again.");
    } finally {
      setEnglishLoading(false);
      setAiTyping(false);
    }
  };

  // Reset and retake the English Interview (Disabled - One Attempt Only)
  const handleRetryEnglish = async () => {
    showToast("You have already completed this assessment. Multiple attempts are not allowed.");
  };

  // Upload and parse resume specifically for English Assessment
  const uploadEnglishResume = async (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'pdf') {
      setEnglishUploadError('Only PDF files are supported.');
      showToast('Invalid file format');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setEnglishUploadError('File size exceeds the 5MB limit.');
      showToast('File too large');
      return;
    }

    setEnglishUploading(true);
    setEnglishUploadProgress(0);
    setEnglishUploadError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/api/candidate/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setEnglishUploadProgress(percentCompleted);
        },
      });

      showToast('Resume uploaded and analyzed successfully!');

      setCandidate(prev => ({
        ...prev,
        resume: response.data.resume_score || 85,
        resume_filename: response.data.resume_filename || file.name,
        resume_analysis: response.data.resume_analysis || [],
        name: response.data.full_name || response.data.name || prev.name
      }));

      await handleStartEnglish();

    } catch (err) {
      console.error("Upload error:", err);
      let errMsg = 'Failed to upload resume. Please try again.';
      if (err.response && err.response.data && err.response.data.detail) {
        errMsg = err.response.data.detail;
      }
      setEnglishUploadError(errMsg);
      showToast('Upload failed');
    } finally {
      setEnglishUploading(false);
    }
  };

  // Get chat dialogue messages list
  const getChatMessages = () => {
    const list = [];
    if (!englishInterview) return list;

    const apiConvs = englishInterview.conversations || [];
    if (apiConvs.length > 0) {
      apiConvs.forEach(c => {
        list.push({ type: 'ai', text: c.ai_question });
        if (c.candidate_answer) {
          list.push({ type: 'candidate', text: c.candidate_answer });
        }
      });
    } else {
      const rootQ = englishInterview.ai_question || englishInterview.current_question?.ai_question;
      if (rootQ) {
        list.push({ type: 'ai', text: rootQ });
      }
    }
    return list;
  };

  const stopSpeech = () => {
    if (activeAudioRef.current) {
      try { activeAudioRef.current.pause(); } catch (e) { }
      activeAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (e) { }
    }
    setAiIsSpeaking(false);
  };

  // TTS speak helper using Gemini TTS API (with support for preloaded audio)
  const speakQuestion = async (text, preloadedAudioBase64 = null) => {
    userDeactivatedMicRef.current = false;
    setUserDeactivatedMic(false);

    // Clear live text box so candidate speech does not appear while AI is speaking
    setEnglishText('');
    currentTextRef.current = '';
    finalTranscriptHistoryRef.current = '';
    currentSessionFinalRef.current = '';

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    stopRecording();

    if (isMuted) return;

    if (activeAudioRef.current) {
      try { activeAudioRef.current.pause(); } catch (e) { }
      activeAudioRef.current = null;
    }

    setAiIsSpeaking(true);
    try {
      const cleanText = text.replace(/Welcome to the English Assessment.*?Click "Start Interview" to begin\./gi, '');

      let audioBase64 = preloadedAudioBase64;
      if (!audioBase64) {
        console.log("[TTS] Requesting speech synthesis from Gemini API...");
        const res = await api.post('/api/english-assessment/tts', { text: cleanText });
        audioBase64 = res.data?.audio_base64;
      } else {
        console.log("[TTS] Using preloaded speech audio.");
      }

      if (audioBase64) {
        const audioUrl = `data:audio/wav;base64,${audioBase64}`;
        const audio = new Audio(audioUrl);
        activeAudioRef.current = audio;

        audio.onended = () => {
          setAiIsSpeaking(false);
          activeAudioRef.current = null;
          // Automatically activate candidate microphone when AI finishes speaking!
          if (!isMuted && !isTextModeRef.current && !userDeactivatedMicRef.current && !isSubmittingRef.current) {
            setTimeout(() => {
              if (!isSubmittingRef.current && !userDeactivatedMicRef.current && !isTextModeRef.current) {
                startRecording();
              }
            }, 300);
          }
        };

        audio.onerror = (e) => {
          console.error("[TTS Playback Error] Failed to play synthesized audio:", e);
          setAiIsSpeaking(false);
          activeAudioRef.current = null;
        };

        await audio.play();
      } else {
        console.warn("[TTS] No audio data returned from backend.");
        setAiIsSpeaking(false);
      }
    } catch (err) {
      console.error("[TTS Exception]:", err);
      setAiIsSpeaking(false);
    }
  };

  // Toggle voice mute
  const toggleMute = () => {
    setIsMuted(prev => {
      const newVal = !prev;
      if (newVal) {
        stopSpeech();
      } else {
        const activeQ = englishInterview?.current_question?.ai_question || englishInterview?.ai_question;
        if (activeQ) {
          speakQuestion(activeQ);
        }
      }
      return newVal;
    });
  };

  // Helper to transcribe audio using backend Gemini endpoint
  const handleAudioTranscribe = async (audioBlob) => {
    try {
      setEnglishLoading(true);
      setAiTyping(true);

      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');

      console.log("[STT] Uploading audio chunk for transcription...");
      const res = await api.post('/api/english-assessment/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const text = res.data?.transcription || '';
      console.log("[STT Gemini Transcript]:", text);

      setEnglishText(text);
      currentTextRef.current = text;
      return text;
    } catch (err) {
      console.error("[STT] Transcription error:", err);
      showToast("Could not transcribe audio. Please try again or switch to text mode.");
      return '';
    } finally {
      setEnglishLoading(false);
      setAiTyping(false);
    }
  };

  const stopRecordingAndSubmit = (isAuto = false) => {
    shouldSubmitAfterTranscribeRef.current = isAuto;
    stopRecording();
  };

  // Periodic helper to transcribe audio in the background for real-time visual output
  const triggerPeriodicTranscribe = async () => {
    if (isTranscribingRef.current || !isRecordingRef.current) return;

    const chunks = audioChunksRef.current;
    if (chunks.length === 0) return;

    isTranscribingRef.current = true;
    try {
      let mimeType = 'audio/webm';
      if (mediaRecorderRef.current) {
        mimeType = mediaRecorderRef.current.mimeType;
      }

      const audioBlob = new Blob(chunks, { type: mimeType });
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');

      console.log("[STT] Uploading intermediate audio for real-time display...");
      const res = await api.post('/api/english-assessment/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const text = res.data?.transcription || '';
      console.log("[STT Live Display]:", text);

      if (isRecordingRef.current && text.trim().length > 0) {
        setEnglishText(text);
        currentTextRef.current = text;
      }
    } catch (err) {
      console.warn("[STT Live Display] Periodic transcription failed:", err);
    } finally {
      isTranscribingRef.current = false;
    }
  };

  // Toggle Microphone / MediaRecorder Speech-to-Text
  const toggleRecording = async () => {
    if (!window.MediaRecorder) {
      showToast("Audio recording is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isRecording) {
      userDeactivatedMicRef.current = true;
      setUserDeactivatedMic(true);
      stopRecording();
    } else {
      userDeactivatedMicRef.current = false;
      setUserDeactivatedMic(false);
      // Request / Verify Microphone permission explicitly
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        console.error("Microphone permission check failed:", err);
        showToast("Microphone access is denied. Please click the Lock icon in your browser address bar to allow microphone access.");
        return;
      }

      stopSpeech();
      startRecording(null, true);
    }
  };

  const startRecording = async (ignoredSpeechRec, force = false, isAutoRestart = false) => {
    if (isSubmittingRef.current || (aiIsSpeaking && !force) || isTextModeRef.current) return;

    if (!isAutoRestart) {
      setEnglishText('');
      currentTextRef.current = '';
    }

    // Reset/Stop previous recording instance if active
    if (mediaRecorderRef.current) {
      try { mediaRecorderRef.current.stop(); } catch (e) { }
      mediaRecorderRef.current = null;
    }
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      } catch (e) { }
      mediaStreamRef.current = null;
    }
    if (silenceCheckFrameRef.current) {
      cancelAnimationFrame(silenceCheckFrameRef.current);
      silenceCheckFrameRef.current = null;
    }
    if (audioContextRef.current) {
      try { await audioContextRef.current.close(); } catch (e) { }
      audioContextRef.current = null;
    }

    // Stop and clean up any existing browser SpeechRecognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (e) { }
      recognitionRef.current = null;
    }
    isNativeSRActiveRef.current = false;

    try {
      console.log("[STT] Starting audio recording...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        if (audioCtx.state === 'suspended') {
          audioCtx.resume().catch(err => console.warn("Failed to resume AudioContext on init:", err));
        }
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;
      }

      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/wav';
      }

      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log("[STT] Recording stopped. Preparing to transcribe...");
        setIsRecording(false);
        isRecordingRef.current = false;

        const chunks = audioChunksRef.current;
        if (chunks.length === 0) {
          console.warn("[STT] No audio chunks captured.");
          shouldSubmitAfterTranscribeRef.current = false;
          return;
        }

        const audioBlob = new Blob(chunks, { type: mimeType });
        const transcribedText = await handleAudioTranscribe(audioBlob);

        if (shouldSubmitAfterTranscribeRef.current) {
          shouldSubmitAfterTranscribeRef.current = false;
          const textToSubmit = (transcribedText && transcribedText.trim().length > 0)
            ? transcribedText
            : (currentTextRef.current || '');

          if (textToSubmit && textToSubmit.trim().length > 0) {
            console.log("[STT] Auto-submitting response: ", textToSubmit);
            handleRespondEnglish(textToSubmit);
          } else {
            console.log("[STT] Auto-submit skipped: No speech detected in either backend or native recognition.");
            // Restart recording so candidate doesn't get stuck with mic turned off
            if (!isMuted && !isTextModeRef.current && !userDeactivatedMicRef.current && !isSubmittingRef.current) {
              startRecording(null, true, true);
            }
          }
        }
      };

      setIsRecording(true);
      isRecordingRef.current = true;
      setVoiceUsed(true);
      mediaRecorder.start(250);

      // Start browser native SpeechRecognition for instant, zero-delay feedback
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
              const result = event.results[i];
              const transcript = result[0].transcript;
              const confidence = result[0].confidence;

              // Filter out non-Latin scripts (e.g. Tamil characters like 'வணக்கம்')
              const isLatinScript = /^[a-zA-Z0-9\s.,\/#!$%\^&\*;:{}=\-_`~()?'"\n]*$/.test(transcript);

              // Filter out low confidence results (non-English or background noise)
              const isConfident = confidence >= 0.60;

              if (isLatinScript && isConfident) {
                if (result.isFinal) {
                  finalTranscript += transcript;
                } else {
                  interimTranscript += transcript;
                }
              } else {
                console.log(`[STT Native Filtered] Ignored: "${transcript}" | Confidence: ${confidence} | Latin: ${isLatinScript}`);
              }
            }

            const currentText = finalTranscript + interimTranscript;
            if (isRecordingRef.current && currentText.trim().length > 0) {
              setEnglishText(currentText);
              currentTextRef.current = currentText;
            }
          };

          recognition.onerror = (event) => {
            console.error("Native Speech recognition error:", event.error);
          };

          recognition.onend = () => {
            // Auto-restart if we are still recording and this is still the active instance
            if (isRecordingRef.current && recognitionRef.current === recognition) {
              try { recognition.start(); } catch (e) { }
            }
          };

          recognitionRef.current = recognition;
          recognition.start();
          isNativeSRActiveRef.current = true;
          console.log("[STT] Browser SpeechRecognition started successfully.");
        } catch (srErr) {
          console.warn("[STT] Failed to start browser SpeechRecognition:", srErr);
        }
      }

      if (analyserRef.current) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        let lastSoundTime = Date.now();
        let lastTranscribeTime = Date.now();
        let hasSpoken = false;
        let lastTextLength = 0;

        const checkSilence = () => {
          if (!isRecordingRef.current) return;

          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;

          const now = Date.now();

          const currentText = currentTextRef.current || '';
          const textChanged = currentText.length > lastTextLength;
          if (textChanged) {
            lastTextLength = currentText.length;
            lastSoundTime = now;
            hasSpoken = true;
          }

          // If they haven't spoken any words yet, use volume/amplitude to detect if they started speaking
          if (currentText.trim().length === 0) {
            const audioLevelThreshold = 20; // raised to ignore background hiss
            if (average > audioLevelThreshold) {
              lastSoundTime = now;
              hasSpoken = true;
            }
          }

          // Trigger background transcription updates for live display (every 2.5 seconds)
          // ONLY if we are NOT using the browser's native SpeechRecognition
          if (!isNativeSRActiveRef.current && (now - lastTranscribeTime > 2500)) {
            lastTranscribeTime = now;
            triggerPeriodicTranscribe();
          }

          if (hasSpoken && (now - lastSoundTime > 3000)) {
            console.log("[STT] Silence detected. Stopping recording and submitting...");
            stopRecordingAndSubmit(true);
            return;
          }

          silenceCheckFrameRef.current = requestAnimationFrame(checkSilence);
        };

        silenceCheckFrameRef.current = requestAnimationFrame(checkSilence);
      }
    } catch (e) {
      console.error("[STT Exception]:", e);
      showToast(`Failed to start microphone: ${e.message || e}`);
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (silenceCheckFrameRef.current) {
      cancelAnimationFrame(silenceCheckFrameRef.current);
      silenceCheckFrameRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) { }
    }
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      } catch (e) { }
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (e) { }
      audioContextRef.current = null;
    }

    // Stop native SpeechRecognition if active
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (e) { }
      recognitionRef.current = null;
    }
    isNativeSRActiveRef.current = false;

    setIsRecording(false);
  };

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (activeTab === 'english' && englishInterview && englishInterview.status === 'IN_PROGRESS') {
      timer = setInterval(() => {
        setEnglishTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // End interview automatically
            handleCompleteEnglish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeTab, englishInterview]);

  // Load status on mount and when tab changes
  useEffect(() => {
    if (activeTab === 'english') {
      fetchEnglishStatus();
    }
  }, [activeTab]);

  // Scroll chat history to the bottom when dialogue history updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [englishInterview?.conversations?.length, aiTyping, englishLoading]);



  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [activeAssignment, setActiveAssignment] = useState(null);

  const handleOpenInstructions = (assignment) => {
    if (startingTechRef.current || isStartingTechnical) return;
    const asm = assignment?.assessment || assignment || {};
    const startTimeVal = assignment?.startTime || assignment?.start_time || asm?.startTime || asm?.start_time;
    if (startTimeVal && new Date(startTimeVal).getTime() > Date.now()) {
      showToast("This assessment is not available yet. Please wait until the scheduled time.");
      return;
    }
    handleStartExam(assignment);
  };

  const [showNotifications, setShowNotifications] = useState(false);
  const [readNotifications, setReadNotifications] = useState(() => {
    const saved = localStorage.getItem('recruitai_read_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const getNotificationsFromAssignments = () => {
    const notifs = [];
    const now = Date.now();
    const list = Array.isArray(assignments) ? assignments : [];
    list.forEach(asm => {
      if (asm && (asm.status === 'ASSIGNED' || asm.status === 'SCHEDULED' || asm.status === 'IN_PROGRESS')) {
        const startTimeVal = asm.startTime || asm.start_time;
        const isScheduled = startTimeVal ? new Date(startTimeVal).getTime() > now : false;
        const formattedTime = startTimeVal ? new Date(startTimeVal).toLocaleString() : 'immediately';

        const notifId = `assign-${asm.id}`;
        const isRead = Array.isArray(readNotifications) ? readNotifications.includes(notifId) : false;

        notifs.push({
          id: notifId,
          title: isScheduled ? "Assessment Scheduled" : "Assessment Assigned",
          message: `"${asm.assessmentName || asm.assessment?.name || 'Assessment'}" has been scheduled for you. You can take this test starting from ${formattedTime}.`,
          time: asm.assignedAt || asm.created_at || new Date(),
          startTime: startTimeVal,
          isScheduled: !!startTimeVal,
          isAvailable: !isScheduled,
          read: isRead,
          assignment: asm
        });
      }
    });
    return notifs.sort((a, b) => new Date(b.time) - new Date(a.time));
  };

  const notifications = getNotificationsFromAssignments();
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = () => {
    const ids = notifications.map(n => n.id);
    const updated = [...new Set([...(Array.isArray(readNotifications) ? readNotifications : []), ...ids])];
    setReadNotifications(updated);
    localStorage.setItem('recruitai_read_notifications', JSON.stringify(updated));
  };

  // Python Coding Sandbox states
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [consoleOutput, setConsoleOutput] = useState('');
  const [runtimeError, setRuntimeError] = useState('');
  const [syntaxError, setSyntaxError] = useState('');
  const [executionTime, setExecutionTime] = useState(0);
  const [executionStatus, setExecutionStatus] = useState('');
  const [sqlQueryResult, setSqlQueryResult] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [consoleTab, setConsoleTab] = useState('output');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const DEFAULT_EXAM_STATE = {
    currentQuestionIndex: 0,
    answers: {},
    executionOutputs: {},
    visitedQuestions: { 0: true },
    timeLeft: 0,
    submitted: false
  };

  const [examState, setExamState] = useState(DEFAULT_EXAM_STATE);

  const prevQuestionIndexRef = useRef(examState?.currentQuestionIndex ?? 0);
  const sqlCompletionProviderRef = useRef(null);
  const liveSchemaRef = useRef(null);
  const resultGridRef = useRef(null);
  const [liveSchemaMap, setLiveSchemaMap] = useState(null);

  const scrollToResults = () => {
    setTimeout(() => {
      if (resultGridRef.current) {
        resultGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        try { resultGridRef.current.focus({ preventScroll: false }); } catch (e) { }
      }
    }, 150);
  };

  useEffect(() => {
    // Automatically connect and cache live database schema metadata for assessment session
    const fetchLiveSchema = async () => {
      try {
        const res = await api.get('/api/assessment/live-schema');
        if (res.data && res.data.tables_map) {
          liveSchemaRef.current = res.data.tables_map;
          setLiveSchemaMap(res.data.tables_map);
          console.info("[Candidate Dashboard] Cached Live Database schema metadata for SQL Editor autocomplete & schema viewer.");
        }
      } catch (err) {
        console.error("Could not load live SQL schema metadata:", err);
      }
    };
    if (activeTab === 'technical' && activeAssignment) {
      fetchLiveSchema();
    }
  }, [activeTab, activeAssignment]);

  // Auto-redirect to English Assessment after Technical Assessment completion
  useEffect(() => {
    if (activeTab === 'technical' && activeAssignment && examState?.submitted) {
      const isExpired = examState.timeLeft <= 0 || activeAssignment.status === 'EXPIRED';
      if (isExpired) return;

      const redirectTimer = setTimeout(() => {
        setActiveTab('english');
        setActiveAssignment(null);
      }, 3000);
      return () => clearTimeout(redirectTimer);
    }
  }, [activeTab, activeAssignment, examState?.submitted, examState?.timeLeft]);

  const handleEditorDidMount = (editor, monaco) => {
    if (sqlCompletionProviderRef.current) {
      try { sqlCompletionProviderRef.current.dispose(); } catch (_e) { }
    }

    sqlCompletionProviderRef.current = monaco.languages.registerCompletionItemProvider('sql', {
      triggerCharacters: ['.', ' ', '\n', '\t', '\r'],
      provideCompletionItems: (model, position) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        });

        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        const schemaMap = liveSchemaRef.current || {};
        const suggestions = [];

        // Check if user is typing after a dot: e.g. "HumanResources." or "HumanResources.Employee." or "Employee."
        const match = textUntilPosition.match(/([a-zA-Z0-9_]+)\.(?:([a-zA-Z0-9_]+)\.)?$/);

        if (match) {
          const part1 = match[1]; // e.g. "HumanResources" or "Employee"
          const part2 = match[2]; // e.g. "Employee" if typing "HumanResources.Employee."

          if (part2) {
            // Case 3: Typed Schema.Table. -> suggest available columns of that table
            const fullTab = `${part1}.${part2}`;
            const tabInfo = schemaMap[fullTab] || Object.values(schemaMap).find(t => t.table.toLowerCase() === part2.toLowerCase() && t.schema.toLowerCase() === part1.toLowerCase());
            if (tabInfo && Array.isArray(tabInfo.columns)) {
              tabInfo.columns.forEach(col => {
                suggestions.push({
                  label: col.name,
                  kind: monaco.languages.CompletionItemKind.Field,
                  insertText: col.name,
                  detail: `${col.type} ${col.is_pk ? '(PK)' : ''} - Column in ${fullTab}`,
                  documentation: `Column of table ${fullTab}`,
                  range: range
                });
              });
            }
          } else {
            // Case 2: Typed Part1. -> Part1 could be a Schema (propose Tables in that schema) OR a Table (propose Columns)
            const matchedSchemaTables = Object.values(schemaMap).filter(t => t.schema.toLowerCase() === part1.toLowerCase());
            if (matchedSchemaTables.length > 0) {
              matchedSchemaTables.forEach(t => {
                suggestions.push({
                  label: t.table,
                  kind: monaco.languages.CompletionItemKind.Class,
                  insertText: t.table,
                  detail: `Table in schema ${t.schema}`,
                  documentation: `Table ${t.schema}.${t.table} in live AdventureWorks database`,
                  range: range
                });
              });
            }

            // Also check if part1 is a table name (without schema prefix)
            const matchedTableInfo = Object.values(schemaMap).find(t => t.table.toLowerCase() === part1.toLowerCase());
            if (matchedTableInfo && Array.isArray(matchedTableInfo.columns)) {
              matchedTableInfo.columns.forEach(col => {
                suggestions.push({
                  label: col.name,
                  kind: monaco.languages.CompletionItemKind.Field,
                  insertText: col.name,
                  detail: `${col.type} ${col.is_pk ? '(PK)' : ''} - Column in ${matchedTableInfo.schema}.${matchedTableInfo.table}`,
                  documentation: `Column of table ${matchedTableInfo.schema}.${matchedTableInfo.table}`,
                  range: range
                });
              });
            }
          }
        } else {
          // Case 1: Typing freely -> suggest available schemas (HumanResources, Person, Sales, Production, Purchasing, dbo, etc.), tables, and SQL keywords
          const schemasSet = new Set(Object.values(schemaMap).map(t => t.schema));
          ['HumanResources', 'Person', 'Sales', 'Production', 'Purchasing', 'dbo'].forEach(s => schemasSet.add(s));

          schemasSet.forEach(s => {
            suggestions.push({
              label: s,
              kind: monaco.languages.CompletionItemKind.Module,
              insertText: s,
              detail: `Schema in AdventureWorks database`,
              documentation: `SQL Server database schema: ${s}`,
              range: range
            });
          });

          // Suggest fully qualified table names
          Object.entries(schemaMap).forEach(([fullName, t]) => {
            suggestions.push({
              label: fullName,
              kind: monaco.languages.CompletionItemKind.Struct,
              insertText: fullName,
              detail: `Table (${t.columns?.length || 0} columns)`,
              documentation: `Fully qualified table name in AdventureWorks`,
              range: range
            });
            suggestions.push({
              label: t.table,
              kind: monaco.languages.CompletionItemKind.Class,
              insertText: `${t.schema}.${t.table}`,
              detail: `Table in ${t.schema}`,
              documentation: `Auto-completes to fully qualified T-SQL name: ${t.schema}.${t.table}`,
              range: range
            });
          });

          // Standard T-SQL keywords
          ['SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'ON', 'GROUP BY', 'ORDER BY', 'HAVING', 'DESC', 'ASC', 'TOP', 'DISTINCT', 'WITH', 'AS', 'AND', 'OR', 'NOT', 'IN', 'IS NULL', 'IS NOT NULL', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'BETWEEN', 'LIKE'].forEach(kw => {
            suggestions.push({
              label: kw,
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: kw,
              detail: 'T-SQL Keyword',
              range: range
            });
          });
        }

        return { suggestions };
      }
    });
  };

  // Sync compiler output state and starter code when navigating between questions
  useEffect(() => {
    const currentIdx = examState?.currentQuestionIndex ?? 0;
    const prevIdx = prevQuestionIndexRef.current;

    if (prevIdx !== undefined && prevIdx !== null && prevIdx !== currentIdx) {
      // Save output of previous question into examState.executionOutputs
      const currentOutputs = {
        consoleOutput,
        runtimeError,
        syntaxError,
        executionStatus,
        executionTime,
        sqlQueryResult,
        customInput,
        consoleTab
      };
      setExamState(prev => ({
        ...(prev || DEFAULT_EXAM_STATE),
        executionOutputs: {
          ...((prev || DEFAULT_EXAM_STATE).executionOutputs || {}),
          [prevIdx]: currentOutputs
        }
      }));
    }

    // Load execution outputs for the new question (if any exist)
    const savedOutputs = examState?.executionOutputs?.[currentIdx];
    if (savedOutputs) {
      setConsoleOutput(savedOutputs.consoleOutput || '');
      setRuntimeError(savedOutputs.runtimeError || '');
      setSyntaxError(savedOutputs.syntaxError || '');
      setExecutionStatus(savedOutputs.executionStatus || '');
      setExecutionTime(savedOutputs.executionTime || 0);
      setSqlQueryResult(savedOutputs.sqlQueryResult || null);
      setCustomInput(savedOutputs.customInput || '');
      setConsoleTab(savedOutputs.consoleTab || 'output');
    } else {
      // Reset console & compiler output for unexecuted question
      setConsoleOutput('');
      setRuntimeError('');
      setSyntaxError('');
      setExecutionStatus('');
      setExecutionTime(0);
      setSqlQueryResult(null);
      setCustomInput('');
      setConsoleTab('output');
    }

    // Initialize starter code for new question if candidate hasn't typed code yet
    const asm = activeAssignment?.assessment || activeAssignment || {};
    const questions = asm.questions || [];
    const question = questions[currentIdx];
    if (question) {
      const typeUpper = (question.type || question.question_type || '').toUpperCase();
      const qHasOpts = question && Array.isArray(question.options) && question.options.length > 0;
      const isMcq = typeUpper === 'MCQ' || qHasOpts;
      const isAptitude = (question.subject || '').toUpperCase() === 'APTITUDE';

      if (!isMcq && !isAptitude) {
        const existingAns = examState?.answers?.[currentIdx];
        if (existingAns === undefined || existingAns === null || String(existingAns).trim() === '') {
          const starter = getDynamicStarterForQuestion(question);
          setExamState(prev => ({
            ...(prev || DEFAULT_EXAM_STATE),
            answers: {
              ...((prev || DEFAULT_EXAM_STATE).answers || {}),
              [currentIdx]: starter
            }
          }));
        }
      }
    }

    prevQuestionIndexRef.current = currentIdx;
  }, [examState?.currentQuestionIndex, activeAssignment]);

  // Automatically mark current question as visited as soon as candidate opens or navigates to it
  useEffect(() => {
    if (activeAssignment && !examState?.submitted && activeTab === 'technical' && examState?.currentQuestionIndex !== undefined && examState?.currentQuestionIndex !== null) {
      const idx = examState.currentQuestionIndex;
      setExamState(prev => {
        if (prev?.visitedQuestions && prev.visitedQuestions[idx]) {
          return prev;
        }
        return {
          ...(prev || DEFAULT_EXAM_STATE),
          visitedQuestions: {
            ...((prev || DEFAULT_EXAM_STATE).visitedQuestions || {}),
            [idx]: true
          }
        };
      });
    }
  }, [examState?.currentQuestionIndex, activeAssignment, examState?.submitted, activeTab]);

  const isExamActive = !!(activeAssignment && !examState?.submitted && activeTab === 'technical');

  const parseDuration = (durStr) => {
    if (typeof durStr === 'number') return durStr;
    if (!durStr) return 30;
    const parsed = parseInt(String(durStr).replace(/\D/g, ''), 10);
    return isNaN(parsed) ? 30 : parsed;
  };

  const formatTime = (seconds) => {
    const sec = Math.max(0, parseInt(seconds, 10) || 0);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Initialize Exam Security hook
  const examSecurity = useExamSecurity({
    active: isExamActive,
    assignmentId: activeAssignment?.id || activeAssignment?.assignmentId,
    questionNumber: ((examState?.currentQuestionIndex ?? 0) + 1),
    remainingTime: formatTime(examState?.timeLeft || 0),
    maxViolations: 3,
    maxWarnings: 3,
    gracePeriodSeconds: 15,
    onLock: (reason) => {
      showToast(`Security Alert: ${reason}`);
    },
    onViolation: (violation) => {
      showToast(`Security Warning: ${violation.type} - ${violation.description}`);
    }
  });

  // Initialize Exam Security hook for English Communication Assessment
  const isEnglishActive = activeTab === 'english' && englishInterview && englishInterview.status === 'IN_PROGRESS';

  const englishExamSecurity = useExamSecurity({
    active: isEnglishActive,
    assignmentId: englishInterview?.assignment_id || activeAssignment?.id || activeAssignment?.assignmentId,
    questionNumber: (englishInterview?.conversations?.length || 0) + 1,
    remainingTime: formatTime(englishTimeLeft),
    maxViolations: 3,
    maxWarnings: 3,
    gracePeriodSeconds: 15,
    onLock: (reason) => {
      showToast(`Security Alert: ${reason}`);
    },
    onViolation: (violation) => {
      showToast(`Security Warning: ${violation.type} - ${violation.description}`);
    }
  });

  // Auto-submit English Assessment on 4th proctoring violation
  useEffect(() => {
    if (isEnglishActive && englishExamSecurity.autoSubmittedDueToViolations) {
      handleCompleteEnglish();
    }
  }, [isEnglishActive, englishExamSecurity.autoSubmittedDueToViolations]);

  // Request fullscreen when English assessment starts or resumes in progress
  useEffect(() => {
    if (isEnglishActive) {
      englishExamSecurity.requestFullscreen();
    }
  }, [isEnglishActive]);

  // Hide navigation bar when Technical Assessment is active or when English Assessment is in Full-Screen mode
  const hideNavigation = isExamActive || (isEnglishActive && englishExamSecurity.isFullscreen);

  // Lock body scroll when active in technical or english assessment
  useEffect(() => {
    if (isExamActive || (isEnglishActive && englishExamSecurity.isFullscreen)) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isExamActive, isEnglishActive, englishExamSecurity.isFullscreen]);

  const fetchAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const response = await api.get('/api/assignments/candidate');
      if (Array.isArray(response.data)) {
        const seenIds = new Set();
        const seenAssessmentIds = new Set();
        const deduplicated = response.data.filter(asm => {
          if (!asm) return false;
          const idKey = asm.id ? String(asm.id) : null;
          const asmIdKey = (asm.assessment_id || asm.assessmentId || asm.assessment?.id)
            ? String(asm.assessment_id || asm.assessmentId || asm.assessment?.id)
            : null;

          if (idKey && seenIds.has(idKey)) return false;
          if (asmIdKey && seenAssessmentIds.has(asmIdKey)) return false;

          if (idKey) seenIds.add(idKey);
          if (asmIdKey) seenAssessmentIds.add(asmIdKey);
          return true;
        });
        setAssignments(deduplicated);
      } else {
        setAssignments([]);
      }
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
      setAssignments([]);
    } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Resume support: restore active exam state if candidate refreshes page or reconnects
  useEffect(() => {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('recruitai_active_exam_')) {
          const savedRaw = localStorage.getItem(key);
          if (savedRaw) {
            const saved = JSON.parse(savedRaw);
            if (saved && saved.assignment && saved.examState && !saved.examState.submitted) {
              if (saved.lastSavedTimestamp) {
                const elapsedSeconds = Math.floor((Date.now() - saved.lastSavedTimestamp) / 1000);
                saved.examState.timeLeft = Math.max(0, saved.examState.timeLeft - elapsedSeconds);
              }
              if (saved.examState.timeLeft <= 0) {
                localStorage.removeItem(key);
                api.patch(`/api/assignments/${saved.assignment.id}/status`, { status: 'EXPIRED' })
                  .catch(err => console.warn("Failed to patch status to EXPIRED on restore timeout:", err));
                continue;
              }
              setActiveAssignment(saved.assignment);
              setExamState({
                ...saved.examState,
                visitedQuestions: saved.examState.visitedQuestions || { [saved.examState.currentQuestionIndex || 0]: true }
              });
              setActiveTab('technical');
              break;
            }
          }
        }
      }
    } catch (e) {
      console.warn("Failed to restore exam state from localStorage:", e);
    }
  }, []);

  // Synchronize active exam state to localStorage on state changes
  useEffect(() => {
    if (activeAssignment && examState && !examState.submitted) {
      try {
        const key = `recruitai_active_exam_${activeAssignment.id}`;
        localStorage.setItem(key, JSON.stringify({
          assignment: activeAssignment,
          examState: examState,
          lastSavedTimestamp: Date.now()
        }));
      } catch (e) {
        console.warn("Failed to save active exam state to localStorage:", e);
      }
    } else if (activeAssignment && examState?.submitted) {
      try {
        const key = `recruitai_active_exam_${activeAssignment.id}`;
        localStorage.removeItem(key);
      } catch (_e) { }
    }
  }, [activeAssignment, examState]);

  // Synchronize activeAssignment state with server fetched assignments to clear stale/completed local storage state
  useEffect(() => {
    if (activeAssignment && !loadingAssignments) {
      if (assignments.length > 0) {
        const match = assignments.find(a => a.id === activeAssignment.id);
        if (!match || match.status === 'COMPLETED' || match.status === 'EXPIRED') {
          try {
            localStorage.removeItem(`recruitai_active_exam_${activeAssignment.id}`);
          } catch (e) { }
          setActiveAssignment(null);
          setExamState(DEFAULT_EXAM_STATE);
          setActiveTab('dashboard');
          showToast(match?.status === 'EXPIRED' ? "Assessment session has expired." : "Assessment session is no longer active.");
        }
      } else {
        try {
          localStorage.removeItem(`recruitai_active_exam_${activeAssignment.id}`);
        } catch (e) { }
        setActiveAssignment(null);
        setExamState(DEFAULT_EXAM_STATE);
        setActiveTab('dashboard');
        showToast("Assessment session is no longer active.");
      }
    }
  }, [assignments, activeAssignment, loadingAssignments]);


  const handleStartExam = async (assignment) => {
    if (startingTechRef.current || isStartingTechnical) return;
    startingTechRef.current = true;
    setIsStartingTechnical(true);
    try {
      const asm = assignment?.assessment || assignment || {};
      const startTimeVal = assignment?.startTime || assignment?.start_time || asm?.startTime || asm?.start_time;
      if (startTimeVal && new Date(startTimeVal).getTime() > Date.now()) {
        showToast("This assessment is not available yet. Please wait until the scheduled time.");
        return;
      }

      let activeQuestions = asm.questions || [];
      try {
        const evalRes = await api.post('/api/evaluation/start', { assignmentId: assignment.id });
        if (evalRes.data?.questions && evalRes.data.questions.length > 0) {
          activeQuestions = evalRes.data.questions;
        }
      } catch (evalErr) {
        console.warn("Evaluation start endpoint notice:", evalErr);
        if (assignment?.status === 'ASSIGNED' || assignment?.status === 'SCHEDULED') {
          try {
            await api.patch(`/api/assignments/${assignment.id}/status`, { status: 'IN_PROGRESS' });
          } catch (patchErr) {
            console.warn("Status patch warning:", patchErr);
          }
        }
      }

      // Enforce Phase 1 (MCQ) -> Phase 2 (Scenario) ordering grouped by topic
      const sortedQuestions = sortQuestionsForCandidate(activeQuestions);

      setAssignments(prev => prev.map(a => a.id === assignment.id ? { ...a, status: 'IN_PROGRESS' } : a));

      const initialAnswers = {};
      sortedQuestions.forEach((q, idx) => {
        const typeUpper = (q.type || q.question_type || '').toUpperCase();
        const qHasOpts = q && Array.isArray(q.options) && q.options.length > 0;
        const isMcq = typeUpper === 'MCQ' || qHasOpts;
        const isAptitude = (q.subject || '').toUpperCase() === 'APTITUDE';

        if (isMcq || isAptitude) {
          initialAnswers[idx] = '';
        } else {
          initialAnswers[idx] = getDynamicStarterForQuestion(q);
        }
      });

      const assignmentToSet = {
        ...assignment,
        assessment: {
          ...asm,
          questions: sortedQuestions
        }
      };

      if (examSecurity?.resetExamSecurity) {
        examSecurity.resetExamSecurity();
      }

      setActiveAssignment(assignmentToSet);
      setActiveTab('technical');
      setExamState({
        currentQuestionIndex: 0,
        answers: initialAnswers,
        executionOutputs: {},
        visitedQuestions: { 0: true },
        timeLeft: parseDuration(asm.duration || "30") * 60,
        submitted: false
      });

      // Request browser full-screen mode on exam start
      setTimeout(() => {
        if (examSecurity?.requestFullscreen) {
          examSecurity.requestFullscreen();
        }
      }, 100);
    } catch (err) {
      console.error("Failed to start assessment:", err);
      let errMsg = "Error starting assessment. Please try again.";
      if (typeof err.response?.data?.detail === 'object') {
        errMsg = err.response.data.detail.message || JSON.stringify(err.response.data.detail);
      } else if (typeof err.response?.data?.detail === 'string') {
        errMsg = err.response.data.detail;
      } else if (err.message) {
        errMsg = err.message;
      }
      showToast(errMsg);
    } finally {
      setIsStartingTechnical(false);
      startingTechRef.current = false;
    }
  };

  const handleSubmitExam = async (assignmentIdOverride, securityMetadata = {}) => {
    // If string passed (or object from proctoring), use string or fallback to activeAssignment ID
    const targetId = (typeof assignmentIdOverride === 'string' ? assignmentIdOverride : null) || activeAssignment?.id || activeAssignment?.assignmentId || activeAssignment?._id;
    if (!targetId) {
      console.error("No active target assignment ID found for submission.");
      showToast("Error: No active assignment ID found.");
      return;
    }

    if (isSubmittingManual || examState.submitted) {
      return;
    }

    // 1. Immediately disable submit button to prevent duplicate clicks
    setIsSubmittingManual(true);

    // 2. Instantly display success toast notification
    showToast("Assessment submitted successfully.");

    // 3. Immediately transition UI state to submitted and close modal
    setExamState(prev => ({ ...prev, submitted: true }));
    setIsSubmitModalOpen(false);

    // If auto-submitted due to timeout, set activeAssignment status to EXPIRED
    const durationSeconds = parseDuration(activeAssignment?.assessment?.duration || activeAssignment?.duration || "30") * 60;
    const isAuto = securityMetadata?.autoSubmitted === true || (examState.timeLeft !== undefined && examState.timeLeft <= 0);
    if (isAuto) {
      setActiveAssignment(prev => prev ? { ...prev, status: 'EXPIRED' } : null);
    }

    try {
      try {
        localStorage.removeItem(`recruitai_active_exam_${targetId}`);
      } catch (_e) { }

      const asm = activeAssignment?.assessment || activeAssignment || {};
      const questions = asm.questions || [];
      const answersPayload = questions.map((q, idx) => {
        const qId = q.id !== undefined && q.id !== null ? q.id : (q.question || idx);
        return {
          questionId: String(qId),
          answer: examState.answers[idx] !== undefined && examState.answers[idx] !== null ? String(examState.answers[idx]) : ""
        };
      });

      const durationSeconds = parseDuration(asm.duration || "30") * 60;
      const timeTaken = Math.max(0, durationSeconds - (examState.timeLeft || 0));
      const isAuto = securityMetadata?.autoSubmitted === true || (examState.timeLeft !== undefined && examState.timeLeft <= 0);

      const payload = {
        assignmentId: targetId,
        answers: answersPayload,
        timeTaken: Math.round(timeTaken),
        autoSubmitted: isAuto,
        submissionReason: securityMetadata?.submissionReason || null,
        warningCount: securityMetadata?.warningCount ?? examSecurity?.fullscreenExitCount ?? 0,
        warningHistory: securityMetadata?.warningHistory || examSecurity?.warningHistory || []
      };

      // 4. Perform actual assessment submission asynchronously in the background
      api.post('/api/assessment/submit', payload)
        .then(async () => {
          if (isAuto) {
            try {
              await api.patch(`/api/assignments/${targetId}/status`, { status: 'EXPIRED' });
            } catch (err) {
              console.error("Failed to update status to EXPIRED:", err);
            }
          }
          fetchAssignments();
        })
        .catch(err => {
          console.error("Background assessment submission log:", err);
          const status = err.response?.status;
          const detail = err?.response?.data?.detail;
          const errMsg = typeof detail === 'string' ? detail : (detail?.message || "Error submitting assessment. Please try again.");
          showToast(errMsg);

          // If the assignment is missing, unauthorized, or expired, clean up local storage and exit technical view
          if (status === 404 || status === 403 || (status === 400 && String(errMsg).toLowerCase().includes("expire"))) {
            try {
              localStorage.removeItem(`recruitai_active_exam_${targetId}`);
            } catch (_e) { }
            setActiveAssignment(null);
            setExamState(DEFAULT_EXAM_STATE);
            setActiveTab('dashboard');
          }
        })
        .finally(() => {
          setIsSubmittingManual(false);
        });

    } catch (err) {
      console.error("Failed to prepare submission payload:", err);
      setIsSubmittingManual(false);
    }
  };

  useEffect(() => {
    const currentIdx = examState?.currentQuestionIndex ?? 0;
    if (examState?.executionOutputs && examState.executionOutputs[currentIdx]) {
      const saved = examState.executionOutputs[currentIdx];
      setConsoleOutput(saved.consoleOutput || '');
      setRuntimeError(saved.runtimeError || '');
      setSyntaxError(saved.syntaxError || '');
      setExecutionTime(saved.executionTime || 0);
      setExecutionStatus(saved.executionStatus || '');
      setSqlQueryResult(saved.sqlQueryResult || null);
      if (saved.customInput !== undefined) setCustomInput(saved.customInput);
    } else {
      setConsoleOutput('');
      setRuntimeError('');
      setSyntaxError('');
      setExecutionTime(0);
      setExecutionStatus('');
      setSqlQueryResult(null);
    }
  }, [examState?.currentQuestionIndex]);

  const handleRunCode = async (currentCode, currentQuestion) => {
    if (!currentCode) return;
    setIsExecuting(true);
    setConsoleTab('output');
    setConsoleOutput('Running query...');
    setRuntimeError('');
    setSyntaxError('');
    setExecutionStatus('');
    setExecutionTime(0);
    setSqlQueryResult(null);

    let funcName = currentQuestion?.function_name || currentQuestion?.functionName || null;
    if (!funcName && currentCode) {
      const match = currentCode.match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
      if (match) {
        funcName = match[1];
      }
    }

    let parsedInputs = currentQuestion?.inputs || null;
    if (!parsedInputs && customInput) {
      try {
        parsedInputs = JSON.parse(customInput);
      } catch (_e) {
        // Fallback to plain string input
      }
    }

    const codeTrim = (currentCode || '').trim().toUpperCase();
    const looksLikeSql = codeTrim.startsWith('SELECT') ||
      codeTrim.startsWith('WITH') ||
      codeTrim.startsWith('UPDATE') ||
      codeTrim.startsWith('INSERT') ||
      codeTrim.startsWith('DELETE') ||
      codeTrim.startsWith('CREATE') ||
      codeTrim.startsWith('ALTER') ||
      codeTrim.startsWith('DROP') ||
      codeTrim.startsWith('USE') ||
      codeTrim.startsWith('EXEC') ||
      codeTrim.startsWith('--');

    const isSql = looksLikeSql || (currentQuestion && (
      (currentQuestion.subject || '').toLowerCase().includes('sql') ||
      (currentQuestion.language || '').toLowerCase().includes('sql') ||
      (currentQuestion.topic || '').toLowerCase().includes('sql') ||
      (currentQuestion.type || '').toLowerCase().includes('sql')
    ));

    if (isSql) {
      try {
        const payload = {
          query: currentCode,
          serverType: "sqlserver",
          credentials: {
            host: "172.176.122.4",
            port: 1433,
            database: "AdventureWorks",
            username: "readonly_user",
            password: "Readonly@123"
          },
          examId: String(activeAssignment?.id || "exam_123"),
          userEmail: candidate?.email || "candidate@example.com"
        };
        const res = await api.post('/run-sql', payload);
        const data = res.data;

        const isSuccess = data.status === 'Success' || data.success === true;
        if (isSuccess && !data.runtime_error && !data.syntax_error) {
          const rawRows = Array.isArray(data.rows) ? data.rows : (Array.isArray(data.output?.rows) ? data.output.rows : []);
          const rows = rawRows.slice(0, 100);
          let cols = Array.isArray(data.columns) && data.columns.length > 0
            ? data.columns
            : (Array.isArray(data.output?.columns) && data.output.columns.length > 0 ? data.output.columns : []);
          if (cols.length === 0 && rows.length > 0 && typeof rows[0] === 'object' && rows[0] !== null) {
            cols = Object.keys(rows[0]);
          }

          const execTime = data.executionTime ?? data.output?.executionTime ?? 0;
          const rowCount = data.rowCount ?? data.output?.rowCount ?? rows.length;

          const sqlData = {
            ...data,
            columns: cols,
            rows: rows,
            rowCount: rowCount,
            executionTime: execTime,
            query: currentCode,
            status: 'Success'
          };

          const successMsg = "Query executed successfully.";
          setSqlQueryResult(sqlData);
          setConsoleOutput(successMsg);
          setRuntimeError('');
          setSyntaxError('');
          setExecutionTime(execTime);
          setExecutionStatus('Success');

          setExamState(prev => ({
            ...prev,
            answers: {
              ...(prev.answers || {}),
              [examState.currentQuestionIndex]: currentCode
            },
            executionOutputs: {
              ...(prev.executionOutputs || {}),
              [examState.currentQuestionIndex]: {
                consoleOutput: successMsg,
                runtimeError: '',
                syntaxError: '',
                executionTime: execTime,
                executionStatus: 'Success',
                sqlQueryResult: sqlData,
                customInput,
                consoleTab: 'output',
                timestamp: Date.now()
              }
            }
          }));

          // Non-blocking background auto-save to backend
          const activeAsmId = activeAssignment?.assessment_id || activeAssignment?.assessment?.id;
          const currentQ = currentQuestion;
          const qId = String(currentQ?.id || currentQ?.question || currentQ?.title || examState.currentQuestionIndex);
          if (activeAsmId) {
            api.post('/api/assessment/submit-code', {
              assessmentId: activeAsmId,
              questionId: qId,
              code: currentCode,
              assignmentId: activeAssignment?.id
            }).catch(e => console.warn("[AutoSave] Background SQL answer auto-save notice:", e));
          }
        } else {
          const rErr = data.runtime_error || data.error || 'SQL Query Execution Error';
          const sErr = data.syntax_error || '';
          const exTime = data.executionTime || 0;
          // IMPORTANT: Set sqlQueryResult to null when error occurs so empty grid doesn't display under error message!
          setSqlQueryResult(null);
          setConsoleOutput('');
          setRuntimeError(rErr);
          setSyntaxError(sErr);
          setExecutionTime(exTime);
          setExecutionStatus('Error');

          setExamState(prev => ({
            ...prev,
            executionOutputs: {
              ...(prev.executionOutputs || {}),
              [examState.currentQuestionIndex]: {
                consoleOutput: '',
                runtimeError: rErr,
                syntaxError: sErr,
                executionTime: exTime,
                executionStatus: 'Error',
                sqlQueryResult: null,
                customInput,
                consoleTab: 'output'
              }
            }
          }));
        }
      } catch (err) {
        console.error("Failed to run SQL query:", err);
        const errMsg = err.response?.data?.detail || err.message || "SQL Execution error.";
        setSqlQueryResult(null);
        setRuntimeError(errMsg);
        setExecutionStatus('Error');

        setExamState(prev => ({
          ...prev,
          executionOutputs: {
            ...(prev.executionOutputs || {}),
            [examState.currentQuestionIndex]: {
              consoleOutput: '',
              runtimeError: errMsg,
              syntaxError: '',
              executionTime: 0,
              executionStatus: 'Error',
              sqlQueryResult: null,
              customInput,
              consoleTab: 'output'
            }
          }
        }));
      } finally {
        setIsExecuting(false);
        scrollToResults();
      }
      return;
    }

    try {
      const rawSampleInput = currentQuestion?.sampleInput ||
        currentQuestion?.visibleTestCase?.input ||
        (currentQuestion?.visibleTestCases && currentQuestion.visibleTestCases[0] && currentQuestion.visibleTestCases[0].input) ||
        currentQuestion?.exampleInput || '';

      const rawSampleOutput = currentQuestion?.sampleOutput ||
        currentQuestion?.visibleTestCase?.expectedOutput ||
        (currentQuestion?.visibleTestCases && currentQuestion.visibleTestCases[0] && currentQuestion.visibleTestCases[0].expectedOutput) ||
        currentQuestion?.exampleOutput || '';

      const activeInput = (customInput !== undefined && customInput !== null && customInput.trim() !== '')
        ? customInput
        : rawSampleInput;

      const hiddenTCs = Array.isArray(currentQuestion?.hiddenTestCases) ? currentQuestion.hiddenTestCases : [];

      const visibleList = [
        {
          input: String(activeInput),
          expectedOutput: String(rawSampleOutput)
        }
      ];

      const hiddenList = hiddenTCs.map(htc => ({
        input: String(htc.input || ''),
        expectedOutput: String(htc.expectedOutput || '')
      }));

      const payload = {
        code: currentCode,
        visibleTestCases: visibleList,
        hiddenTestCases: hiddenList,
        testCases: visibleList,
        input: String(activeInput),
        function_name: funcName,
        functionName: funcName
      };

      const res = await api.post('/api/assessment/run-code', payload);
      const data = res.data;
      const outText = data.stdout || data.output || '';
      const rErr = data.stderr || data.runtime_error || '';
      const sErr = data.syntax_error || '';
      const exTime = data.executionTime || data.execution_time || 0;
      const exStat = data.status || (data.allPassed ? 'Success' : 'Test Cases Failed');

      setConsoleOutput(outText);
      setRuntimeError(rErr);
      setSyntaxError(sErr);
      setExecutionTime(exTime);
      setExecutionStatus(exStat);

      setExamState(prev => ({
        ...prev,
        executionOutputs: {
          ...(prev.executionOutputs || {}),
          [examState.currentQuestionIndex]: {
            consoleOutput: outText,
            runtimeError: rErr,
            syntaxError: sErr,
            executionTime: exTime,
            executionStatus: exStat,
            sqlQueryResult: null,
            customInput,
            consoleTab: 'output'
          }
        }
      }));
    } catch (err) {
      console.error("Failed to run code:", err);
      const errMsg = err.response?.data?.detail || err.message || "Execution error.";
      setRuntimeError(errMsg);
      setExecutionStatus('Error');

      setExamState(prev => ({
        ...prev,
        executionOutputs: {
          ...(prev.executionOutputs || {}),
          [examState.currentQuestionIndex]: {
            consoleOutput: '',
            runtimeError: errMsg,
            syntaxError: '',
            executionTime: 0,
            executionStatus: 'Error',
            sqlQueryResult: null,
            customInput,
            consoleTab: 'output'
          }
        }
      }));
    } finally {
      setIsExecuting(false);
      scrollToResults();
    }
  };

  const handleSubmitCode = async (currentCode, currentQuestion) => {
    if (!currentCode) {
      showToast("Please enter Python code before submitting.");
      return;
    }
    const assessmentId = activeAssignment?.assessment_id || activeAssignment?.assessment?.id;
    const questionId = String(currentQuestion?.id || currentQuestion?.question || currentQuestion?.title || examState.currentQuestionIndex);

    if (!assessmentId) {
      showToast("Assessment ID missing.");
      return;
    }

    setIsSubmittingCode(true);
    try {
      await api.post('/api/assessment/submit-code', {
        assessmentId: assessmentId,
        questionId: questionId,
        code: currentCode,
        assignmentId: activeAssignment?.id
      });
      showToast("Python code saved in PostgreSQL successfully!");
    } catch (err) {
      console.error("Failed to submit code:", err);
      const errMsg = err.response?.data?.detail || err.message || "Error submitting code.";
      showToast(errMsg);
    } finally {
      setIsSubmittingCode(false);
    }
  };

  const handleResetCode = (currentIdx) => {
    if (window.confirm("Are you sure you want to reset your code to the default template? Any unsaved changes will be lost.")) {
      const asm = activeAssignment?.assessment || activeAssignment || {};
      const questions = asm.questions || [];
      const q = questions[currentIdx];
      const template = getDynamicStarterForQuestion(q);

      setExamState(prev => ({
        ...prev,
        answers: {
          ...prev.answers,
          [currentIdx]: template
        },
        executionOutputs: {
          ...(prev.executionOutputs || {}),
          [currentIdx]: null
        }
      }));

      setConsoleOutput('');
      setRuntimeError('');
      setSyntaxError('');
      setExecutionStatus('');
      setExecutionTime(0);
      setSqlQueryResult(null);
      setCustomInput('');
      setConsoleTab('output');
      showToast("Code and compiler output reset to starter template.");
    }
  };


  useEffect(() => {
    if (!activeAssignment || examState.submitted || examState.timeLeft <= 0) return;

    // Pause timer if exam security warning dialog is open or full-screen is not active
    if (!examSecurity.isFullscreen || examSecurity.isExamLocked) {
      return;
    }

    const timer = setInterval(() => {
      setExamState((prev) => {
        if (prev.timeLeft <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            handleSubmitExam(activeAssignment.id);
          }, 0);
          return { ...prev, timeLeft: 0 };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeAssignment, examState.submitted, examState.timeLeft, examSecurity.isFullscreen, examSecurity.isExamLocked]);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const uploadFile = async (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'pdf') {
      setUploadError('Only PDF files are supported.');
      showToast('Invalid file format');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds the 5MB limit.');
      showToast('File too large');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/api/candidate/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      const updatedUser = response.data;

      const updatedCandidate = {
        ...candidate,
        resume: updatedUser.resume_score || 85,
        name: updatedUser.full_name || updatedUser.name || candidate.name,
        python: updatedUser.python_score || 0,
        sql: updatedUser.sql_score || 0,
        aptitude: updatedUser.aptitude_score || 0,
        english: updatedUser.english_score || 0,
        final: Math.round(
          ((updatedUser.python_score || 0) +
            (updatedUser.sql_score || 0) +
            (updatedUser.aptitude_score || 0) +
            (updatedUser.english_score || 0)) / 4
        ) || 80,
        resume_filename: updatedUser.resume_filename || file.name,
        resume_analysis: updatedUser.resume_analysis || [
          "Demonstrates solid background in core development.",
          "Demonstrates practical hands-on experience in SQL database schema design.",
          "Clear project organization and excellent written communication."
        ],
        status: 'Completed'
      };

      setCandidate(updatedCandidate);
      localStorage.setItem('current_candidate', JSON.stringify(updatedCandidate));

      const storedCandidates = localStorage.getItem('recruitai_candidates');
      if (storedCandidates) {
        try {
          const list = JSON.parse(storedCandidates);
          const idx = list.findIndex(c => c.email.toLowerCase() === candidate.email.toLowerCase());
          if (idx !== -1) {
            list[idx] = { ...list[idx], ...updatedCandidate };
            localStorage.setItem('recruitai_candidates', JSON.stringify(list));
          }
        } catch (e) {
          console.error("Error updating candidates list:", e);
        }
      }

      showToast('Resume uploaded and analyzed successfully!');
    } catch (err) {
      console.error("Upload error:", err);
      let errMsg = 'Failed to upload resume. Please try again.';
      if (err.response && err.response.data && err.response.data.detail) {
        errMsg = err.response.data.detail;
      }
      setUploadError(errMsg);
      showToast('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('current_candidate');
    onLogout();
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  const firstName = candidate.name.split(' ')[0];

  const getHeaderContent = () => {
    switch (activeTab) {
      case 'resume':
        return {
          title: 'Resume Upload',
          tag: 'Upload',
          subtitle: 'Upload your resume for AI-powered skill extraction and analysis.'
        };
      case 'technical':
        return {
          title: 'Technical Assessment',
          tag: 'Test',
          subtitle: 'AI-generated questions based on topics selected by your recruiter.'
        };
      case 'english':
        return {
          title: 'English Speaking Assessment',
          tag: 'Speaking',
          subtitle: 'AI-generated questions based on your resume. Speak clearly and confidently.'
        };
      default:
        return {
          title: 'Candidate Portal',
          tag: 'Workspaces',
          subtitle: 'Complete assessments and view progress details.'
        };
    }
  };

  /* Removed dashboard-specific local statistics and skill lists */

  return (
    <div className="candidate-dashboard-theme bg-dash-light-blue-bg text-dash-dark-purple min-h-screen relative overflow-hidden font-inter flex w-full">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl bg-dash-white-card border border-dash-border-gray shadow-[0_10px_25px_rgba(87,82,170,0.1)] flex items-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-dash-primary-purple animate-ping" />
            <span className="text-sm font-semibold text-dash-dark-purple tracking-wide">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. SIDEBAR (Full-Height Solid Layout matching Recruiter) */}
      {!hideNavigation && (
        <aside className="hidden lg:flex flex-col w-[260px] h-screen shrink-0 bg-dash-sidebar-bg pt-8 pb-8 pl-6 pr-0 relative z-30 text-dash-dark-purple shadow-[4px_0_24px_rgba(0,0,0,0.03)] justify-between">
          <div>
            {/* Branding */}
            <div className="flex items-center gap-3 px-2 py-4 mb-6">
              <img src={logo} alt="RecruitAI Logo" className="w-12 h-12 rounded-2xl object-cover shadow-md shrink-0" />
              <div>
                <h1 className="font-outfit font-bold text-base tracking-tight text-dash-dark-purple leading-none">RecruitAI</h1>
                <span className="text-[10px] text-dash-light-purple font-medium tracking-widest uppercase">Candidate Portal</span>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-2">
              {[
                { id: 'technical', label: 'Technical Test', icon: Terminal },
                { id: 'english', label: 'English Speaking', icon: Volume2 },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (item.id !== 'resume' && item.id !== 'technical' && item.id !== 'english') {
                        showToast(`"${item.label}" feature is coming soon!`);
                      }
                    }}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-l-[24px] rounded-r-none text-sm font-bold transition-all duration-300 relative group ${isActive
                      ? 'sidebar-active-tab shadow-sm'
                      : 'text-dash-light-purple hover:text-dash-dark-purple hover:bg-dash-primary-purple/20'
                      }`}
                  >
                    <Icon size={18} className="relative z-10" />
                    <span className="relative z-10">{item.label}</span>
                  </button>
                );
              })}
            </nav>
            {/* Centered Lottie Animation */}
            <div className="flex items-center justify-center py-4 px-6 mt-2">
              <div className="w-48 h-48 flex items-center justify-center">
                <DotLottieReact
                  src="https://lottie.host/f5bd2f6c-67a9-44d5-954d-96176d4cb3df/USuWgujLWd.lottie"
                  loop
                  autoplay
                />
              </div>
            </div>
          </div>

          {/* User Profile & Logout */}
          <div className="space-y-4">
            <div className="border-t border-dash-border-gray/25 pt-4 px-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-dash-primary-purple flex items-center justify-center font-semibold text-dash-white-card">
                  {(candidate?.name || candidate?.full_name || 'Candidate').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-semibold text-dash-dark-purple truncate">{candidate?.name || candidate?.full_name || 'Candidate'}</h4>
                  <span className="text-[10px] text-dash-light-purple truncate block">Candidate</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-dash-light-purple hover:bg-dash-primary-purple/20 transition-all duration-200 cursor-pointer"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>
      )}

      {/* Mobile Sidebar Backdrop & Content */}
      {!hideNavigation && (
        <>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-dash-dark-purple z-40 lg:hidden"
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {sidebarOpen && (
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}
                className="fixed top-0 bottom-0 left-0 w-[270px] pt-6 pb-6 pl-6 pr-0 z-50 lg:hidden flex flex-col bg-dash-sidebar-bg text-dash-dark-purple border-r border-dash-border-gray/25"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <img src={logo} alt="RecruitAI Logo" className="w-10 h-10 rounded-xl object-cover shadow-sm shrink-0" />
                    <h1 className="font-outfit font-bold text-base text-dash-dark-purple">RecruitAI</h1>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 rounded-lg hover:bg-dash-primary-purple/20 text-dash-light-purple hover:text-dash-dark-purple mr-4"
                  >
                    <X size={20} />
                  </button>
                </div>

                <nav className="space-y-1 flex-1">
                  {[
                    { id: 'technical', label: 'Technical Test', icon: Terminal },
                    { id: 'english', label: 'English Speaking', icon: Volume2 },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setSidebarOpen(false);
                          if (item.id !== 'resume' && item.id !== 'technical' && item.id !== 'english') {
                            showToast(`"${item.label}" feature is coming soon!`);
                          }
                        }}
                        className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-l-[24px] rounded-r-none text-sm font-bold transition-all duration-200 ${isActive
                          ? 'sidebar-active-tab shadow-sm'
                          : 'text-dash-light-purple hover:text-dash-dark-purple hover:bg-dash-primary-purple/20'
                          }`}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
                {/* Centered Lottie Animation */}
                <div className="flex items-center justify-center py-2 pr-4 my-2">
                  <div className="w-44 h-44 flex items-center justify-center">
                    <DotLottieReact
                      src="https://lottie.host/f5bd2f6c-67a9-44d5-954d-96176d4cb3df/USuWgujLWd.lottie"
                      loop
                      autoplay
                    />
                  </div>
                </div>

                <div className="border-t border-dash-border-gray/25 pt-4 space-y-3 mr-4">
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-9 h-9 rounded-full bg-dash-primary-purple flex items-center justify-center font-semibold text-dash-white-card">
                      {(candidate?.name || candidate?.full_name || 'Candidate').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-dash-dark-purple">{candidate?.name || candidate?.full_name || 'Candidate'}</h4>
                      <span className="text-[10px] text-dash-light-purple">Candidate</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSidebarOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-dash-light-purple hover:bg-dash-primary-purple/20 transition-all duration-200"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </>
      )}

      {/* 2. MAIN WORKSPACE */}
      <main className={hideNavigation ? "fixed inset-0 z-40 bg-dash-light-blue-bg overflow-hidden flex flex-col p-4 sm:p-6 lg:p-8 w-screen h-screen" : "flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col gap-6 relative z-20 overflow-y-auto h-screen max-h-screen"}>
        {/* HEADER SECTION (Horizontal White Card style) */}
        {!hideNavigation && (
          <header className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-5 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2 lg:mt-0 shadow-[0_4px_20px_rgba(87,82,170,0.03)]">
            <div className="flex items-center gap-3">
              {/* Hamburger menu for small screens */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-dash-white-card border border-dash-border-gray text-dash-primary-purple hover:bg-dash-soft-pink transition-all duration-200"
              >
                <Menu size={20} />
              </button>

              <div>
                <h2 className="text-xl sm:text-2xl font-plus-jakarta font-extrabold tracking-tight text-dash-dark-purple flex items-center gap-2">
                  {getHeaderContent().title}
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-dash-primary-purple/10 border border-dash-border-gray text-dash-primary-purple font-outfit">{getHeaderContent().tag}</span>
                </h2>
                <p className="text-xs sm:text-sm text-dash-light-purple font-semibold mt-0.5">
                  {getHeaderContent().subtitle}
                </p>
              </div>
            </div>

            {/* Right Area: Notifications bell */}
            <div className="flex items-center gap-3 self-end sm:self-center relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-xl bg-dash-white-card border border-dash-border-gray text-dash-primary-purple hover:bg-dash-soft-pink transition-all duration-300 hover:scale-105 cursor-pointer flex items-center justify-center"
              >
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse border-2 border-white" />
                )}
                <Bell size={18} />
              </button>

              {/* Notifications Dropdown Panel */}
              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-45" onClick={() => setShowNotifications(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-3 w-80 bg-dash-white-card border border-dash-border-gray rounded-2xl shadow-xl z-50 p-4 flex flex-col gap-3 max-h-96 overflow-y-auto"
                    >
                      <div className="flex items-center justify-between border-b border-dash-border-gray/25 pb-2">
                        <h4 className="text-xs font-extrabold text-dash-dark-purple uppercase tracking-wider">Notifications</h4>
                        {unreadNotificationsCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-[10px] font-bold text-dash-primary-purple hover:underline bg-transparent border-0 cursor-pointer"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        {notifications.length === 0 ? (
                          <div className="text-center py-6 text-xs text-dash-light-purple font-semibold">
                            No notifications found.
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`p-3 rounded-xl border text-xs leading-relaxed flex flex-col gap-1.5 transition-all ${notif.read
                                ? 'bg-slate-50/50 border-slate-100 text-slate-500 font-medium'
                                : 'bg-dash-primary-purple/5 border-dash-primary-purple/20 text-dash-dark-purple font-semibold'
                                }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-extrabold text-dash-primary-purple">{notif.title}</span>
                                <span className="text-[9px] text-dash-light-purple font-medium whitespace-nowrap">
                                  {new Date(notif.time).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-[11px] leading-normal">{notif.message}</p>
                              {notif.isScheduled && (
                                <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-200/50">
                                  <span className="text-[10px] font-bold text-slate-500">
                                    Starts: {new Date(notif.startTime).toLocaleString()}
                                  </span>
                                  {notif.isAvailable ? (
                                    <button
                                      onClick={() => {
                                        setShowNotifications(false);
                                        setActiveTab('technical');
                                        handleOpenInstructions(notif.assignment);
                                      }}
                                      className="px-2.5 py-1 bg-dash-primary-purple text-white text-[9px] font-extrabold rounded-lg border-0 cursor-pointer hover:bg-dash-dark-purple transition-all"
                                    >
                                      Start Now
                                    </button>
                                  ) : (
                                    <span className="text-[9px] font-extrabold text-amber-600 bg-amber-50 border border-amber-200/50 px-1.5 py-0.5 rounded-full uppercase">
                                      Locked
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </header>
        )}





        {activeTab === 'technical' && !activeAssignment && (
          <div className="w-full flex flex-col gap-6 animate-fade-in">
            {loadingAssignments ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-dash-primary-purple border-t-transparent animate-spin" />
                <p className="text-sm font-semibold text-dash-light-purple">Loading your assessments...</p>
              </div>
            ) : assignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] shadow-sm max-w-2xl mx-auto w-full text-center p-8">
                <div className="w-16 h-16 rounded-full bg-dash-primary-purple/10 flex items-center justify-center text-dash-primary-purple mb-4">
                  <Terminal size={32} />
                </div>
                <h3 className="font-plus-jakarta font-extrabold text-xl text-dash-dark-purple">
                  No Assessments Assigned Yet
                </h3>
                <p className="text-sm text-dash-light-purple font-semibold mt-2 max-w-md">
                  Your recruiter will assign technical assessments for you to take here. Check back soon!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {assignments.map((assignment) => {
                  const asm = assignment?.assessment || assignment || {};
                  const isCompleted = assignment.status === 'COMPLETED';
                  const isInProgress = assignment.status === 'IN_PROGRESS';
                  const isExpired = assignment.status === 'EXPIRED';

                  return (
                    <div
                      key={assignment.id}
                      className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-6 shadow-[0_4px_25px_rgba(87,82,170,0.02)] flex flex-col justify-between gap-5 hover:shadow-md transition-all duration-300 relative overflow-hidden"
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase border bg-dash-soft-pink border-dash-border-gray/50 text-dash-dark-purple">
                          {asm.difficulty}
                        </span>

                        {/* Status Badge */}
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${isCompleted
                          ? 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/20'
                          : isInProgress
                            ? 'text-[#f97316] bg-[#f97316]/10 border-[#f97316]/20'
                            : isExpired
                              ? 'text-red-500 bg-red-50 border-red-200'
                              : 'text-[#3b82f6] bg-[#3b82f6]/10 border-[#3b82f6]/20'
                          }`}>
                          {assignment.status}
                        </span>
                      </div>

                      {/* Title & Subjects */}
                      <div>
                        <h4 className="font-plus-jakarta font-extrabold text-lg text-dash-dark-purple tracking-tight line-clamp-1">
                          {asm.name}
                        </h4>
                        <p className="text-xs font-bold text-dash-light-purple mt-1 font-mono">
                          Subjects: {asm.subjects ? (Array.isArray(asm.subjects) ? asm.subjects.join(', ') : asm.subjects) : ''}
                        </p>
                      </div>

                      {/* Detail Metrics Grid */}
                      <div className="grid grid-cols-2 gap-3 w-full bg-dash-light-blue-bg/40 border border-dash-border-gray/30 rounded-2xl p-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-bold text-dash-light-purple uppercase tracking-wider">Duration</span>
                          <span className="font-plus-jakarta font-extrabold text-sm text-dash-dark-purple">{asm.duration}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-bold text-dash-light-purple uppercase tracking-wider">Questions</span>
                          <span className="font-plus-jakarta font-extrabold text-sm text-dash-dark-purple">{asm.questionsCount} items</span>
                        </div>
                        <div className="flex flex-col gap-0.5 col-span-2 border-t border-dash-border-gray/25 pt-2 mt-1">
                          <span className="text-[10px] font-bold text-dash-light-purple uppercase tracking-wider">Assigned Date</span>
                          <span className="font-semibold text-xs text-dash-dark-purple">
                            {new Date(assignment.assignedAt).toLocaleString()}
                          </span>
                        </div>
                        {assignment.dueDate && (
                          <div className="flex flex-col gap-0.5 col-span-2 border-t border-dash-border-gray/25 pt-2">
                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Due Date</span>
                            <span className="font-semibold text-xs text-red-600">
                              {new Date(assignment.dueDate).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      {isCompleted ? (
                        <div className="w-full py-3 rounded-xl bg-dash-success-green/10 text-dash-success-green text-center font-bold text-sm border border-dash-success-green/20 flex items-center justify-center gap-2">
                          <CheckCircle2 size={16} />
                          <span>Completed</span>
                        </div>
                      ) : isExpired ? (
                        <div className="w-full py-3 rounded-xl bg-red-50 text-red-600 text-center font-bold text-sm border border-red-200 flex items-center justify-center gap-2">
                          <X size={16} />
                          <span>Assessment Expired</span>
                        </div>
                      ) : (() => {
                        const startTimeVal = assignment.startTime || assignment.start_time;
                        const isFuture = startTimeVal ? new Date(startTimeVal).getTime() > Date.now() : false;
                        if (isFuture) {
                          return (
                            <div className="flex flex-col gap-2 w-full text-center">
                              <button
                                disabled
                                className="w-full py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                              >
                                <Clock size={14} />
                                <span>Scheduled Test</span>
                              </button>
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200/40 p-2 rounded-xl">
                                ⚠️ This assessment is not available yet. Please wait until the scheduled time: {new Date(startTimeVal).toLocaleString()}
                              </span>
                            </div>
                          );
                        }
                        return (
                          <ActionButton
                            onClick={() => handleOpenInstructions(assignment)}
                            isLoading={isStartingTechnical}
                            loadingText={isInProgress ? "Resuming Assessment..." : "Starting Technical Assessment..."}
                            disabled={isStartingTechnical || startingTechRef.current}
                            icon={Play}
                            iconSize={14}
                            className="w-full py-3 rounded-xl bg-dash-primary-purple text-dash-white-card font-bold text-sm hover:bg-dash-dark-purple shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isInProgress ? 'Resume Technical Assessment' : 'Start Technical Assessment'}
                          </ActionButton>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'technical' && activeAssignment && examState.submitted && (() => {
          const isExpired = examState.timeLeft <= 0 || activeAssignment.status === 'EXPIRED';

          if (isExpired) {
            return (
              <div className="flex justify-center items-center py-12 animate-fade-in w-full">
                <div className="w-full max-w-2xl bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-10 shadow-[0_4px_25px_rgba(87,82,170,0.02)] flex flex-col items-center text-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-2 animate-pulse border border-red-200">
                    <ShieldAlert size={40} />
                  </div>
                  <div>
                    <h3 className="font-plus-jakarta font-extrabold text-2xl text-red-600 tracking-tight">
                      Assessment Expired
                    </h3>
                    <p className="text-sm text-dash-light-purple font-semibold mt-3 max-w-md mx-auto leading-relaxed">
                      The time limit for this assessment has expired. You can no longer continue or restart this assessment. Your progress has been auto-saved and submitted.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center mt-4">
                    <button
                      onClick={() => {
                        setActiveTab('dashboard');
                        setActiveAssignment(null);
                        setExamState(DEFAULT_EXAM_STATE);
                      }}
                      className="px-6 py-3 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 transition-all duration-200 shadow-md cursor-pointer border-0"
                    >
                      Return to Dashboard
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div className="flex justify-center items-center py-12 animate-fade-in w-full">
              <div className="w-full max-w-2xl bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-10 shadow-[0_4px_25px_rgba(87,82,170,0.02)] flex flex-col items-center text-center gap-6">
                <div className="w-20 h-20 rounded-full bg-dash-success-green/10 flex items-center justify-center text-dash-success-green mb-2 animate-bounce">
                  <Check size={40} />
                </div>
                <div>
                  <h3 className="font-plus-jakarta font-extrabold text-2xl text-dash-dark-purple tracking-tight">
                    Assessment Completed!
                  </h3>
                  <p className="text-sm text-dash-light-purple font-semibold mt-3 max-w-md mx-auto leading-relaxed">
                    Thank you for taking the assessment. Your response has been securely saved and submitted to your recruiter.
                  </p>
                  <p className="text-xs text-dash-primary-purple font-extrabold mt-3 animate-pulse flex items-center justify-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Redirecting to English Communication Assessment in 3 seconds...</span>
                  </p>
                </div>

                {examSecurity?.autoSubmittedDueToViolations && (
                  <div className="w-full bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2">
                    <span>Your assessment has been automatically submitted because you exited full-screen mode multiple times.</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => { setActiveTab('english'); setActiveAssignment(null); }}
                    className="px-6 py-3 rounded-xl bg-dash-primary-purple text-dash-white-card font-bold text-xs hover:bg-dash-dark-purple transition-all duration-200 shadow-md cursor-pointer border-0 flex items-center gap-2"
                  >
                    <span>Proceed to English Assessment Now</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {activeTab === 'technical' && activeAssignment && !examState?.submitted && (() => {
          const asm = activeAssignment?.assessment || activeAssignment || {};
          const questions = asm.questions || [];
          const currentIdx = examState?.currentQuestionIndex ?? 0;
          const question = questions[currentIdx];

          if (!question) {
            return (
              <div className="text-center py-20 bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-8 max-w-2xl mx-auto w-full">
                <p className="text-sm font-semibold text-red-500 mb-4">Error: No questions found in this assessment.</p>
                <button onClick={() => setActiveAssignment(null)} className="px-4 py-2 bg-dash-primary-purple text-white rounded-lg border-0 cursor-pointer">Go Back</button>
              </div>
            );
          }

          const mcqNavItems = questions
            .map((q, idx) => ({ q, idx }))
            .filter(item => {
              const typeUpper = (item.q.type || item.q.question_type || '').toUpperCase();
              const qHasOpts = item.q && Array.isArray(item.q.options) && item.q.options.length > 0;
              return typeUpper === 'MCQ' || qHasOpts;
            });

          const codingNavItems = questions
            .map((q, idx) => ({ q, idx }))
            .filter(item => {
              const typeUpper = (item.q.type || item.q.question_type || '').toUpperCase();
              const qHasOpts = item.q && Array.isArray(item.q.options) && item.q.options.length > 0;
              return typeUpper !== 'MCQ' && !qHasOpts;
            });

          const totalMcqs = mcqNavItems.length;
          const totalScenarios = codingNavItems.length;

          const isMcqPhase = totalMcqs > 0 && currentIdx < totalMcqs;
          const currentPhaseLabel = isMcqPhase
            ? `Phase 1 of ${totalScenarios > 0 ? 2 : 1} — MCQ Questions`
            : `Phase ${totalMcqs > 0 ? 2 : 1} of ${totalMcqs > 0 ? 2 : 1} — Scenario & Coding Studio`;

          const currentTopic = question.topic || question.subject || "General";
          const visitedCount = questions.filter((q, idx) => Boolean(examState.visitedQuestions?.[idx])).length;
          const answeredCount = questions.filter((q, idx) => isAnswerFilled(q, examState.answers[idx])).length;
          const overallProgressPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

          const qSubject = (question?.subject || question?.topic || question?.language || '').toLowerCase().trim();
          const qType = String(question?.type || question?.question_type || '').toUpperCase().trim();
          const hasOptions = question && Array.isArray(question.options) && question.options.length > 0;

          // Strict Subject Classification (No cross-contamination)
          const isSql = !hasOptions && question ? (
            qSubject.includes('sql') ||
            qType === 'SQL_CODING' ||
            ((qType === 'CODING' || qType === 'SCENARIO_CODING' || qType === 'SCENARIO') && qSubject.includes('sql')) ||
            (question.question || '').toUpperCase().includes('SELECT ')
          ) : false;

          const isPython = !hasOptions && !isSql && question ? (
            qSubject.includes('python') ||
            qType === 'PYTHON_CODING' ||
            qType === 'CODING' ||
            qType === 'SCENARIO_CODING' ||
            ((qType === 'SCENARIO') && qSubject.includes('python'))
          ) : false;

          const isAptitudeScenario = !hasOptions && !isSql && !isPython;

          // Code/Query Studio is displayed only for SQL and Python questions
          const isCoding = !hasOptions && (isSql || isPython);

          const hasPrev = currentIdx > 0;
          const hasNext = currentIdx < questions.length - 1;
          const isFlagged = Boolean(examState.flaggedQuestions?.[currentIdx]);

          const flaggedCount = Object.keys(examState.flaggedQuestions || {}).filter(k => Boolean(examState.flaggedQuestions[k])).length;
          const unansweredCount = questions.length - answeredCount;

          const goToQuestion = (targetIdx) => {
            // Reset execution outputs on question navigation to prevent state leakage
            setConsoleOutput('');
            setSqlQueryResult(null);
            setSyntaxError(null);
            setRuntimeError(null);
            setExecutionStatus(null);
            setExecutionTime(null);
            setCustomInput('');
            setConsoleTab('results');
            setExamState(prev => ({
              ...prev,
              currentQuestionIndex: targetIdx,
              visitedQuestions: {
                ...prev.visitedQuestions,
                [targetIdx]: true
              }
            }));
          };

          const toggleFlag = () => {
            setExamState(prev => ({
              ...prev,
              flaggedQuestions: {
                ...prev.flaggedQuestions,
                [currentIdx]: !prev.flaggedQuestions?.[currentIdx]
              }
            }));
          };

          return (
            <div className="flex flex-col gap-4 animate-fade-in w-full select-none">

              {/* TOP HEADER BAR: Title, Topic, Timer, Progress & Submit */}
              <div className="bg-dash-white-card border border-dash-border-gray/50 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">

                {/* Title & Phase/Topic */}
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider text-white shadow-xs ${isCoding ? 'bg-indigo-600' : 'bg-dash-primary-purple'}`}>
                    {currentPhaseLabel}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs font-extrabold text-dash-dark-purple flex items-center gap-1.5">
                      <span className="text-slate-400 font-bold">Topic:</span>
                      <span className="text-dash-primary-purple">{currentTopic}</span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      Question {currentIdx + 1} of {questions.length} (Sequence #{question.sequence_order || currentIdx + 1})
                    </span>
                  </div>
                </div>

                {/* Timer, Progress & Submit */}
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Timer Box */}
                  <div className="flex items-center gap-2 bg-dash-soft-pink border border-dash-border-gray/50 rounded-xl px-3.5 py-1.5 shadow-2xs">
                    <span className="text-[10px] font-extrabold text-dash-light-purple uppercase tracking-wider">Time Remaining:</span>
                    <span className="font-plus-jakarta font-extrabold text-xl text-red-600 font-mono tracking-wider">
                      {formatTime(examState.timeLeft)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="hidden md:flex items-center gap-3 border-l border-slate-200/80 pl-4">
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Overall Progress</span>
                      <span className="text-xs font-extrabold text-dash-primary-purple">{overallProgressPercent}% ({answeredCount}/{questions.length})</span>
                    </div>
                    <div className="w-20 h-2.5 rounded-full bg-slate-200 overflow-hidden shrink-0">
                      <div className="h-full bg-dash-primary-purple rounded-full transition-all duration-300" style={{ width: `${overallProgressPercent}%` }} />
                    </div>
                  </div>

                  {/* Submit Assessment Button */}
                  <button
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="py-2 px-4 rounded-xl border border-red-200 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
                  >
                    <CheckCircle2 size={15} />
                    <span>Submit Assessment</span>
                  </button>
                </div>
              </div>

              {/* CODING LAYOUT: Top Horizontal Navigator */}
              {isCoding && (
                <div className="bg-dash-white-card border border-dash-border-gray/50 rounded-2xl px-4 py-2.5 shadow-2xs flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 overflow-x-auto dashboard-scrollbar">
                  <div className="flex items-center gap-3 overflow-x-auto py-0.5 dashboard-scrollbar flex-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 shrink-0 flex items-center gap-1.5 mr-1">
                      <ListOrdered size={15} className="text-dash-primary-purple" />
                      <span>Navigator:</span>
                    </span>

                    {mcqNavItems.length > 0 && (
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[9px] font-black text-purple-700 bg-purple-100 px-2 py-1 rounded-md uppercase tracking-wider shrink-0">MCQ Questions ({mcqNavItems.length})</span>
                        <div className="flex items-center gap-1.5">
                          {mcqNavItems.map(({ q, idx }) => {
                            const isCurrent = idx === currentIdx;
                            const qAns = examState.answers[idx];
                            const isAns = isAnswerFilled(q, qAns);
                            const isCompleted = isAns && !isCurrent;
                            const qFlagged = Boolean(examState.flaggedQuestions?.[idx]);

                            return (
                              <button
                                key={idx}
                                onClick={() => goToQuestion(idx)}
                                title={`Question ${idx + 1}: MCQ (${isCurrent ? 'Active' : qFlagged ? 'Flagged' : isCompleted ? 'Answered' : 'Unanswered'})`}
                                className={`w-8 h-8 rounded-lg font-extrabold text-xs flex items-center justify-center cursor-pointer border transition-all duration-200 shrink-0 relative ${isCurrent
                                  ? 'bg-dash-primary-purple text-white border-dash-primary-purple shadow-sm scale-105 ring-2 ring-dash-primary-purple/40 font-black'
                                  : qFlagged
                                    ? 'bg-amber-500/15 text-amber-700 border-amber-500/50 hover:bg-amber-500/25'
                                    : isCompleted
                                      ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/40 hover:bg-emerald-500/25'
                                      : 'bg-slate-100 border-slate-200/80 text-slate-600 hover:bg-slate-200/70'
                                  }`}
                              >
                                <span>{idx + 1}</span>
                                {qFlagged ? (
                                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[7px] font-black shadow-xs">
                                    <Flag size={7} className="fill-white" />
                                  </span>
                                ) : isCompleted ? (
                                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[7px] font-black shadow-xs">
                                    <Check size={8} strokeWidth={3} />
                                  </span>
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {mcqNavItems.length > 0 && codingNavItems.length > 0 && (
                      <div className="h-4 w-px bg-slate-200 shrink-0 mx-1" />
                    )}

                    {codingNavItems.length > 0 && (
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[9px] font-black text-indigo-700 bg-indigo-100 px-2 py-1 rounded-md uppercase tracking-wider shrink-0">Scenario & Coding ({codingNavItems.length})</span>
                        <div className="flex items-center gap-1.5">
                          {codingNavItems.map(({ q, idx }) => {
                            const isCurrent = idx === currentIdx;
                            const qAns = examState.answers[idx];
                            const isAns = isAnswerFilled(q, qAns);
                            const isCompleted = isAns && !isCurrent;
                            const qFlagged = Boolean(examState.flaggedQuestions?.[idx]);

                            return (
                              <button
                                key={idx}
                                onClick={() => goToQuestion(idx)}
                                title={`Question ${idx + 1}: Coding (${isCurrent ? 'Active' : qFlagged ? 'Flagged' : isCompleted ? 'Answered' : 'Unanswered'})`}
                                className={`w-8 h-8 rounded-lg font-extrabold text-xs flex items-center justify-center cursor-pointer border transition-all duration-200 shrink-0 relative ${isCurrent
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm scale-105 ring-2 ring-indigo-500/40 font-black'
                                  : qFlagged
                                    ? 'bg-amber-500/15 text-amber-700 border-amber-500/50 hover:bg-amber-500/25'
                                    : isCompleted
                                      ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/40 hover:bg-emerald-500/25'
                                      : 'bg-slate-100 border-slate-200/80 text-slate-600 hover:bg-slate-200/70'
                                  }`}
                              >
                                <span>{idx + 1}</span>
                                {qFlagged ? (
                                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[7px] font-black shadow-xs">
                                    <Flag size={7} className="fill-white" />
                                  </span>
                                ) : isCompleted ? (
                                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[7px] font-black shadow-xs">
                                    <Check size={8} strokeWidth={3} />
                                  </span>
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200/60 shrink-0 uppercase tracking-wider ml-auto flex items-center gap-1.5">
                    <Code size={12} />
                    <span>{isSql ? 'SQL QUERY STUDIO' : 'PYTHON COMPILER STUDIO'}</span>
                  </span>
                </div>
              )}

              {/* MAIN CONTENT AREA: Dynamic switching between MCQ and Coding */}
              {isCoding ? (
                /* CODING / COMPILER LAYOUT: Majority Width Editor + Left Question Card */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start w-full">
                  {/* Left Column (5/12 width): Question Card with Integrated Navigation */}
                  <div className="lg:col-span-5 w-full flex flex-col gap-3">
                    <QuestionCard
                      question={question}
                      isSql={isSql}
                      isCoding={isCoding}
                      liveSchemaMap={liveSchemaMap}
                      hasPrev={hasPrev}
                      hasNext={hasNext}
                      goToQuestion={goToQuestion}
                      currentIdx={currentIdx}
                      totalQuestions={questions.length}
                      toggleFlag={toggleFlag}
                      isFlagged={isFlagged}
                      onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
                    />
                  </div>

                  {/* Right Column (7/12 width): Compiler Studio & Output Grid */}
                  <div className={`lg:col-span-7 w-full flex flex-col justify-between gap-3 bg-[#141414] border border-zinc-800/90 rounded-2xl p-3.5 shadow-2xl relative ${isFullscreen ? 'fixed inset-0 z-50 p-6 bg-[#141414] overflow-y-auto' : 'h-[660px] max-h-[660px] overflow-hidden'}`}>
                    <SqlStudioEditor
                      isSql={isSql}
                      currentIdx={currentIdx}
                      question={question}
                      answerValue={examState.answers[currentIdx]}
                      onAnswerChange={(val) => setExamState(prev => ({
                        ...prev,
                        answers: { ...prev.answers, [currentIdx]: val }
                      }))}
                      isFullscreen={isFullscreen}
                      onReset={handleResetCode}
                      onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
                      onRunCode={() => handleRunCode(examState.answers[currentIdx] || getDynamicStarterForQuestion(question), question)}
                      isExecuting={isExecuting}
                    />

                    <QueryResultGrid
                      isSql={isSql}
                      consoleTab={consoleTab}
                      setConsoleTab={setConsoleTab}
                      sqlQueryResult={sqlQueryResult}
                      consoleOutput={consoleOutput}
                      syntaxError={syntaxError}
                      runtimeError={runtimeError}
                      isExecuting={isExecuting}
                      executionStatus={executionStatus}
                      executionTime={executionTime}
                      customInput={customInput}
                      setCustomInput={setCustomInput}
                      expectedOutputText={question.expectedOutput || question.exampleOutput}
                      resultGridRef={resultGridRef}
                    />
                  </div>
                </div>
              ) : (
                /* MCQ LAYOUT: Fixed Sticky Left Vertical Sidebar Navigator (22% Width) + Single Large Main Assessment Card (78% Width) */
                <div className="flex flex-col lg:flex-row gap-5 items-start w-full">

                  {/* FIXED STICKY VERTICAL SIDEBAR QUESTION NAVIGATOR (Left Side 20-22%) */}
                  <div className="w-full lg:w-72 xl:w-80 shrink-0 sticky top-4 bg-dash-white-card border border-dash-border-gray/50 rounded-2xl p-4.5 shadow-sm flex flex-col gap-4">

                    {/* Sidebar Title & Total Count */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <ListOrdered size={16} className="text-dash-primary-purple" />
                        <h4 className="font-plus-jakarta font-extrabold text-sm text-dash-dark-purple">
                          Question Navigator
                        </h4>
                      </div>
                      <span className="text-[10px] font-black bg-dash-primary-purple/10 text-dash-primary-purple px-2.5 py-0.5 rounded-full border border-dash-primary-purple/20">
                        {questions.length} Total
                      </span>
                    </div>

                    {/* Visual Status Legend */}
                    <div className="grid grid-cols-3 gap-1.5 bg-slate-50 border border-slate-100 p-2 rounded-xl text-[10px] font-extrabold">
                      <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{answeredCount}</span>
                        </div>
                        <span className="text-[9px] font-semibold text-emerald-600/80">Answered</span>
                      </div>

                      <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700">
                        <div className="flex items-center gap-1">
                          <Flag size={9} className="fill-amber-500 text-amber-500" />
                          <span>{flaggedCount}</span>
                        </div>
                        <span className="text-[9px] font-semibold text-amber-600/80">Flagged</span>
                      </div>

                      <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <span>{unansweredCount}</span>
                        </div>
                        <span className="text-[9px] font-semibold text-slate-500">Pending</span>
                      </div>
                    </div>

                    {/* SECTIONED QUESTION LIST */}
                    <div className="flex flex-col gap-4 max-h-[420px] overflow-y-auto dashboard-scrollbar pr-1">

                      {/* MCQ QUESTIONS SECTION */}
                      {mcqNavItems.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                              <CheckCircle2 size={11} />
                              <span>MCQ Questions ({mcqNavItems.length})</span>
                            </span>
                          </div>

                          <div className="grid grid-cols-5 gap-2">
                            {mcqNavItems.map(({ q, idx }) => {
                              const isCurrent = idx === currentIdx;
                              const qAns = examState.answers[idx];
                              const isAns = isAnswerFilled(q, qAns);
                              const isCompleted = isAns && !isCurrent;
                              const qFlagged = Boolean(examState.flaggedQuestions?.[idx]);

                              return (
                                <button
                                  key={idx}
                                  onClick={() => goToQuestion(idx)}
                                  title={`Question ${idx + 1}: MCQ (${isCurrent ? 'Active (Current)' : qFlagged ? 'Flagged' : isCompleted ? 'Answered' : 'Unanswered'})`}
                                  className={`h-9 rounded-xl font-extrabold text-xs flex items-center justify-center cursor-pointer border transition-all duration-200 relative ${isCurrent
                                    ? 'bg-dash-primary-purple text-white border-dash-primary-purple shadow-sm scale-105 ring-2 ring-dash-primary-purple/40 font-black'
                                    : qFlagged
                                      ? 'bg-amber-500/15 text-amber-700 border-amber-500/50 hover:bg-amber-500/25'
                                      : isCompleted
                                        ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/40 hover:bg-emerald-500/25'
                                        : 'bg-slate-100 border-slate-200/80 text-slate-600 hover:bg-slate-200/70'
                                    }`}
                                >
                                  <span>{idx + 1}</span>

                                  {/* Mini Badges */}
                                  {qFlagged ? (
                                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[7px] font-black shadow-xs">
                                      <Flag size={7} className="fill-white" />
                                    </span>
                                  ) : isCompleted ? (
                                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[7px] font-black shadow-xs">
                                      <Check size={8} strokeWidth={3} />
                                    </span>
                                  ) : null}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* SCENARIO / CODING QUESTIONS SECTION */}
                      {codingNavItems.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                              <Code size={11} />
                              <span>Scenario & Coding Questions ({codingNavItems.length})</span>
                            </span>
                          </div>

                          <div className="grid grid-cols-5 gap-2">
                            {codingNavItems.map(({ q, idx }) => {
                              const isCurrent = idx === currentIdx;
                              const qAns = examState.answers[idx];
                              const isAns = isAnswerFilled(q, qAns);
                              const isCompleted = isAns && !isCurrent;
                              const qFlagged = Boolean(examState.flaggedQuestions?.[idx]);

                              return (
                                <button
                                  key={idx}
                                  onClick={() => goToQuestion(idx)}
                                  title={`Question ${idx + 1}: Coding (${isCurrent ? 'Active (Current)' : qFlagged ? 'Flagged' : isCompleted ? 'Answered' : 'Unanswered'})`}
                                  className={`h-9 rounded-xl font-extrabold text-xs flex items-center justify-center cursor-pointer border transition-all duration-200 relative ${isCurrent
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm scale-105 ring-2 ring-indigo-500/40 font-black'
                                    : qFlagged
                                      ? 'bg-amber-500/15 text-amber-700 border-amber-500/50 hover:bg-amber-500/25'
                                      : isCompleted
                                        ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/40 hover:bg-emerald-500/25'
                                        : 'bg-slate-100 border-slate-200/80 text-slate-600 hover:bg-slate-200/70'
                                    }`}
                                >
                                  <span>{idx + 1}</span>

                                  {/* Mini Badges */}
                                  {qFlagged ? (
                                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[7px] font-black shadow-xs">
                                      <Flag size={7} className="fill-white" />
                                    </span>
                                  ) : isCompleted ? (
                                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[7px] font-black shadow-xs">
                                      <Check size={8} strokeWidth={3} />
                                    </span>
                                  ) : null}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Quick Helper Banner */}
                    <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                      <span>Click any number to jump</span>
                      <button
                        onClick={toggleFlag}
                        className={`px-2.5 py-1 rounded-lg border text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-colors ${isFlagged
                          ? 'bg-amber-50 border-amber-200 text-amber-600'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700'
                          }`}
                      >
                        <Flag size={10} className={isFlagged ? "fill-amber-500 text-amber-500" : ""} />
                        <span>{isFlagged ? 'Flagged' : 'Flag'}</span>
                      </button>
                    </div>

                  </div>

                  {/* MAIN CONTENT AREA: Single Large Assessment Card (78% Width) */}
                  <div className="flex-1 w-full bg-dash-white-card border border-dash-border-gray/50 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-6 min-h-[540px]">

                    {/* CARD CONTENT BODY */}
                    <div className="flex flex-col gap-5 w-full">

                      {/* Question Header & Meta Bar */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4 w-full">
                        <div className="flex items-center gap-2.5">
                          <span className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-dash-primary-purple/10 text-dash-primary-purple border border-dash-primary-purple/20 shadow-2xs">
                            Question {currentIdx + 1} of {questions.length}
                          </span>
                          <span className="text-xs font-extrabold text-slate-400">
                            (1 Mark)
                          </span>
                        </div>

                        {/* Flag Question Action (Top-Right Corner) */}
                        <button
                          type="button"
                          onClick={toggleFlag}
                          className={`px-3.5 py-1.5 rounded-xl border text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all duration-200 ${isFlagged
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                            }`}
                        >
                          <Flag size={13} className={isFlagged ? "fill-amber-500 text-amber-500" : ""} />
                          <span>{isFlagged ? 'Flagged for Review' : 'Flag Question'}</span>
                        </button>
                      </div>

                      {/* Scenario Context Box (If Present) */}
                      {question.scenario && (
                        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4.5 shadow-2xs w-full">
                          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <Sparkles size={12} className="text-dash-primary-purple" />
                            <span>Scenario Context:</span>
                          </h5>
                          <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed whitespace-pre-line">
                            {question.scenario}
                          </p>
                        </div>
                      )}

                      {/* Question Text - Full Width for Maximum Readability */}
                      <div className="w-full">
                        <div className="font-plus-jakarta font-extrabold text-lg sm:text-xl text-[#1e1b4b] leading-relaxed">
                          <FormattedQuestionText text={question.question} />
                        </div>
                      </div>

                      {/* Options Header / Selection Clear Bar (ONLY FOR MCQ QUESTIONS) */}
                      {question.options && Array.isArray(question.options) && question.options.length > 0 ? (
                        <>
                          <div className="flex items-center justify-between border-t border-b border-slate-100/80 py-2.5 mt-1 w-full">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                              <CheckCircle2 size={15} className="text-dash-primary-purple" />
                              <span>Select your answer option:</span>
                            </span>

                            {examState.answers[currentIdx] && (
                              <button
                                type="button"
                                onClick={() => setExamState(prev => ({
                                  ...prev,
                                  answers: { ...prev.answers, [currentIdx]: '' }
                                }))}
                                className="text-[11px] font-extrabold text-slate-400 hover:text-red-500 flex items-center gap-1 bg-transparent border-0 cursor-pointer transition-colors"
                              >
                                <RotateCcw size={12} />
                                <span>Clear Selection</span>
                              </button>
                            )}
                          </div>

                          {/* Answer Options - Displayed Directly Beneath Question */}
                          <div className="grid grid-cols-1 gap-3.5 w-full">
                            {question.options.map((option, optIdx) => {
                              const optionLetter = String.fromCharCode(65 + optIdx);
                              const isSelected = examState.answers[currentIdx] === option;

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  onClick={() => setExamState(prev => ({
                                    ...prev,
                                    answers: { ...prev.answers, [currentIdx]: option }
                                  }))}
                                  className={`w-full text-left p-4.5 rounded-2xl border font-semibold text-sm transition-all duration-200 cursor-pointer flex items-start gap-4 group shadow-2xs ${isSelected
                                    ? 'bg-dash-primary-purple/10 border-2 border-dash-primary-purple text-dash-dark-purple shadow-sm font-bold scale-[1.003]'
                                    : 'bg-white border-dash-border-gray/60 text-slate-700 hover:border-dash-primary-purple/40 hover:bg-dash-soft-pink/30 hover:shadow-xs'
                                    }`}
                                >
                                  {/* Option Letter Badge */}
                                  <div className={`w-7 h-7 rounded-xl font-extrabold text-xs flex items-center justify-center shrink-0 transition-all ${isSelected
                                    ? 'bg-dash-primary-purple text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 border border-slate-200 group-hover:bg-dash-primary-purple/20 group-hover:text-dash-primary-purple'
                                    }`}>
                                    {optionLetter}
                                  </div>

                                  {/* Option Content */}
                                  <span className="flex-1 pt-0.5 leading-relaxed font-sans text-slate-800">{option}</span>

                                  {/* Selection Radio Circle */}
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${isSelected
                                    ? 'border-dash-primary-purple bg-dash-primary-purple text-white shadow-2xs'
                                    : 'border-slate-300 group-hover:border-dash-primary-purple'
                                    }`}>
                                    {isSelected && <Check size={12} strokeWidth={3} />}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <div className="w-full flex flex-col gap-3">
                          {/* Output Format Guidelines Box */}
                          {(() => {
                            const fmt = getAptitudeOutputFormat(question);
                            return fmt ? (
                              <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-3.5 w-full text-slate-700 text-xs sm:text-sm shadow-2xs flex items-center justify-between">
                                <h6 className="font-extrabold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5 text-[11px]">
                                  <FileText size={14} className="text-indigo-600" />
                                  <span>Output Format:</span>
                                </h6>
                                <span className="font-extrabold text-xs text-indigo-700 bg-white border border-indigo-200 px-3 py-1 rounded-xl shadow-2xs">
                                  {fmt}
                                </span>
                              </div>
                            ) : null;
                          })()}

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                              <Edit3 size={14} className="text-dash-primary-purple" />
                              <span>Type Your Answer:</span>
                            </span>
                            {question.answerType && (
                              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/60 px-2.5 py-1 rounded-full">
                                Format: {question.answerType === 'NUMBER' ? 'Numeric (Integer / Decimal)' : 'Text'}
                              </span>
                            )}
                          </div>
                          <div className="relative w-full">
                            <input
                              type="text"
                              inputMode={question.answerType === 'NUMBER' ? 'decimal' : 'text'}
                              value={examState.answers[currentIdx] || ''}
                              onChange={(e) => setExamState(prev => ({
                                ...prev,
                                answers: { ...prev.answers, [currentIdx]: e.target.value }
                              }))}
                              placeholder={question.placeholder || "Enter your answer"}
                              className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-dash-primary-purple bg-white text-slate-800 font-semibold text-base focus:outline-none focus:ring-4 focus:ring-dash-primary-purple/10 transition-all shadow-xs"
                            />
                            {examState.answers[currentIdx] && (
                              <button
                                type="button"
                                onClick={() => setExamState(prev => ({
                                  ...prev,
                                  answers: { ...prev.answers, [currentIdx]: '' }
                                }))}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer border-0"
                                title="Clear answer"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                          <span className="text-[11px] font-semibold text-slate-400 italic">
                            Please type your answer into the input field above.
                          </span>
                        </div>
                      )}

                    </div>

                    {/* CARD BOTTOM NAVIGATION FOOTER (Inside Same Assessment Card) */}
                    <div className="pt-5 border-t border-slate-100 flex items-center justify-between gap-4 w-full">
                      {/* Previous Question Button */}
                      <button
                        type="button"
                        onClick={() => goToQuestion(currentIdx - 1)}
                        disabled={!hasPrev}
                        className={`px-5 py-2.5 rounded-xl border font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer ${hasPrev
                          ? 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200 hover:scale-[1.01]'
                          : 'opacity-40 cursor-not-allowed text-slate-400 border-slate-200 bg-slate-50'
                          }`}
                      >
                        <ChevronLeft size={16} />
                        <span>Previous Question</span>
                      </button>

                      {/* Next Question / Finish Assessment Button */}
                      {hasNext ? (
                        <button
                          type="button"
                          onClick={() => goToQuestion(currentIdx + 1)}
                          className="px-6 py-2.5 rounded-xl bg-dash-primary-purple hover:bg-dash-dark-purple text-white font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer border-0 shadow-sm hover:scale-[1.01]"
                        >
                          <span>Next Question</span>
                          <ChevronRight size={16} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsSubmitModalOpen(true)}
                          className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer border-0 shadow-md hover:scale-[1.01]"
                        >
                          <CheckCircle2 size={16} />
                          <span>Finish Assessment</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {activeTab === 'english' && (
          <div className="w-full flex-1 flex flex-col gap-6 animate-fade-in select-text">
            {englishLoading && !englishInterview && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-dash-primary-purple" size={40} />
                <p className="text-sm font-semibold text-dash-light-purple">Initializing English Assessment...</p>
              </div>
            )}

            {englishInterview && (englishInterview.status === 'NOT_STARTED' || !englishInterview.status) && (
              <div className="w-full flex justify-center items-center py-6">
                <div className="w-full max-w-2xl bg-dash-white-card border border-dash-border-gray/50 rounded-[28px] p-8 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.03)] text-center flex flex-col items-center gap-7">

                  {/* Interviewer Profile Card */}
                  <div className="relative w-full rounded-2.5xl p-6 bg-gradient-to-br from-slate-50 to-slate-100/60 border border-slate-200/60 flex flex-col sm:flex-row items-center gap-5 text-left transition-all hover:shadow-md">
                    <div className="relative w-16 h-16 rounded-2xl bg-dash-primary-purple flex items-center justify-center text-white text-3xl shadow-inner shrink-0">
                      🎙️
                      <div className="absolute -inset-1 rounded-2xl border-2 border-dash-primary-purple/35 animate-ping opacity-60 pointer-events-none" />
                    </div>
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5">
                        <span className="font-plus-jakarta font-extrabold text-lg text-dash-dark-purple">
                          Interviewer: Puck
                        </span>
                        <span className="inline-flex self-center sm:self-auto items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-dash-primary-purple/10 text-dash-primary-purple uppercase tracking-wide">
                          Gemini 3.1 Live Voice
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-bold mt-0.5">AI HR Recruiting & Communications Manager</p>
                      <p className="text-[11px] text-slate-400 font-medium mt-2 leading-relaxed">
                        Puck uses the advanced Gemini Live voice synthesis protocol to conduct natural, real-time verbal assessments, evaluating your fluency, grammar, and pronunciation.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-plus-jakarta font-extrabold text-2xl text-dash-dark-purple tracking-tight">
                      English Communication Assessment
                    </h3>
                    <p className="text-xs font-bold text-dash-light-purple mt-1 uppercase tracking-wider">Real-Time Conversational Audit</p>
                  </div>

                  <div className="bg-dash-soft-pink/40 border border-dash-border-gray/40 rounded-2xl p-4 text-left w-full text-xs font-medium text-dash-dark-purple leading-relaxed space-y-1">
                    <p className="font-bold text-dash-primary-purple flex items-center gap-1.5">
                      <span>🎤 Continuous Voice Interview Protocol:</span>
                    </p>
                    <p className="text-slate-600">
                      The AI will read concise HR questions aloud one at a time. Once Puck finishes speaking, your microphone automatically turns ON. Speak naturally — silence will automatically submit your response and continue the conversation.
                    </p>
                  </div>

                  {englishInterview.is_eligible === false ? (
                    <div className="w-full p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-bold text-xs">
                      ⚠️ You must successfully complete the Technical Assessment first before starting the English Assessment.
                    </div>
                  ) : englishUploading ? (
                    <div className="w-full p-6 border border-dash-border-gray/50 rounded-2xl bg-slate-50 flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-dash-primary-purple" size={32} />
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                        <div className="h-full bg-dash-primary-purple transition-all duration-350" style={{ width: `${englishUploadProgress}%` }} />
                      </div>
                      <span className="text-xs font-bold text-dash-primary-purple">Uploading & Analyzing Resume... {englishUploadProgress}%</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 w-full">
                      {/* Hidden input for resume upload - placed outside conditional blocks so it is always present in DOM */}
                      <input
                        type="file"
                        ref={englishFileInputRef}
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            uploadEnglishResume(files[0]);
                          }
                        }}
                        accept=".pdf"
                        className="hidden"
                      />

                      {/* Resume Analysis Badge & Detail Summary */}
                      {candidate && (candidate.resume_filename || (candidate.resume && candidate.resume > 0) || candidate.resume_url || candidate.resume_path) ? (
                        <div className="w-full bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 text-left shadow-sm space-y-2.5">
                          <div className="flex items-center justify-between gap-3 border-b border-emerald-200/60 pb-2.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-700 shrink-0 font-extrabold text-sm">
                                📄
                              </div>
                              <div>
                                <p className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                                  <span>Resume Analyzed: {candidate.resume_filename || 'Uploaded Resume.pdf'}</span>
                                  <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">Verified</span>
                                </p>
                                <p className="text-[10px] text-emerald-700 font-bold mt-0.5">
                                  Resume Match Score: {candidate.resume || 85}% • Skills & Experience extracted by AI
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => englishFileInputRef.current && englishFileInputRef.current.click()}
                              className="text-[10px] font-extrabold text-dash-primary-purple hover:underline cursor-pointer shrink-0"
                            >
                              Re-upload PDF
                            </button>
                          </div>

                          <div className="text-[11px] text-slate-700 space-y-1">
                            <p className="font-extrabold text-dash-primary-purple uppercase tracking-wider text-[10px] flex items-center gap-1">
                              <span>🤖 AI Question Tailoring Protocol:</span>
                            </p>
                            <p className="text-[11px] leading-relaxed text-slate-600 font-medium">
                              The AI HR interviewer has thoroughly analyzed your resume context. All 8 interview questions will be customized based on your background, technical skills, and project experience.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left flex items-center gap-3">
                            <ShieldAlert size={18} className="text-amber-600 shrink-0" />
                            <div>
                              <p className="text-xs font-black text-amber-900">
                                Mandatory Step 1: Upload Your Resume PDF
                              </p>
                              <p className="text-[10px] text-amber-700 font-bold mt-0.5">
                                The AI will parse and analyze your resume to generate personalized interview questions based on your background.
                              </p>
                            </div>
                          </div>

                          {/* Drag & Drop Zone */}
                          <div
                            onDragOver={(e) => { e.preventDefault(); setEnglishDragOver(true); }}
                            onDragLeave={() => setEnglishDragOver(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setEnglishDragOver(false);
                              const files = e.dataTransfer.files;
                              if (files && files.length > 0) {
                                uploadEnglishResume(files[0]);
                              }
                            }}
                            onClick={() => englishFileInputRef.current && englishFileInputRef.current.click()}
                            className={`w-full py-6 border-2 border-dashed rounded-[20px] transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${englishDragOver
                              ? 'border-dash-primary-purple bg-dash-primary-purple/5 scale-[0.99]'
                              : 'border-dash-border-gray hover:border-dash-primary-purple hover:bg-dash-light-blue-bg/40'
                              }`}
                          >
                            <UploadCloud size={24} className="text-dash-light-purple animate-pulse" />
                            <span className="text-xs font-extrabold text-dash-dark-purple">
                              Upload Resume PDF to Analyze & Start Interview
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">Drag & Drop PDF file here or click to browse (max 5MB)</span>
                          </div>
                        </>
                      )}

                      {englishUploadError && (
                        <p className="text-[10px] font-bold text-red-500">{englishUploadError}</p>
                      )}

                      {/* Start AI Voice Interview button */}
                      {englishInterview.is_eligible !== false && (
                        <div className="flex flex-col items-center gap-2 mt-1 w-full">
                          <ActionButton
                            onClick={handleStartEnglish}
                            isLoading={englishLoading}
                            loadingText="Analyzing Resume & Starting Interview..."
                            disabled={englishLoading || startingEnglishRef.current}
                            icon={Play}
                            iconSize={13}
                            className="px-8 py-3.5 rounded-xl bg-dash-primary-purple text-white font-bold text-xs hover:bg-dash-dark-purple shadow-md justify-center w-full disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all hover:scale-[1.01]"
                          >
                            {candidate && (candidate.resume_filename || (candidate.resume && candidate.resume > 0) || candidate.resume_url || candidate.resume_path) ? 'Start AI Voice Interview (Based on Analyzed Resume)' : 'Upload Resume & Start AI Voice Interview'}
                          </ActionButton>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {englishInterview && englishInterview.status === 'IN_PROGRESS' && (() => {
              const conversations = englishInterview.conversations || [];
              const currentQ = englishInterview.current_question || {};
              const currentQNum = conversations.length;
              const activeQuestionText = currentQ.ai_question || englishInterview.ai_question || "Please introduce yourself.";
              const interviewerName = 'Puck';

              return (
                <div className="flex flex-col gap-6 w-full flex-1 animate-fade-in select-text">
                  <style>{`
                    @keyframes ripple {
                      0% { transform: scale(0.95); opacity: 0.8; }
                      50% { transform: scale(1.15); opacity: 0.4; }
                      100% { transform: scale(1.35); opacity: 0; }
                    }
                    .animate-ripple-fast {
                      animation: ripple 1.2s infinite ease-out;
                    }
                    .animate-ripple-medium {
                      animation: ripple 2s infinite ease-out;
                    }
                    .animate-ripple-slow {
                      animation: ripple 3.5s infinite ease-out;
                    }
                  `}</style>

                  {/* Header Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-dash-white-card border border-dash-border-gray/50 rounded-[20px] p-4 shadow-sm w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-pulse" />
                      <div>
                        <span className="text-xs font-extrabold text-dash-dark-purple block flex items-center gap-1.5">
                          <span>{interviewerName} - RecruitAI AI HR Manager</span>
                          <span className="text-[9px] bg-dash-primary-purple/10 text-dash-primary-purple px-2 py-0.5 rounded-full font-bold uppercase">
                            Puck Voice
                          </span>
                        </span>
                        <span className="text-[10px] font-extrabold text-dash-primary-purple">Question {currentQNum + 1} of 8</span>
                      </div>
                    </div>

                    {/* Progress Bar & Warning Counter */}
                    <div className="flex items-center gap-4 flex-1 max-w-md mx-4">
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-dash-primary-purple transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.round(((currentQNum + 1) / 8) * 100))}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 shrink-0">
                        <ShieldAlert size={13} />
                        <span className="text-[10px] font-black">{englishExamSecurity.fullscreenExitCount} / 3 Warn</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleCompleteEnglish}
                        disabled={englishLoading || aiTyping}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer border-none shrink-0"
                      >
                        Finish Assessment
                      </button>
                    </div>
                  </div>

                  {/* VOICE CALL INTERVIEW ROOM CONTAINER */}
                  <div className="w-full flex flex-col bg-gradient-to-b from-[#1c133a] to-[#0a0614] border border-[#2d1b54]/40 rounded-[32px] p-6 sm:p-8 shadow-[0_10px_35px_rgba(45,27,84,0.3)] min-h-[520px] relative overflow-hidden select-none gap-6">

                    {/* Two-Column Interview Layout */}
                    <div className="flex flex-col lg:flex-row gap-6 flex-1 z-10 relative">

                      {/* LEFT COLUMN: Avatar, Mic Button, Status */}
                      <div className="flex flex-col items-center justify-start gap-5 lg:w-64 shrink-0">
                        <div className="relative w-40 h-40 flex items-center justify-center rounded-full bg-white/5 border border-white/10 shadow-[0_0_50px_rgba(139,92,246,0.15)] shrink-0">

                          {/* Pulse wave rings based on state */}
                          {isRecording && (
                            <>
                              <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-ripple-fast" style={{ animationDelay: '0s' }} />
                              <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ripple-fast" style={{ animationDelay: '0.4s' }} />
                              <div className="absolute inset-0 rounded-full border border-emerald-500/10 animate-ripple-fast" style={{ animationDelay: '0.8s' }} />
                            </>
                          )}

                          {aiIsSpeaking && (
                            <>
                              <div className="absolute inset-0 rounded-full border border-violet-500/30 animate-ripple-medium" style={{ animationDelay: '0s' }} />
                              <div className="absolute inset-0 rounded-full border border-violet-500/20 animate-ripple-medium" style={{ animationDelay: '0.6s' }} />
                              <div className="absolute inset-0 rounded-full border border-violet-500/10 animate-ripple-medium" style={{ animationDelay: '1.2s' }} />
                            </>
                          )}

                          {(aiTyping || englishLoading || autoSubmitting) && (
                            <>
                              <div className="absolute inset-0 rounded-full border border-amber-400/30 animate-ripple-slow" style={{ animationDelay: '0s' }} />
                              <div className="absolute inset-0 rounded-full border border-amber-400/15 animate-ripple-slow" style={{ animationDelay: '1.2s' }} />
                            </>
                          )}

                          {/* Inner Avatar Box */}
                          <div className={`w-28 h-28 rounded-full flex items-center justify-center text-white shadow-2xl relative z-10 transition-all duration-500 ${isRecording
                            ? 'bg-emerald-600 shadow-emerald-500/30 border-2 border-emerald-400/40'
                            : aiIsSpeaking
                              ? 'bg-violet-600 shadow-violet-500/30 border-2 border-violet-400/40'
                              : autoSubmitting || aiTyping || englishLoading
                                ? 'bg-amber-600 shadow-amber-500/30 border-2 border-amber-400/40'
                                : 'bg-[#231b42] border border-[#40356c]'
                            }`}>
                            <Volume2 size={40} className={isRecording ? "animate-pulse" : aiIsSpeaking ? "animate-bounce" : ""} />
                          </div>
                        </div>

                        {/* Microphone Toggle Button */}
                        <button
                          type="button"
                          onClick={toggleRecording}
                          disabled={isTextMode}
                          className={`w-full px-4 py-2.5 rounded-full flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md border ${isTextMode
                            ? 'bg-slate-800 border-slate-700/50 text-slate-500 cursor-not-allowed opacity-50'
                            : isRecording
                              ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-500 text-white animate-pulse'
                              : 'bg-white/10 hover:bg-white/20 border-white/20 text-white cursor-pointer'
                            }`}
                        >
                          {isRecording ? <Mic size={13} /> : <MicOff size={13} className="opacity-75" />}
                          {isRecording ? 'Mic: ON' : 'Mic: OFF'}
                        </button>

                        {/* Speech status pill */}
                        <div className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-semibold text-white flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${isRecording
                            ? 'bg-emerald-500 animate-ping'
                            : aiIsSpeaking
                              ? 'bg-violet-500 animate-pulse'
                              : autoSubmitting || aiTyping || englishLoading
                                ? 'bg-amber-400 animate-ping'
                                : 'bg-slate-400'
                            }`} />
                          <span className="leading-tight">
                            {isRecording
                              ? 'You are speaking...'
                              : aiIsSpeaking
                                ? `${interviewerName} is speaking...`
                                : autoSubmitting
                                  ? 'Auto-submitting...'
                                  : aiTyping || englishLoading
                                    ? `${interviewerName} is thinking...`
                                    : `${interviewerName} is ready`}
                          </span>
                        </div>

                        {/* Mute AI Voice */}
                        <button
                          type="button"
                          onClick={toggleMute}
                          className={`w-full px-4 py-2.5 rounded-full flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md border ${isMuted
                            ? 'bg-amber-600 border-amber-600 text-white hover:bg-amber-700'
                            : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                            }`}
                          title={isMuted ? `Unmute ${interviewerName}'s Voice` : `Mute ${interviewerName}'s Voice`}
                        >
                          {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                          {isMuted ? 'AI: Muted' : 'AI: Audible'}
                        </button>
                      </div>

                      {/* RIGHT COLUMN: Chat history + Response box */}
                      <div className="flex-1 flex flex-col gap-4 min-w-0">

                        {/* Chat Dialogue History Box */}
                        <div
                          ref={chatContainerRef}
                          className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 min-h-[180px] max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent text-left"
                        >
                          {getChatMessages().map((msg, idx) => (
                            <div key={idx} className="flex flex-col gap-1 w-full">
                              <div className={`flex gap-2 items-start max-w-[88%] ${msg.type === 'ai' ? 'self-start' : 'self-end flex-row-reverse'}`}>
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[8px] shrink-0 border ${msg.type === 'ai'
                                  ? 'bg-violet-500/20 border-violet-500/30 text-violet-300'
                                  : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                                  }`}>
                                  {msg.type === 'ai' ? 'AI' : 'YOU'}
                                </div>
                                <div className={`rounded-2xl px-3 py-2 text-xs font-medium leading-relaxed border ${msg.type === 'ai'
                                  ? 'bg-[#29204a]/80 text-violet-100 border-violet-500/15'
                                  : 'bg-[#0f2a1e]/80 text-emerald-100 border-emerald-500/15'
                                  }`}>
                                  {msg.text}
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Thinking indicator */}
                          {(aiTyping || englishLoading || autoSubmitting) && (
                            <div className="flex gap-2 items-start max-w-[88%] self-start">
                              <div className="w-6 h-6 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center font-black text-[8px] text-violet-300 shrink-0">
                                AI
                              </div>
                              <div className="bg-[#29204a]/80 rounded-2xl px-3 py-2.5 border border-violet-500/15 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Candidate Response Input Box */}
                        <div className="bg-white/10 border border-white/20 rounded-2xl p-4 text-left shadow-lg backdrop-blur-md">
                          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
                              <span className="text-[10px] font-extrabold text-white uppercase tracking-wider">
                                {isTextMode ? '📝 Your Response (Text)' : isRecording ? '🎙️ Live Voice Input' : '📝 Your Response'}
                              </span>
                            </div>
                            <span className="text-[10px] text-emerald-300 font-bold italic">
                              {englishText ? `${englishText.trim().split(/\s+/).filter(Boolean).length} words` : isRecording ? 'Listening...' : ''}
                            </span>
                          </div>

                          <textarea
                            value={englishText}
                            onChange={(e) => {
                              if (isTextMode) {
                                setEnglishText(e.target.value);
                                currentTextRef.current = e.target.value;
                              }
                            }}
                            readOnly={!isTextMode}
                            placeholder={
                              isTextMode
                                ? "Type your response here..."
                                : isRecording
                                  ? "Speak clearly — your voice is being transcribed in real time..."
                                  : aiIsSpeaking
                                    ? `${interviewerName} is speaking. Your mic will activate automatically...`
                                    : "Waiting for your turn..."
                            }
                            rows={3}
                            className={`w-full bg-black/40 text-white font-sans text-xs font-medium p-3 rounded-xl border border-white/10 focus:outline-none resize-none shadow-inner leading-relaxed placeholder:text-slate-500 placeholder:italic ${isTextMode ? 'cursor-text select-text focus:border-white/30' : 'select-none cursor-default'
                              }`}
                          />

                          <div className="flex items-center justify-between mt-2.5 gap-3">
                            <span className="text-[10px] text-slate-400 font-medium leading-snug">
                              {isTextMode
                                ? '📝 Text Mode — type and click Submit'
                                : isRecording && englishText
                                  ? '✨ Transcribing live — 3s silence will auto-submit'
                                  : isRecording
                                    ? '🎙️ Mic active — speak clearly'
                                    : autoSubmitting
                                      ? '⏳ Auto-submitting...'
                                      : '🤖 Voice-driven — enable mic to speak'}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsTextMode(prev => {
                                    const newVal = !prev;
                                    isTextModeRef.current = newVal;
                                    if (newVal) stopRecording();
                                    return newVal;
                                  });
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer border border-white/10"
                              >
                                {isTextMode ? '🎙️ Voice' : '📝 Type'}
                              </button>

                              {englishText && englishText.trim().length > 0 && !isSubmittingRef.current && (
                                <button
                                  type="button"
                                  onClick={() => handleRespondEnglish(englishText)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[10px] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm animate-fade-in"
                                >
                                  <Send size={10} />
                                  Submit
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Control Bar */}
                    <div className="w-full flex items-center justify-between border-t border-white/10 pt-5 z-10 gap-4">
                      {/* Remaining Time */}
                      <div className="flex flex-col text-left">
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Remaining Time</span>
                        <span className="font-mono text-sm font-extrabold text-red-400">{formatTime(englishTimeLeft)}</span>
                      </div>

                      {/* Conclude Interview */}
                      <ActionButton
                        onClick={handleCompleteEnglish}
                        isLoading={englishLoading}
                        loadingText="Generating Report..."
                        disabled={aiTyping || conversations.length < 3}
                        className="px-5 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md"
                        title="Finish conversation and generate report"
                      >
                        Conclude Interview
                      </ActionButton>

                      {/* Conversation Turns info */}
                      <div className="flex flex-col text-right">
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Turns</span>
                        <span className="text-sm font-extrabold text-white">{currentQNum} / 8</span>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })()}

            {englishInterview && englishInterview.status === 'COMPLETED' && (
              <div className="w-full flex justify-center items-center py-10 animate-fade-in">
                <div className="w-full max-w-xl bg-dash-white-card border border-dash-border-gray/50 rounded-[28px] p-8 sm:p-10 shadow-[0_4px_25px_rgba(87,82,170,0.02)] text-center flex flex-col items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-[#10b981]">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h3 className="font-plus-jakarta font-extrabold text-2xl text-dash-dark-purple tracking-tight">
                      Interview Completed!
                    </h3>
                    <p className="text-xs font-bold text-dash-light-purple mt-1 uppercase tracking-wider">English Speaking Assessment</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 text-center w-full space-y-3.5 text-xs font-medium text-slate-700 leading-relaxed shadow-sm">
                    <p className="font-bold text-sm text-dash-primary-purple">Thank you for taking the assessment.</p>
                    <p>Your conversational AI HR interview has been successfully completed and saved.</p>
                    <p>All evaluation scores, summary analysis, strengths, weaknesses, and dialogue transcripts have been securely submitted to the recruiter for processing.</p>
                    <p className="text-[10px] text-dash-light-purple italic mt-2">You can safely navigate away or wait for updates from your recruiter.</p>
                  </div>

                  {/* One-attempt lock notice — no retry button */}
                  <div className="flex w-full items-center justify-center gap-2.5 bg-amber-50 border border-amber-200/70 rounded-xl px-5 py-3 mt-2">
                    <ShieldAlert size={15} className="text-amber-600 shrink-0" />
                    <p className="text-xs font-bold text-amber-700">
                      This assessment has been permanently submitted. Multiple attempts are not permitted.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}


        {activeTab !== 'technical' && activeTab !== 'english' && (
          <section className="bg-dash-white-card border border-dash-border-gray/50 rounded-[24px] p-8 shadow-sm flex flex-col items-center justify-center min-h-[350px] text-center">
            <div className="p-4 rounded-full bg-dash-light-blue-bg text-dash-primary-purple mb-4">
              <Clock size={36} className="animate-spin" style={{ animationDuration: '10s' }} />
            </div>
            <h3 className="font-plus-jakarta font-extrabold text-lg text-dash-dark-purple">
              Page Under Construction
            </h3>
            <p className="text-sm text-dash-light-purple font-medium mt-2 max-w-sm">
              We are working hard to bring this view to your RecruitAI candidate portal workspace.
            </p>
          </section>
        )}
      </main>

      {activeAssignment && !examState.submitted && (
        <ExamSecurityMonitor
          securityState={examSecurity}
          assessmentName={activeAssignment?.assessmentName || activeAssignment?.assessment?.name || 'Technical Assessment'}
          onAutoSubmit={(secData) => handleSubmitExam(activeAssignment?.id, secData)}
        />
      )}

      {isEnglishActive && (
        <ExamSecurityMonitor
          securityState={englishExamSecurity}
          assessmentName="English Communication Assessment"
          onAutoSubmit={() => handleCompleteEnglish()}
        />
      )}

      {/* Manual Submission Confirmation Modal */}
      <AnimatePresence>
        {isSubmitModalOpen && (() => {
          const currentAsm = activeAssignment?.assessment || activeAssignment || {};
          const modalQuestions = currentAsm.questions || [];
          const totalModalQuestions = modalQuestions.length;
          const completedModalQuestions = modalQuestions.filter((q, idx) => isAnswerFilled(q, examState.answers[idx])).length;
          const unansweredModalQuestions = Math.max(0, totalModalQuestions - completedModalQuestions);

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col items-center text-center gap-5"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <CheckCircle2 size={30} />
                </div>

                <div>
                  <h3 className="font-plus-jakarta font-extrabold text-xl text-slate-900">
                    Submit Assessment?
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    Review your completion progress before final submission
                  </p>
                </div>

                {/* Progress Confirmation Summary */}
                <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 text-left">
                    Progress Summary
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Completed Questions */}
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">Completed</span>
                      <span className="font-plus-jakarta font-black text-lg text-emerald-700 mt-0.5">
                        {completedModalQuestions}/{totalModalQuestions}
                      </span>
                    </div>

                    {/* Unanswered Questions */}
                    <div className={`border rounded-xl p-3 flex flex-col items-center justify-center ${unansweredModalQuestions > 0
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-700'
                      : 'bg-slate-100 border-slate-200 text-slate-600'
                      }`}>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider">Unanswered</span>
                      <span className="font-plus-jakarta font-black text-lg mt-0.5">
                        {unansweredModalQuestions}/{totalModalQuestions}
                      </span>
                    </div>
                  </div>

                  {/* Status Notice */}
                  {unansweredModalQuestions > 0 ? (
                    <div className="flex items-start gap-2 text-left bg-amber-50 border border-amber-200/70 p-2.5 rounded-xl text-amber-800 text-[11px] font-medium leading-relaxed">
                      <ShieldAlert size={15} className="text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        You have <strong className="font-extrabold text-amber-900">{unansweredModalQuestions} unanswered question{unansweredModalQuestions > 1 ? 's' : ''}</strong>. You can go back to complete them or submit now.
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 bg-emerald-50 border border-emerald-200/70 p-2.5 rounded-xl text-emerald-800 text-[11px] font-bold">
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                      <span>All {totalModalQuestions} questions have been completed!</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  After submission, your responses will be locked and cannot be modified.
                </p>

                <div className="flex items-center gap-3 w-full pt-1">
                  <ActionButton
                    onClick={() => setIsSubmitModalOpen(false)}
                    disabled={isSubmittingManual}
                    variant="secondary"
                    className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Go Back & Review
                  </ActionButton>

                  <ActionButton
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSubmitExam(activeAssignment?.id);
                    }}
                    isLoading={isSubmittingManual}
                    loadingText="Submitting..."
                    className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-md"
                  >
                    Confirm & Submit
                  </ActionButton>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
};

export default CandidateDashboard;