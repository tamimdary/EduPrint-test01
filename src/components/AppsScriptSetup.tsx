/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppLanguage, AppSettings, InstitutionProfile } from '../types';
import { translationData } from '../translations';
import CrestLogo from './CrestLogo';
import { 
  Copy, 
  Check, 
  Server, 
  Database, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Building2, 
  MapPin, 
  Phone, 
  UserCheck, 
  Globe, 
  Upload, 
  Save 
} from 'lucide-react';

interface AppsScriptSetupProps {
  currentLang: AppLanguage;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  savedDocsCount: number;
}

export default function AppsScriptSetup({
  currentLang,
  settings,
  onUpdateSettings,
  savedDocsCount,
}: AppsScriptSetupProps) {
  const t = translationData[currentLang];
  const isArabic = currentLang === 'ar';
  
  // Script Copy and accordion states
  const [copied, setCopied] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const [urlInput, setUrlInput] = useState(settings.googleAppsScriptUrl);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Institution Profile States
  const [profileName, setProfileName] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profilePrincipal, setProfilePrincipal] = useState('');
  const [profileWebsite, setProfileWebsite] = useState('');
  const [profileLogoOption, setProfileLogoOption] = useState('preset-school');
  const [profileLogoUploadedData, setProfileLogoUploadedData] = useState<string | undefined>(undefined);
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  // Load existing profile from storage
  useEffect(() => {
    const savedProfile = localStorage.getItem('eduprint_institution_profile');
    if (savedProfile) {
      try {
        const parsed: InstitutionProfile = JSON.parse(savedProfile);
        setProfileName(parsed.name || '');
        setProfileAddress(parsed.address || '');
        setProfilePhone(parsed.phone || '');
        setProfilePrincipal(parsed.principal || '');
        setProfileWebsite(parsed.website || '');
        setProfileLogoOption(parsed.logoOption || 'preset-school');
        setProfileLogoUploadedData(parsed.logoUploadedData);
      } catch (e) {
        console.error('Error loading institution profile', e);
      }
    }
  }, []);

  const handleSaveProfile = () => {
    const profile: InstitutionProfile = {
      name: profileName,
      address: profileAddress,
      phone: profilePhone,
      principal: profilePrincipal,
      website: profileWebsite,
      logoOption: profileLogoOption,
      logoUploadedData: profileLogoUploadedData,
    };
    localStorage.setItem('eduprint_institution_profile', JSON.stringify(profile));
    setProfileSavedToast(true);
    setTimeout(() => setProfileSavedToast(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileLogoUploadedData(reader.result as string);
        setProfileLogoOption('uploaded');
      };
      reader.readAsDataURL(file);
    }
  };

  const appsScriptCode = `/*
  EduPrint Mobile - Google Sheets Database Connector Script
  Instructions:
  1. Open a new Google Sheet (sheets.google.com).
  2. Click Extensions > Apps Script in the menu.
  3. Delete any default code inside the editor.
  4. Copy and paste ALL of this code into the editor.
  5. Click Save (disk icon).
  6. Click "Deploy" > "New deployment" (top right button).
  7. Under "Select type" select "Web app" (clog icon).
  8. Set "Execute as": "Me (your email)".
  9. Set "Who has access": "Anyone" (CRITICAL for mobile saving).
  10. Click Deploy, authorize permissions, and COPY the "Web App URL"!
  11. Paste that URL into the EduPrint Mobile App Database Settings.
*/

function doGet(e) {
  var sheet = getOrCreateSheet();
  var rows = sheet.getDataRange().getValues();
  var documents = [];
  
  // Skip header row
  for (var i = 1; i < rows.length; i++) {
    try {
      documents.push({
        id: rows[i][0],
        type: rows[i][1],
        lang: rows[i][2],
        institutionName: rows[i][3],
        title: rows[i][4],
        createdAt: rows[i][5],
        lastModified: rows[i][6],
        payload: JSON.parse(rows[i][7])
      });
    } catch (err) {
      // Handle parse errors gracefully
    }
  }
  
  if (e && e.parameter && e.parameter.id) {
    var singleDoc = documents.find(function(d) { return d.id === e.parameter.id; });
    return ContentService.createTextOutput(JSON.stringify(singleDoc || { error: "Not found" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ documents: documents }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*");
}

function doPost(e) {
  var resHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  
  try {
    var postData = JSON.parse(e.postData.contents);
    var sheet = getOrCreateSheet();
    var rows = sheet.getDataRange().getValues();
    
    var docId = postData.id;
    var docType = postData.type;
    var docLang = postData.lang;
    var institutionName = postData.institutionName;
    var title = postData.title || "";
    var createdAt = postData.createdAt;
    var lastModified = postData.lastModified;
    var payloadStr = JSON.stringify(postData.data || postData);
    
    var foundIndex = -1;
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] === docId) {
        foundIndex = i;
        break;
      }
    }
    
    if (foundIndex !== -1) {
      var targetRow = foundIndex + 1;
      sheet.getRange(targetRow, 2).setValue(docType);
      sheet.getRange(targetRow, 3).setValue(docLang);
      sheet.getRange(targetRow, 4).setValue(institutionName);
      sheet.getRange(targetRow, 5).setValue(title);
      sheet.getRange(targetRow, 7).setValue(lastModified);
      sheet.getRange(targetRow, 8).setValue(payloadStr);
    } else {
      sheet.appendRow([
        docId,
        docType,
        docLang,
        institutionName,
        title,
        createdAt,
        lastModified,
        payloadStr
      ]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: true, id: docId }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
  }
}

function doOptions(e) {
  return ContentService.createTextOutput("")
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("EduPrintDocs");
  if (!sheet) {
    sheet = ss.insertSheet("EduPrintDocs");
    sheet.appendRow([
      "Document ID", 
      "Template Type", 
      "Language", 
      "Institution Name", 
      "Subject/Heading", 
      "Created At", 
      "Last Modified", 
      "Document Payload Data (JSON)"
    ]);
    sheet.getRange("A1:H1").setFontWeight("bold").setBackground("#e2e8f0");
    sheet.setColumnWidth(1, 150);
    sheet.setColumnWidth(2, 120);
    sheet.setColumnWidth(3, 90);
    sheet.setColumnWidth(4, 200);
    sheet.setColumnWidth(5, 200);
    sheet.setColumnWidth(8, 300);
  }
  return sheet;
}
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSettings = () => {
    onUpdateSettings({
      googleAppsScriptUrl: urlInput.trim(),
      offlineFallbackOnly: urlInput.trim() === ''
    });
    setStatusMessage(urlInput.trim() === '' ? 'Cleared database URL. Using phone storage only.' : 'Saved successfully!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleTestConnection = async () => {
    const url = urlInput.trim();
    if (!url) {
      setStatusMessage('Please enter a Web App URL first.');
      return;
    }
    setIsTesting(true);
    setStatusMessage(null);
    try {
      const textResponse = await fetch(url + (url.includes('?') ? '&' : '?') + 'id=test_ping', {
        method: 'GET',
        mode: 'cors',
      });
      if (textResponse.ok) {
        setStatusMessage('Connection Test Successful! Your Google Sheets DB is ready.');
      } else {
        setStatusMessage('URL responds but returned error. Ensure "Execute as: Me" and "Who has access: Anyone" are correct.');
      }
    } catch (err: any) {
      console.warn(err);
      setStatusMessage('CORS warning completed. If redirected, Apps Script received the test correctly. Try saving a real document.');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div id="apps-script-setup-sec" className="space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
      
      {/* SECTION 1: INSTITUTION PROFILE SETUP (Thumb Reachable Form) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100/60 rounded-2xl text-indigo-700">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800">
              {isArabic ? 'الملف التعريفي للمؤسسة' : currentLang === 'bn' ? 'শিক্ষা প্রতিষ্ঠানের প্রোফাইল' : 'Institution Profile'}
            </h2>
            <p className="text-xs text-slate-400">
              {isArabic ? 'احفظ بيانات مدرستك لتعبئتها وسحبها تلقائياً عند صياغة أي مستند' : currentLang === 'bn' ? 'প্রতিষ্ঠানের নাম ও বিবরণ সেভ করে রাখুন, যা স্বয়ংক্রিয়ভাবে নোটিশ বা প্রশ্নে যুক্ত হবে' : 'Specify details here to auto-fill headers on notices, questions and reports.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Main Institution Name */}
          <div className="space-y-1">
            <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest block">
              {t.institutionName}
            </label>
            <div className="relative">
              <Building2 className={`absolute top-3 ${isArabic ? 'right-3' : 'left-3'} w-4.5 h-4.5 text-slate-400`} />
              <input
                id="prof-inst-name"
                type="text"
                placeholder={t.institutionPlaceholder}
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className={`w-full text-sm border border-slate-200 rounded-xl py-2 px-3 ${isArabic ? 'pr-9' : 'pl-9'} focus:ring-2 focus:ring-indigo-500 bg-slate-50/80 focus:bg-white focus:outline-none`}
              />
            </div>
          </div>

          {/* Principal Headmaster Name */}
          <div className="space-y-1">
            <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest block">
              {isArabic ? 'اسم المدير / المخول بالتوقيع' : currentLang === 'bn' ? 'প্রধান শিক্ষকের নাম' : 'Principal / Authorized Head'}
            </label>
            <div className="relative">
              <UserCheck className={`absolute top-3 ${isArabic ? 'right-3' : 'left-3'} w-4.5 h-4.5 text-slate-400`} />
              <input
                id="prof-principal"
                type="text"
                placeholder={isArabic ? 'مثال: أ.د. محمود العراقي' : currentLang === 'bn' ? 'উদাঃ ড. মোহাম্মদ আব্দুল করিম' : 'e.g. Principal Dr. Arthur Jenkins'}
                value={profilePrincipal}
                onChange={(e) => setProfilePrincipal(e.target.value)}
                className={`w-full text-sm border border-slate-200 rounded-xl py-2 px-3 ${isArabic ? 'pr-9' : 'pl-9'} focus:ring-2 focus:ring-indigo-500 bg-slate-50/80 focus:bg-white focus:outline-none`}
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1">
            <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest block">
              {isArabic ? 'العنوان والموقع' : currentLang === 'bn' ? 'প্রতিষ্ঠানের ঠিকানা' : 'Campus Physical Address'}
            </label>
            <div className="relative">
              <MapPin className={`absolute top-3 ${isArabic ? 'right-3' : 'left-3'} w-4.5 h-4.5 text-slate-400`} />
              <input
                id="prof-address"
                type="text"
                placeholder={isArabic ? 'مثال: حي الروضة، جازان' : currentLang === 'bn' ? 'উদাঃ মিরপুর-১০, ঢাকা-১২১৬' : 'e.g. Sector-4, Mirpur, Dhaka'}
                value={profileAddress}
                onChange={(e) => setProfileAddress(e.target.value)}
                className={`w-full text-sm border border-slate-200 rounded-xl py-2 px-3 ${isArabic ? 'pr-9' : 'pl-9'} focus:ring-2 focus:ring-indigo-500 bg-slate-50/80 focus:bg-white focus:outline-none`}
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest block">
              {isArabic ? 'رقم الهاتف / اتصال وثيق' : currentLang === 'bn' ? 'মোবাইল নম্বর' : 'Official Hotline / Phone'}
            </label>
            <div className="relative">
              <Phone className={`absolute top-3 ${isArabic ? 'right-3' : 'left-3'} w-4.5 h-4.5 text-slate-400`} />
              <input
                id="prof-phone"
                type="text"
                placeholder={isArabic ? 'مثال: ٠٥٢٤٠٤١٤...' : currentLang === 'bn' ? 'উদাঃ ০১৮xxxxxxxx' : 'e.g. +880 1712-345678'}
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                className={`w-full text-sm border border-slate-200 rounded-xl py-2 px-3 ${isArabic ? 'pr-9' : 'pl-9'} focus:ring-2 focus:ring-indigo-500 bg-slate-50/80 focus:bg-white focus:outline-none`}
              />
            </div>
          </div>

          {/* Website */}
          <div className="space-y-1 md:col-span-2">
            <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest block">
              {isArabic ? 'موقع الويب الإلكتروني' : currentLang === 'bn' ? 'ওয়েবসাইট লিংক' : 'Institution Web Portal / Website'}
            </label>
            <div className="relative">
              <Globe className={`absolute top-3 ${isArabic ? 'right-3' : 'left-3'} w-4.5 h-4.5 text-slate-400`} />
              <input
                id="prof-website"
                type="url"
                placeholder="https://www.yourschool.edu"
                value={profileWebsite}
                onChange={(e) => setProfileWebsite(e.target.value)}
                className={`w-full text-sm border border-slate-200 rounded-xl py-2 px-3 ${isArabic ? 'pr-9' : 'pl-9'} focus:ring-2 focus:ring-indigo-500 bg-slate-50/80 focus:bg-white focus:outline-none`}
              />
            </div>
          </div>
        </div>

        {/* Header Preset Logo selection inside profile */}
        <div className="space-y-2">
          <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest block">
            {isArabic ? 'شعار المدرج الافتراضي للبادئة' : currentLang === 'bn' ? 'ডিফল্ট মনোগ্রাম / লোগো সিলেক্ট করুন' : 'Default Crest Logo / Monogram'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'preset-school', title: t.logoSchool },
              { id: 'preset-madrasa', title: t.logoMadrasa },
              { id: 'preset-college', title: t.logoCollege },
              { id: 'preset-star', title: t.logoStar },
              { id: 'preset-none', title: t.logoNone },
            ].map((logo) => (
              <button
                key={logo.id}
                id={`btn-prof-logo-${logo.id}`}
                onClick={() => setProfileLogoOption(logo.id)}
                className={`text-xs py-2 px-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  profileLogoOption === logo.id 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold' 
                    : 'border-slate-200 hover:border-slate-350 text-slate-600 bg-white'
                }`}
              >
                <CrestLogo option={logo.id} className="w-8 h-8" />
                <span className="scale-90 block truncate leading-none">{logo.title}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col items-start gap-2 pt-2">
            <span className="text-[11px] text-slate-400 block">
              {isArabic ? 'أو ارفع شعاراً مخصصاً:' : currentLang === 'bn' ? 'অথবা নিজের কাস্টম লোগো আপলোড করুন:' : 'Or upload a custom high-quality monogram:'}
            </span>
            <div className="flex items-center gap-3">
              <label 
                id="prof-logo-file-label"
                className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold py-2 px-4 rounded-xl cursor-pointer inline-flex items-center gap-1.5 transition"
              >
                <Upload className="w-4 h-4" />
                <span>{t.logoUpload}</span>
                <input
                  id="prof-logo-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>

              {profileLogoOption === 'uploaded' && profileLogoUploadedData && (
                <div className="flex items-center gap-1">
                  <CrestLogo option="uploaded" uploadedData={profileLogoUploadedData} className="w-9 h-9" />
                  <span className="text-[10px] text-emerald-600 font-extrabold uppercase">✓ uploaded logo active</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Save trigger */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <button
            id="prof-save-btn"
            onClick={handleSaveProfile}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm py-3 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition active:scale-98 cursor-pointer"
          >
            <Save className="w-4.5 h-4.5" />
            <span>
              {isArabic ? 'حفظ وحماية الملف عالي الجودة' : currentLang === 'bn' ? 'স্কুল প্রোফাইল সেভ করুন' : 'Save Institution Profile'}
            </span>
          </button>
        </div>

        {profileSavedToast && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3 rounded-xl flex items-center justify-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              {isArabic ? 'تم حفظ الملف بنجاح! سيتم استخدامه لملء الحقول تلقائياً.' : currentLang === 'bn' ? 'প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে! সকল নতুন পাতায় এটি অটো-ফিলাপ হবে।' : 'Profile Saved Successfully! Future forms will auto-fill automatically.'}
            </span>
          </div>
        )}
      </div>

      {/* SECTION 2: GOOGLE SHEETS CLOUD STORAGE SCRIPT */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-700">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800">
              {isArabic ? 'الربط السحابي مع Google Sheets' : currentLang === 'bn' ? 'গুগল স্প্রেডশিট সংযোজক' : 'Google Sheets Web Sync'}
            </h2>
            <p className="text-xs text-slate-400">
              {isArabic ? 'مزامنة تعاميمك كشوف علاماتك وأوراق اختباراتك للوصول لها عبر الهواتف الأخرى والكومبيوتر' : currentLang === 'bn' ? 'আপনার মোবাইল থেকে সকল সংরক্ষিত কাজের ব্যাকআপ রাখুন সরাসরি গুগল শিটে' : 'Connect to your Google Sheets spreadsheet dynamically for remote backups.'}
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 text-xs space-y-2">
          <div className="flex items-center gap-2">
            <Server className="w-4.5 h-4.5 text-amber-600 shrink-0" />
            <span className="font-extrabold uppercase tracking-wide">
              {isArabic ? 'التخزين المحلي الآمن نشط' : currentLang === 'bn' ? 'ডিভাইস অফলাইন স্টোরেজ চালু আছে' : 'Local Sandbox Active'}
            </span>
          </div>
          <p>
            {isArabic 
              ? `يحتوي هاتفك حالياً على (${savedDocsCount}) من المستندات المحفوظة بشكل كامل داخل ذاكرة التخزين المؤقت.` 
              : currentLang === 'bn' ? `আপনার ব্রাউজার মেমরিতে বর্তমানে (${savedDocsCount} টি) ফাইল সুরক্ষায় অলরেডি রয়ে গেছে।` : `You have (${savedDocsCount}) offline drafts safely cached. You do NOT have to connect a spreadsheet to use the app, but it is recommended for remote backup.`}
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-3">
          <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest leading-none">
            {isArabic ? 'رابط تطبيق ويب جوجل شيت (Google Web App URL)' : currentLang === 'bn' ? 'গুগল স্ক্রিপ্ট ওয়েব ইউআরএল (Web App URL)' : 'Google Web App Deploy URL'}
          </label>
          <div className="flex gap-2">
            <input
              id="url-input-field"
              type="text"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 min-w-0 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono bg-white"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              id="btn-save-settings"
              onClick={handleSaveSettings}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
            >
              {isArabic ? 'حفظ الرابط' : currentLang === 'bn' ? 'সেভ কানেকশন' : 'Save Connection'}
            </button>
            
            {urlInput && (
              <button
                id="btn-test-settings"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="bg-white hover:bg-slate-100 text-slate-700 font-extrabold text-xs px-4 py-2.5 rounded-xl transition border border-slate-200 cursor-pointer"
              >
                {isTesting ? '...' : isArabic ? 'اختبار الإتصال' : currentLang === 'bn' ? 'টেস্ট কানেকশন' : 'Test Sync'}
              </button>
            )}
          </div>

          {statusMessage && (
            <div className="text-[11px] bg-slate-900 text-slate-300 p-3 rounded-xl border border-slate-850 font-mono break-all leading-relaxed whitespace-pre-wrap">
              {statusMessage}
            </div>
          )}
        </div>

        {/* Dynamic script deployment guide */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <button
            id="toggle-instructions-btn"
            onClick={() => setShowScript(!showScript)}
            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition text-left cursor-pointer"
          >
            <span className="font-extrabold text-xs uppercase tracking-widest text-slate-700 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-500" />
              {isArabic ? 'خطوات الإعداد المجاني (دقيقتان فقط)' : currentLang === 'bn' ? 'গুগল শিট কানেক্ট করার জন্য কোড ও নির্দেশনা' : 'Deploy spreadsheet connector in 2 minutes'}
            </span>
            {showScript ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </button>

          {showScript && (
            <div className="p-4 border-t border-slate-200 text-slate-650 text-xs space-y-3 leading-relaxed">
              <p className="font-bold text-slate-800">
                {isArabic ? 'احصل على سحابة مجانية مستقلة خاصة بك:' : currentLang === 'bn' ? 'নির্দেশনাবলী:' : 'Standalone setup guidelines:'}
              </p>
              
              <ul className={`list-decimal px-4 space-y-1.5 ${isArabic ? 'mr-4' : 'ml-4'}`}>
                <li>{isArabic ? 'افتح جدول بيانات Google Sheet فارغاً جديداً.' : currentLang === 'bn' ? 'sheets.google.com এ গিয়ে নতুন ফাকা স্প্রেডশিট ক্রিয়েট করুন।' : 'Create an empty sheet.'}</li>
                <li>{isArabic ? 'انتقل إلى الإضافات (Extensions) ثم Apps Script.' : currentLang === 'bn' ? 'Extensions থেকে Apps Script এ ক্লিক করুন।' : 'Click Extensions > Apps Script.'}</li>
                <li>{isArabic ? 'الصق الكود البرمجي البرمجي التالي تماماً.' : currentLang === 'bn' ? 'সেখানকার ডিফল্ট কোড মুছে নিচেরসম্পূর্ণ স্ক্রিপ্ট পেস্ট করুন।' : 'Copy and paste the Apps Script Code below.'}</li>
                <li>{isArabic ? 'اضغط Deploy ثم New Deployment كـ Web App.' : currentLang === 'bn' ? 'Deploy বাটন থেকে New Deployment চাপুন এবং Web App সিলেক্ট করুন।' : 'Select Web App category in New Deployment.'}</li>
                <li><span className="font-extrabold text-rose-600">{isArabic ? 'هام جداً: اختر "Who has access" ليكون "Anyone".' : currentLang === 'bn' ? 'গুরুত্বপূর্ণ: "Who has access" এ "Anyone" নির্বাচন করুন।' : 'CRITICAL: Change Access to "Anyone".'}</span></li>
                <li>{isArabic ? 'اضغط Deploy، واقبل أذونات الحساب، والصف الرابط في الأعلى.' : currentLang === 'bn' ? 'Deploy সম্পন্ন করে প্রাপ্ত লিঙ্ক কপি করে উপরে সেট করুন।' : 'Copy Web App URL & save above.'}</li>
              </ul>

              <div className="border border-slate-200 rounded-xl overflow-hidden mt-3">
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200">
                  <span className="text-[10px] font-mono text-slate-500">GoogleAppsScript.gs</span>
                  <button
                    id="btn-copy-code"
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-bold transition cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy Schema Code'}
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-300 text-[10px] overflow-x-auto font-mono max-h-48 scrollbar-thin">
                  {appsScriptCode}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
