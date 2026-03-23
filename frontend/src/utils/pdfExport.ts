import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { ResumeContent } from "../types";

const formatBullets = (text: string): string => {
  if (!text) return "";
  const cleanText = text.replace(/<[^>]+>/g, "").replace(/<br\s*\/?>/gi, "\n");
  const lines = cleanText.split("\n").filter((line) => line.trim());
  if (lines.length === 0) return "";

  return lines
    .map((line) => {
      const cleanLine = line.replace(/^[•\-\*\+]\s*/, "").trim();
      if (!cleanLine) return "";
      return `<li style="margin-bottom: 4px; padding-left: 16px; list-style-position: outside; font-size: 14px; color: #222222; line-height: 1.5;">${cleanLine}</li>`;
    })
    .join("");
};

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

const buildPdfHtml = (content: ResumeContent): string => {
  const {
    personalInfo,
    summary,
    experience,
    projects,
    achievements,
    education,
    skills,
  } = content;

  // Build location string (comma after city, then spaces)
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

  // Build contact lines
  const firstLineParts = [
    locationString || "",
    personalInfo.whatsapp ? formatPhoneNumber(personalInfo.whatsapp) : "",
  ].filter(Boolean);
  const secondLineParts = [
    personalInfo.email || "",
    personalInfo.linkedIn ? formatLinkedIn(personalInfo.linkedIn) : "",
  ].filter(Boolean);

  return `
    <div style="
      background: #ffffff;
      color: #222222;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      width: 794px;
    ">
      <!-- Header Section - Two Column Layout -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px;">
        <!-- Left Side - Name and Title -->
        <div style="min-width: 200px;">
          <h1 style="font-size: 20px; font-weight: 700; color: #222222; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1;">
            ${personalInfo.fullName || "RESUME"}
          </h1>
          ${personalInfo.jobTitle ? `<p style="font-size: 17px; font-weight: 500; color: #222222; margin: 8px 0 0 0; line-height: 1.2;">${personalInfo.jobTitle}</p>` : ""}
        </div>

        <!-- Right Side - Contact Info -->
        <div style="text-align: right; min-width: 200px; margin-left: auto; margin-top: auto;">
          ${firstLineParts.length > 0 ? `<p style="font-size: 14px; color: #222222; margin: 0; line-height: 1.2;">${firstLineParts.join(" • ")}</p>` : ""}
          ${secondLineParts.length > 0 ? `<p style="font-size: 14px; color: #222222; margin: 4px 0 0 0; line-height: 1.2;">${secondLineParts.join(" • ")}</p>` : ""}
        </div>
      </div>

      ${
        summary
          ? `
        <div style="margin-bottom: 18px;">
          <h2 style="font-size: 15px; font-weight: 700; color: #222222; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #222222; padding-bottom: 6px;">SUMMARY</h2>
          <p style="font-size: 14px; color: #222222; margin: 0; line-height: 1.6;">${summary.replace(/<[^>]+>/g, "")}</p>
        </div>
      `
          : ""
      }

      ${
        experience.length > 0
          ? `
        <div style="margin-bottom: 18px;">
          <h2 style="font-size: 15px; font-weight: 700; color: #222222; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #222222; padding-bottom: 6px;">EXPERIENCE</h2>
          ${experience
            .map(
              (exp) => `
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 4px;">
                <div>
                  <span style="font-size: 15px; font-weight: 700; color: #222222;">${exp.company}</span>
                  <p style="font-size: 14px; color: #222222; margin: 2px 0 0 0; font-weight: 500;">${exp.title}${exp.topSkills && exp.topSkills.length > 0 ? ` - <span style="font-style: italic; font-weight: normal;">${exp.topSkills.join(", ")}</span>` : ""}</p>
                </div>
                <span style="font-size: 12px; color: #222222; white-space: nowrap; font-weight: 500;">${exp.startDate} — ${exp.current ? "Present" : exp.endDate}</span>
              </div>
              ${exp.description ? `<ul style="margin: 4px 0 0 0; padding-left: 16px; list-style-type: disc;">${formatBullets(exp.description)}</ul>` : ""}
            </div>
          `,
            )
            .join("")}
        </div>
      `
          : ""
      }

      ${
        projects && projects.length > 0
          ? `
        <div style="margin-bottom: 18px;">
          <h2 style="font-size: 15px; font-weight: 700; color: #222222; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #222222; padding-bottom: 6px;">PROJECTS</h2>
          ${projects
            .map(
              (proj) => `
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; margin-bottom: 4px;">
                <span style="font-size: 15px; font-weight: 700; color: #222222;">${proj.name || "Untitled Project"}</span>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                  ${proj.links?.live ? `<a href="${proj.links.live}" style="font-size: 10px; color: #059669; text-decoration: none;">Live</a>` : ""}
                  ${proj.links?.github ? `<a href="${proj.links.github}" style="font-size: 10px; color: #6b7280; text-decoration: none;">GitHub</a>` : ""}
                </div>
              </div>
              ${proj.description ? `<ul style="margin: 4px 0 0 0; padding-left: 16px; list-style-type: disc;">${formatBullets(proj.description)}</ul>` : ""}
            </div>
          `,
            )
            .join("")}
        </div>
      `
          : ""
      }

      ${
        achievements && achievements.length > 0
          ? `
        <div style="margin-bottom: 18px;">
          <h2 style="font-size: 15px; font-weight: 700; color: #222222; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #222222; padding-bottom: 6px;">ACHIEVEMENTS</h2>
          <ul style="margin: 4px 0 0 0; padding-left: 16px; list-style-type: disc;">
            ${achievements.map((ach) => `<li style="margin-bottom: 4px; padding-left: 16px; list-style-position: outside; font-size: 14px; color: #222222; line-height: 1.5;">${ach.title}${ach.description ? ` - ${ach.description}` : ""}</li>`).join("")}
          </ul>
        </div>
      `
          : ""
      }

      ${
        education.length > 0
          ? `
        <div style="margin-bottom: 18px;">
          <h2 style="font-size: 15px; font-weight: 700; color: #222222; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #222222; padding-bottom: 6px;">EDUCATION</h2>
          ${education
            .map(
              (edu) => `
            <div style="margin-bottom: 12px;">
              <span style="font-size: 15px; font-weight: 700; color: #222222; display: block; margin-bottom: 2px;">${edu.institution}</span>
              <span style="font-size: 14px; color: #222222; display: block;">${edu.degree}</span>
              <span style="font-size: 12px; color: #222222; display: block;">${edu.date}</span>
            </div>
          `,
            )
            .join("")}
        </div>
      `
          : ""
      }

      ${
        skills.length > 0
          ? `
        <div style="margin-bottom: 18px;">
          <h2 style="font-size: 15px; font-weight: 700; color: #222222; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #222222; padding-bottom: 6px;">SKILLS</h2>
          <div style="font-size: 14px; color: #222222; margin: 0; line-height: 1.8;">
            <span style="font-weight: 600; color: #222222;">Technical Skills:</span> ${skills.join("  |  ")}
          </div>
        </div>
      `
          : ""
      }
    </div>
  `;
};

export const exportToPdf = async (content: ResumeContent): Promise<void> => {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "0";
  container.style.left = "-9999px";
  container.style.zIndex = "-9999";
  container.style.width = "794px";
  container.style.backgroundColor = "#ffffff";
  document.body.appendChild(container);

  try {
    container.innerHTML = buildPdfHtml(content);
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Get link positions before capturing
    const links: Array<{ url: string; x: number; y: number; w: number; h: number }> = [];
    container.querySelectorAll("a").forEach((a) => {
      const rect = a.getBoundingClientRect();
      links.push({
        url: a.href,
        x: rect.left,
        y: rect.top,
        w: rect.width,
        h: rect.height,
      });
    });

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: 794,
      height: container.scrollHeight,
    });

    document.body.removeChild(container);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = (pdfWidth - 16) / imgWidth;
    const finalWidth = imgWidth * ratio;
    const finalHeight = imgHeight * ratio;
    const imgX = (pdfWidth - finalWidth) / 2;
    const imgY = 10;

    pdf.addImage(imgData, "PNG", imgX, imgY, finalWidth, finalHeight);

    // Add clickable links
    links.forEach((link) => {
      const linkX = imgX + (link.x / imgWidth) * finalWidth;
      const linkY = imgY + (link.y / imgHeight) * finalHeight;
      const linkW = (link.w / imgWidth) * finalWidth;
      const linkH = (link.h / imgHeight) * finalHeight;
      pdf.link(linkX, linkY, linkW, linkH, { url: link.url });
    });

    pdf.save(`${content.personalInfo.fullName || "resume"}.pdf`);
  } catch (error) {
    if (container.parentNode) {
      document.body.removeChild(container);
    }
    throw error;
  }
};
