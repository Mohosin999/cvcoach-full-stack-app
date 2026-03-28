import { ResumeContent } from "../types";

let printWindow: Window | null = null;

export const exportToPdf = async (content: ResumeContent): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      if (printWindow && !printWindow.closed) {
        printWindow.close();
      }

      printWindow = window.open("", "_blank", "width=800,height=900");

      if (!printWindow) {
        throw new Error("Unable to open print window. Please allow popups.");
      }

      const printContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resume - CVCoach</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    html, body {
      width: 210mm;
      min-height: 297mm;
      margin: 0;
      padding: 0;
      background: white !important;
    }
    
    body {
      font-size: 10pt;
      line-height: 1.4;
      color: #222222;
    }
    
    .resume-container {
      width: 210mm;
      min-height: 297mm;
      padding: 15mm;
      background: white;
      margin: 0;
      box-sizing: border-box;
    }
    
    .resume-container * {
      box-sizing: border-box;
    }
    
    .resume-name {
      font-size: 16pt !important;
      line-height: 1.1 !important;
      letter-spacing: 0.02em;
    }
    
    .resume-job-title {
      font-size: 12pt !important;
      margin-top: 4px;
    }
    
    .resume-section {
      margin-top: 12pt;
    }
    
    .resume-section-title {
      font-size: 11pt;
      font-weight: 600;
      color: #222222;
      border-bottom: 1pt solid #e5e7eb;
      padding-bottom: 2pt;
      margin-bottom: 6pt;
    }
    
    .resume-item {
      margin-bottom: 8pt;
    }
    
    .resume-item-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    
    .resume-company,
    .resume-school {
      font-weight: 600;
      font-size: 10pt;
      color: #222222;
    }
    
    .resume-date {
      font-size: 9pt;
      color: #4b5563;
    }
    
    .resume-position,
    .resume-degree {
      font-size: 10pt;
      color: #374151;
      font-style: italic;
    }
    
    .resume-description {
      margin-top: 3pt;
      font-size: 10pt;
      line-height: 1.4;
      color: #374151;
    }
    
    .resume-description ul {
      margin: 2pt 0 0 0;
      padding-left: 12pt;
    }
    
    .resume-description li {
      margin: 1pt 0;
    }
    
    .resume-skills-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 4pt;
    }
    
    .resume-skill-tag {
      font-size: 9pt;
      background: #f3f4f6;
      padding: 2pt 6pt;
      border-radius: 2pt;
      color: #374151;
    }
    
    .resume-contact-line {
      font-size: 9pt;
      line-height: 1.3;
      color: #222222;
    }
    
    .resume-contact-line span {
      margin: 0 3pt;
    }
    
    a {
      color: #2563eb !important;
      text-decoration: none !important;
    }
    
    .ql-editor {
      padding: 0 !important;
    }
    
    .ql-editor p {
      margin: 0 !important;
    }
  </style>
</head>
<body>
  <div class="resume-container">
    <!-- Header - Name and Title -->
    <div style="margin-bottom: 14pt;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="min-width: 220px;">
          <h1 class="resume-name" style="font-weight: bold; color: #222222; text-transform: uppercase;">
            ${content.personalInfo.fullName || "YOUR NAME"}
          </h1>
          ${content.personalInfo.jobTitle ? `<p class="resume-job-title" style="color: #222222;">${content.personalInfo.jobTitle}</p>` : ""}
        </div>
        <div style="text-align: right; min-width: 200px;">
          ${buildContactInfo(content)}
        </div>
      </div>
    </div>

    <!-- Summary -->
    ${
      content.summary
        ? `
    <div class="resume-section">
      <h2 class="resume-section-title">PROFESSIONAL SUMMARY</h2>
      <p style="font-size: 10pt; line-height: 1.4; color: #374151;">${content.summary}</p>
    </div>
    `
        : ""
    }

    <!-- Experience -->
    ${
      content.experience.length > 0
        ? `
    <div class="resume-section">
      <h2 class="resume-section-title">WORK EXPERIENCE</h2>
      ${content.experience
        .map(
          (exp) => `
        <div class="resume-item">
          <div class="resume-item-header">
            <span class="resume-company">${exp.company}</span>
            <span class="resume-date">${formatDateRange(exp.startDate, exp.endDate)}</span>
          </div>
          <p class="resume-position">${exp.title}</p>
          ${exp.description ? `<div class="resume-description">${formatDescriptionHtml(exp.description)}</div>` : ""}
        </div>
      `,
        )
        .join("")}
    </div>
    `
        : ""
    }

    <!-- Projects -->
    ${
      content.projects && content.projects.length > 0
        ? `
    <div class="resume-section">
      <h2 class="resume-section-title">PROJECTS</h2>
      ${content.projects
        .map(
          (proj) => `
        <div class="resume-item">
          <div class="resume-item-header">
            <span class="resume-company">${proj.name}</span>
            ${proj.links?.live ? `<a href="${proj.links.live}" target="_blank">${proj.links.live}</a>` : ""}
          </div>
          ${proj.description ? `<div class="resume-description">${formatDescriptionHtml(proj.description)}</div>` : ""}
        </div>
      `,
        )
        .join("")}
    </div>
    `
        : ""
    }

    <!-- Achievements -->
    ${
      content.achievements && content.achievements.length > 0
        ? `
    <div class="resume-section">
      <h2 class="resume-section-title">ACHIEVEMENTS</h2>
      <ul style="margin: 0; padding-left: 16pt;">
        ${content.achievements
          .map(
            (ach) => `
          <li style="margin: 2pt 0; font-size: 10pt; color: #374151;">${ach.title}${ach.date ? ` - ${ach.date}` : ""}</li>
        `,
          )
          .join("")}
      </ul>
    </div>
    `
        : ""
    }

    <!-- Education -->
    ${
      content.education.length > 0
        ? `
    <div class="resume-section">
      <h2 class="resume-section-title">EDUCATION</h2>
      ${content.education
        .map(
          (edu) => `
        <div class="resume-item">
          <div class="resume-item-header">
            <span class="resume-school">${edu.institution}</span>
            <span class="resume-date">${edu.date || ""}</span>
          </div>
          <p class="resume-degree">${edu.degree}</p>
        </div>
      `,
        )
        .join("")}
    </div>
    `
        : ""
    }

    <!-- Skills -->
    ${
      content.technicalSkills?.length > 0 || content.softSkills?.length > 0
        ? `
    <div class="resume-section">
      <h2 class="resume-section-title">SKILLS</h2>
      <div style="margin-bottom: 6pt;">
        ${content.technicalSkills?.length > 0 ? `<strong>Technical: </strong>` : ""}
        <span class="resume-skills-grid" style="display: inline;">
          ${
            content.technicalSkills
              ?.map(
                (skill) => `
            <span class="resume-skill-tag">${skill}</span>
          `,
              )
              .join("") || ""
          }
        </span>
      </div>
      ${
        content.softSkills?.length > 0
          ? `
      <div>
        <strong>Soft: </strong>
        <span class="resume-skills-grid" style="display: inline;">
          ${
            content.softSkills
              ?.map(
                (skill) => `
            <span class="resume-skill-tag">${skill}</span>
          `,
              )
              .join("") || ""
          }
        </span>
      </div>
      `
          : ""
      }
    </div>
    `
        : ""
    }
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 250);
    };
  </script>
</body>
</html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();

      printWindow.onafterprint = () => {
        printWindow?.close();
        resolve();
      };
    } catch (error) {
      console.error("PDF export error:", error);
      reject(error);
    }
  });
};

function buildContactInfo(content: ResumeContent): string {
  const parts: string[] = [];

  const locationParts = [
    content.personalInfo.address?.city,
    content.personalInfo.address?.division,
    content.personalInfo.address?.zipCode,
  ].filter(Boolean);

  if (locationParts.length > 0) {
    parts.push(locationParts.join(", "));
  }

  if (content.personalInfo.whatsapp) {
    const phone = content.personalInfo.whatsapp.replace(/^(\+880|880)/, "");
    parts.push(`(+880) ${phone}`);
  }

  const firstLine = parts.join(" • ");

  const secondLineParts: string[] = [];

  if (content.personalInfo.email) {
    secondLineParts.push(content.personalInfo.email);
  }

  if (content.personalInfo.linkedIn) {
    let linkedin = content.personalInfo.linkedIn
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "");
    if (!linkedin.startsWith("linkedin.com/in/")) {
      linkedin = "linkedin.com/in/" + linkedin;
    }
    secondLineParts.push(linkedin);
  }

  const socialParts: string[] = [];

  if (content.personalInfo.socialLinks?.github) {
    let github = content.personalInfo.socialLinks.github
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "");
    socialParts.push(`github.com/${github.replace(/^github\.com\//, "")}`);
  }

  if (content.personalInfo.socialLinks?.portfolio) {
    let portfolio = content.personalInfo.socialLinks.portfolio
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "");
    socialParts.push(portfolio);
  }

  if (content.personalInfo.socialLinks?.website) {
    let website = content.personalInfo.socialLinks.website
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "");
    socialParts.push(website);
  }

  let html = '<div class="resume-contact-line">';
  if (firstLine) {
    html += `<div>${firstLine}</div>`;
  }
  if (secondLineParts.length > 0) {
    html += `<div>${secondLineParts.join(" • ")}</div>`;
  }
  if (socialParts.length > 0) {
    html += `<div>${socialParts.join(" • ")}</div>`;
  }
  html += "</div>";

  return html;
}

function formatDateRange(startDate?: string, endDate?: string): string {
  const formatDate = (date?: string) => {
    if (!date) return "Present";
    const d = new Date(date);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

function formatDescriptionHtml(desc: string): string {
  if (!desc) return "";

  if (desc.includes("<") && desc.includes(">")) {
    return desc;
  }

  const lines = desc.split("\n").filter((line) => line.trim());
  if (lines.length === 0) return "";

  if (lines.length === 1) {
    return `<p>${lines[0]}</p>`;
  }

  return `<ul style="margin: 2pt 0 0 0; padding-left: 14pt;">${lines
    .map((line) => {
      const cleanLine = line.replace(/^[•\-\*]\s*/, "").trim();
      return cleanLine ? `<li style="margin: 1pt 0;">${cleanLine}</li>` : "";
    })
    .join("")}</ul>`;
}
