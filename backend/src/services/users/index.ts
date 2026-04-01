import { User } from "../../models/User";

interface UpdateProfileData {
  name?: string;
  preferences?: {
    theme?: "light" | "dark" | "system";
    defaultTemplate?: string;
    notifications?: boolean;
  };
}

export const getUserProfile = async (userId: string) => {
  return User.findById(userId).select("-__v");
};

export const updateUserProfile = async (
  userId: string,
  updateData: UpdateProfileData
) => {
  return User.findByIdAndUpdate(userId, { $set: updateData }, {
    new: true,
    runValidators: true,
  }).select("-__v");
};

export const deleteUserAccount = async (userId: string) => {
  return User.findByIdAndDelete(userId);
};

export const useUserCredit = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.subscription.credits <= 0) {
    throw new Error("Insufficient credits");
  }

  user.subscription.credits -= 1;
  await user.save();

  return { credits: user.subscription.credits, user };
};

export const useUserCredits = async (userId: string, amount: number) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.subscription.credits < amount) {
    throw new Error("Insufficient credits");
  }

  user.subscription.credits -= amount;
  await user.save();

  return { credits: user.subscription.credits, user };
};

export const getUserCredits = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return user.subscription.credits;
};
