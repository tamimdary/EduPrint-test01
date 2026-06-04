/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppLanguage, StudentResultData, SubjectScore, EduDocument } from '../types';
import { translationData } from '../translations';
import CrestLogo from './CrestLogo';
import { 
  Building, 
  GraduationCap, 
  Plus, 
  Trash2, 
  Eye, 
  Edit3, 
  Save, 
  Printer, 
  Download, 
  Copy,
  User, 
  FileKey, 
  Award, 
  Sparkles, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';

interface ResultGeneratorProps {
  currentLang: AppLanguage;
  initialDoc?: StudentResultData | null;
  onSave: (doc: EduDocument) => Promise<void>;
  onBackToDashboard: () => void;
}

export default function ResultGenerator({
  currentLang,
  initialDoc,
  onSave,
  onBackToDashboard,
}: ResultGeneratorProps) {
  const t = translationData[currentLang];
  const isArabic = currentLang === 'ar';

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [institutionName, setInstitutionName] = useState('');
  const [logoOption, setLogoOption] = useState('preset-school');
  const [logoUploadedData, setLogoUploadedData] = useState<string | undefined>(undefined);
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [className, setClassName] = useState('');
  const [academicDetails, setAcademicDetails] = useState('');
  const [subjects, setSubjects] = useState<SubjectScore[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Auto Calculations state
  const [totalMarks, setTotalMarks] = useState(0);
  const [averageMarks, setAverageMarks] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [gpa, setGpa] = useState(0);
  const [grade, setGrade] = useState('');
  const [status, setStatus] = useState<'Pass' | 'Fail'>('Pass');

  // Trigger calculations whenever subjects array changes
  useEffect(() => {
    if (subjects.length === 0) {
      setTotalMarks(0);
      setAverageMarks(0);
      setPercentage(0);
      setGpa(0);
      setGrade('-');
      setStatus('Pass');
      return;
    }

    let sum = 0;
    let isFailed = false;

    subjects.forEach(sub => {
      sum += sub.marksObtained;
      // standard academic condition: if a student scores below 33 in any subject, they fail that subject
      if (sub.marksObtained < 33) {
        isFailed = true;
      }
    });

    const count = subjects.length;
    const avg = sum / count;
    // Assume 100 marks standard per subject
    const maxMarks = count * 100;
    const pct = (sum / maxMarks) * 100;

    // Standard grading calculations (scales GPA to 5.0 or 4.0 depending on country language fallback)
    let calculatedGpa = 0;
    let letterGrade = 'F';

    if (pct >= 80) {
      calculatedGpa = 5.0;
      letterGrade = 'A+';
    } else if (pct >= 70) {
      calculatedGpa = 4.0;
      letterGrade = 'A';
    } else if (pct >= 60) {
      calculatedGpa = 3.5;
      letterGrade = 'A-';
    } else if (pct >= 50) {
      calculatedGpa = 3.0;
      letterGrade = 'B';
    } else if (pct >= 40) {
      calculatedGpa = 2.0;
      letterGrade = 'C';
    } else if (pct >= 33) {
      calculatedGpa = 1.0;
      letterGrade = 'D';
    } else {
      calculatedGpa = 0;
      letterGrade = 'F';
      isFailed = true;
    }

    setTotalMarks(sum);
    setAverageMarks(parseFloat(avg.toFixed(2)));
    setPercentage(parseFloat(pct.toFixed(2)));
    setGpa(calculatedGpa);
    setGrade(letterGrade);
    setStatus(isFailed ? 'Fail' : 'Pass');
  }, [subjects]);

  // Load initial model if on edit workflow
  useEffect(() => {
    if (initialDoc) {
      setInstitutionName(initialDoc.institutionName || '');
      setLogoOption(initialDoc.logoOption || 'preset-school');
      setLogoUploadedData(initialDoc.logoUploadedData);
      setStudentName(initialDoc.studentName || '');
      setRollNumber(initialDoc.rollNumber || '');
      setRegistrationNumber(initialDoc.registrationNumber || '');
      setClassName(initialDoc.className || '');
      setAcademicDetails(initialDoc.academicDetails || '');
      setSubjects(initialDoc.subjects || []);
    } else {
      // Load standard defaults based on active language
      if (currentLang === 'bn') {
        setInstitutionName('শাপলা কিন্ডারগার্টেন ও আদর্শ উচ্চ বিদ্যালয়');
        setStudentName('তাহসিন ইসলাম নোমান');
        setRollNumber('১২');
        setRegistrationNumber('২০২৫৩৪০৯১');
        setClassName('অষ্টম শ্রেণী');
        setAcademicDetails('২০২৬ শিক্ষাবর্ষ');
        setSubjects([
          { id: '1', subjectName: 'বাংলা প্রথম পত্র', marksObtained: 85 },
          { id: '2', subjectName: 'ইংরেজি', marksObtained: 72 },
          { id: '3', subjectName: 'গণিত', marksObtained: 94 },
          { id: '4', subjectName: 'বিজ্ঞান', marksObtained: 68 },
          { id: '5', subjectName: 'ইতিহাস ও সামাজিক বিজ্ঞান', marksObtained: 80 }
        ]);
      } else if (currentLang === 'ar') {
        setInstitutionName('مدرسة الإيمان الإسلامية الأهلية');
        setStudentName('أحمد بن يوسف العباسي');
        setRollNumber('٤٥');
        setRegistrationNumber('٤٠٢٩١٨');
        setClassName('الصف الأول المتوسط');
        setAcademicDetails('العام الدراسي ٢٠٢٥ / ٢٠٢٦');
        setSubjects([
          { id: '1', subjectName: 'اللغة العربية والإنشاء', marksObtained: 90 },
          { id: '2', subjectName: 'الحديث الشريف وعلومه', marksObtained: 88 },
          { id: '3', subjectName: 'الرياضيات العامة', marksObtained: 74 },
          { id: '4', subjectName: 'العلوم الطبيعية', marksObtained: 81 },
          { id: '5', subjectName: 'اللغة الإنجليزية', marksObtained: 65 }
        ]);
      } else {
        setInstitutionName('Sunflower Academy of Excellence');
        setStudentName('Jameson Alexander');
        setRollNumber('24');
        setRegistrationNumber('ST-884021');
        setClassName('Grade 8 - Gold');
        setAcademicDetails('Academic Session 2025-2026');
        setSubjects([
          { id: '1', subjectName: 'English Literature', marksObtained: 88 },
          { id: '2', subjectName: 'Mathematical Sciences', marksObtained: 95 },
          { id: '3', subjectName: 'Physical Chemistry', marksObtained: 78 },
          { id: '4', subjectName: 'World Civilizations & History', marksObtained: 84 },
          { id: '5', subjectName: 'Information Technology', marksObtained: 90 }
        ]);
      }
    }
  }, [initialDoc, currentLang]);

  // Image Upload parser
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUploadedData(reader.result as string);
        setLogoOption('uploaded');
      };
      reader.readAsDataURL(file);
    }
  };

  // Add individual student subject score line
  const handleAddSubject = () => {
    const blankSubject: SubjectScore = {
      id: 'sub_' + Math.random().toString(36).substring(2, 11),
      subjectName: '',
      marksObtained: 80
    };
    setSubjects([...subjects, blankSubject]);
  };

  const handleRemoveSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const handleSubjectNameChange = (id: string, name: string) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, subjectName: name } : s));
  };

  const handleSubjectMarksChange = (id: string, marks: number) => {
    // Standard limits: grades marks are bounded on 0 to 100 max range
    const sanitized = Math.max(0, Math.min(100, marks));
    setSubjects(subjects.map(s => s.id === id ? { ...s, marksObtained: sanitized } : s));
  };

  // Compile full model payload to post or local storage
  const getPayload = (): StudentResultData => {
    return {
      id: initialDoc?.id || 'doc_' + Math.random().toString(36).substring(2, 11),
      type: 'result',
      lang: currentLang,
      institutionName,
      logoOption,
      logoUploadedData,
      createdAt: initialDoc?.createdAt || new Date().toISOString(),
      lastModified: new Date().toISOString(),
      studentName,
      rollNumber,
      registrationNumber,
      className,
      academicDetails,
      subjects,
      totalMarks,
      averageMarks,
      percentage,
      gpa,
      grade,
      status,
    };
  };

  const handleSave = async () => {
    if (!institutionName.trim() || !studentName.trim() || !rollNumber.trim()) {
      alert(currentLang === 'ar' ? 'يرجى إدخال اسم المؤسسة، واسم الطالب، ورقم الجلوس!' : currentLang === 'bn' ? 'দয়া করে প্রতিষ্ঠানের নাম, শিক্ষার্থীর নাম এবং রোল নম্বর লিখুন।' : 'Please enter Institution, Student Name, and Roll number first.');
      return;
    }
    setIsSaving(true);
    try {
      await onSave(getPayload());
    } finally {
      setIsSaving(false);
    }
  };

  // PDF direct download trigger
  const triggerPdfPrint = () => {
    window.print();
  };

  // Copy result card formatting to clipboard as a resilient backup for locked mobile devices
  const copyFormattedDocument = async () => {
    try {
      const element = document.getElementById('result-print-area');
      if (!element) return;
      
      const cloned = element.cloneNode(true) as HTMLElement;
      
      const blob = new Blob([cloned.innerHTML], { type: 'text/html' });
      const item = new ClipboardItem({ 
        'text/html': blob, 
        'text/plain': new Blob([element.innerText], { type: 'text/plain' }) 
      });
      await navigator.clipboard.write([item]);
      alert(currentLang === 'bn' ? 'ফলাফলপত্রটি ফর্ম্যাটসহ কপি করা হয়েছে! এমএস ওয়ার্ড বা গুগলে পেস্ট করতে পারবেন।' : 'Transcript marksheet copied with formatting! You can paste it directly into MS Word or other document editors.');
    } catch (err) {
      try {
        const element = document.getElementById('result-print-area');
        if (element) {
          await navigator.clipboard.writeText(element.innerText);
          alert(currentLang === 'bn' ? 'ফলাফলপত্রের সাধারণ টেক্সট কপি করা হয়েছে!' : 'Plain text transcript copied to clipboard!');
        }
      } catch (e) {
        alert('Failed to copy transcript content.');
      }
    }
  };

  // Export to standard .doc files for Microsoft Word
  const triggerDocxExport = () => {
    const filename = `${studentName.replace(/\s+/g, '_')}_result`;
    const element = document.getElementById('result-print-area');
    if (!element) return;

    const htmlContent = element.innerHTML;
    const isRtl = currentLang === 'ar';
    const direction = isRtl ? 'rtl' : 'ltr';
    const alignment = isRtl ? 'right' : 'left';

    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><title>EduPrint Student Transcript</title>
    <style>
      body { font-family: 'Arial', sans-serif; direction: ${direction}; text-align: ${alignment}; padding: 35px; }
      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .text-left { text-align: left; }
      table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 25px; }
      th, td { border: 1px solid #000; padding: 8px; text-align: ${alignment}; }
      th { background-color: #f2f2f2; font-weight: bold; }
      .result-badge { font-weight: bold; text-transform: uppercase; font-size: 16px; color: ${status === 'Pass' ? '#16a34a' : '#dc2626'}; }
      .profile-grid { width: 100%; margin-bottom: 20px; }
      .profile-grid td { border: none; padding: 4px 10px; }
    </style>
    </head>
    <body>`;
    const footer = "</body></html>";
    const totalHtml = header + htmlContent + footer;

    const blob = new Blob(['\ufeff' + totalHtml], {
      type: 'application/msword;charset=utf-8'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Sticky coordinate top bar tab for rapid edits */}
      <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-2xl shadow-sm sticky top-0 z-40">
        <button
          id="btn-back-dashboard-rg"
          onClick={onBackToDashboard}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition"
        >
          &larr; {isArabic ? 'خروج' : currentLang === 'bn' ? 'বাহির হোন' : 'Exit'}
        </button>

        <div className="flex bg-slate-100 rounded-xl p-1 shrink-0">
          <button
            id="tab-edit"
            onClick={() => setActiveTab('edit')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'edit' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isArabic ? 'تعديل الدرجات' : currentLang === 'bn' ? 'নম্বর লিখুন' : 'Fill Details'}
          </button>
          <button
            id="tab-preview"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'preview' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            {isArabic ? 'معاينة الشهادة للطباعة' : currentLang === 'bn' ? 'মার্কশীট প্রিভিউ' : 'Live Preview'}
          </button>
        </div>

        <button
          id="btn-rg-save"
          onClick={handleSave}
          disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1 shadow-sm transition"
        >
          <Save className="w-3.5 h-3.5" />
          {isSaving ? t.saving : isArabic ? 'حفظ' : currentLang === 'bn' ? 'সেভ' : 'Save'}
        </button>
      </div>

      {activeTab === 'edit' ? (
        /* Result calculator formulation form screen */
        <div id="rg-form-view" className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <GraduationCap className="text-indigo-600 w-5 h-5 animate-pulse" />
              {isArabic ? 'إنشاء شهادة درجات وصحيفة الطلاب' : currentLang === 'bn' ? 'শিক্ষার্থীদের রিপোর্ট কার্ড তৈরি' : 'Generate Student Marksheets'}
            </h2>
            <p className="text-xs text-slate-500">
              {isArabic ? 'أدخل اسم الطالب، والصفوف والدرجات لمشاهدة التقديرات الإجمالية التلقائية' : currentLang === 'bn' ? 'শিক্ষার্থীর সাধারণ তথ্যাবলী এবং প্রাপ্ত বিষয়ের নম্বর লিখলে ফলাফল হিসাব নিচে তৈরি হবে।' : 'Add scores line-by-line to view totals, letter grades, and passes instantly.'}
            </p>
          </div>

          <div className="space-y-4">
            {/* Institution + metadata inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.institutionName} <span className="text-red-500">*</span>
                </label>
                <input
                  id="rg-inst-name"
                  type="text"
                  placeholder={t.institutionPlaceholder}
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.logoSelect}
                </label>
                <select
                  id="rg-logo-opt"
                  value={logoOption}
                  onChange={(e) => setLogoOption(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="preset-school">{t.logoSchool}</option>
                  <option value="preset-madrasa">{t.logoMadrasa}</option>
                  <option value="preset-college">{t.logoCollege}</option>
                  <option value="preset-star">{t.logoStar}</option>
                  <option value="uploaded">{t.logoUpload}</option>
                  <option value="preset-none">{t.logoNone}</option>
                </select>
              </div>

              {logoOption === 'uploaded' && (
                <div className="animate-fade-in sm:col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t.logoUpload}
                  </label>
                  <div className="flex items-center gap-3 border border-slate-200 rounded-xl p-2 bg-white">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer w-full"
                    />
                    {logoUploadedData && (
                      <img
                        src={logoUploadedData}
                        alt="Logo Preview"
                        className="w-9 h-9 object-contain rounded-md border border-slate-200 p-0.5 bg-white shrink-0"
                      />
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.academicDetails}
                </label>
                <input
                  id="rg-session"
                  type="text"
                  placeholder="e.g. Session 2025-2026 / বার্ষিক পরীক্ষা"
                  value={academicDetails}
                  onChange={(e) => setAcademicDetails(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.className}
                </label>
                <input
                  id="rg-class"
                  type="text"
                  placeholder={t.classPlaceholder}
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            </div>

            {/* Student metadata fields */}
            <div className="bg-white rounded-2xl border border-slate-150 p-4 space-y-3">
              <span className="text-xs font-extrabold text-indigo-700 block uppercase tracking-wider">
                {t.studentInfoTitle}
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {t.studentName} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className={`absolute top-2.5 ${isArabic ? 'left-auto right-2.5' : 'left-2.5'} w-4 h-4 text-slate-400`} />
                    <input
                      id="rg-stud-name"
                      type="text"
                      placeholder={t.studentNamePlaceholder}
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className={`w-full border border-slate-200 rounded-xl py-2 ${isArabic ? 'pl-3 pr-8' : 'pl-8 pr-3'} text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {t.rollNumber} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="rg-stud-roll"
                    type="text"
                    placeholder={t.rollPlaceholder}
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {t.registrationNumber}
                  </label>
                  <div className="relative">
                    <FileKey className={`absolute top-2.5 ${isArabic ? 'left-auto right-2.5' : 'left-2.5'} w-4 h-4 text-slate-400`} />
                    <input
                      id="rg-stud-reg"
                      type="text"
                      placeholder={t.regPlaceholder}
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      className={`w-full border border-slate-200 rounded-xl py-2 ${isArabic ? 'pl-3 pr-8' : 'pl-8 pr-3'} text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Live recalculation summary badge box */}
            {subjects.length > 0 && (
              <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-wrap justify-between items-center gap-4 relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full" />
                <div className="space-y-1 z-10">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">{t.resultsSummary}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black">{gpa.toFixed(2)} {isArabic ? 'جـ' : 'GP'}</span>
                    <span className="text-sm text-lime-400 font-semibold">({grade})</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 z-10 text-xs sm:text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">{t.totalMarksObtained}</span>
                    <span className="text-sm font-bold font-mono">{totalMarks}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">{t.percentageValue}</span>
                    <span className="text-sm font-bold font-mono">{percentage}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">{t.statusLabel}</span>
                    <span className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full inline-block mt-0.5 ${
                      status === 'Pass' ? 'bg-emerald-500 shadow-sm shadow-emerald-700/30' : 'bg-red-500 shadow-sm shadow-red-700/30'
                    }`}>
                      {status === 'Pass' ? (isArabic ? 'ناجح' : 'PASS') : (isArabic ? 'راسب' : 'FAIL')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Custom subjects array details creator */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{t.subjectsListTitle}</span>
                <button
                  id="btn-add-subject"
                  type="button"
                  onClick={handleAddSubject}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs px-3.5 py-1.5 rounded-xl border border-indigo-200 transition flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t.addSubjectBtn}
                </button>
              </div>

              {subjects.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl text-slate-450 italic text-xs">
                  {isArabic ? 'لا توجد أوراق مواد درجات مضافة' : currentLang === 'bn' ? 'কোনো বিষয় যোগ করা হয়নি। উপরে বোতাম টিপে বিষয় যোগ করুন।' : 'No subjects recorded. Tap Add Subject above to record.'}
                </div>
              ) : (
                <div className="space-y-2">
                  {subjects.map((sub, idx) => (
                    <div key={sub.id} className="flex gap-2 items-center bg-slate-50/80 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-xs font-extrabold text-slate-400 font-mono w-5">
                        {idx + 1}.
                      </span>
                      <input
                        id={`inp-subname-${sub.id}`}
                        type="text"
                        placeholder={isArabic ? 'اسم المادة المأخوذة' : currentLang === 'bn' ? 'বিষয়ের নাম লিখুন' : 'e.g. English Grammar'}
                        value={sub.subjectName}
                        onChange={(e) => handleSubjectNameChange(sub.id, e.target.value)}
                        className="flex-1 min-w-0 border border-slate-250 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none"
                      />
                      <div className="flex items-center gap-1.5 w-24 shrink-0">
                        <input
                          id={`inp-submarks-${sub.id}`}
                          type="number"
                          placeholder="Marks"
                          value={sub.marksObtained}
                          onChange={(e) => handleSubjectMarksChange(sub.id, parseInt(e.target.value) || 0)}
                          className="w-full border border-slate-250 rounded-lg px-2 py-1.5 text-xs text-center bg-white font-bold text-slate-705"
                          min="0"
                          max="100"
                        />
                      </div>
                      <button
                        id={`btn-remove-sub-${sub.id}`}
                        type="button"
                        onClick={() => handleRemoveSubject(sub.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 bg-white rounded-lg border border-slate-200 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form coordinate buttons */}
          <div className="flex gap-3 pt-6 border-t border-slate-100">
            <button
              id="bg-btn-switch-preview"
              type="button"
              onClick={() => setActiveTab('preview')}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-4 rounded-xl text-xs transition duration-200 text-center flex items-center justify-center gap-1 animate-none"
            >
              <Eye className="w-4.5 h-4.5" />
              {isArabic ? 'معاينة شهادة الدرجات' : currentLang === 'bn' ? 'লাইভ প্রিভিউ দেখুন' : 'View Printable Layout'}
            </button>
            <button
              id="rg-save-main-btn"
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition duration-200 flex items-center justify-center gap-1.5 shadow-md"
            >
              <Save className="w-4.5 h-4.5" />
              {isSaving ? t.saving : t.saveToDatabase}
            </button>
          </div>
        </div>
      ) : (
        /* Report card document A4 sheet view */
        <div className="space-y-6">
          {/* Quick print and download bar */}
          <div className="bg-indigo-50 border border-indigo-150 p-4 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-indigo-900" dir={isArabic ? 'rtl' : 'ltr'}>
            <div className="space-y-0.5">
              <span className="font-bold text-sm block">
                {isArabic ? 'أدوات تصدير الشهادة جاهزة لتسليمها' : currentLang === 'bn' ? 'রিপোর্ট কার্ড প্রিন্ট এবং ডাউনলোড অপশন' : 'Export and Print Controls'}
              </span>
              <p className="text-xs text-indigo-700">
                {t.downloadPdfDetail}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                id="btn-print-rg"
                onClick={triggerPdfPrint}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                {t.downloadPdf}
              </button>
              
              <button
                id="btn-docx-rg"
                onClick={triggerDocxExport}
                className="bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-300 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                {t.downloadWord}
              </button>

              <button
                id="btn-copy-rg"
                onClick={copyFormattedDocument}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                title="Copies rich formatting text for painless copy pasting into locally installed soft copy apps"
              >
                <Copy className="w-4 h-4" />
                <span>{isArabic ? 'نسخ العلامات للورد' : currentLang === 'bn' ? 'ফর্ম্যাট কপি করুন (ওয়ার্ড)' : 'Copy Formatted Word'}</span>
              </button>
            </div>
          </div>

          {/* Transcript A4 visual card wrapper */}
          <div className="bg-slate-100 p-2 sm:p-6 rounded-3xl border border-slate-200 overflow-x-auto">
            <div 
              id="result-print-area"
              className="bg-white text-slate-900 mx-auto w-full max-w-[800px] min-h-[1050px] shadow-lg rounded-sm p-10 m-1 md:p-14 print:shadow-none print:w-full print:min-h-0 print:m-0 print:border-0 border-8 border-stone-100 shadow-[inset_0_0_0_1px_rgba(120,110,90,0.25)]"
              dir={isArabic ? 'rtl' : 'ltr'}
              style={{ contentVisibility: 'auto' }}
            >
              {/* Seal and headers */}
              <div className="flex flex-col items-center text-center border-b-2 border-slate-900 pb-5 mb-8">
                {logoOption !== 'preset-none' && (
                  <div className="mb-2">
                    <CrestLogo option={logoOption} uploadedData={logoUploadedData} className="w-20 h-20" />
                  </div>
                )}
                
                <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-snug">
                  {institutionName || 'Sunflower High School'}
                </h1>
                
                {academicDetails && (
                  <div className="text-xs font-bold text-slate-500 uppercase mt-1 tracking-widest">
                    {academicDetails}
                  </div>
                )}

                <div className="mt-4">
                  <span className="bg-slate-900 text-white text-xs font-bold tracking-widest px-5 py-1.5 rounded-sm uppercase inline-block">
                    {isArabic ? 'تقرير نتائج درجات الطلاب' : currentLang === 'bn' ? 'একাডেমিক ট্রান্সক্রিপ্ট / মার্কশীট' : 'OFFICIAL ACADEMIC TRANSCRIPT'}
                  </span>
                </div>
              </div>

              {/* Student demographic details grid */}
              <div className="bg-slate-50/50 border border-slate-200 rounded-lg p-5 mb-6 text-xs sm:text-xs">
                <span className="font-extrabold uppercase tracking-wide text-slate-500 block border-b border-slate-200 pb-1 mb-3">
                  {isArabic ? 'تفاصيل ومعلومات الطالب الفردية' : currentLang === 'bn' ? 'শিক্ষার্থীর পরিচয় ও বিবরণ' : 'STUDENT PROFILE CARD'}
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
                  <div className="flex items-center justify-between pb-1.5 border-b border-dashed border-slate-200">
                    <span className="text-slate-500 font-semibold">{t.studentName}</span>
                    <span className="font-extrabold text-slate-900">{studentName || '-'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pb-1.5 border-b border-dashed border-slate-200">
                    <span className="text-slate-500 font-semibold">{t.className}</span>
                    <span className="font-extrabold text-slate-900">{className || '-'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pb-1.5 border-b border-dashed border-slate-200">
                    <span className="text-slate-500 font-semibold">{t.rollNumber}</span>
                    <span className="font-extrabold text-slate-900 font-mono">{rollNumber || '-'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pb-1.5 border-b border-dashed border-slate-200">
                    <span className="text-slate-500 font-semibold">{t.registrationNumber}</span>
                    <span className="font-extrabold text-slate-900 font-mono">{registrationNumber || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Central Transcripts ledger results table */}
              <div className="mb-8">
                <table className="w-full text-xs text-slate-800 border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700">
                      <th className="border border-slate-300 p-2.5 font-bold w-12 text-center">#</th>
                      <th className="border border-slate-300 p-2.5 font-extrabold text-left">{isArabic ? 'المادة المعتمدة' : currentLang === 'bn' ? 'বিষয়ের নাম' : 'Academic Course Title'}</th>
                      <th className="border border-slate-300 p-2.5 font-extrabold w-28 text-center">{isArabic ? 'الدرجة الكاملة' : currentLang === 'bn' ? 'পূর্ণমান' : 'Max Mark'}</th>
                      <th className="border border-slate-300 p-2.5 font-extrabold w-28 text-center">{t.marksObtained}</th>
                      <th className="border border-slate-300 p-2.5 font-extrabold w-28 text-center">{isArabic ? 'مستوى التقدير' : currentLang === 'bn' ? 'লেটার গ্রেড' : 'Grade Point'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="border border-slate-300 p-6 text-center text-slate-400 italic font-medium">
                          {isArabic ? 'ليس هناك مواد مضافة في القائمة' : currentLang === 'bn' ? 'কোনও বিষয়ের নম্বর যোগ করা হয়নি।' : 'No subjects recorded in list.'}
                        </td>
                      </tr>
                    ) : (
                      subjects.map((sub, idx) => {
                        let finalLetter = 'F';
                        let pointVal = '0.0';
                        if (sub.marksObtained >= 80) { finalLetter = 'A+'; pointVal = '5.0'; }
                        else if (sub.marksObtained >= 70) { finalLetter = 'A'; pointVal = '4.0'; }
                        else if (sub.marksObtained >= 60) { finalLetter = 'A-'; pointVal = '3.5'; }
                        else if (sub.marksObtained >= 50) { finalLetter = 'B'; pointVal = '3.0'; }
                        else if (sub.marksObtained >= 40) { finalLetter = 'C'; pointVal = '2.0'; }
                        else if (sub.marksObtained >= 33) { finalLetter = 'D'; pointVal = '1.0'; }

                        return (
                          <tr key={sub.id} className="hover:bg-slate-50/50">
                            <td className="border border-slate-300 p-2 px-3 text-center text-slate-500 font-mono font-bold">{idx + 1}</td>
                            <td className="border border-slate-300 p-2 px-3.5 font-bold text-slate-800 text-left">{sub.subjectName || '-'}</td>
                            <td className="border border-slate-300 p-2 text-center text-slate-600 font-mono">100</td>
                            <td className={`border border-slate-300 p-2 text-center font-bold font-mono ${sub.marksObtained < 33 ? 'text-red-600 font-extrabold bg-red-10 px-2 rounded-sm' : 'text-slate-800'}`}>
                              {sub.marksObtained}
                            </td>
                            <td className="border border-slate-300 p-2 text-center text-slate-700 font-bold font-serif">{finalLetter} ({pointVal})</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Automatic outputs aggregate recap cards */}
              {subjects.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mb-10 border border-slate-300 rounded-lg p-5 bg-slate-50/50 text-xs sm:text-xs">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                      <span className="text-slate-500 font-semibold">{t.totalMarksObtained}:</span>
                      <span className="font-extrabold text-slate-900 font-mono text-sm">{totalMarks} / {subjects.length * 100}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                      <span className="text-slate-500 font-semibold">{t.averageMarks}:</span>
                      <span className="font-extrabold text-slate-950 font-mono">{averageMarks}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-semibold">{t.percentageValue}:</span>
                      <span className="font-extrabold text-slate-950 font-mono">{percentage}%</span>
                    </div>
                  </div>

                  <div className="space-y-2 border-l border-slate-300 pl-4">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                      <span className="text-slate-500 font-semibold">{t.calculatedGpa}:</span>
                      <span className="font-black text-slate-950 text-sm">{gpa.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                      <span className="text-slate-500 font-semibold">{t.calculatedGrade}:</span>
                      <span className="font-black text-indigo-700 text-sm">{grade}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-semibold">{t.statusLabel}:</span>
                      <span className={`font-black uppercase px-3 py-0.5 rounded-sm inline-block ${
                        status === 'Pass' ? 'text-emerald-700' : 'text-red-700'
                      }`}>
                        {status === 'Pass' ? t.statusPass : t.statusFail}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Signatures spacer lines */}
              <div className="mt-20 pt-10 border-t border-slate-100">
                <div className="flex justify-between text-center text-xs text-slate-600 font-bold">
                  <div className="w-1/3">
                    <div className="border-t border-slate-400 mt-6 pt-1.5 font-mono text-[10px]">
                      {isArabic ? 'مجلس التقييم الإداري' : currentLang === 'bn' ? 'শ্রেণী শিক্ষকের স্বাক্ষর' : 'Class Teacher'}
                    </div>
                  </div>
                  <div className="w-1/3">
                    <div className="border-t border-slate-400 mt-6 pt-1.5 font-mono text-[10px]">
                      {isArabic ? 'قسم الامحانات والکنترول' : currentLang === 'bn' ? 'পরীক্ষা নিয়ন্ত্রক' : 'Controller of Exams'}
                    </div>
                  </div>
                  <div className="w-1/3">
                    <div className="border-t border-slate-400 mt-6 pt-1.5 font-mono text-[10px]">
                      {isArabic ? 'مدير عام الـمؤسسة' : currentLang === 'bn' ? 'প্রধান শিক্ষক / অধ্যক্ষের স্বাক্ষর' : 'Principal Seal'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
