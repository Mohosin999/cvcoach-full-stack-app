import { jsPDF } from "jspdf";
import { ResumeContent } from "../types";

// Format phone number with (+880) prefix
const formatPhoneNumber = (phone: string): string => {
  const cleanNumber = phone.replace(/^(\+880|880)/, "");
  return `(+880) ${cleanNumber}`;
};

// Format LinkedIn URL
const formatLinkedIn = (linkedIn: string): string => {
  const clean = linkedIn.replace(/^https?:\/\//, "").replace(/^www\./, "");
  return clean.startsWith("linkedin.com/in/")
    ? clean
    : `linkedin.com/in/${clean}`;
};

// Format bullets for plain text
const formatBullets = (text: string): string[] => {
  if (!text) return [];
  const cleanText = text.replace(/<[^>]+>/g, "").replace(/<br\s*\/?>/gi, "\n");
  const lines = cleanText.split("\n").filter((line) => line.trim());
  return lines.map((line) => line.replace(/^[•\-\*\+]\s*/, "").trim());
};

export const exportToPdf = async (content: ResumeContent): Promise<void> => {
  const {
    personalInfo,
    summary,
    experience,
    projects,
    achievements,
    education,
    technicalSkills,
    softSkills,
  } = content;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;

  let y = margin;

  // === HEADER - Two Column Layout (matching live preview exactly) ===
  // Left Side - Name and Title
  pdf.setFontSize(14); // ~10px equivalent
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(34, 34, 34); // #222222
  const name = personalInfo.fullName || "YOUR NAME";
  pdf.text(name.toUpperCase(), margin, y + 5);

  if (personalInfo.jobTitle) {
    pdf.setFontSize(11); // ~8px equivalent
    pdf.setFont("helvetica", "normal");
    pdf.text(personalInfo.jobTitle, margin, y + 9);
  }

  // Right Side - Contact Info
  const rightX = pageWidth - margin;
  pdf.setFontSize(7); // ~5px equivalent for contact info
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(34, 34, 34);

  // Build location string
  const locationParts = [
    personalInfo.address?.city,
    personalInfo.address?.division,
    personalInfo.address?.zipCode,
  ].filter(Boolean);
  const locationString =
    locationParts.length > 0
      ? locationParts[0] +
        (locationParts.length > 1 ? ", " : "") +
        locationParts.slice(1).join(" ")
      : "";

  // First line: Location • Phone
  const phone = personalInfo.whatsapp
    ? formatPhoneNumber(personalInfo.whatsapp)
    : "";
  const firstContactLine = [locationString, phone].filter(Boolean).join(" • ");
  
  // Second line: Email • LinkedIn
  const linkedIn = personalInfo.linkedIn
    ? formatLinkedIn(personalInfo.linkedIn)
    : "";
  const email = personalInfo.email || "";
  const secondContactLine = [email, linkedIn].filter(Boolean).join(" • ");

  const firstLineWidth = pdf.getTextWidth(firstContactLine);
  const secondLineWidth = pdf.getTextWidth(secondContactLine);
  const maxContactWidth = Math.max(firstLineWidth, secondLineWidth);
  const contactX = rightX - maxContactWidth;

  pdf.text(firstContactLine, contactX, y + 3.5);
  pdf.text(secondContactLine, contactX, y + 7);

  // Add clickable links for email
  if (email) {
    const emailWidth = pdf.getTextWidth(email);
    let emailX = contactX;
    if (linkedIn && email) {
      emailX = contactX;
    }
    pdf.link(emailX, y + 4.5, emailWidth, 2.5, { url: `mailto:${email}` });
  }

  // Add clickable link for LinkedIn
  if (personalInfo.linkedIn) {
    const linkedInWidth = pdf.getTextWidth(linkedIn);
    const linkedInUrl = personalInfo.linkedIn.startsWith("http")
      ? personalInfo.linkedIn
      : `https://${personalInfo.linkedIn}`;
    
    let linkedInX = contactX;
    if (email) {
      linkedInX = contactX + pdf.getTextWidth(email + " • ");
    }
    pdf.link(linkedInX, y + 8, linkedInWidth, 2.5, { url: linkedInUrl });
  }

  y = y + 15;

  // === SUMMARY ===
  if (summary) {
    const cleanSummary = summary.replace(/<[^>]+>/g, "");
    y = addSectionHeader(pdf, "SUMMARY", y, margin, contentWidth);
    pdf.setFontSize(8); // ~6px equivalent
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(55, 55, 55); // #373737 (gray-700)
    const summaryLines = pdf.splitTextToSize(cleanSummary, contentWidth);
    pdf.text(summaryLines, margin, y);
    y = y + summaryLines.length * 3.5;
    y = y + 3;
  }

  // === EXPERIENCE ===
  if (experience.length > 0) {
    y = addSectionHeader(pdf, "EXPERIENCE", y, margin, contentWidth);
    experience.forEach((exp, index) => {
      if (y > pageHeight - 25) {
        pdf.addPage();
        y = margin;
        y = addSectionHeader(pdf, "EXPERIENCE", y, margin, contentWidth);
      }

      // Company and dates on same line
      pdf.setFontSize(9); // ~7px equivalent
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(34, 34, 34);
      pdf.text(exp.company, margin, y);

      const dateText = `${exp.startDate} - ${exp.current ? "Present" : exp.endDate || ""}`;
      const dateWidth = pdf.getTextWidth(dateText);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(107, 107, 107); // gray-600
      pdf.text(dateText, pageWidth - margin - dateWidth, y);

      y = y + 4;

      // Title and top skills
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(55, 55, 55);
      let titleText = exp.title;
      if (exp.topSkills && exp.topSkills.length > 0) {
        titleText += ` - ${exp.topSkills.join(", ")}`;
      }
      const titleLines = pdf.splitTextToSize(titleText, contentWidth);
      pdf.text(titleLines, margin, y);
      y = y + titleLines.length * 3.5;

      // Description bullets
      if (exp.description) {
        const bullets = formatBullets(exp.description);
        bullets.forEach((bullet) => {
          if (y > pageHeight - 12) {
            pdf.addPage();
            y = margin;
          }
          pdf.text(`• ${bullet}`, margin + 1, y);
          const bulletLines = pdf.splitTextToSize(bullet, contentWidth - 2);
          y = y + bulletLines.length * 3;
        });
      }

      if (index < experience.length - 1) {
        y = y + 2;
      }
    });
    y = y + 3;
  }

  // === PROJECTS ===
  if (projects && projects.length > 0) {
    y = addSectionHeader(pdf, "PROJECTS", y, margin, contentWidth);
    projects.forEach((proj, index) => {
      if (y > pageHeight - 25) {
        pdf.addPage();
        y = margin;
        y = addSectionHeader(pdf, "PROJECTS", y, margin, contentWidth);
      }

      // Project name and links on same line
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(34, 34, 34);
      pdf.text(proj.name || "Untitled Project", margin, y);

      // Project links (Live, GitHub) on right side
      const linkGap = 5;
      const links: Array<{ text: string; url: string }> = [];
      if (proj.links?.live) {
        links.push({ text: "Live", url: proj.links.live });
      }
      if (proj.links?.github) {
        links.push({ text: "GitHub", url: proj.links.github });
      }

      // Calculate total width of links
      let totalLinksWidth = 0;
      pdf.setFontSize(7);
      links.forEach((link, i) => {
        totalLinksWidth += pdf.getTextWidth(link.text);
        if (i < links.length - 1) {
          totalLinksWidth += linkGap;
        }
      });

      let currentX = pageWidth - margin - totalLinksWidth;
      links.forEach((link) => {
        pdf.setFontSize(7);
        pdf.setTextColor(5, 150, 105); // #059669 (emerald-600 for Live)
        if (link.text === "GitHub") {
          pdf.setTextColor(107, 114, 128); // #6b7280 (gray-500 for GitHub)
        }
        pdf.text(link.text, currentX, y);
        const textWidth = pdf.getTextWidth(link.text);
        pdf.link(currentX, y - 2, textWidth, 2.5, { url: link.url });
        currentX = currentX + textWidth + linkGap;
      });

      // Reset text color
      pdf.setTextColor(34, 34, 34);
      y = y + 4;

      // Technologies (italic)
      if (proj.technologies && proj.technologies.length > 0) {
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "italic");
        pdf.setTextColor(107, 107, 107);
        const techText = proj.technologies.join(", ");
        pdf.text(techText, margin, y);
        pdf.setTextColor(34, 34, 34);
        pdf.setFont("helvetica", "normal");
        y = y + 3.5;
      }

      // Description
      if (proj.description) {
        const bullets = formatBullets(proj.description);
        bullets.forEach((bullet) => {
          if (y > pageHeight - 12) {
            pdf.addPage();
            y = margin;
          }
          pdf.text(`• ${bullet}`, margin + 1, y);
          const bulletLines = pdf.splitTextToSize(bullet, contentWidth - 2);
          y = y + bulletLines.length * 3;
        });
      }

      if (index < projects.length - 1) {
        y = y + 2;
      }
    });
    y = y + 3;
  }

  // === ACHIEVEMENTS ===
  if (achievements && achievements.length > 0) {
    y = addSectionHeader(pdf, "ACHIEVEMENTS", y, margin, contentWidth);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(55, 55, 55);
    achievements.forEach((ach) => {
      if (y > pageHeight - 12) {
        pdf.addPage();
        y = margin;
      }
      let achText = ach.title;
      if (ach.description) {
        achText += ` - ${ach.description}`;
      }
      pdf.text(`• ${achText}`, margin + 1, y);
      const achLines = pdf.splitTextToSize(achText, contentWidth - 2);
      y = y + achLines.length * 3;
    });
    y = y + 3;
  }

  // === EDUCATION ===
  if (education.length > 0) {
    y = addSectionHeader(pdf, "EDUCATION", y, margin, contentWidth);
    education.forEach((edu) => {
      if (y > pageHeight - 18) {
        pdf.addPage();
        y = margin;
      }

      // Institution (bold)
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(34, 34, 34);
      pdf.text(edu.institution, margin, y);

      y = y + 4;

      // Degree
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(55, 55, 55);
      pdf.text(edu.degree, margin, y);

      y = y + 3.5;

      // Date
      if (edu.date) {
        pdf.setFontSize(7);
        pdf.setTextColor(107, 107, 107);
        pdf.text(edu.date, margin, y);
        y = y + 3;
      }
    });
    y = y + 3;
  }

  // === SKILLS ===
  if ((content.technicalSkills && content.technicalSkills.length > 0) || (content.softSkills && content.softSkills.length > 0)) {
    y = addSectionHeader(pdf, "SKILLS", y, margin, contentWidth);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(55, 55, 55);
    
    const technicalSkills = content.technicalSkills || [];
    const softSkills = content.softSkills || [];
    
    let currentY = y;
    
    if (technicalSkills.length > 0) {
      const techSkillsText = `• Technical Skills: ${technicalSkills.join(", ")}`;
      const techSkillLines = pdf.splitTextToSize(techSkillsText, contentWidth);
      pdf.text(techSkillLines, margin, currentY);
      currentY = currentY + techSkillLines.length * 3.5;
    }
    
    if (softSkills.length > 0) {
      const softSkillsText = `• Soft Skills: ${softSkills.join(", ")}`;
      const softSkillLines = pdf.splitTextToSize(softSkillsText, contentWidth);
      pdf.text(softSkillLines, margin, currentY);
      currentY = currentY + softSkillLines.length * 3.5;
    }
    
    y = currentY;
  }

  pdf.save(`${personalInfo.fullName || "resume"}.pdf`);
};

const addSectionHeader = (
  pdf: jsPDF,
  title: string,
  y: number,
  margin: number,
  contentWidth: number,
): number => {
  pdf.setFontSize(9); // ~7px equivalent
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(34, 34, 34);
  pdf.text(title, margin, y);
  // Draw border line under header
  pdf.setLineWidth(0.25);
  pdf.setDrawColor(209, 213, 219); // gray-300
  pdf.line(margin, y + 1, margin + contentWidth, y + 1);
  return y + 4;
};
