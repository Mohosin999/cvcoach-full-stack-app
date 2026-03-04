import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Eye,
  Edit3,
  Save,
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  Trash2
} from 'lucide-react';
import { toast } from 'react-toastify';
import BackButton from '../components/BackButton';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { useAuth } from '../contexts/AuthContext';
import { resumeApi } from '../services/api';
import { Resume, ResumeContent } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const steps = ['Select', 'Edit', 'Preview', 'Download'];

const templates = [
  { 
    id: 'modern', 
    name: 'Modern', 
    description: 'Clean and professional',
    accentColor: '#3B82F6',
    style: 'left' as const
  },
  { 
    id: 'professional', 
    name: 'Professional', 
    description: 'Classic corporate layout',
    accentColor: '#1F2937',
    style: 'top' as const
  },
  { 
    id: 'creative', 
    name: 'Creative', 
    description: 'Bold and standout design',
    accentColor: '#8B5CF6',
    style: 'sidebar' as const
  },
  { 
    id: 'minimal', 
    name: 'Minimal', 
    description: 'Simple and elegant',
    accentColor: '#6B7280',
    style: 'simple' as const
  },
];

const defaultContent: ResumeContent = {
  personalInfo: {
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    portfolio: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
};

export default function Builder() {
  const { user } = useAuth();
  const location = useLocation();
  const [savedResumes, setSavedResumes] = useState<Resume[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [content, setContent] = useState<ResumeContent>(defaultContent);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const passedResume = location.state?.resume as Resume | undefined;
    if (passedResume) {
      setSelectedResume(passedResume);
      setContent(passedResume.content);
      setCurrentStep(1);
    }
    fetchResumes();
  }, [location.state]);

  const fetchResumes = async () => {
    try {
      const response = await resumeApi.getAll(1, 20);
      setSavedResumes(response.data.data || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResume = (resume: Resume) => {
    setSelectedResume(resume);
    setContent(resume.content);
    setCurrentStep(1);
  };

  const handleSaveResume = async () => {
    setSaving(true);
    try {
      if (selectedResume) {
        await resumeApi.update(selectedResume._id, { content });
        toast.success('Resume updated');
      } else {
        const formData = new FormData();
        const blob = new Blob([JSON.stringify({ content })], { type: 'application/json' });
        formData.append('resume', blob, 'resume.json');
        await resumeApi.upload(formData);
        toast.success('Resume saved');
      }
      await fetchResumes();
    } catch (error) {
      toast.error('Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const templateStyles: Record<string, { accent: [number, number, number], headerSize: number, bodySize: number }> = {
      modern: { accent: [59, 130, 246], headerSize: 22, bodySize: 10 },
      professional: { accent: [31, 41, 55], headerSize: 20, bodySize: 11 },
      creative: { accent: [139, 92, 246], headerSize: 24, bodySize: 10 },
      minimal: { accent: [107, 114, 128], headerSize: 18, bodySize: 11 },
    };

    const style = templateStyles[selectedTemplate] || templateStyles.modern;
    const [accentR, accentG, accentB] = style.accent;

    if (selectedTemplate === 'modern') {
      doc.setFillColor(accentR, accentG, accentB);
      doc.rect(0, 0, pageWidth, 35, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(style.headerSize);
      doc.setFont('helvetica', 'bold');
      doc.text(content.personalInfo.name || 'Resume', margin, 22);
      y = 45;
    } else if (selectedTemplate === 'professional') {
      doc.setFontSize(style.headerSize);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(accentR, accentG, accentB);
      doc.text(content.personalInfo.name || 'Resume', margin, y);
      y += 8;
      doc.setDrawColor(accentR, accentG, accentB);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;
    } else if (selectedTemplate === 'creative') {
      doc.setFillColor(accentR, accentG, accentB);
      doc.rect(0, 0, 30, doc.internal.pageSize.getHeight(), 'F');
      doc.setTextColor(accentR, accentG, accentB);
      doc.setFontSize(style.headerSize);
      doc.setFont('helvetica', 'bold');
      doc.text(content.personalInfo.name || 'Resume', margin + 5, y + 10);
      y = 45;
    } else {
      doc.setFontSize(style.headerSize);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(accentR, accentG, accentB);
      doc.text(content.personalInfo.name || 'Resume', margin, y);
      y += 8;
    }

    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const contactInfo = [
      content.personalInfo.email,
      content.personalInfo.phone,
      content.personalInfo.location,
    ].filter(Boolean).join('  |  ');
    doc.text(contactInfo, margin, y);
    y += 10;

    if (content.summary) {
      doc.setTextColor(accentR, accentG, accentB);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary', margin, y);
      y += 6;
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(style.bodySize);
      doc.setFont('helvetica', 'normal');
      const summaryLines = doc.splitTextToSize(content.summary, contentWidth);
      doc.text(summaryLines, margin, y);
      y += summaryLines.length * 5 + 8;
    }

    if (content.experience.length > 0) {
      doc.setTextColor(accentR, accentG, accentB);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Experience', margin, y);
      y += 6;
      content.experience.forEach((exp) => {
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(style.bodySize);
        doc.setFont('helvetica', 'bold');
        doc.text(`${exp.title}`, margin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(` at ${exp.company}`, margin + doc.getTextWidth(`${exp.title} `), y);
        y += 5;
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`, margin, y);
        y += 5;
        const descLines = doc.splitTextToSize(exp.description, contentWidth);
        doc.setFontSize(style.bodySize - 1);
        doc.setTextColor(60, 60, 60);
        doc.text(descLines, margin, y);
        y += descLines.length * 4 + 8;
      });
    }

    if (content.skills.length > 0) {
      doc.setTextColor(accentR, accentG, accentB);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Skills', margin, y);
      y += 6;
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(style.bodySize);
      doc.setFont('helvetica', 'normal');
      doc.text(content.skills.join(' • '), margin, y);
    }

    doc.save(`${content.personalInfo.name || 'resume'}_${selectedTemplate}.pdf`);
    toast.success('PDF downloaded');
  };

  const handleExportDOCX = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: content.personalInfo.name || 'Resume',
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: [content.personalInfo.email, content.personalInfo.phone, content.personalInfo.location].filter(Boolean).join(' | '),
              }),
            ],
          }),
          ...(content.summary ? [
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun('Summary')],
            }),
            new Paragraph(content.summary),
          ] : []),
          ...(content.experience.length > 0 ? [
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun('Experience')],
            }),
            ...content.experience.flatMap((exp) => [
              new Paragraph({
                children: [new TextRun({ text: `${exp.title} at ${exp.company}`, bold: true })],
              }),
              new Paragraph({
                children: [new TextRun({ text: `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`, italics: true })],
              }),
              new Paragraph(exp.description),
            ]),
          ] : []),
          ...(content.skills.length > 0 ? [
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [new TextRun('Skills')],
            }),
            new Paragraph(content.skills.join(', ')),
          ] : []),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${content.personalInfo.name || 'resume'}.docx`);
    toast.success('DOCX downloaded');
  };

  const addExperience = () => {
    setContent({
      ...content,
      experience: [
        ...content.experience,
        { company: '', title: '', startDate: '', endDate: '', description: '' },
      ],
    });
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const updated = [...content.experience];
    updated[index] = { ...updated[index], [field]: value };
    setContent({ ...content, experience: updated });
  };

  const removeExperience = (index: number) => {
    setContent({
      ...content,
      experience: content.experience.filter((_, i) => i !== index),
    });
  };

  const addSkill = (skill: string) => {
    if (skill && !content.skills.includes(skill)) {
      setContent({ ...content, skills: [...content.skills, skill] });
    }
  };

  const removeSkill = (skill: string) => {
    setContent({ ...content, skills: content.skills.filter((s) => s !== skill) });
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <BackButton />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Resume Builder
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and edit your professional resume
          </p>
        </motion.div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStep
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}
                >
                  {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span
                  className={`ml-2 text-sm hidden sm:inline ${
                    index <= currentStep
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500'
                  }`}
                >
                  {step}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 sm:w-16 h-0.5 mx-2 ${
                      index < currentStep
                        ? 'bg-primary'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {currentStep === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Choose a Template
            </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      setContent(defaultContent);
                      setSelectedResume(null);
                      setCurrentStep(1);
                    }}
                    className={`p-4 border-2 rounded-xl text-left transition-all hover:scale-[1.02] ${
                      selectedTemplate === template.id
                        ? 'border-primary bg-primary/5 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-full h-20 rounded-lg mb-3 overflow-hidden bg-white dark:bg-gray-800 relative">
                      {template.id === 'modern' && (
                        <div className="absolute inset-0 p-2">
                          <div className="h-3 w-16 bg-gray-800 rounded mb-1" />
                          <div className="h-2 w-12 bg-gray-400 rounded mb-2" />
                          <div className="h-2 w-full bg-gray-200 rounded" />
                        </div>
                      )}
                      {template.id === 'professional' && (
                        <div className="absolute inset-0 p-2">
                          <div className="h-4 w-20 bg-gray-800 rounded mb-1" />
                          <div className="h-2 w-14 bg-gray-600 rounded mb-2" />
                          <div className="h-2 w-full bg-gray-300 rounded" />
                          <div className="h-1 w-full bg-gray-200 rounded mt-1" />
                        </div>
                      )}
                      {template.id === 'creative' && (
                        <div className="absolute inset-0 flex">
                          <div className="w-1/3 bg-purple-500" />
                          <div className="flex-1 p-2">
                            <div className="h-3 w-12 bg-gray-800 rounded mb-1" />
                            <div className="h-2 w-10 bg-gray-400 rounded" />
                          </div>
                        </div>
                      )}
                      {template.id === 'minimal' && (
                        <div className="absolute inset-0 p-2 flex flex-col justify-center items-center">
                          <div className="h-4 w-16 bg-gray-800 rounded mb-2" />
                          <div className="h-1 w-20 bg-gray-300 rounded" />
                        </div>
                      )}
                    </div>
                    <div 
                      className="w-4 h-4 rounded-full mb-2" 
                      style={{ backgroundColor: template.accentColor }}
                    />
                    <p className="font-medium text-gray-900 dark:text-white">
                      {template.name}
                    </p>
                    <p className="text-sm text-gray-500">{template.description}</p>
                  </button>
                ))}
              </div>
          </motion.div>
        )}

        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="space-y-6">
              <div className="card">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name</label>
                    <input
                      type="text"
                      value={content.personalInfo.name}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          personalInfo: { ...content.personalInfo, name: e.target.value },
                        })
                      }
                      className="input"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      value={content.personalInfo.email}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          personalInfo: { ...content.personalInfo, email: e.target.value },
                        })
                      }
                      className="input"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input
                      type="tel"
                      value={content.personalInfo.phone}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          personalInfo: { ...content.personalInfo, phone: e.target.value },
                        })
                      }
                      className="input"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div>
                    <label className="label">Location</label>
                    <input
                      type="text"
                      value={content.personalInfo.location}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          personalInfo: { ...content.personalInfo, location: e.target.value },
                        })
                      }
                      className="input"
                      placeholder="City, Country"
                    />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Professional Summary
                  </h3>
                </div>
                <textarea
                  value={content.summary}
                  onChange={(e) => setContent({ ...content, summary: e.target.value })}
                  className="input min-h-[120px] resize-none"
                  placeholder="Write a brief summary of your professional background..."
                />
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Experience</h3>
                  <button onClick={addExperience} className="btn-ghost text-sm">
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </button>
                </div>
                <div className="space-y-4">
                  {content.experience.map((exp, index) => (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Position {index + 1}
                        </span>
                        <button
                          onClick={() => removeExperience(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          value={exp.title}
                          onChange={(e) => updateExperience(index, 'title', e.target.value)}
                          className="input"
                          placeholder="Job Title"
                        />
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateExperience(index, 'company', e.target.value)}
                          className="input"
                          placeholder="Company"
                        />
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                          className="input"
                          placeholder="Start Date"
                        />
                        <input
                          type="text"
                          value={exp.endDate}
                          onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                          className="input"
                          placeholder="End Date"
                        />
                      </div>
                      <textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                        className="input min-h-[80px] resize-none"
                        placeholder="Describe your responsibilities and achievements..."
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {content.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2"
                    >
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:text-red-500">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addSkill((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                  className="input"
                  placeholder="Type a skill and press Enter..."
                />
              </div>
            </div>

            <div className="lg:sticky lg:top-24 h-fit">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Preview</h3>
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className="btn-ghost text-sm"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {previewMode ? 'Edit' : 'Preview'}
                  </button>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 min-h-[500px]">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {content.personalInfo.name || 'Your Name'}
                  </h2>
                  <div className="text-sm text-gray-500 mt-1">
                    {[content.personalInfo.email, content.personalInfo.phone, content.personalInfo.location].filter(Boolean).join(' | ')}
                  </div>

                  {content.summary && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide">
                        Summary
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {content.summary}
                      </p>
                    </div>
                  )}

                  {content.experience.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide">
                        Experience
                      </h4>
                      {content.experience.map((exp, index) => (
                        <div key={index} className="mt-2">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {exp.title} at {exp.company}
                          </p>
                          <p className="text-xs text-gray-500">
                            {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {exp.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {content.skills.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide">
                        Skills
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {content.skills.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentStep >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card"
          >
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Your Resume is Ready
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                Download your resume in your preferred format
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleExportPDF}
                  className="btn-primary flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                <button
                  onClick={handleExportDOCX}
                  className="btn-outline flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download DOCX
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="btn-ghost flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex gap-2">
            <button onClick={handleSaveResume} className="btn-outline flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save
            </button>
            {currentStep < 3 && (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="btn-primary flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
