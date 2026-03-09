/**
 * Resume Analysis Service - Enterprise Grade
 * Main orchestrator for professional resume analysis
 * 
 * Scoring Model:
 * - ATS Score (50% of overall):
 *   - Keyword Matching: 30%
 *   - Skills Match: 30%
 *   - Section Completeness: 30%
 *   - Experience Relevance: 10%
 * 
 * - Job Match Score (50% of overall):
 *   - Required Skills: 25%
 *   - Preferred Skills: 15%
 *   - Experience Alignment: 20%
 *   - Education Alignment: 15%
 *   - Responsibility Match: 25%
 */

import {
  ResumeContent,
  AnalysisResult,
  ScoreBreakdown,
  SectionAnalysis,
  SkillsAnalysis,
  ExperienceAnalysis,
  KeywordAnalysis,
  Recommendation,
  AnalysisMetadata,
  SkillMatch,
  SkillGap,
  SkillCategoryBreakdown,
  PositionAnalysis,
  KeywordMatch,
  KeywordGap,
  DEFAULT_ANALYSIS_CONFIG,
} from '../../types/analysis.types';

import {
  KeywordMatchingCalculator,
  SkillsMatchCalculator,
  SectionCompletenessCalculator,
  ExperienceRelevanceCalculator,
} from './scoringEngine';

import {
  extractKeywords,
  extractSkillsFromResume,
  parseJobDescription,
  SKILL_TAXONOMY,
} from './keywordExtractor';

interface AnalysisInput {
  resume: ResumeContent;
  resumeText: string;
  jobDescription: string;
}

/**
 * Main Analysis Service Class
 * Orchestrates all analysis components
 */
export class ResumeAnalysisService {
  private keywordCalculator: KeywordMatchingCalculator;
  private skillsCalculator: SkillsMatchCalculator;
  private sectionCalculator: SectionCompletenessCalculator;
  private experienceCalculator: ExperienceRelevanceCalculator;

  constructor() {
    this.keywordCalculator = new KeywordMatchingCalculator();
    this.skillsCalculator = new SkillsMatchCalculator();
    this.sectionCalculator = new SectionCompletenessCalculator();
    this.experienceCalculator = new ExperienceRelevanceCalculator();
  }

  /**
   * Main analysis entry point
   */
  async analyze(input: AnalysisInput): Promise<AnalysisResult> {
    const startTime = Date.now();

    const { resume, resumeText, jobDescription } = input;

    // Extract keywords from both documents
    const resumeKeywords = extractKeywords(resumeText);
    const jdKeywords = extractKeywords(jobDescription);
    const parsedJD = parseJobDescription(jobDescription);

    // Calculate ATS Score Components
    const atsBreakdown = this.calculateATSScore({
      resume,
      resumeText,
      resumeKeywords,
      jdKeywords,
      parsedJD,
    });

    // Calculate Job Match Score Components
    const jobMatchBreakdown = this.calculateJobMatchScore({
      resume,
      resumeText,
      parsedJD,
    });

    // Calculate overall scores
    const atsScore = this.calculateWeightedATSScore(atsBreakdown);
    const jobMatchScore = this.calculateWeightedJobMatchScore(jobMatchBreakdown);
    const overallScore = Math.round(atsScore * 0.5 + jobMatchScore * 0.5);

    // Generate detailed analysis
    const sectionAnalysis = this.analyzeSections(resume, resumeKeywords);
    const skillsAnalysis = this.analyzeSkills(resume, parsedJD);
    const experienceAnalysis = this.analyzeExperience(resume, jobDescription);
    const keywordAnalysis = this.analyzeKeywords(resumeText, jdKeywords);

    // Generate recommendations
    const recommendations = this.generateRecommendations({
      atsBreakdown,
      jobMatchBreakdown,
      sectionAnalysis,
      skillsAnalysis,
      experienceAnalysis,
      keywordAnalysis,
    });

    // Build metadata
    const metadata: AnalysisMetadata = {
      analysisVersion: '2.0.0',
      analyzedAt: new Date(),
      processingTimeMs: Date.now() - startTime,
      resumeWordCount: resumeText.split(/\s+/).length,
      jdWordCount: jobDescription.split(/\s+/).length,
      confidenceScore: this.calculateConfidenceScore(resume, jobDescription),
      dataQuality: {
        resumeQuality: this.assessDataQuality(resumeText),
        jdQuality: this.assessDataQuality(jobDescription),
        parseSuccess: true,
        completenessScore: this.calculateCompletenessScore(resume),
      },
      limitations: [],
    };

    return {
      overallScore,
      atsScore,
      jobMatchScore,
      scoreBreakdown: {
        ats: atsBreakdown,
        jobMatch: jobMatchBreakdown,
      },
      sectionAnalysis,
      skillsAnalysis,
      experienceAnalysis,
      keywordAnalysis,
      recommendations,
      metadata,
    };
  }

  /**
   * Calculate ATS Score Breakdown
   */
  private calculateATSScore(input: {
    resume: ResumeContent;
    resumeText: string;
    resumeKeywords: any;
    jdKeywords: any;
    parsedJD: any;
  }): ScoreBreakdown['ats'] {
    const { resume, resumeText, resumeKeywords, jdKeywords, parsedJD } = input;

    // Keyword Matching (30%)
    const keywordMatching = this.keywordCalculator.calculate({
      resumeText,
      jdKeywords: jdKeywords.all,
      resumeKeywords: resumeKeywords.all,
    });

    // Skills Match (30%)
    const resumeSkills = extractSkillsFromResume(resume);
    const skillsMatch = this.skillsCalculator.calculate({
      resumeSkills,
      jdSkills: parsedJD.requiredSkills,
      jdRequiredSkills: parsedJD.requiredSkills,
      jdPreferredSkills: parsedJD.preferredSkills,
    });

    // Section Completeness (30%)
    const sectionCompleteness = this.sectionCalculator.calculate({
      resume,
      resumeText,
    });

    // Experience Relevance (10%)
    const experienceRelevance = this.experienceCalculator.calculate({
      resume,
      jdText: input.parsedJD.rawText || '',
      jdKeywords: jdKeywords.all,
      jdResponsibilities: [],
    });

    return {
      keywordMatching,
      skillsMatch,
      sectionCompleteness,
      experienceRelevance,
    };
  }

  /**
   * Calculate Job Match Score Breakdown
   */
  private calculateJobMatchScore(input: {
    resume: ResumeContent;
    resumeText: string;
    parsedJD: any;
  }): ScoreBreakdown['jobMatch'] {
    const { resume, resumeText, parsedJD } = input;
    const resumeSkills = extractSkillsFromResume(resume);
    const resumeLower = resumeText.toLowerCase();

    // Required Skills Match (25%)
    const requiredMatches = parsedJD.requiredSkills.filter((skill: string) =>
      resumeSkills.some((s) => s.toLowerCase().includes(skill.toLowerCase()))
    );
    const requiredSkillsMatch = {
      score: parsedJD.requiredSkills.length > 0
        ? Math.round((requiredMatches.length / parsedJD.requiredSkills.length) * 100)
        : 100,
      weight: 25,
      maxScore: 100,
      details: `${requiredMatches.length}/${parsedJD.requiredSkills.length} required skills matched`,
      factors: [],
    };

    // Preferred Skills Match (15%)
    const preferredMatches = parsedJD.preferredSkills.filter((skill: string) =>
      resumeSkills.some((s) => s.toLowerCase().includes(skill.toLowerCase()))
    );
    const preferredSkillsMatch = {
      score: parsedJD.preferredSkills.length > 0
        ? Math.round((preferredMatches.length / parsedJD.preferredSkills.length) * 100)
        : 100,
      weight: 15,
      maxScore: 100,
      details: `${preferredMatches.length}/${parsedJD.preferredSkills.length} preferred skills matched`,
      factors: [],
    };

    // Experience Alignment (20%)
    const yearsExp = this.calculateYearsOfExperience(resume.experience);
    const experienceAlignment = {
      score: yearsExp >= parsedJD.experienceYears ? 100 : Math.round((yearsExp / parsedJD.experienceYears) * 100),
      weight: 20,
      maxScore: 100,
      details: `${yearsExp} years experience (required: ${parsedJD.experienceYears}+)`,
      factors: [],
    };

    // Education Alignment (15%)
    const hasEducation = resume.education && resume.education.length > 0;
    const educationAlignment = {
      score: hasEducation ? 80 : 40,
      weight: 15,
      maxScore: 100,
      details: hasEducation ? 'Education section present' : 'No education listed',
      factors: [],
    };

    // Responsibility Match (25%)
    const actionVerbs = [
      'managed', 'led', 'developed', 'designed', 'implemented',
      'created', 'built', 'optimized', 'improved', 'increased',
    ];
    const jdVerbs = actionVerbs.filter((v) => resumeLower.includes(v));
    const resumeVerbs = actionVerbs.filter((v) =>
      resume.experience?.some((exp) => exp.description?.toLowerCase().includes(v))
    );
    const responsibilityMatch = {
      score: jdVerbs.length > 0
        ? Math.round((resumeVerbs.filter((v) => jdVerbs.includes(v)).length / jdVerbs.length) * 100)
        : 70,
      weight: 25,
      maxScore: 100,
      details: `${resumeVerbs.filter(v => jdVerbs.includes(v)).length}/${jdVerbs.length} responsibility keywords matched`,
      factors: [],
    };

    return {
      requiredSkillsMatch,
      preferredSkillsMatch,
      experienceAlignment,
      educationAlignment,
      responsibilityMatch,
    };
  }

  /**
   * Calculate weighted ATS Score
   */
  private calculateWeightedATSScore(breakdown: ScoreBreakdown['ats']): number {
    const weights = DEFAULT_ANALYSIS_CONFIG.weights;
    
    return Math.round(
      breakdown.keywordMatching.score * (weights.keywordMatching / 100) +
      breakdown.skillsMatch.score * (weights.skillsMatch / 100) +
      breakdown.sectionCompleteness.score * (weights.sectionCompleteness / 100) +
      breakdown.experienceRelevance.score * (weights.experienceRelevance / 100)
    );
  }

  /**
   * Calculate weighted Job Match Score
   */
  private calculateWeightedJobMatchScore(breakdown: ScoreBreakdown['jobMatch']): number {
    return Math.round(
      breakdown.requiredSkillsMatch.score * (breakdown.requiredSkillsMatch.weight / 100) +
      breakdown.preferredSkillsMatch.score * (breakdown.preferredSkillsMatch.weight / 100) +
      breakdown.experienceAlignment.score * (breakdown.experienceAlignment.weight / 100) +
      breakdown.educationAlignment.score * (breakdown.educationAlignment.weight / 100) +
      breakdown.responsibilityMatch.score * (breakdown.responsibilityMatch.weight / 100)
    );
  }

  /**
   * Analyze resume sections in detail
   */
  private analyzeSections(resume: ResumeContent, keywords: any): SectionAnalysis {
    return {
      summary: {
        present: !!(resume.summary && resume.summary.length > 30),
        score: resume.summary && resume.summary.length > 30 ? 85 : 30,
        quality: resume.summary && resume.summary.length > 50 ? 'Excellent' : 
                 resume.summary && resume.summary.length > 30 ? 'Good' : 'Poor',
        wordCount: resume.summary?.split(/\s+/).length || 0,
        issues: resume.summary && resume.summary.length < 30 
          ? [{ type: 'Too Short', severity: 'High', description: 'Summary is too brief', suggestion: 'Expand to at least 30 words' }]
          : [],
        recommendations: resume.summary 
          ? [] 
          : ['Add a professional summary highlighting your key qualifications'],
        strengths: resume.summary && resume.summary.length > 50 
          ? ['Comprehensive professional summary'] 
          : [],
      },
      skills: {
        present: !!(resume.skills && resume.skills.length > 0),
        score: resume.skills && resume.skills.length > 5 ? 90 : 
               resume.skills && resume.skills.length > 0 ? 60 : 20,
        quality: resume.skills && resume.skills.length > 10 ? 'Excellent' : 
                 resume.skills && resume.skills.length > 5 ? 'Good' : 'Fair',
        issues: resume.skills && resume.skills.length < 5
          ? [{ type: 'Too Short', severity: 'High', description: 'Skills section is sparse', suggestion: 'Add at least 5 technical skills' }]
          : [],
        recommendations: resume.skills && resume.skills.length < 5
          ? ['Expand your technical skills section']
          : [],
        strengths: resume.skills && resume.skills.length > 10
          ? [`Comprehensive skills section with ${resume.skills.length} skills`]
          : [],
      },
      experience: {
        present: !!(resume.experience && resume.experience.length > 0),
        score: resume.experience && resume.experience.length > 2 ? 90 :
               resume.experience && resume.experience.length > 0 ? 70 : 20,
        quality: resume.experience && resume.experience.length > 3 ? 'Excellent' :
                 resume.experience && resume.experience.length > 1 ? 'Good' : 'Fair',
        issues: !resume.experience || resume.experience.length === 0
          ? [{ type: 'Missing', severity: 'Critical', description: 'No work experience listed', suggestion: 'Add relevant work experience' }]
          : [],
        recommendations: !resume.experience || resume.experience.length === 0
          ? ['Add your work experience with detailed descriptions']
          : [],
        strengths: resume.experience && resume.experience.length > 2
          ? [`Strong work history with ${resume.experience.length} positions`]
          : [],
      },
      projects: {
        present: !!(resume.projects && resume.projects.length > 0),
        score: resume.projects && resume.projects.length > 2 ? 90 :
               resume.projects && resume.projects.length > 0 ? 70 : 40,
        quality: resume.projects && resume.projects.length > 3 ? 'Excellent' :
                 resume.projects && resume.projects.length > 1 ? 'Good' : 'Fair',
        issues: !resume.projects || resume.projects.length === 0
          ? [{ type: 'Missing', severity: 'Medium', description: 'No projects section', suggestion: 'Add personal or professional projects' }]
          : [],
        recommendations: !resume.projects || resume.projects.length === 0
          ? ['Add a projects section to showcase practical work']
          : [],
        strengths: resume.projects && resume.projects.length > 2
          ? [`Impressive portfolio with ${resume.projects.length} projects`]
          : [],
      },
      education: {
        present: !!(resume.education && resume.education.length > 0),
        score: resume.education && resume.education.length > 0 ? 80 : 50,
        quality: resume.education && resume.education.length > 0 ? 'Good' : 'Fair',
        issues: !resume.education || resume.education.length === 0
          ? [{ type: 'Missing', severity: 'Low', description: 'No education section', suggestion: 'Consider adding education details' }]
          : [],
        recommendations: !resume.education || resume.education.length === 0
          ? ['Add your educational background']
          : [],
        strengths: resume.education && resume.education.length > 0
          ? ['Education section present']
          : [],
      },
      certifications: {
        present: !!(resume.certifications && resume.certifications.length > 0),
        score: resume.certifications && resume.certifications.length > 0 ? 85 : 50,
        quality: resume.certifications && resume.certifications.length > 2 ? 'Excellent' :
                 resume.certifications && resume.certifications.length > 0 ? 'Good' : 'Fair',
        issues: [],
        recommendations: !resume.certifications || resume.certifications.length === 0
          ? ['Consider adding relevant certifications']
          : [],
        strengths: resume.certifications && resume.certifications.length > 0
          ? [`${resume.certifications.length} certifications listed`]
          : [],
      },
      additionalSections: [],
    };
  }

  /**
   * Analyze skills in detail
   */
  private analyzeSkills(resume: ResumeContent, parsedJD: any): SkillsAnalysis {
    const resumeSkills = extractSkillsFromResume(resume);
    
    const matchedSkills: SkillMatch[] = parsedJD.requiredSkills
      .filter((skill: string) =>
        resumeSkills.some((s) => s.toLowerCase().includes(skill.toLowerCase()))
      )
      .map((skill: string) => ({
        name: skill,
        category: this.categorizeSkill(skill),
        matchType: 'Exact' as const,
        matchScore: 100,
        foundIn: ['skills'],
        context: [],
      }));

    const missingSkills: SkillGap[] = parsedJD.requiredSkills
      .filter((skill: string) =>
        !resumeSkills.some((s) => s.toLowerCase().includes(skill.toLowerCase()))
      )
      .map((skill: string) => ({
        name: skill,
        category: this.categorizeSkill(skill),
        priority: 'High' as const,
        isRequired: true,
        suggestions: [`Add ${skill} to your skills section`, `Highlight ${skill} experience in projects`],
      }));

    const additionalSkills = resumeSkills.filter(
      (skill) => !parsedJD.requiredSkills.some((s: string) => s.toLowerCase().includes(skill.toLowerCase()))
    );

    const categoryBreakdown: SkillCategoryBreakdown[] = [];
    const categories = ['programmingLanguages', 'frontendFrameworks', 'backendFrameworks', 'databases', 'devopsTools'];
    
    categories.forEach((category) => {
      const taxonomySkills = SKILL_TAXONOMY[category as keyof typeof SKILL_TAXONOMY] || [];
      const required = taxonomySkills.filter((s) => parsedJD.requiredSkills.includes(s));
      const matched = required.filter((s) => resumeSkills.some((rs) => rs.includes(s.toLowerCase())));
      
      categoryBreakdown.push({
        category: this.getCategoryName(category),
        required: required.length,
        matched: matched.length,
        missing: required.length - matched.length,
        matchPercentage: required.length > 0 ? Math.round((matched.length / required.length) * 100) : 100,
        skills: matched,
      });
    });

    return {
      totalSkillsFound: resumeSkills.length,
      matchedSkills,
      missingSkills,
      additionalSkills,
      skillCategories: categoryBreakdown,
      skillDensity: resumeSkills.length / Math.max(1, this.calculateYearsOfExperience(resume.experience)),
      skillProficiency: {
        expert: 0,
        advanced: 0,
        intermediate: resumeSkills.length,
        beginner: 0,
      },
    };
  }

  /**
   * Analyze experience in detail
   */
  private analyzeExperience(resume: ResumeContent, jdText: string): ExperienceAnalysis {
    const experience = resume.experience || [];
    const jdLower = jdText.toLowerCase();

    const positions: PositionAnalysis[] = experience.map((exp) => {
      const expText = `${exp.title} ${exp.company} ${exp.description}`.toLowerCase();
      const keywords = jdLower.split(/\s+/).filter((word) => word.length > 4);
      const matchedKeywords = keywords.filter((k) => expText.includes(k));

      const achievements = (exp.description?.match(/\d+%|\$\d+|\d+x/g) || []).length;
      
      return {
        title: exp.title,
        company: exp.company,
        duration: this.calculateDuration(exp.startDate, exp.endDate, exp.current),
        relevanceScore: matchedKeywords.length > 0 ? Math.min(100, matchedKeywords.length * 10) : 30,
        matchedKeywords: matchedKeywords.slice(0, 10),
        matchedResponsibilities: [],
        achievements,
        quantifiedAchievements: achievements,
        technologiesUsed: [],
      };
    });

    const totalYears = this.calculateYearsOfExperience(experience);
    const totalAchievements = positions.reduce((sum, p) => sum + p.achievements, 0);

    return {
      totalYears,
      relevantYears: totalYears,
      positions,
      careerProgression: {
        hasProgression: experience.length > 1,
        progressionScore: experience.length > 2 ? 80 : 50,
        titleProgression: 'Increasing' as const,
        responsibilityGrowth: true,
        skillGrowth: true,
      },
      achievementMetrics: {
        totalAchievements: totalAchievements,
        quantifiedCount: totalAchievements,
        quantificationRate: totalAchievements > 0 ? 100 : 0,
        metricTypes: {
          percentages: (jdText.match(/\d+%/g) || []).length,
          monetaryValues: (jdText.match(/\$\d+/g) || []).length,
          timeReductions: 0,
          efficiencyGains: 0,
          scaleMetrics: 0,
        },
      },
      responsibilityMatch: {
        matchedResponsibilities: 0,
        totalResponsibilities: 0,
        matchPercentage: 50,
        matchedActionVerbs: [],
        missingActionVerbs: [],
      },
      gaps: [],
    };
  }

  /**
   * Analyze keywords in detail
   */
  private analyzeKeywords(resumeText: string, jdKeywords: any): KeywordAnalysis {
    const resumeLower = resumeText.toLowerCase();
    const wordCount = resumeText.split(/\s+/).length;

    const foundKeywords: KeywordMatch[] = jdKeywords.all
      .filter((keyword: string) => {
        const escaped = this.escapeRegex(keyword);
        return new RegExp(`\\b${escaped}\\b`, 'i').test(resumeLower);
      })
      .map((keyword: string) => {
        const escaped = this.escapeRegex(keyword);
        const frequency = (resumeLower.match(new RegExp(escaped, 'gi')) || []).length;
        return {
          keyword,
          category: 'Technical Skill' as const,
          frequency,
          locations: [],
          context: [],
          relevanceScore: Math.min(100, frequency * 10),
        };
      });

    const missingKeywords: KeywordGap[] = jdKeywords.all
      .filter((keyword: string) => {
        const escaped = this.escapeRegex(keyword);
        return !new RegExp(`\\b${escaped}\\b`, 'i').test(resumeLower);
      })
      .map((keyword: string) => ({
        keyword,
        category: 'Technical Skill' as const,
        importance: 'High' as const,
        frequency: 1,
        suggestions: [`Add ${keyword} to relevant sections`],
      }));

    const keywordCount = foundKeywords.length;
    const density = (keywordCount / wordCount) * 100;

    return {
      totalKeywords: jdKeywords.all.length,
      foundKeywords,
      missingKeywords,
      keywordDensity: {
        overall: density,
        bySection: {},
      },
      keywordDistribution: {
        summary: 0,
        experience: 0,
        skills: keywordCount,
        projects: 0,
      },
      overusedKeywords: [],
      semanticKeywords: [],
    };
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(input: {
    atsBreakdown: ScoreBreakdown['ats'];
    jobMatchBreakdown: ScoreBreakdown['jobMatch'];
    sectionAnalysis: SectionAnalysis;
    skillsAnalysis: SkillsAnalysis;
    experienceAnalysis: ExperienceAnalysis;
    keywordAnalysis: KeywordAnalysis;
  }): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const { sectionAnalysis, skillsAnalysis, keywordAnalysis } = input;

    // Critical: Missing sections
    if (!sectionAnalysis.summary.present) {
      recommendations.push({
        id: 'rec-001',
        category: 'Content',
        priority: 'Critical',
        title: 'Add Professional Summary',
        description: 'Your resume is missing a professional summary section.',
        impact: 'High',
        effort: 'Low',
        actionItems: [
          {
            id: 'action-001',
            action: 'Write a 3-5 sentence summary highlighting your key qualifications',
            section: 'Summary',
            example: 'Example: "Senior Software Engineer with 5+ years of experience..."',
            completed: false,
          },
        ],
        estimatedScoreImprovement: 15,
      });
    }

    if (!sectionAnalysis.experience.present) {
      recommendations.push({
        id: 'rec-002',
        category: 'Experience',
        priority: 'Critical',
        title: 'Add Work Experience',
        description: 'Your resume is missing work experience.',
        impact: 'High',
        effort: 'High',
        actionItems: [
          {
            id: 'action-002',
            action: 'Add your relevant work experience with detailed descriptions',
            section: 'Experience',
            completed: false,
          },
        ],
        estimatedScoreImprovement: 25,
      });
    }

    // High: Skills gaps
    if (skillsAnalysis.missingSkills.length > 0) {
      recommendations.push({
        id: 'rec-003',
        category: 'Skills',
        priority: 'High',
        title: 'Address Skills Gaps',
        description: `You're missing ${skillsAnalysis.missingSkills.length} required skills.`,
        impact: 'High',
        effort: 'Medium',
        actionItems: skillsAnalysis.missingSkills.slice(0, 5).map((skill, i) => ({
          id: `action-003-${i}`,
          action: `Add ${skill.name} to your skills or experience section`,
          section: 'Skills',
          completed: false,
        })),
        estimatedScoreImprovement: 20,
      });
    }

    // Medium: Keyword optimization
    if (keywordAnalysis.missingKeywords.length > 5) {
      recommendations.push({
        id: 'rec-004',
        category: 'Keywords',
        priority: 'Medium',
        title: 'Optimize Keywords',
        description: `Add ${keywordAnalysis.missingKeywords.length} missing keywords from the job description.`,
        impact: 'Medium',
        effort: 'Low',
        actionItems: keywordAnalysis.missingKeywords.slice(0, 5).map((kw, i) => ({
          id: `action-004-${i}`,
          action: `Incorporate "${kw.keyword}" naturally in your resume`,
          section: 'Experience',
          completed: false,
        })),
        estimatedScoreImprovement: 10,
      });
    }

    // Medium: Projects section
    if (!sectionAnalysis.projects.present) {
      recommendations.push({
        id: 'rec-005',
        category: 'Structure',
        priority: 'Medium',
        title: 'Add Projects Section',
        description: 'Adding projects showcases practical application of your skills.',
        impact: 'Medium',
        effort: 'Medium',
        actionItems: [
          {
            id: 'action-005',
            action: 'Add 2-3 relevant projects with descriptions and technologies used',
            section: 'Projects',
            completed: false,
          },
        ],
        estimatedScoreImprovement: 10,
      });
    }

    return recommendations;
  }

  // Utility methods
  private calculateYearsOfExperience(experience: any[]): number {
    if (!experience || experience.length === 0) return 0;
    
    let totalMonths = 0;
    experience.forEach((exp) => {
      if (exp.startDate) {
        const start = new Date(exp.startDate);
        const end = exp.current || !exp.endDate ? new Date() : new Date(exp.endDate);
        totalMonths += (end.getFullYear() - start.getFullYear()) * 12 + 
                       (end.getMonth() - start.getMonth());
      }
    });
    
    return Math.round(totalMonths / 12);
  }

  private calculateDuration(start: string, end?: string, current?: boolean): number {
    if (!start) return 0;
    const startDate = new Date(start);
    const endDate = current || !end ? new Date() : new Date(end);
    return Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
  }

  private categorizeSkill(skill: string): any {
    const lower = skill.toLowerCase();
    for (const [category, skills] of Object.entries(SKILL_TAXONOMY)) {
      if (skills.some((s) => lower.includes(s) || s.includes(lower))) {
        return category.replace(/([A-Z])/g, ' $1').trim();
      }
    }
    return 'Domain Knowledge';
  }

  private getCategoryName(key: string): any {
    const names: Record<string, string> = {
      programmingLanguages: 'Programming Language',
      frontendFrameworks: 'Framework',
      backendFrameworks: 'Framework',
      databases: 'Database',
      devopsTools: 'DevOps Tool',
    };
    return names[key] || 'Technical Skill';
  }

  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private calculateConfidenceScore(resume: ResumeContent, jd: string): number {
    let score = 100;
    if (!resume.summary) score -= 10;
    if (!resume.experience || resume.experience.length === 0) score -= 20;
    if (!resume.skills || resume.skills.length === 0) score -= 15;
    if (jd.length < 100) score -= 10;
    return Math.max(0, score);
  }

  private assessDataQuality(text: string): 'Excellent' | 'Good' | 'Fair' | 'Poor' {
    const wordCount = text.split(/\s+/).length;
    if (wordCount > 500) return 'Excellent';
    if (wordCount > 200) return 'Good';
    if (wordCount > 50) return 'Fair';
    return 'Poor';
  }

  private calculateCompletenessScore(resume: ResumeContent): number {
    let score = 0;
    if (resume.summary) score += 15;
    if (resume.experience && resume.experience.length > 0) score += 30;
    if (resume.skills && resume.skills.length > 0) score += 20;
    if (resume.education && resume.education.length > 0) score += 15;
    if (resume.projects && resume.projects.length > 0) score += 10;
    if (resume.certifications && resume.certifications.length > 0) score += 10;
    return Math.min(100, score);
  }
}

// Export singleton instance
export const resumeAnalysisService = new ResumeAnalysisService();
