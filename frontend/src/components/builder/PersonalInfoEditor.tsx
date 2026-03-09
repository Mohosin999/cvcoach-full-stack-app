import { ResumeContent } from '../../types';

interface PersonalInfoEditorProps {
  content: ResumeContent;
  updateField: (field: string, value: any) => void;
}

export default function PersonalInfoEditor({ content, updateField }: PersonalInfoEditorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <label className="label">Full Name</label>
          <input
            type="text"
            value={content.personalInfo.fullName}
            onChange={(e) => updateField('fullName', e.target.value)}
            className="input"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="label">Job Title</label>
          <input
            type="text"
            value={content.personalInfo.jobTitle}
            onChange={(e) => updateField('jobTitle', e.target.value)}
            className="input"
            placeholder="Software Engineer"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            value={content.personalInfo.email}
            onChange={(e) => updateField('email', e.target.value)}
            className="input"
            placeholder="john@example.com"
          />
        </div>
        <div>
          <label className="label">WhatsApp Number</label>
          <input
            type="tel"
            value={content.personalInfo.whatsapp}
            onChange={(e) => updateField('whatsapp', e.target.value)}
            className="input"
            placeholder="+1 234 567 8900"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="label">City</label>
          <input
            type="text"
            value={content.personalInfo.address?.city}
            onChange={(e) => updateField('address.city', e.target.value)}
            className="input"
            placeholder="City"
          />
        </div>
        <div>
          <label className="label">Division/State</label>
          <input
            type="text"
            value={content.personalInfo.address?.division}
            onChange={(e) => updateField('address.division', e.target.value)}
            className="input"
            placeholder="Division/State"
          />
        </div>
        <div>
          <label className="label">Zip Code</label>
          <input
            type="text"
            value={content.personalInfo.address?.zipCode}
            onChange={(e) => updateField('address.zipCode', e.target.value)}
            className="input"
            placeholder="Zip Code"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="label">LinkedIn</label>
          <input
            type="text"
            value={content.personalInfo.linkedIn}
            onChange={(e) => updateField('linkedIn', e.target.value)}
            className="input"
            placeholder="linkedin.com/in/username"
          />
        </div>
        <div>
          <label className="label">Website</label>
          <input
            type="text"
            value={content.personalInfo.socialLinks?.website}
            onChange={(e) => updateField('socialLinks.website', e.target.value)}
            className="input"
            placeholder="yourwebsite.com"
          />
        </div>
      </div>
    </div>
  );
}
