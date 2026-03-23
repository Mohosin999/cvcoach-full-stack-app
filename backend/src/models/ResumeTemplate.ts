import mongoose, { Document, Schema } from 'mongoose';

export interface IResumeTemplate extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  isAtsFriendly: boolean;
  content: {
    personalInfo: {
      fullName?: string;
      jobTitle?: string;
      email?: string;
      whatsapp?: string;
      address?: {
        city?: string;
        division?: string;
        zipCode?: string;
      };
      linkedIn?: string;
      socialLinks?: {
        github?: string;
        portfolio?: string;
        website?: string;
      };
    };
    summary?: string;
    experience: Array<{
      company: string;
      title: string;
      topSkills?: string[];
      location?: string;
      startDate: string;
      endDate?: string;
      current?: boolean;
      description: string;
    }>;
    projects?: Array<{
      name: string;
      description: string;
      links?: {
        live?: string;
        github?: string;
        caseStudy?: string;
      };
      technologies?: string[];
    }>;
    achievements?: Array<{
      title: string;
      description?: string;
      date?: string;
    }>;
    education: Array<{
      institution: string;
      degree: string;
      date?: string;
    }>;
    skills: string[];
  };
  isDraft: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const resumeTemplateSchema = new Schema<IResumeTemplate>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      default: 'Untitled Resume',
    },
    isAtsFriendly: {
      type: Boolean,
      default: true,
    },
    content: {
      personalInfo: {
        fullName: String,
        jobTitle: String,
        email: String,
        whatsapp: String,
        address: {
          city: String,
          division: String,
          zipCode: String,
        },
        linkedIn: String,
        socialLinks: {
          github: String,
          portfolio: String,
          website: String,
        },
      },
      summary: String,
      experience: [
        {
          company: String,
          title: String,
          location: String,
          startDate: String,
          endDate: String,
          current: Boolean,
          description: String,
        },
      ],
      projects: [
        {
          name: String,
          description: String,
          links: {
            live: String,
            github: String,
            caseStudy: String,
          },
          technologies: [String],
        },
      ],
      achievements: [
        {
          title: String,
          description: String,
          date: String,
        },
      ],
      education: [
        {
          institution: String,
          degree: String,
          date: String,
        },
      ],
      skills: [String],
    },
    isDraft: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

resumeTemplateSchema.index({ userId: 1, createdAt: -1 });

export const ResumeTemplate = mongoose.model<IResumeTemplate>(
  'ResumeTemplate',
  resumeTemplateSchema
);
