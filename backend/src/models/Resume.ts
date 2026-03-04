import mongoose, { Document, Schema } from 'mongoose';

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  originalFormat: {
    filename: string;
    mimetype: string;
    size: number;
    path: string;
  };
  content: {
    personalInfo: {
      name?: string;
      email?: string;
      phone?: string;
      location?: string;
      linkedin?: string;
      portfolio?: string;
    };
    summary?: string;
    experience: Array<{
      company: string;
      title: string;
      location?: string;
      startDate: string;
      endDate?: string;
      current?: boolean;
      description: string;
    }>;
    education: Array<{
      institution: string;
      degree: string;
      field?: string;
      graduationDate?: string;
      gpa?: string;
    }>;
    skills: string[];
    projects?: Array<{
      name: string;
      description: string;
      technologies?: string[];
      url?: string;
    }>;
    certifications?: Array<{
      name: string;
      issuer: string;
      date?: string;
      url?: string;
    }>;
    languages?: Array<{
      language: string;
      proficiency: string;
    }>;
  };
  metadata: {
    filename: string;
    originalName: string;
    size: number;
    type: string;
  };
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const resumeSchema = new Schema<IResume>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    originalFormat: {
      filename: String,
      mimetype: String,
      size: Number,
      path: String
    },
    content: {
      personalInfo: {
        name: String,
        email: String,
        phone: String,
        location: String,
        linkedin: String,
        portfolio: String
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
          description: String
        }
      ],
      education: [
        {
          institution: String,
          degree: String,
          field: String,
          graduationDate: String,
          gpa: String
        }
      ],
      skills: [String],
      projects: [
        {
          name: String,
          description: String,
          technologies: [String],
          url: String
        }
      ],
      certifications: [
        {
          name: String,
          issuer: String,
          date: String,
          url: String
        }
      ],
      languages: [
        {
          language: String,
          proficiency: String
        }
      ]
    },
    metadata: {
      filename: { type: String, required: true },
      originalName: { type: String, required: true },
      size: { type: Number, required: true },
      type: { type: String, required: true }
    },
    tags: [String],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

resumeSchema.index({ userId: 1, createdAt: -1 });

export const Resume = mongoose.model<IResume>('Resume', resumeSchema);
