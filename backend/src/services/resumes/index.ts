import { Resume } from "../../models/Resume";
import { User } from "../../models/User";
import { parseResumeFile } from "../resumeParser";

interface ResumeContent {
  personalInfo?: any;
  [key: string]: any;
}

interface PaginationOptions {
  page: number;
  limit: number;
  sourceType?: 'uploaded' | 'builder';
}

export const getAllResumesByUser = async (
  userId: string,
  options: PaginationOptions
) => {
  const { page, limit, sourceType } = options;
  const skip = (page - 1) * limit;

  const query: any = { 
    userId, 
    $or: [
      { isActive: true },
      { isActive: { $exists: false } }
    ]
  };

  if (sourceType) {
    query.sourceType = sourceType;
  }

  const [resumes, total] = await Promise.all([
    Resume.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-originalFormat"),
    Resume.countDocuments(query),
  ]);

  return {
    resumes,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getResumeById = async (resumeId: string, userId: string) => {
  return Resume.findOne({ _id: resumeId, userId });
};

interface UploadedFile {
  path: string;
  filename: string;
  mimetype: string;
  size: number;
  originalname: string;
}

export const createResumeFromUpload = async (
  userId: string,
  file: UploadedFile
) => {
  const parsedContent = await parseResumeFile(file.path, file.mimetype);

  const resume = await Resume.create({
    userId,
    sourceType: "uploaded",
    originalFormat: {
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
    },
    content: parsedContent,
    metadata: {
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      type: file.mimetype,
    },
    isActive: true,
  });

  return resume;
};

export const createResumeFromContent = async (
  userId: string,
  content: ResumeContent
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.subscription.credits <= 0) {
    throw new Error("Insufficient credits. Please upgrade your plan.");
  }

  user.subscription.credits -= 1;
  await user.save();

  const resume = await Resume.create({
    userId,
    sourceType: "builder",
    content,
    metadata: {
      filename: `resume_${Date.now()}.json`,
      originalName: content.personalInfo?.fullName || "Resume",
      size: JSON.stringify(content).length,
      type: "application/json",
    },
    isActive: true,
  });

  return { resume, remainingCredits: user.subscription.credits };
};

export const updateResumeById = async (
  resumeId: string,
  userId: string,
  updateData: any
) => {
  return Resume.findOneAndUpdate(
    { _id: resumeId, userId },
    { $set: updateData },
    { new: true, runValidators: true }
  );
};

export const deleteResumeById = async (resumeId: string, userId: string) => {
  return Resume.findOneAndDelete({ _id: resumeId, userId });
};

export const deleteAllResumesByUser = async (userId: string): Promise<{ deletedCount: number }> => {
  const result = await Resume.deleteMany({ 
    userId, 
    $or: [
      { isActive: true },
      { isActive: { $exists: false } }
    ]
  });
  return { deletedCount: result.deletedCount };
};
