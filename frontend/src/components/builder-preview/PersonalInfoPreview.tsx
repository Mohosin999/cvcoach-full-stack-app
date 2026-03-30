import { ResumeContent } from "@/types";

export function PersonalInfoPreview({
  content,
}: {
  content: ResumeContent;
  forPdf: boolean;
}) {
  // Format phone number with (+880) prefix
  const formatPhoneNumber = (phone: string) => {
    const cleanNumber = phone.replace(/^(\+880|880)/, "");
    return `(+880) ${cleanNumber}`;
  };

  // Format LinkedIn URL - just show the path
  const formatLinkedIn = (linkedIn: string) => {
    const clean = linkedIn.replace(/^https?:\/\//, "").replace(/^www\./, "");
    return clean.startsWith("linkedin.com/in/")
      ? clean
      : `linkedin.com/in/${linkedIn}`;
  };

  // Build location string (comma after city, then spaces)
  const locationParts = [
    content.personalInfo.address?.city,
    content.personalInfo.address?.division,
    content.personalInfo.address?.zipCode,
  ].filter(Boolean);
  const locationString =
    locationParts.length > 0
      ? locationParts[0] +
        (locationParts.length > 1 ? ", " : "") +
        locationParts.slice(1).join(" ")
      : "";

  return (
    <div className="px-6 pt-6 pb-6">
      <div className="flex justify-between items-start">
        {/* Left Side - Name and Title */}
        <div className="min-w-[220px]">
          <h1 className="text-base font-bold text-black uppercase tracking-wide leading-tight">
            {content.personalInfo.fullName || "Your Name"}
          </h1>
          {content.personalInfo.jobTitle && (
            <p className="text-xs font-medium text-black mt-1 leading-tight">
              {content.personalInfo.jobTitle}
            </p>
          )}
        </div>

        {/* Right Side - Contact Info */}
        <div className="mt-auto items-end text-right min-w-[200px]">
          {/* First Line: Location • Phone */}
          <div className="text-[10px] text-black leading-snug">
            <span>
              {[
                locationString || "",
                content.personalInfo.whatsapp
                  ? formatPhoneNumber(content.personalInfo.whatsapp)
                  : "",
              ]
                .filter(Boolean)
                .join(" • ")}
            </span>
          </div>
          {/* Second Line: Email • LinkedIn */}
          <div className="text-[10px] text-black leading-snug mt-0.5 flex items-center justify-end gap-1 flex-wrap">
            {content.personalInfo.email && (
              <a
                href={`mailto:${content.personalInfo.email}`}
                className="text-black"
                style={{ color: "#000000" }}
              >
                {content.personalInfo.email}
              </a>
            )}
            {content.personalInfo.email && content.personalInfo.linkedIn && (
              <span className="text-black"> • </span>
            )}
            {content.personalInfo.linkedIn && (
              <a
                href={
                  content.personalInfo.linkedIn.startsWith("http")
                    ? content.personalInfo.linkedIn
                    : `https://${content.personalInfo.linkedIn}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-black"
                style={{ color: "#000000" }}
              >
                {formatLinkedIn(content.personalInfo.linkedIn)}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
