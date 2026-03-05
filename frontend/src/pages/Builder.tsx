import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  Save,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  PlusCircle,
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
import ConfirmModal from '../components/ConfirmModal';

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
  expanded: boolean;
}

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
  awards: [],
  contributions: [],
};

export default function Builder() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [savedResumes, setSavedResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [content, setContent] = useState<ResumeContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sections, setSections] = useState<Section[]>([
    { id: 'personal', title: 'Personal Information', icon: FileText, expanded: true },
    { id: 'summary', title: 'Professional Summary', icon: FileText, expanded: true },
    { id: 'experience', title: 'Experience', icon: FileText, expanded: true },
    { id: 'education', title: 'Education', icon: FileText, expanded: true },
    { id: 'skills', title: 'Skills', icon: FileText, expanded: true },
    { id: 'projects', title: 'Projects', icon: FileText, expanded: true },
    { id: 'certifications', title: 'Certifications', icon: FileText, expanded: false },
    { id: 'awards', title: 'Awards', icon: FileText, expanded: false },
    { id: 'languages', title: 'Languages', icon: FileText, expanded: false },
  ]);

  useEffect(() => {
    const passedResume = location.state?.resume as Resume | undefined;
    if (passedResume) {
      setSelectedResume(passedResume);
      setContent(passedResume.content);
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

  const updatePersonalInfo = (field: string, value: string) => {
    setContent({
      ...content,
      personalInfo: { ...content.personalInfo, [field]: value }
    });
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

  const addEducation = () => {
    setContent({
      ...content,
      education: [
        ...content.education,
        { institution: '', degree: '', field: '', graduationDate: '' }
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

  const addProject = () => {
    setContent({
      ...content,
      projects: [
        ...(content.projects || []),
        { name: '', description: '', technologies: [], url: '' }
      ]
    });
  };

  const updateProject = (index: number, field: string, value: any) => {
    const updated = [...(content.projects || [])];
    updated[index] = { ...updated[index], [field]: value };
    setContent({ ...content, projects: updated });
  };

  const removeProject = (index: number) => {
    setContent({
      ...content,
      projects: content.projects?.filter((_, i) => i !== index) || []
    });
  };

  const addCertification = () => {
    setContent({
      ...content,
      certifications: [
        ...(content.certifications || []),
        { name: '', issuer: '', date: '', url: '' }
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

  const addAward = () => {
    setContent({
      ...content,
      awards: [
        ...(content.awards || []),
        { title: '', issuer: '', date: '' }
      ]
    });
  };

  const updateAward = (index: number, field: string, value: string) => {
    const updated = [...(content.awards || [])];
    updated[index] = { ...updated[index], [field]: value };
    setContent({ ...content, awards: updated });
  };

  const removeAward = (index: number) => {
    setContent({
      ...content,
      awards: content.awards?.filter((_, i) => i !== index) || []
    });
  };

  const addLanguage = () => {
    setContent({
      ...content,
      languages: [
        ...(content.languages || []),
        { language: '', proficiency: '' }
      ]
    });
  };

  const updateLanguage = (index: number, field: string, value: string) => {
    const updated = [...(content.languages || [])];
    updated[index] = { ...updated[index], [field]: value };
    setContent({ ...content, languages: updated });
  };

  const removeLanguage = (index: number) => {
    setContent({
      ...content,
      languages: content.languages?.filter((_, i) => i !== index) || []
    });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - margin * 2;
    let y = 15;
    const accentColor: [number, number, number] = [37, 99, 235];

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 37, 37);
    doc.text(content.personalInfo.name || 'Resume', margin, y);
    y += 7;

    const contactParts = [
      content.personalInfo.email,
      content.personalInfo.phone,
      content.personalInfo.location
    ].filter(Boolean);
    
    if (contactParts.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(contactParts.join('  |  '), margin, y);
      y += 5;
    }

    const socialParts = [
      content.personalInfo.linkedin,
      content.personalInfo.portfolio
    ].filter(Boolean);
    
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
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      const summaryLines = doc.splitTextToSize(content.summary, contentWidth);
      doc.text(summaryLines, margin, y);
      y += summaryLines.length * 5 + 5;
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
        
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        const descLines = doc.splitTextToSize(exp.description, contentWidth);
        doc.text(descLines, margin, y);
        y += descLines.length * 5 + 6;
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
        
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        const descLines = doc.splitTextToSize(proj.description, contentWidth);
        doc.text(descLines, margin, y);
        y += descLines.length * 5 + 6;
      });
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
        const degreeText = edu.field ? `${edu.degree} in ${edu.field}` : edu.degree;
        doc.text(degreeText, margin, y);
        y += 4;
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(edu.institution, margin, y);
        y += 4;
        
        if (edu.graduationDate) {
          doc.setFontSize(9);
          doc.setTextColor(120, 120, 120);
          doc.text(edu.graduationDate, margin, y);
          y += 6;
        } else {
          y += 6;
        }
      });
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
        doc.text(cert.name, margin, y);
        y += 4;
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        const certText = cert.date ? `${cert.issuer} - ${cert.date}` : cert.issuer;
        doc.text(certText, margin, y);
        y += 6;
      });
    }

    if (content.awards && content.awards.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('Awards', margin, y);
      y += 5;
      
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 4;

      content.awards.forEach((award) => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 37, 37);
        doc.text(award.title, margin, y);
        y += 4;
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        const awardText = award.date ? `${award.issuer} - ${award.date}` : award.issuer;
        doc.text(awardText, margin, y);
        y += 6;
      });
    }

    if (content.languages && content.languages.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('Languages', margin, y);
      y += 5;
      
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 4;

      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const langText = content.languages.map(l => `${l.language}: ${l.proficiency}`).join('  |  ');
      doc.text(langText, margin, y);
    }

    doc.save(`${content.personalInfo.name || 'resume'}.pdf`);
    toast.success('PDF downloaded');
  };

  const renderSectionEditor = (section: Section) => {
    switch (section.id) {
      case 'personal':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Full Name</label>
              <input
                type="text"
                value={content.personalInfo.name}
                onChange={(e) => updatePersonalInfo('name', e.target.value)}
                className="input"
                placeholder="John Doe"
              />
            </div>
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
              <label className="label">Phone</label>
              <input
                type="tel"
                value={content.personalInfo.phone}
                onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                className="input"
                placeholder="+1 234 567 8900"
              />
            </div>
            <div>
              <label className="label">Location</label>
              <input
                type="text"
                value={content.personalInfo.location}
                onChange={(e) => updatePersonalInfo('location', e.target.value)}
                className="input"
                placeholder="City, Country"
              />
            </div>
            <div>
              <label className="label">LinkedIn</label>
              <input
                type="text"
                value={content.personalInfo.linkedin}
                onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                className="input"
                placeholder="linkedin.com/in/username"
              />
            </div>
          </div>
        );

      case 'summary':
        return (
          <textarea
            value={content.summary}
            onChange={(e) => setContent({ ...content, summary: e.target.value })}
            className="input min-h-[120px] resize-none"
            placeholder="Write a brief professional summary..."
          />
        );

      case 'experience':
        return (
          <div className="space-y-4">
            {content.experience.map((exp, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Position {index + 1}
                  </span>
                  <button onClick={() => removeExperience(index)} className="text-red-500 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <input type="text" value={exp.title} onChange={(e) => updateExperience(index, 'title', e.target.value)} className="input" placeholder="Job Title" />
                  <input type="text" value={exp.company} onChange={(e) => updateExperience(index, 'company', e.target.value)} className="input" placeholder="Company" />
                  <input type="text" value={exp.startDate} onChange={(e) => updateExperience(index, 'startDate', e.target.value)} className="input" placeholder="Start Date (e.g., Jan 2020)" />
                  <div className="flex gap-2">
                    <input type="text" value={exp.endDate || ''} onChange={(e) => updateExperience(index, 'endDate', e.target.value)} className="input flex-1" placeholder="End Date" disabled={exp.current} />
                    <label className="flex items-center gap-1 text-xs text-gray-600">
                      <input type="checkbox" checked={exp.current} onChange={(e) => updateExperience(index, 'current', e.target.checked)} />
                      Present
                    </label>
                  </div>
                </div>
                <textarea value={exp.description} onChange={(e) => updateExperience(index, 'description', e.target.value)} className="input min-h-[80px] resize-none" placeholder="Describe your responsibilities and achievements..." />
              </div>
            ))}
            <button onClick={addExperience} className="btn-outline w-full flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add Experience
            </button>
          </div>
        );

      case 'education':
        return (
          <div className="space-y-4">
            {content.education.map((edu, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Education {index + 1}</span>
                  <button onClick={() => removeEducation(index)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="text" value={edu.degree} onChange={(e) => updateEducation(index, 'degree', e.target.value)} className="input" placeholder="Degree" />
                  <input type="text" value={edu.field} onChange={(e) => updateEducation(index, 'field', e.target.value)} className="input" placeholder="Field of Study" />
                  <input type="text" value={edu.institution} onChange={(e) => updateEducation(index, 'institution', e.target.value)} className="input" placeholder="Institution" />
                  <input type="text" value={edu.graduationDate} onChange={(e) => updateEducation(index, 'graduationDate', e.target.value)} className="input" placeholder="Graduation Date" />
                </div>
              </div>
            ))}
            <button onClick={addEducation} className="btn-outline w-full flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add Education
            </button>
          </div>
        );

      case 'skills':
        return (
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {content.skills.map((skill) => (
                <span key={skill} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
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

      case 'projects':
        return (
          <div className="space-y-4">
            {(content.projects || []).map((proj, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Project {index + 1}</span>
                  <button onClick={() => removeProject(index)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <input type="text" value={proj.name} onChange={(e) => updateProject(index, 'name', e.target.value)} className="input" placeholder="Project Name" />
                  <input type="text" value={proj.url || ''} onChange={(e) => updateProject(index, 'url', e.target.value)} className="input" placeholder="Project URL" />
                </div>
                <input type="text" value={proj.technologies?.join(', ') || ''} onChange={(e) => updateProject(index, 'technologies', e.target.value.split(',').map(t => t.trim()))} className="input mb-3" placeholder="Technologies (comma separated)" />
                <textarea value={proj.description} onChange={(e) => updateProject(index, 'description', e.target.value)} className="input min-h-[80px] resize-none" placeholder="Project description..." />
              </div>
            ))}
            <button onClick={addProject} className="btn-outline w-full flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add Project
            </button>
          </div>
        );

      case 'certifications':
        return (
          <div className="space-y-4">
            {(content.certifications || []).map((cert, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Certification {index + 1}</span>
                  <button onClick={() => removeCertification(index)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="text" value={cert.name} onChange={(e) => updateCertification(index, 'name', e.target.value)} className="input" placeholder="Certification Name" />
                  <input type="text" value={cert.issuer} onChange={(e) => updateCertification(index, 'issuer', e.target.value)} className="input" placeholder="Issuing Organization" />
                  <input type="text" value={cert.date || ''} onChange={(e) => updateCertification(index, 'date', e.target.value)} className="input" placeholder="Date" />
                  <input type="text" value={cert.url || ''} onChange={(e) => updateCertification(index, 'url', e.target.value)} className="input" placeholder="Credential URL" />
                </div>
              </div>
            ))}
            <button onClick={addCertification} className="btn-outline w-full flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add Certification
            </button>
          </div>
        );

      case 'awards':
        return (
          <div className="space-y-4">
            {(content.awards || []).map((award, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Award {index + 1}</span>
                  <button onClick={() => removeAward(index)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input type="text" value={award.title} onChange={(e) => updateAward(index, 'title', e.target.value)} className="input" placeholder="Award Title" />
                  <input type="text" value={award.issuer} onChange={(e) => updateAward(index, 'issuer', e.target.value)} className="input" placeholder="Issuing Organization" />
                  <input type="text" value={award.date || ''} onChange={(e) => updateAward(index, 'date', e.target.value)} className="input" placeholder="Date" />
                </div>
              </div>
            ))}
            <button onClick={addAward} className="btn-outline w-full flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add Award
            </button>
          </div>
        );

      case 'languages':
        return (
          <div className="space-y-4">
            {(content.languages || []).map((lang, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Language {index + 1}</span>
                  <button onClick={() => removeLanguage(index)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="text" value={lang.language} onChange={(e) => updateLanguage(index, 'language', e.target.value)} className="input" placeholder="Language" />
                  <input type="text" value={lang.proficiency} onChange={(e) => updateLanguage(index, 'proficiency', e.target.value)} className="input" placeholder="Proficiency (e.g., Native, Fluent)" />
                </div>
              </div>
            ))}
            <button onClick={addLanguage} className="btn-outline w-full flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add Language
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const renderResumePreview = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 min-h-[700px] text-sm">
        <div className="border-b-2 border-blue-600 pb-3 mb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {content.personalInfo.name || 'Your Name'}
          </h1>
          <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-600 dark:text-gray-400">
            {content.personalInfo.email && <span>{content.personalInfo.email}</span>}
            {content.personalInfo.phone && <span>| {content.personalInfo.phone}</span>}
            {content.personalInfo.location && <span>| {content.personalInfo.location}</span>}
          </div>
          {(content.personalInfo.linkedin || content.personalInfo.portfolio) && (
            <div className="text-xs text-blue-600 mt-1">
              {content.personalInfo.linkedin && <span>{content.personalInfo.linkedin}</span>}
              {content.personalInfo.linkedin && content.personalInfo.portfolio && <span> | </span>}
              {content.personalInfo.portfolio && <span>{content.personalInfo.portfolio}</span>}
            </div>
          )}
        </div>

        {content.summary && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-blue-600 mb-1">Summary</h2>
            <p className="text-gray-700 dark:text-gray-300 text-xs">{content.summary}</p>
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
                <p className="text-gray-700 dark:text-gray-300 text-xs mt-1 whitespace-pre-line">{exp.description}</p>
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
                <p className="text-gray-700 dark:text-gray-300 text-xs">{proj.description}</p>
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
                  <span className="font-semibold text-gray-900 dark:text-white text-xs">{edu.degree}{edu.field && ` in ${edu.field}`}</span>
                  <span className="text-xs text-gray-500">{edu.graduationDate}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-xs">{edu.institution}</p>
              </div>
            ))}
          </div>
        )}

        {content.certifications && content.certifications.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-blue-600 mb-1">Certifications</h2>
            {content.certifications.map((cert, index) => (
              <p key={index} className="text-gray-700 dark:text-gray-300 text-xs">
                {cert.name} - {cert.issuer} {cert.date && `(${cert.date})`}
              </p>
            ))}
          </div>
        )}

        {content.awards && content.awards.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-blue-600 mb-1">Awards</h2>
            {content.awards.map((award, index) => (
              <p key={index} className="text-gray-700 dark:text-gray-300 text-xs">
                {award.title} - {award.issuer} {award.date && `(${award.date})`}
              </p>
            ))}
          </div>
        )}

        {content.languages && content.languages.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-blue-600 mb-1">Languages</h2>
            <p className="text-gray-700 dark:text-gray-300 text-xs">
              {content.languages.map(l => `${l.language}: ${l.proficiency}`).join(' | ')}
            </p>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resume Builder</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Create your professional resume</p>
            </div>
            <div className="flex gap-2">
              {savedResumes.length > 0 && (
                <select
                  value={selectedResume?._id || ''}
                  onChange={(e) => {
                    const resume = savedResumes.find(r => r._id === e.target.value);
                    if (resume) handleSelectResume(resume);
                  }}
                  className="input w-48"
                >
                  <option value="">Load saved...</option>
                  {savedResumes.map((r) => (
                    <option key={r._id} value={r._id}>{r.content.personalInfo.name || 'Untitled'}</option>
                  ))}
                </select>
              )}
              <button onClick={handleNewResume} className="btn-outline">New</button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
            {sections.map((section) => (
              <div key={section.id} className="card">
                <button onClick={() => toggleSection(section.id)} className="w-full flex items-center justify-between p-2">
                  <span className="font-medium text-gray-900 dark:text-white">{section.title}</span>
                  {section.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <AnimatePresence>
                  {section.expanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-2 pb-2">
                      {renderSectionEditor(section)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            <div className="flex gap-3 sticky bottom-0 bg-gray-50 dark:bg-gray-900 py-2">
              <button onClick={handleSaveResume} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={handleExportPDF} className="btn-outline flex items-center gap-2">
                <Download className="w-4 h-4" /> PDF
              </button>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 h-fit">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Live Preview</h3>
            {renderResumePreview()}
          </div>
        </div>
      </div>
    </div>
  );
}
