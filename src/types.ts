/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DocType = 'notice' | 'question' | 'result';
export type AppLanguage = 'en' | 'bn' | 'ar';

export interface BaseDocument {
  id: string;
  type: DocType;
  lang: AppLanguage;
  institutionName: string;
  logoOption: string; // "preset-none" | "preset-school" | "preset-madrasa" | "preset-college" | "preset-star" | "preset-[custom-svg]" | "uploaded"
  logoUploadedData?: string; // base64 string
  createdAt: string;
  lastModified: string;
  isSynced?: boolean;
  // Extended customization properties for templates
  templateVariant?: number; // 1 to 10
  customColor?: 'indigo' | 'emerald' | 'crimson' | 'amber' | 'slate' | 'violet' | 'rose' | 'sky' | 'teal' | 'gold';
  customFont?: 'sans' | 'display' | 'serif' | 'elegant' | 'mono' | 'tajawal' | 'amiri';
  headerStyle?: 'centered' | 'split-left' | 'badge-stamp' | 'ribbon-strip' | 'traditional';
  arabicNumerals?: boolean; // Eastern Arabic numeral conversion
}

export interface InstitutionProfile {
  name: string;
  logoOption: string;
  logoUploadedData?: string;
  address: string;
  phone: string;
  principal: string;
  website: string;
}

// Notice specific data
export interface NoticeData extends BaseDocument {
  type: 'notice';
  noticeTitle: string;
  noticeDate: string;
  noticeContent: string;
  signatureName: string;
  signatureTitle: string;
  templateStyle: 'classic' | 'modern' | 'minimal' | 'elegant';
}

// Question specific data
export type QuestionType = 'short' | 'long' | 'mcq' | 'creative' | 'section';

export interface MCQOption {
  id: string;
  text: string;
}

export interface QuestionItem {
  id: string;
  type: QuestionType;
  questionText: string;
  marks?: number;
  options?: MCQOption[]; // For MCQ
  subQuestions?: string[]; // For creative question steps (e.g. A, B, C, D)
}

export interface QuestionPaperData extends BaseDocument {
  type: 'question';
  examName: string;
  className: string;
  subjectName: string;
  fullMarks: string;
  examTime: string;
  instructions: string;
  questions: QuestionItem[];
}

// Result specific data
export interface SubjectScore {
  id: string;
  subjectName: string;
  marksObtained: number;
}

export interface StudentResultData extends BaseDocument {
  type: 'result';
  studentName: string;
  rollNumber: string;
  registrationNumber: string;
  className: string;
  academicDetails: string;
  subjects: SubjectScore[];
  // Summary outputs computed on edit
  totalMarks: number;
  averageMarks: number;
  percentage: number;
  gpa: number;
  grade: string;
  status: 'Pass' | 'Fail';
}

export type EduDocument = NoticeData | QuestionPaperData | StudentResultData;

export interface AppSettings {
  googleAppsScriptUrl: string;
  offlineFallbackOnly: boolean;
}
