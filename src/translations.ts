/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppLanguage } from './types';

export interface Translations {
  appName: string;
  tagline: string;
  noInternetWarning: string;
  
  // Tabs & Navigation
  dashboard: string;
  noticeBuilder: string;
  questionBuilder: string;
  resultGenerator: string;
  savedDocuments: string;
  setupGuide: string;
  
  // Common Form Inputs
  institutionName: string;
  institutionPlaceholder: string;
  logoSelect: string;
  logoNone: string;
  logoSchool: string;
  logoMadrasa: string;
  logoCollege: string;
  logoStar: string;
  logoUpload: string;
  languageSelect: string;
  
  // General Actions
  saveToDatabase: string;
  saving: string;
  savedSuccessfully: string;
  saveError: string;
  livePreview: string;
  editDocument: string;
  downloadPdf: string;
  downloadPdfDetail: string;
  downloadWord: string;
  deleteDoc: string;
  confirmDelete: string;
  editBack: string;
  createNew: string;
  noSavedDocs: string;
  searchDocs: string;
  creationDate: string;
  lastModifiedDate: string;
  
  // Notice Builder Specifics
  noticeTitle: string;
  noticeTitlePlaceholder: string;
  noticeDate: string;
  noticeContent: string;
  noticeContentPlaceholder: string;
  signatureName: string;
  signatureNamePlaceholder: string;
  signatureTitle: string;
  signatureTitlePlaceholder: string;
  templateStyle: string;
  templateClassic: string;
  templateModern: string;
  templateMinimal: string;
  templateElegant: string;
  
  // Question Builder Specifics
  examName: string;
  examNamePlaceholder: string;
  className: string;
  classPlaceholder: string;
  subjectName: string;
  subjectPlaceholder: string;
  fullMarks: string;
  examTime: string;
  instructions: string;
  instructionsPlaceholder: string;
  addQuestionBtn: string;
  questionType: string;
  questionText: string;
  questionTextPlaceholder: string;
  marksValue: string;
  btnUp: string;
  btnDown: string;
  qShort: string;
  qLong: string;
  qMcq: string;
  qCreative: string;
  optionsLabel: string;
  optionText: string;
  addOptionBtn: string;
  subQuestionsLabel: string;
  subQuestionText: string;
  addSubQuestionBtn: string;
  
  // Result Generator Specifics
  studentInfoTitle: string;
  studentName: string;
  studentNamePlaceholder: string;
  rollNumber: string;
  rollPlaceholder: string;
  registrationNumber: string;
  regPlaceholder: string;
  academicDetails: string;
  subjectsListTitle: string;
  addSubjectBtn: string;
  marksObtained: string;
  resultsSummary: string;
  totalMarksObtained: string;
  averageMarks: string;
  percentageValue: string;
  calculatedGpa: string;
  calculatedGrade: string;
  statusLabel: string;
  statusPass: string;
  statusFail: string;
}

export const translationData: Record<AppLanguage, Translations> = {
  en: {
    appName: "EduPrint Mobile",
    tagline: "Professional Board Sheets & Notices directly from your phone",
    noInternetWarning: "Note: Works offline! Saved to Google Sheets when connected.",
    
    dashboard: "Dashboard",
    noticeBuilder: "Notice Builder",
    questionBuilder: "Question Paper Builder",
    resultGenerator: "Result Generator",
    savedDocuments: "Saved Documents",
    setupGuide: "Database Setup",
    
    institutionName: "Institution Name",
    institutionPlaceholder: "e.g. Sunflower Primary School",
    logoSelect: "Header Logo Icon",
    logoNone: "No Logo",
    logoSchool: "School Crest",
    logoMadrasa: "Madrasa Crest",
    logoCollege: "College Crest",
    logoStar: "National Star Emblem",
    logoUpload: "Upload Custom Logo",
    languageSelect: "Select App Language",
    
    saveToDatabase: "Save Document (Online/Local)",
    saving: "Saving...",
    savedSuccessfully: "Document saved successfully!",
    saveError: "Failed to connect to Google Sheets. Saved locally instead.",
    livePreview: "Document Live Preview",
    editDocument: "Edit Document",
    downloadPdf: "Download PDF / Print",
    downloadPdfDetail: "Opens mobile print. Choose 'Save as PDF' layout.",
    downloadWord: "Download DOCX (Word)",
    deleteDoc: "Delete",
    confirmDelete: "Are you sure you want to delete this document?",
    editBack: "Back to Edit",
    createNew: "Create New",
    noSavedDocs: "No saved documents found on your phone or database.",
    searchDocs: "Search by institution or title...",
    creationDate: "Created on",
    lastModifiedDate: "Last modified",
    
    noticeTitle: "Notice Heading/Title",
    noticeTitlePlaceholder: "e.g. Notice of Eid Mubarak / Monsoon Holidays",
    noticeDate: "Notice Issue Date",
    noticeContent: "Notice Body Content",
    noticeContentPlaceholder: "Write the details of the announcement here...",
    signatureName: "Authorized Authority Name",
    signatureNamePlaceholder: "e.g. Mr. Muhammad Rahman",
    signatureTitle: "Authority Designation",
    signatureTitlePlaceholder: "e.g. Principal / Headmaster",
    templateStyle: "Notice Design Border Frame",
    templateClassic: "Classic Border Frame",
    templateModern: "Modern Left-Streak",
    templateMinimal: "Minimalist Borderless",
    templateElegant: "Elegant Royal Swirls",
    
    examName: "Exam Name",
    examNamePlaceholder: "e.g. Half-Yearly Examination 2026",
    className: "Class / Grade",
    classPlaceholder: "e.g. Class 7",
    subjectName: "Subject",
    subjectPlaceholder: "e.g. Mathematics",
    fullMarks: "Full Marks",
    examTime: "Exam Allowed Time (e.g. 2 Hours 30 Mins)",
    instructions: "Student Instructions (Top)",
    instructionsPlaceholder: "e.g. Read all questions thoroughly. Figures indicate marks.",
    addQuestionBtn: "+ Add Question",
    questionType: "Question Form",
    questionText: "Question Text",
    questionTextPlaceholder: "Write the question statement here...",
    marksValue: "Marks",
    btnUp: "▲ Up",
    btnDown: "▼ Down",
    qShort: "Short Answer Question",
    qLong: "Long Description Question",
    qMcq: "Multiple Choice Question (MCQ)",
    qCreative: "Creative Question (A, B, C, D)",
    optionsLabel: "MCQ Options",
    optionText: "Option text",
    addOptionBtn: "+ Add Option",
    subQuestionsLabel: "Sub-questions (Creative Steps)",
    subQuestionText: "Sub-question text",
    addSubQuestionBtn: "+ Add Sub-Step",
    
    studentInfoTitle: "Student Profile",
    studentName: "Student Name",
    studentNamePlaceholder: "e.g. Abul Kalam",
    rollNumber: "Roll / ID Number",
    rollPlaceholder: "e.g. 102",
    registrationNumber: "Registration Number (Optional)",
    regPlaceholder: "e.g. 5040183",
    academicDetails: "Academic Session",
    subjectsListTitle: "Subject Grades Data",
    addSubjectBtn: "+ Add Subject Score",
    marksObtained: "Marks Obtained",
    resultsSummary: "Performance Calculation Report",
    totalMarksObtained: "Total Marks",
    averageMarks: "Average Grade Point",
    percentageValue: "Percentage Rate",
    calculatedGpa: "Grade Point Average (GPA)",
    calculatedGrade: "Leter Grade Result",
    statusLabel: "Status Result",
    statusPass: "PASSED (উত্তীর্ণ)",
    statusFail: "FAILED (অকৃতকার্য)",
  },
  bn: {
    appName: "এডুপ্রিন্ট মোবাইল",
    tagline: "আপনার মোবাইল ফোন থেকেই তৈরি করুন পেশাদার পরীক্ষার প্রশ্ন, নোটিশ ও ফলাফল",
    noInternetWarning: "বিশেষত্ব: অফলাইনে কাজ করে! ইন্টারনেট সংযোগ থাকলে গুগল শিটে সেভ হবে।",
    
    dashboard: "ড্যাশবোর্ড",
    noticeBuilder: "নোটিশ মেকার",
    questionBuilder: "প্রশ্নপত্র মেকার",
    resultGenerator: "ফলাফল শীট মেকার",
    savedDocuments: "সংরক্ষিত ডকুমেন্টস",
    setupGuide: "ডাটাবেস সেটআপ",
    
    institutionName: "শিক্ষা প্রতিষ্ঠানের নাম",
    institutionPlaceholder: "উদাঃ শাপলা মডেল হাই স্কুল",
    logoSelect: "নির্ধারিত লোগো / মনোগ্রাম",
    logoNone: "লোগো ছাড়া",
    logoSchool: "স্কুল মনোগ্রাম",
    logoMadrasa: "মাদ্রাসা মনোগ্রাম",
    logoCollege: "কলেজ মনোগ্রাম",
    logoStar: "জাতীয় তারকা প্রতীক",
    logoUpload: "নিজের গ্যালারি থেকে লোগো যোগ করুন",
    languageSelect: "ভাষা পরিবর্তন করুন",
    
    saveToDatabase: "ডকুমেন্ট সেভ করুন (অনলাইন/মেমোরি)",
    saving: "সেভ হচ্ছে...",
    savedSuccessfully: "ডকুমেন্টটি সফলভাবে সংরক্ষিত হয়েছে!",
    saveError: "গুগল শিটে সেভ করা যায়নি। তবে ফোনে সাময়িকভাবে সুরক্ষিত রাখা হয়েছে।",
    livePreview: "ডকুমেন্ট লাইভ প্রিভিউ",
    editDocument: "সংশোধন করুন",
    downloadPdf: "পিডিএফ ডাউনলোড / প্রিন্ট",
    downloadPdfDetail: "ফোনে প্রিন্ট অপশন খুলবে। 'Save as PDF' সিলেক্ট করুন।",
    downloadWord: "ওয়ার্ড ফাইল ডাউনলোড (DOCX)",
    deleteDoc: "মুছে ফেলুন",
    confirmDelete: "আপনি কি নিশ্চিত যে এই ডকুমেন্টটি মুছে ফেলতে চান?",
    editBack: "এডিটে ফিরে যান",
    createNew: "নতুন তৈরি করুন",
    noSavedDocs: "এখনও কোনো নতুন ডকুমেন্ট তৈরি বা সংরক্ষণ করা হয়নি।",
    searchDocs: "প্রতিষ্ঠান অথবা শিরোনাম দিয়ে সার্চ করুন...",
    creationDate: "তৈরির তারিখ",
    lastModifiedDate: "সর্বশেষ সংশোধন",
    
    noticeTitle: "নোটিশের শিরোনাম",
    noticeTitlePlaceholder: "উদাঃ ঈদুল ফিতর উপলক্ষে ছুটির নোটিশ",
    noticeDate: "নোটিশের প্রকাশের তারিখ",
    noticeContent: "নোটিশের মূল বিষয়বস্তু",
    noticeContentPlaceholder: "এখান নোটিশের বিস্তারিত বিবরণটি বাংলায় লিখুন...",
    signatureName: "অনুমোদনকারীর নাম",
    signatureNamePlaceholder: "উদাঃ রহমান আলী",
    signatureTitle: "অনুমোদনকারী পদের নাম",
    signatureTitlePlaceholder: "উদাঃ প্রধান শিক্ষক / অধ্যক্ষ",
    templateStyle: "নোটিশের সুন্দর ফ্রেম সিলেক্ট করুন",
    templateClassic: "ক্লাসিক মেমরি ফ্রেম",
    templateModern: "মডার্ন লেফট স্ট্রাইপ",
    templateMinimal: "লাইন ফ্রেম ছাড়া",
    templateElegant: "রাজকীয় ফ্লোরাল ফ্রেম",
    
    examName: "পরীক্ষার নাম",
    examNamePlaceholder: "উদাঃ অর্ধবার্ষিক পরীক্ষা ২০২৬",
    className: "শ্রেণী",
    classPlaceholder: "উদাঃ সপ্তম শ্রেণী",
    subjectName: "বিষয়",
    subjectPlaceholder: "উদাঃ গণিত",
    fullMarks: "পূর্ণমান",
    examTime: "পরীক্ষার সময় (উদাঃ ২ ঘণ্টা ৩০ মিনিট)",
    instructions: "শিক্ষার্থীদের জন্য বিশেষ নির্দেশনাবলী (উপরে)",
    instructionsPlaceholder: "উদাঃ সকল প্রশ্নের উত্তর দেওয়া আবশ্যক। ডান পাশের সংখ্যা পূর্ণমান নির্দেশ করে।",
    addQuestionBtn: "+ নতুন প্রশ্ন যুক্ত করুন",
    questionType: "প্রশ্নের ধরণ",
    questionText: "প্রশ্নের বিবরণ",
    questionTextPlaceholder: "এখানে আপনার প্রশ্নটি লিখুন...",
    marksValue: "নম্বর",
    btnUp: "▲ উপরে",
    btnDown: "▼ নিচে",
    qShort: "সংক্ষিপ্ত প্রশ্ন",
    qLong: "বর্ণনামূলক প্রশ্ন",
    qMcq: "বহুনির্বাচনী প্রশ্ন (MCQ)",
    qCreative: "সৃজনশীল প্রশ্ন (ক, খ, গ, ঘ)",
    optionsLabel: "MCQ অপশনসমূহ",
    optionText: "অপশন লিখুন",
    addOptionBtn: "+ নতুন অপশন",
    subQuestionsLabel: "সৃজনশীল স্তরের প্রশ্নসমূহ (ক, খ, গ, ঘ)",
    subQuestionText: "স্তর ভিত্তিক আংশিক প্রশ্ন",
    addSubQuestionBtn: "+ নতুন উপ-প্রশ্ন",
    
    studentInfoTitle: "শিক্ষার্থীর পরিচয় বিবরণ",
    studentName: "শিক্ষার্থীর নাম",
    studentNamePlaceholder: "উদাঃ আবুল কালাম",
    rollNumber: "রোল নম্বর",
    rollPlaceholder: "উদাঃ ১০২",
    registrationNumber: "রেজিস্ট্রেশন নম্বর (ঐচ্ছিক)",
    regPlaceholder: "উদাঃ ৫০৪০১৮৩",
    academicDetails: "শিক্ষাবর্ষ",
    subjectsListTitle: "বিষয় ও প্রাপ্ত নম্বরের তালিকা",
    addSubjectBtn: "+ নতুন বিষয়ের নম্বর যুক্ত করুন",
    marksObtained: "প্রাপ্ত নম্বর",
    resultsSummary: "ফলাফলের স্বয়ংক্রিয় হিসাব",
    totalMarksObtained: "মোট প্রাপ্ত নম্বর",
    averageMarks: "গড় নম্বর",
    percentageValue: "শতকরা হার",
    calculatedGpa: "প্রাপ্ত গ্রেড পয়েন্ট (GPA)",
    calculatedGrade: "লেটার গ্রেড",
    statusLabel: "শিক্ষার্থীর চূড়ান্ত ফলাফল",
    statusPass: "উত্তীর্ণ (PASSED)",
    statusFail: "অকৃতকার্য (FAILED)",
  },
  ar: {
    appName: "إيدو برينت موبايل",
    tagline: "تصميم وطباعة أوراق المعامالت المدرسية واالختبارات بالهاتف بسهولة",
    noInternetWarning: "يعمل دون إنترنت! يتم الحفظ في سحابة جوجل شيتس عند التوصيل بالشبكة.",
    
    dashboard: "لوحة التحكم",
    noticeBuilder: "منشئ الإعلانات والتعاميم",
    questionBuilder: "منشئ أوراق الاختبارات",
    resultGenerator: "مستخرج الشهادات والنتائج",
    savedDocuments: "المستندات المحفوظة",
    setupGuide: "إعداد قاعدة البيانات",
    
    institutionName: "اسم المؤسسة التعليمية",
    institutionPlaceholder: "مثال: مدرسة عباد الرحمن الابتدائية",
    logoSelect: "شعار الهيدر العالي للمستند",
    logoNone: "بدون شعار",
    logoSchool: "الشعار المدرسي",
    logoMadrasa: "الشعار الإسلامي / المحراب",
    logoCollege: "شعار الكلية الجامعية",
    logoStar: "النجمة الوطنية / الهلال",
    logoUpload: "رفع شعار مخصص من المعرض",
    languageSelect: "تغيير لغة التطبيق",
    
    saveToDatabase: "حفظ المستند (في السحاب/محلياً)",
    saving: "جاري الحفظ...",
    savedSuccessfully: "تم حفظ المستند بنجاح تام!",
    saveError: "تعذر الحفظ في Google Sheets حالياً لمشكلة اتصال. تم حفظها في ذاكرة الهاتف مؤقتاً.",
    livePreview: "معاينة المستند المباشر",
    editDocument: "تعديل المستند",
    downloadPdf: "تنزيل PDF / طباعة هاتف",
    downloadPdfDetail: "يفتح واجهة الطباعة بالهاتف. يرجى اختيار 'الحفظ كملف PDF'.",
    downloadWord: "تحميل بصيغة Word (DOCX)",
    deleteDoc: "حذف المستند",
    confirmDelete: "هل أنت متأكد من رغبتك في حذف هذا المستند؟",
    editBack: "ألعاب تعديل المستند",
    createNew: "إنشاء مستند جديد",
    noSavedDocs: "لا توجد مستندات محفوظة على هذا الهاتف أو في السحاب بعد.",
    searchDocs: "ابحث في اسم المؤسسة أو العنوان...",
    creationDate: "تاريخ الإنشاء",
    lastModifiedDate: "آخر تعديل تاريخ",
    
    noticeTitle: "عنوان التعميم أو الإعـلان",
    noticeTitlePlaceholder: "مثال: إعلان عطلة عيد الفطر المبارك",
    noticeDate: "تاريخ صدور الإعلان",
    noticeContent: "نص الإعلان والتعليمات",
    noticeContentPlaceholder: "اكتب النص الكامل للتعميم الإداري هنا باللغة العربية...",
    signatureName: "اسم الشخص المخول بالتوقيع",
    signatureNamePlaceholder: "مثال: أ.د. محمد عبد الرحمن",
    signatureTitle: "المسمى الوظيفي أو الصفة",
    signatureTitlePlaceholder: "مثال: مدير المدرسة / عميد الكلية",
    templateStyle: "إطار وحدود تصميم الإعلان",
    templateClassic: "إطار كلاسيكي مزخرف",
    templateModern: "شريط خطي حداثي أيسر",
    templateMinimal: "مبسط بدون خطوط الحدود",
    templateElegant: "إطار ملكي مزخرف وراقي",
    
    examName: "اسم الامتـحان",
    examNamePlaceholder: "مثال: امتحانات نهاية الفصل الدراسي الثاني ٢٠٢٦",
    className: "الصف الدراســي",
    classPlaceholder: "مثال: الصف السابع",
    subjectName: "المادة الدراســية",
    subjectPlaceholder: "مثال: الرياضيات",
    fullMarks: "الدرجة الكاملة",
    examTime: "الزمن المسموح (مثال: ساعتان ونصف)",
    instructions: "توجيهات وتعليمات الطلاب العليا",
    instructionsPlaceholder: "مثال: أجب عن الأسئلة الآتية جميعها. الدرجات موضحة جانب كل سؤال.",
    addQuestionBtn: "+ إضافة سؤال جديد",
    questionType: "صيغة السؤال",
    questionText: "نص السؤال المستفسر",
    questionTextPlaceholder: "اكتب نص وطرح السؤال هنا...",
    marksValue: "الدرجة",
    btnUp: "▲ لأعلى",
    btnDown: "▼ لأسفل",
    qShort: "سؤال قصير",
    qLong: "سؤال مقالي أو تعبير تفصيلي",
    qMcq: "سؤال اختيار من متعدد (MCQ)",
    qCreative: "سؤال تركيبي / إبداعي (أ، ب، جـ، د)",
    optionsLabel: "خيارات أسئلة الـ MCQ",
    optionText: "كتابة الخيار المطروح",
    addOptionBtn: "+ خيار إضافي",
    subQuestionsLabel: "الأسئلة والخطوات الفرعية (أ، ب، جـ، د)",
    subQuestionText: "طرح السؤال الفرعي الجزئي",
    addSubQuestionBtn: "+ خطوة فرعية",
    
    studentInfoTitle: "بطاقة هوية الطالب",
    studentName: "اسم الطالب الكامل",
    studentNamePlaceholder: "مثال: محمود أحمد حسن",
    rollNumber: "رقم الجلوس / الكشف",
    rollPlaceholder: "مثال: ١٠٢",
    registrationNumber: "رقم القيد أو التسجيل (اختياري)",
    regPlaceholder: "مثال: ٥٠٤٠١٨٣",
    academicDetails: "العام والقرن الأكاديمي",
    subjectsListTitle: "درجات المواد والتقييمات",
    addSubjectBtn: "+ إضافة مادة وعلامة",
    marksObtained: "العلامة المكتسبة",
    resultsSummary: "تقرير النتائج التلقائي",
    totalMarksObtained: "مجموع الدرجات",
    averageMarks: "متوسط الدرجة",
    percentageValue: "النسبة المئوية",
    calculatedGpa: "المعدل التراكمي (GPA)",
    calculatedGrade: "التقدير اللفظي / الحرفي",
    statusLabel: "القرار الإداري والنتيجة",
    statusPass: "ناجح ومترقٍ (PASSED)",
    statusFail: "راسب وله دور ثاني (FAILED)",
  }
};
