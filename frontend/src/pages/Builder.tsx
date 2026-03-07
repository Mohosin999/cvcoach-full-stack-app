import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  Save,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import BackButton from '../components/BackButton';
import { jsPDF } from 'jspdf';
import { useAuth } from '../contexts/AuthContext';
import { resumeApi } from '../services/api';
import { Resume, ResumeContent } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
  expanded: boolean;
}

const defaultContent: ResumeContent = {
  personalInfo: {
    fullName: '',
    jobTitle: '',
    email: '',
    whatsapp: '',
    address: {
      city: '',
      division: '',
      zipCode: '',
    },
    linkedIn: '',
    socialLinks: {
      github: '',
      portfolio: '',
      website: '',
    },
  },
  summary: '',
  experience: [],
  projects: [],
  achievements: [],
  certifications: [],
  education: [],
  skills: [],
};

const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['clean']
  ],
};

const quillFormats = [
  'bold', 'italic', 'underline',
  'list', 'bullet'
];

export default function Builder() {
  const { user } = useAuth();
  const location = useLocation();
  const [savedResumes, setSavedResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [content, setContent] = useState<ResumeContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [sections, setSections] = useState<Section[]>([
    { id: 'personal', title: 'Personal Information', icon: FileText, expanded: true },
    { id: 'summary', title: 'Professional Summary', icon: FileText, expanded: true },
    { id: 'experience', title: 'Experience', icon: FileText, expanded: true },
    { id: 'projects', title: 'Projects', icon: FileText, expanded: true },
    { id: 'achievements', title: 'Achievements', icon: FileText, expanded: false },
    { id: 'certifications', title: 'Certifications', icon: FileText, expanded: false },
    { id: 'education', title: 'Education', icon: FileText, expanded: true },
    { id: 'skills', title: 'Skills', icon: FileText, expanded: true },
  ]);

  useEffect(() => {
    const passedResume = location.state?.resume as Resume | undefined;
    if (passedResume) {
      setSelectedResume(passedResume);
      setContent(passedResume.content);
      window.history.replaceState({}, document.title);
    }
    fetchResumes();
  }, [location.state]);

  const fetchResumes = async () => {
    try {
      const response = await resumeApi.getAll(1, 50);
      setSavedResumes(response.data.data || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (id: string) => {
    setSections(prev =>
      prev.map(s => s.id === id ? { ...s, expanded: !s.expanded } : s)
    );
  };

  const handleSelectResume = (resume: Resume) => {
    setSelectedResume(resume);
    setContent(resume.content);
  };

  const handleSaveResume = async () => {
    setSaving(true);
    try {
      if (selectedResume) {
        await resumeApi.update(selectedResume._id, { content });
        toast.success('Resume updated successfully');
      } else {
        const response = await resumeApi.createFromContent(content);
        setSelectedResume(response.data.data);
        toast.success('Resume saved successfully');
      }
      await fetchResumes();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  const handleNewResume = () => {
    setSelectedResume(null);
    setContent(defaultContent);
  };

  const updatePersonalInfo = (field: string, value: any) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setContent({
        ...content,
        personalInfo: {
          ...content.personalInfo,
          address: {
            ...content.personalInfo.address,
            [addressField]: value
          }
        }
      });
    } else if (field.startsWith('socialLinks.')) {
      const socialField = field.split('.')[1];
      setContent({
        ...content,
        personalInfo: {
          ...content.personalInfo,
          socialLinks: {
            ...content.personalInfo.socialLinks,
            [socialField]: value
          }
        }
      });
    } else {
      setContent({
        ...content,
        personalInfo: { ...content.personalInfo, [field]: value }
      });
    }
  };

  const addExperience = () => {
    setContent({
      ...content,
      experience: [
        ...content.experience,
        { company: '', title: '', startDate: '', endDate: '', description: '', current: false }
      ]
    });
  };

  const updateExperience = (index: number, field: string, value: any) => {
    const updated = [...content.experience];
    updated[index] = { ...updated[index], [field]: value };
    setContent({ ...content, experience: updated });
  };

  const removeExperience = (index: number) => {
    setContent({
      ...content,
      experience: content.experience.filter((_, i) => i !== index)
    });
  };

  const addProject = () => {
    setContent({
      ...content,
      projects: [
        ...(content.projects || []),
        { name: '', description: '', technologies: [], links: {} }
      ]
    });
  };

  const updateProject = (index: number, field: string, value: any) => {
    const updated = [...(content.projects || [])];
    if (field.startsWith('links.')) {
      const linkField = field.split('.')[1];
      updated[index] = { 
        ...updated[index], 
        links: { ...updated[index].links, [linkField]: value } 
      };
    } else if (field === 'technologies') {
      updated[index] = { ...updated[index], technologies: value };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setContent({ ...content, projects: updated });
  };

  const removeProject = (index: number) => {
    setContent({
      ...content,
      projects: content.projects?.filter((_, i) => i !== index) || []
    });
  };

  const addAchievement = () => {
    setContent({
      ...content,
      achievements: [
        ...(content.achievements || []),
        { title: '', description: '', date: '' }
      ]
    });
  };

  const updateAchievement = (index: number, field: string, value: string) => {
    const updated = [...(content.achievements || [])];
    updated[index] = { ...updated[index], [field]: value };
    setContent({ ...content, achievements: updated });
  };

  const removeAchievement = (index: number) => {
    setContent({
      ...content,
      achievements: content.achievements?.filter((_, i) => i !== index) || []
    });
  };

  const addCertification = () => {
    setContent({
      ...content,
      certifications: [
        ...(content.certifications || []),
        { title: '', link: '', date: '' }
      ]
    });
  };

  const updateCertification = (index: number, field: string, value: string) => {
    const updated = [...(content.certifications || [])];
    updated[index] = { ...updated[index], [field]: value };
    setContent({ ...content, certifications: updated });
  };

  const removeCertification = (index: number) => {
    setContent({
      ...content,
      certifications: content.certifications?.filter((_, i) => i !== index) || []
    });
  };

  const addEducation = () => {
    setContent({
      ...content,
      education: [
        ...content.education,
        { institution: '', degree: '', date: '' }
      ]
    });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const updated = [...content.education];
    updated[index] = { ...updated[index], [field]: value };
    setContent({ ...content, education: updated });
  };

  const removeEducation = (index: number) => {
    setContent({
      ...content,
      education: content.education.filter((_, i) => i !== index)
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

  const parseHtmlForPdf = (doc: jsPDF, html: string, x: number, y: number, maxWidth: number, fontSize: number = 10): number => {
    if (!html) return y;
    
    let currentY = y;
    const lineHeight = fontSize * 0.5;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    let isBold = false;
    let isItalic = false;
    let textContent = '';
    
    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim() || '';
        if (text) {
          textContent += text + ' ';
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        
        if (element.tagName === 'UL' || element.tagName === 'OL') {
          processTextContent();
          element.childNodes.forEach((child: Node) => {
            processNode(child);
          });
          processTextContent();
        } else if (element.tagName === 'LI') {
          processTextContent();
          const lines = doc.splitTextToSize('• ' + textContent.trim(), maxWidth - 5);
          lines.forEach((line: string) => {
            doc.setFont('helvetica', isBold ? 'bold' : 'normal');
            doc.setFontSize(fontSize);
            doc.text(line, x + 5, currentY);
            currentY += lineHeight;
          });
          textContent = '';
        } else if (element.tagName === 'B' || element.tagName === 'STRONG') {
          const wasBold = isBold;
          isBold = true;
          element.childNodes.forEach((child: Node) => processNode(child));
          isBold = wasBold;
        } else if (element.tagName === 'I' || element.tagName === 'EM') {
          const wasItalic = isItalic;
          isItalic = true;
          element.childNodes.forEach((child: Node) => processNode(child));
          isItalic = wasItalic;
        } else if (element.tagName === 'BR') {
          processTextContent();
        } else if (element.tagName === 'P') {
          processTextContent();
          element.childNodes.forEach((child: Node) => processNode(child));
          processTextContent();
        } else {
          element.childNodes.forEach((child: Node) => processNode(child));
        }
      }
    };
    
    const processTextContent = () => {
      if (textContent.trim()) {
        const lines = doc.splitTextToSize(textContent.trim(), maxWidth);
        doc.setFont('helvetica', isBold ? 'bold' : (isItalic ? 'italic' : 'normal'));
        doc.setFontSize(fontSize);
        doc.setTextColor(60, 60, 60);
        
        lines.forEach((line: string) => {
          doc.text(line, x, currentY);
          currentY += lineHeight;
        });
        textContent = '';
      }
    };
    
    processNode(tempDiv);
    processTextContent();
    
    return currentY;
  };

  const stripHtml = (html: string): string => {
    if (!html) return '';
    return html
      .replace(/<ul>/gi, '\n')
      .replace(/<\/ul>/gi, '')
      .replace(/<ol>/gi, '\n')
      .replace(/<\/ol>/gi, '')
      .replace(/<li>/gi, '• ')
      .replace(/<\/li>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<p>/gi, '')
      .replace(/<\/p>/gi, '\n')
      .replace(/<strong>/gi, '')
      .replace(/<\/strong>/gi, '')
      .replace(/<b>/gi, '')
      .replace(/<\/b>/gi, '')
      .replace(/<em>/gi, '')
      .replace(/<\/em>/gi, '')
      .replace(/<i>/gi, '')
      .replace(/<\/i>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  };

  const renderHtmlContent = (html: string): React.ReactNode => {
    if (!html) return null;
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - margin * 2;
    let y = 15;

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 37, 37);
    doc.text(content.personalInfo.fullName || 'Resume', margin, y);
    y += 7;

    if (content.personalInfo.jobTitle) {
      doc.setFontSize(12);
      doc.setTextColor(37, 99, 235);
      doc.text(content.personalInfo.jobTitle, margin, y);
      y += 6;
    }

    const contactParts: string[] = [];
    if (content.personalInfo.email) contactParts.push(content.personalInfo.email);
    if (content.personalInfo.whatsapp) contactParts.push(`WhatsApp: ${content.personalInfo.whatsapp}`);
    if (content.personalInfo.address?.city) {
      const address = [
        content.personalInfo.address.city,
        content.personalInfo.address.division,
        content.personalInfo.address.zipCode
      ].filter(Boolean).join(', ');
      if (address) contactParts.push(address);
    }

    if (contactParts.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(contactParts.join('  |  '), margin, y);
      y += 5;
    }

    const socialParts: string[] = [];
    if (content.personalInfo.linkedIn) socialParts.push(`LinkedIn: ${content.personalInfo.linkedIn}`);
    if (content.personalInfo.socialLinks?.github) socialParts.push(`GitHub: ${content.personalInfo.socialLinks.github}`);
    if (content.personalInfo.socialLinks?.portfolio) socialParts.push(`Portfolio: ${content.personalInfo.socialLinks.portfolio}`);

    if (socialParts.length > 0) {
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(socialParts.join('  |  '), margin, y);
      y += 8;
    }

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    if (content.summary) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('Summary', margin, y);
      y += 5;

      y = parseHtmlForPdf(doc, content.summary, margin, y, contentWidth, 10);
      y += 5;
    }

    if (content.skills.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('Skills', margin, y);
      y += 5;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      const skillsText = content.skills.join('  |  ');
      const skillsLines = doc.splitTextToSize(skillsText, contentWidth);
      doc.text(skillsLines, margin, y);
      y += skillsLines.length * 5 + 5;
    }

    if (content.experience.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('Experience', margin, y);
      y += 5;

      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 4;

      content.experience.forEach((exp) => {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 37, 37);
        doc.text(exp.title, margin, y);

        const titleWidth = doc.getTextWidth(exp.title);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(` at ${exp.company}`, margin + titleWidth, y);
        y += 4;

        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        const dateStr = exp.current ? `${exp.startDate} - Present` : `${exp.startDate} - ${exp.endDate}`;
        doc.text(dateStr, margin, y);
        y += 4;

        y = parseHtmlForPdf(doc, exp.description, margin, y, contentWidth, 10);
        y += 6;
      });
    }

    if (content.projects && content.projects.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('Projects', margin, y);
      y += 5;

      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 4;

      content.projects.forEach((proj) => {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 37, 37);
        doc.text(proj.name, margin, y);
        y += 4;

        if (proj.technologies && proj.technologies.length > 0) {
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.text(proj.technologies.join(', '), margin, y);
          y += 4;
        }

        y = parseHtmlForPdf(doc, proj.description, margin, y, contentWidth, 10);
        y += 6;
      });
    }

    if (content.achievements && content.achievements.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('Achievements', margin, y);
      y += 5;

      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 4;

      content.achievements.forEach((ach) => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 37, 37);
        doc.text(`• ${ach.title}`, margin, y);
        y += 5;
      });
      y += 2;
    }

    if (content.certifications && content.certifications.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('Certifications', margin, y);
      y += 5;

      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 4;

      content.certifications.forEach((cert) => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 37, 37);
        doc.text(cert.title, margin, y);
        y += 5;
      });
      y += 2;
    }

    if (content.education.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('Education', margin, y);
      y += 5;

      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 4;

      content.education.forEach((edu) => {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 37, 37);
        doc.text(edu.degree, margin, y);
        y += 4;

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(edu.institution, margin, y);
        y += 4;

        if (edu.date) {
          doc.setFontSize(9);
          doc.setTextColor(120, 120, 120);
          doc.text(edu.date, margin, y);
          y += 6;
        } else {
          y += 6;
        }
      });
    }

    doc.save(`${content.personalInfo.fullName || 'resume'}.pdf`);
    toast.success('PDF downloaded');
  };

  const renderSectionEditor = (section: Section) => {
    switch (section.id) {
      case 'personal':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  value={content.personalInfo.fullName}
                  onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                  className="input"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="label">Job Title</label>
                <input
                  type="text"
                  value={content.personalInfo.jobTitle}
                  onChange={(e) => updatePersonalInfo('jobTitle', e.target.value)}
                  className="input"
                  placeholder="Software Engineer"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={content.personalInfo.email}
                  onChange={(e) => updatePersonalInfo('email', e.target.value)}
                  className="input"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="label">WhatsApp Number</label>
                <input
                  type="tel"
                  value={content.personalInfo.whatsapp}
                  onChange={(e) => updatePersonalInfo('whatsapp', e.target.value)}
                  className="input"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>
            <div>
              <label className="label">Address</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={content.personalInfo.address?.city}
                  onChange={(e) => updatePersonalInfo('address.city', e.target.value)}
                  className="input"
                  placeholder="City"
                />
                <input
                  type="text"
                  value={content.personalInfo.address?.division}
                  onChange={(e) => updatePersonalInfo('address.division', e.target.value)}
                  className="input"
                  placeholder="Division/State"
                />
                <input
                  type="text"
                  value={content.personalInfo.address?.zipCode}
                  onChange={(e) => updatePersonalInfo('address.zipCode', e.target.value)}
                  className="input"
                  placeholder="Zip Code"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="label">LinkedIn</label>
                <input
                  type="text"
                  value={content.personalInfo.linkedIn}
                  onChange={(e) => updatePersonalInfo('linkedIn', e.target.value)}
                  className="input"
                  placeholder="linkedin.com/in/username"
                />
              </div>
              <div>
                <label className="label">GitHub</label>
                <input
                  type="text"
                  value={content.personalInfo.socialLinks?.github}
                  onChange={(e) => updatePersonalInfo('socialLinks.github', e.target.value)}
                  className="input"
                  placeholder="github.com/username"
                />
              </div>
              <div>
                <label className="label">Portfolio</label>
                <input
                  type="text"
                  value={content.personalInfo.socialLinks?.portfolio}
                  onChange={(e) => updatePersonalInfo('socialLinks.portfolio', e.target.value)}
                  className="input"
                  placeholder="yourportfolio.com"
                />
              </div>
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="space-y-2">
            <textarea
              value={content.summary}
              onChange={(e) => setContent({ ...content, summary: e.target.value })}
              className="input min-h-[150px] resize-none"
              placeholder="Write a brief professional summary..."
            />
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-4">
            {content.experience.map((exp, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Position {index + 1}</span>
                  <button onClick={() => removeExperience(index)} className="text-red-500 hover:text-red-600 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <input type="text" value={exp.title} onChange={(e) => updateExperience(index, 'title', e.target.value)} className="input" placeholder="Job Title" />
                  <input type="text" value={exp.company} onChange={(e) => updateExperience(index, 'company', e.target.value)} className="input" placeholder="Company" />
                  <input type="text" value={exp.startDate} onChange={(e) => updateExperience(index, 'startDate', e.target.value)} className="input" placeholder="Start Date (e.g., Jan 2020)" />
                  <div className="flex gap-2">
                    <input type="text" value={exp.endDate || ''} onChange={(e) => updateExperience(index, 'endDate', e.target.value)} className="input flex-1" placeholder="End Date" disabled={exp.current} />
                    <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      <input type="checkbox" checked={exp.current} onChange={(e) => updateExperience(index, 'current', e.target.checked)} />
                      Present
                    </label>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-md">
                  <ReactQuill
                    theme="snow"
                    value={exp.description}
                    onChange={(value) => updateExperience(index, 'description', value)}
                    modules={quillModules}
                    formats={quillFormats}
                    className="h-32 mb-8"
                    placeholder="Describe your responsibilities and achievements..."
                  />
                </div>
              </div>
            ))}
            <button onClick={addExperience} className="btn-outline w-full flex items-center justify-center gap-2 py-2">
              <Plus className="w-4 h-4" /> Add Experience
            </button>
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-4">
            {(content.projects || []).map((proj, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Project {index + 1}</span>
                  <button onClick={() => removeProject(index)} className="text-red-500 hover:text-red-600 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <input type="text" value={proj.name} onChange={(e) => updateProject(index, 'name', e.target.value)} className="input" placeholder="Project Title" />
                  <input type="text" value={proj.technologies?.join(', ') || ''} onChange={(e) => updateProject(index, 'technologies', e.target.value.split(',').map(t => t.trim()))} className="input" placeholder="Technologies (comma separated)" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <input type="text" value={proj.links?.live || ''} onChange={(e) => updateProject(index, 'links.live', e.target.value)} className="input" placeholder="Live URL" />
                  <input type="text" value={proj.links?.github || ''} onChange={(e) => updateProject(index, 'links.github', e.target.value)} className="input" placeholder="GitHub Repository" />
                  <input type="text" value={proj.links?.caseStudy || ''} onChange={(e) => updateProject(index, 'links.caseStudy', e.target.value)} className="input" placeholder="Case Study" />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-md">
                  <ReactQuill
                    theme="snow"
                    value={proj.description}
                    onChange={(value) => updateProject(index, 'description', value)}
                    modules={quillModules}
                    formats={quillFormats}
                    className="h-32 mb-8"
                    placeholder="Project description..."
                  />
                </div>
              </div>
            ))}
            <button onClick={addProject} className="btn-outline w-full flex items-center justify-center gap-2 py-2">
              <Plus className="w-4 h-4" /> Add Project
            </button>
          </div>
        );

      case 'achievements':
        return (
          <div className="space-y-4">
            {(content.achievements || []).map((ach, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Achievement {index + 1}</span>
                  <button onClick={() => removeAchievement(index)} className="text-red-500 hover:text-red-600 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <input type="text" value={ach.title} onChange={(e) => updateAchievement(index, 'title', e.target.value)} className="input" placeholder="Achievement Title" />
                  <textarea value={ach.description} onChange={(e) => updateAchievement(index, 'description', e.target.value)} className="input min-h-[80px] resize-none" placeholder="Description (optional)" />
                  <input type="text" value={ach.date || ''} onChange={(e) => updateAchievement(index, 'date', e.target.value)} className="input" placeholder="Date (optional)" />
                </div>
              </div>
            ))}
            <button onClick={addAchievement} className="btn-outline w-full flex items-center justify-center gap-2 py-2">
              <Plus className="w-4 h-4" /> Add Achievement
            </button>
          </div>
        );

      case 'certifications':
        return (
          <div className="space-y-4">
            {(content.certifications || []).map((cert, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Certification {index + 1}</span>
                  <button onClick={() => removeCertification(index)} className="text-red-500 hover:text-red-600 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input type="text" value={cert.title} onChange={(e) => updateCertification(index, 'title', e.target.value)} className="input" placeholder="Certification Title" />
                  <input type="text" value={cert.link || ''} onChange={(e) => updateCertification(index, 'link', e.target.value)} className="input" placeholder="Certification Link" />
                  <input type="text" value={cert.date || ''} onChange={(e) => updateCertification(index, 'date', e.target.value)} className="input" placeholder="Date" />
                </div>
              </div>
            ))}
            <button onClick={addCertification} className="btn-outline w-full flex items-center justify-center gap-2 py-2">
              <Plus className="w-4 h-4" /> Add Certification
            </button>
          </div>
        );

      case 'education':
        return (
          <div className="space-y-4">
            {content.education.map((edu, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Education {index + 1}</span>
                  <button onClick={() => removeEducation(index)} className="text-red-500 hover:text-red-600 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input type="text" value={edu.institution} onChange={(e) => updateEducation(index, 'institution', e.target.value)} className="input" placeholder="School / University Name" />
                  <input type="text" value={edu.degree} onChange={(e) => updateEducation(index, 'degree', e.target.value)} className="input" placeholder="Degree" />
                  <input type="text" value={edu.date} onChange={(e) => updateEducation(index, 'date', e.target.value)} className="input" placeholder="Date / Duration" />
                </div>
              </div>
            ))}
            <button onClick={addEducation} className="btn-outline w-full flex items-center justify-center gap-2 py-2">
              <Plus className="w-4 h-4" /> Add Education
            </button>
          </div>
        );

      case 'skills':
        return (
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {content.skills.map((skill) => (
                <span key={skill} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2">
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
        );

      default:
        return null;
    }
  };

  const renderResumePreview = () => {
    const formatDescription = (desc: string): React.ReactNode => {
      if (!desc) return null;
      
      if (desc.includes('<') && desc.includes('>')) {
        return <div className="ql-editor" style={{ padding: 0 }} dangerouslySetInnerHTML={{ __html: desc }} />;
      }
      
      const lines = desc.split('\n').filter(line => line.trim());
      return (
        <ul className="list-disc pl-4 space-y-1">
          {lines.map((line, i) => {
            const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
            if (!cleanLine) return null;
            return <li key={i}>{cleanLine}</li>;
          })}
        </ul>
      );
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 min-h-[700px] text-sm">
        <div className="border-b-2 border-blue-600 pb-3 mb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {content.personalInfo.fullName || 'Your Name'}
          </h1>
          {content.personalInfo.jobTitle && (
            <p className="text-sm text-blue-600 font-medium">{content.personalInfo.jobTitle}</p>
          )}
          
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-1">
            {content.personalInfo.email && <div>{content.personalInfo.email}</div>}
            {content.personalInfo.whatsapp && <div>WhatsApp: {content.personalInfo.whatsapp}</div>}
            {content.personalInfo.address?.city && (
              <div>
                {[content.personalInfo.address.city, content.personalInfo.address.division, content.personalInfo.address.zipCode].filter(Boolean).join(', ')}
              </div>
            )}
          </div>

          {(content.personalInfo.linkedIn || content.personalInfo.socialLinks?.github || content.personalInfo.socialLinks?.portfolio) && (
            <div className="text-xs text-blue-600 mt-2 space-y-1">
              {content.personalInfo.linkedIn && <div>{content.personalInfo.linkedIn}</div>}
              {content.personalInfo.socialLinks?.github && <div>{content.personalInfo.socialLinks.github}</div>}
              {content.personalInfo.socialLinks?.portfolio && <div>{content.personalInfo.socialLinks.portfolio}</div>}
            </div>
          )}
        </div>

        {content.summary && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-blue-600 mb-1">Summary</h2>
            {content.summary.includes('<') && content.summary.includes('>') ? (
              <div className="text-gray-700 dark:text-gray-300 text-xs ql-editor" style={{ padding: 0 }} dangerouslySetInnerHTML={{ __html: content.summary }} />
            ) : (
              <p className="text-gray-700 dark:text-gray-300 text-xs whitespace-pre-wrap">{content.summary}</p>
            )}
          </div>
        )}

        {content.skills.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-blue-600 mb-1">Skills</h2>
            <p className="text-gray-700 dark:text-gray-300 text-xs">{content.skills.join(' | ')}</p>
          </div>
        )}

        {content.experience.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-blue-600 mb-1">Experience</h2>
            {content.experience.map((exp, index) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white text-xs">{exp.title}</span>
                  <span className="text-xs text-gray-500">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-xs">{exp.company}</p>
                <div className="text-gray-700 dark:text-gray-300 text-xs mt-1">
                  {formatDescription(exp.description)}
                </div>
              </div>
            ))}
          </div>
        )}

        {content.projects && content.projects.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-blue-600 mb-1">Projects</h2>
            {content.projects.map((proj, index) => (
              <div key={index} className="mb-2">
                <span className="font-semibold text-gray-900 dark:text-white text-xs">{proj.name}</span>
                {proj.technologies && proj.technologies.length > 0 && (
                  <p className="text-xs text-gray-500">{proj.technologies.join(', ')}</p>
                )}
                {(proj.links?.live || proj.links?.github) && (
                  <div className="text-xs text-blue-600">
                    {proj.links.live && <span className="mr-2">Live: {proj.links.live}</span>}
                    {proj.links.github && <span>GitHub: {proj.links.github}</span>}
                  </div>
                )}
                <div className="text-gray-700 dark:text-gray-300 text-xs mt-1">
                  {formatDescription(proj.description)}
                </div>
              </div>
            ))}
          </div>
        )}

        {content.achievements && content.achievements.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-blue-600 mb-1">Achievements</h2>
            {content.achievements.map((ach, index) => (
              <div key={index} className="mb-1">
                <span className="text-gray-700 dark:text-gray-300 text-xs">• {ach.title}</span>
              </div>
            ))}
          </div>
        )}

        {content.certifications && content.certifications.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-blue-600 mb-1">Certifications</h2>
            {content.certifications.map((cert, index) => (
              <div key={index} className="text-gray-700 dark:text-gray-300 text-xs mb-1">
                {cert.link ? (
                  <a 
                    href={cert.link.startsWith('http') ? cert.link : `https://${cert.link}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 inline-flex"
                  >
                    {cert.title}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span>{cert.title}</span>
                )}
                {cert.date && <span className="text-gray-500"> ({cert.date})</span>}
              </div>
            ))}
          </div>
        )}

        {content.education.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-blue-600 mb-1">Education</h2>
            {content.education.map((edu, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white text-xs">{edu.degree}</span>
                  <span className="text-xs text-gray-500">{edu.date}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-xs">{edu.institution}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resume Builder</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Create your professional resume</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="btn-outline flex items-center gap-2"
              >
                {showPreview ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
              {savedResumes.length > 0 && (
                <select
                  value={selectedResume?._id || ''}
                  onChange={(e) => {
                    const resume = savedResumes.find(r => r._id === e.target.value);
                    if (resume) handleSelectResume(resume);
                  }}
                  className="input w-40"
                >
                  <option value="">Load saved...</option>
                  {savedResumes.map((r) => (
                    <option key={r._id} value={r._id}>{r.content.personalInfo.fullName || 'Untitled'}</option>
                  ))}
                </select>
              )}
              <button onClick={handleNewResume} className="btn-outline">New</button>
            </div>
          </div>
        </motion.div>

        <div className={`grid grid-cols-1 gap-8 ${showPreview ? 'lg:grid-cols-2' : ''}`}>
          <div className="space-y-3">
            {sections.map((section) => (
              <div key={section.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button onClick={() => toggleSection(section.id)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-center gap-2">
                    <section.icon className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-gray-900 dark:text-white">{section.title}</span>
                  </div>
                  {section.expanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                </button>
                <AnimatePresence>
                  {section.expanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-4 pb-4">
                      {renderSectionEditor(section)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={handleSaveResume} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={handleExportPDF} className="btn-outline flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> PDF
              </button>
            </div>
          </div>

          {showPreview && (
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Live Preview</h3>
              </div>
              {renderResumePreview()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
