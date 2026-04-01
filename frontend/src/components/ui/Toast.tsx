import { toast } from "react-toastify";
import { userApi } from "../../api/api";

export const showToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  warning: (message: string) => toast.warning(message),
  info: (message: string) => toast.info(message),
};

export const showUpgradePlan = () => {
  toast.info("Upgrade plan feature is coming soon!", {
    position: "top-center",
    autoClose: 5000,
  });
};

export const addFreeCredits = async (
  onSuccess?: () => void,
  onError?: () => void,
) => {
  try {
    const response = await userApi.addFreeCredits();
    const responseData = response.data;

    if (responseData.success && responseData.data) {
      if (onSuccess) {
        await onSuccess();
      }
      toast.success(
        responseData.data.message || "Free credits added successfully!",
      );
      return responseData.data;
    } else {
      toast.error(responseData.message || "Failed to add free credits");
      if (onError) onError();
    }
  } catch (error: any) {
    console.error("Add free credits error:", error);
    const message =
      error.response?.data?.message || "Failed to add free credits";
    toast.error(message);
    if (onError) onError();
    throw error;
  }
};

export default showToast;
