import mongoose, { Document, Schema } from "mongoose";

export interface IAnalysis extends Document {
  userId: mongoose.Types.ObjectId;
  resumeId: mongoose.Types.ObjectId;
  jobDescription: string;
  jobTitle?: string;
  company?: string;
  score: number;
  atsScore: number;
  atsScoreBreakdown?: {
    keywordMatching: { score: number; weight: number; details: string };
    skillsMatch: { score: number; weight: number; details: string };
    resumeSections: { score: number; weight: number; details: string };
    experienceRelevance: { score: number; weight: number; details: string };
    resumeFormatting: { score: number; weight: number; details: string };
    achievementsImpact: { score: number; weight: number; details: string };
    grammarReadability: { score: number; weight: number; details: string };
  };
  jobMatchingBreakdown?: {
    requiredSkillsMatch: { score: number; details: string };
    relevantWorkExperience: { score: number; details: string };
    technologiesUsed: { score: number; details: string };
    toolsFrameworks: { score: number; details: string };
    industryRelevance: { score: number; details: string };
    yearsExperienceAlignment: { score: number; details: string };
    roleResponsibilitySimilarity: { score: number; details: string };
  };
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
  missingKeywords: {
    programmingLanguages: string[];
    frameworks: string[];
    databases: string[];
    tools: string[];
    devops: string[];
    softSkills: string[];
  };
  recommendedKeywords: string[];
  howToUseKeywords: string[];
  resumeImprovements: string[];
  jobMatch?: {
    score: number;
    missingKeywords: string[];
    suggestions: string[];
  };
  existingSections: {
    experience: boolean;
    education: boolean;
    skills: boolean;
  };
  createdAt: Date;
}

const analysisSchema = new Schema<IAnalysis>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    resumeId: {
      type: Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },
    jobDescription: {
      type: String,
      default: "",
    },
    jobTitle: String,
    company: String,
    score: {
      type: Number,
      default: 0,
    },
    atsScore: {
      type: Number,
      default: 0,
    },
    atsScoreBreakdown: {
      keywordMatching: {
        score: { type: Number, default: 0 },
        weight: { type: Number, default: 30 },
        details: String,
      },
      skillsMatch: {
        score: { type: Number, default: 0 },
        weight: { type: Number, default: 20 },
        details: String,
      },
      resumeSections: {
        score: { type: Number, default: 0 },
        weight: { type: Number, default: 15 },
        details: String,
      },
      experienceRelevance: {
        score: { type: Number, default: 0 },
        weight: { type: Number, default: 15 },
        details: String,
      },
      resumeFormatting: {
        score: { type: Number, default: 0 },
        weight: { type: Number, default: 10 },
        details: String,
      },
      achievementsImpact: {
        score: { type: Number, default: 0 },
        weight: { type: Number, default: 5 },
        details: String,
      },
      grammarReadability: {
        score: { type: Number, default: 0 },
        weight: { type: Number, default: 5 },
        details: String,
      },
    },
    jobMatchingBreakdown: {
      requiredSkillsMatch: {
        score: { type: Number, default: 0 },
        details: String,
      },
      relevantWorkExperience: {
        score: { type: Number, default: 0 },
        details: String,
      },
      technologiesUsed: {
        score: { type: Number, default: 0 },
        details: String,
      },
      toolsFrameworks: {
        score: { type: Number, default: 0 },
        details: String,
      },
      industryRelevance: {
        score: { type: Number, default: 0 },
        details: String,
      },
      yearsExperienceAlignment: {
        score: { type: Number, default: 0 },
        details: String,
      },
      roleResponsibilitySimilarity: {
        score: { type: Number, default: 0 },
        details: String,
      },
    },
    feedback: {
      overall: String,
      strengths: [String],
      weaknesses: [String],
      suggestions: [String],
    },
    sectionScores: {
      skills: {
        score: { type: Number, default: 0 },
        matched: [String],
        missing: [String],
      },
      experience: {
        score: { type: Number, default: 0 },
        details: String,
      },
      education: {
        score: { type: Number, default: 0 },
        details: String,
      },
      format: {
        score: { type: Number, default: 0 },
        details: String,
      },
    },
    keywords: {
      found: [String],
      missing: [String],
      density: Schema.Types.Mixed,
    },
    missingKeywords: {
      programmingLanguages: [String],
      frameworks: [String],
      databases: [String],
      tools: [String],
      devops: [String],
      softSkills: [String],
    },
    recommendedKeywords: [String],
    howToUseKeywords: [String],
    resumeImprovements: [String],
    jobMatch: {
      score: Number,
      missingKeywords: [String],
      suggestions: [String],
    },
    existingSections: {
      experience: { type: Boolean, default: false },
      education: { type: Boolean, default: false },
      skills: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  },
);

analysisSchema.index({ userId: 1, createdAt: -1 });

export const Analysis = mongoose.model<IAnalysis>("Analysis", analysisSchema);

// import mongoose, { Document, Schema } from 'mongoose';

// export interface IAnalysis extends Document {
//   userId: mongoose.Types.ObjectId;
//   resumeId: mongoose.Types.ObjectId;
//   jobDescription: string;
//   jobTitle?: string;
//   company?: string;
//   score: number;
//   atsScore: number;
//   atsScoreBreakdown?: {
//     keywordMatching: { score: number; weight: number; details: string };
//     skillsMatch: { score: number; weight: number; details: string };
//     resumeSections: { score: number; weight: number; details: string };
//     experienceRelevance: { score: number; weight: number; details: string };
//     resumeFormatting: { score: number; weight: number; details: string };
//     achievementsImpact: { score: number; weight: number; details: string };
//     grammarReadability: { score: number; weight: number; details: string };
//   };
//   jobMatchingBreakdown?: {
//     requiredSkillsMatch: { score: number; details: string };
//     relevantWorkExperience: { score: number; details: string };
//     technologiesUsed: { score: number; details: string };
//     toolsFrameworks: { score: number; details: string };
//     industryRelevance: { score: number; details: string };
//     yearsExperienceAlignment: { score: number; details: string };
//     roleResponsibilitySimilarity: { score: number; details: string };
//   };
//   feedback: {
//     overall: string;
//     strengths: string[];
//     weaknesses: string[];
//     suggestions: string[];
//   };
//   sectionScores: {
//     skills: {
//       score: number;
//       matched: string[];
//       missing: string[];
//     };
//     experience: {
//       score: number;
//       details: string;
//     };
//     education: {
//       score: number;
//       details: string;
//     };
//     format: {
//       score: number;
//       details: string;
//     };
//   };
//   keywords: {
//     found: string[];
//     missing: string[];
//     density: Record<string, number>;
//   };
//   missingKeywords: {
//     programmingLanguages: string[];
//     frameworks: string[];
//     databases: string[];
//     tools: string[];
//     devops: string[];
//     softSkills: string[];
//   };
//   recommendedKeywords: string[];
//   howToUseKeywords: string[];
//   resumeImprovements: string[];
//   jobMatch?: {
//     score: number;
//     missingKeywords: string[];
//     suggestions: string[];
//   };
//   existingSections: {
//     experience: boolean;
//     education: boolean;
//     skills: boolean;
//   };
//   createdAt: Date;
// }

// const analysisSchema = new Schema<IAnalysis>(
//   {
//     userId: {
//       type: Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//       index: true
//     },
//     resumeId: {
//       type: Schema.Types.ObjectId,
//       ref: 'Resume',
//       required: true
//     },
//     jobDescription: {
//       type: String,
//       default: ''
//     },
//     jobTitle: String,
//     company: String,
//     score: {
//       type: Number,
//       default: 0
//     },
//     atsScore: {
//       type: Number,
//       default: 0
//     },
//     atsScoreBreakdown: {
//       keywordMatching: {
//         score: { type: Number, default: 0 },
//         weight: { type: Number, default: 30 },
//         details: String
//       },
//       skillsMatch: {
//         score: { type: Number, default: 0 },
//         weight: { type: Number, default: 20 },
//         details: String
//       },
//       resumeSections: {
//         score: { type: Number, default: 0 },
//         weight: { type: Number, default: 15 },
//         details: String
//       },
//       experienceRelevance: {
//         score: { type: Number, default: 0 },
//         weight: { type: Number, default: 15 },
//         details: String
//       },
//       resumeFormatting: {
//         score: { type: Number, default: 0 },
//         weight: { type: Number, default: 10 },
//         details: String
//       },
//       achievementsImpact: {
//         score: { type: Number, default: 0 },
//         weight: { type: Number, default: 5 },
//         details: String
//       },
//       grammarReadability: {
//         score: { type: Number, default: 0 },
//         weight: { type: Number, default: 5 },
//         details: String
//       }
//     },
//     jobMatchingBreakdown: {
//       requiredSkillsMatch: {
//         score: { type: Number, default: 0 },
//         details: String
//       },
//       relevantWorkExperience: {
//         score: { type: Number, default: 0 },
//         details: String
//       },
//       technologiesUsed: {
//         score: { type: Number, default: 0 },
//         details: String
//       },
//       toolsFrameworks: {
//         score: { type: Number, default: 0 },
//         details: String
//       },
//       industryRelevance: {
//         score: { type: Number, default: 0 },
//         details: String
//       },
//       yearsExperienceAlignment: {
//         score: { type: Number, default: 0 },
//         details: String
//       },
//       roleResponsibilitySimilarity: {
//         score: { type: Number, default: 0 },
//         details: String
//       }
//     },
//     feedback: {
//       overall: String,
//       strengths: [String],
//       weaknesses: [String],
//       suggestions: [String]
//     },
//     sectionScores: {
//       skills: {
//         score: { type: Number, default: 0 },
//         matched: [String],
//         missing: [String]
//       },
//       experience: {
//         score: { type: Number, default: 0 },
//         details: String
//       },
//       education: {
//         score: { type: Number, default: 0 },
//         details: String
//       },
//       format: {
//         score: { type: Number, default: 0 },
//         details: String
//       }
//     },
//     keywords: {
//       found: [String],
//       missing: [String],
//       density: Schema.Types.Mixed
//     },
//     missingKeywords: {
//       programmingLanguages: [String],
//       frameworks: [String],
//       databases: [String],
//       tools: [String],
//       devops: [String],
//       softSkills: [String]
//     },
//     recommendedKeywords: [String],
//     howToUseKeywords: [String],
//     resumeImprovements: [String],
//     jobMatch: {
//       score: Number,
//       missingKeywords: [String],
//       suggestions: [String]
//     },
//     existingSections: {
//       experience: { type: Boolean, default: false },
//       education: { type: Boolean, default: false },
//       skills: { type: Boolean, default: false }
//     }
//   },
//   {
//     timestamps: true
//   }
// );

// analysisSchema.index({ userId: 1, createdAt: -1 });

// export const Analysis = mongoose.model<IAnalysis>('Analysis', analysisSchema);
