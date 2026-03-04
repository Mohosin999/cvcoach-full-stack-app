import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalysis extends Document {
  userId: mongoose.Types.ObjectId;
  resumeId: mongoose.Types.ObjectId;
  jobDescription: string;
  jobTitle?: string;
  company?: string;
  score: number;
  atsScore: number;
  feedback: {
    overall: string;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  sectionScores: {
    skills: {
      score: number;
      matched: string[];
      missing: string[];
    };
    experience: {
      score: number;
      details: string;
    };
    education: {
      score: number;
      details: string;
    };
    format: {
      score: number;
      details: string;
    };
  };
  keywords: {
    found: string[];
    missing: string[];
    density: Record<string, number>;
  };
  createdAt: Date;
}

const analysisSchema = new Schema<IAnalysis>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    resumeId: {
      type: Schema.Types.ObjectId,
      ref: 'Resume',
      required: true
    },
    jobDescription: {
      type: String,
      required: true
    },
    jobTitle: String,
    company: String,
    score: {
      type: Number,
      default: 0
    },
    atsScore: {
      type: Number,
      default: 0
    },
    feedback: {
      overall: String,
      strengths: [String],
      weaknesses: [String],
      suggestions: [String]
    },
    sectionScores: {
      skills: {
        score: { type: Number, default: 0 },
        matched: [String],
        missing: [String]
      },
      experience: {
        score: { type: Number, default: 0 },
        details: String
      },
      education: {
        score: { type: Number, default: 0 },
        details: String
      },
      format: {
        score: { type: Number, default: 0 },
        details: String
      }
    },
    keywords: {
      found: [String],
      missing: [String],
      density: Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

analysisSchema.index({ userId: 1, createdAt: -1 });

export const Analysis = mongoose.model<IAnalysis>('Analysis', analysisSchema);
