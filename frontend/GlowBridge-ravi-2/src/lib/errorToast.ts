import toast from "react-hot-toast";
import { ApiError } from "./userApi";
interface ValidationErrorResponse {
  error: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
  formErrors?: string[];
}


export const showApiErrorToast = (error: unknown, customMessage?: string) => {

  if (error instanceof ApiError) {
    const response = error.response as ValidationErrorResponse | undefined;

    if (response?.error === "ValidationError") {

      if (
        response.fieldErrors &&
        Object.keys(response.fieldErrors).length > 0
      ) {

        Object.entries(response.fieldErrors).forEach(([field, messages]) => {
          const fieldName = formatFieldName(field);
          messages.forEach((message) => {
            toast.error(`${fieldName}: ${message}`, {
              duration: 6000,
              id: `${field}-${message}`,
            });
          });
        });
      }


      if (response.formErrors && response.formErrors.length > 0) {
        response.formErrors.forEach((message) => {
          toast.error(message, {
            duration: 6000,
          });
        });
      }


      if (
        (!response.fieldErrors ||
          Object.keys(response.fieldErrors).length === 0) &&
        (!response.formErrors || response.formErrors.length === 0)
      ) {
        toast.error(response.message || "Validation failed", {
          duration: 6000,
        });
      }
    } else if (error.status === 409) {

      toast.error(
        response?.message ||
          error.message ||
          "Conflict: Resource already exists"
      );
    } else if (error.status === 404) {

      toast.error("Resource not found");
    } else if (error.status === 401) {

      toast.error("Unauthorized access");
    } else if (error.status === 403) {

      toast.error("Access forbidden");
    } else if (error.status >= 500) {

      toast.error("Server error. Please try again later.");
    } else {

      toast.error(error.message || customMessage || "An error occurred");
    }
  } else if (error instanceof Error) {

    toast.error(
      error.message || customMessage || "An unexpected error occurred"
    );
  } else {

    toast.error(customMessage || "An unknown error occurred");
  }
};


export const showSuccessToast = (message: string) => {
  toast.success(message, {
    duration: 4000,
  });
};


export const showLoadingToast = (message: string) => {
  return toast.loading(message);
};


export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};


export const updateToast = (
  toastId: string,
  message: string,
  type: "success" | "error"
) => {
  if (type === "success") {
    toast.success(message, { id: toastId });
  } else {
    toast.error(message, { id: toastId });
  }
};


const formatFieldName = (field: string): string => {
  return field
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};


export const handleFormSubmissionWithToast = async <T>(
  submitFn: () => Promise<T>,
  loadingMessage: string,
  successMessage: string,
  errorMessage?: string
): Promise<T | null> => {
  const toastId = showLoadingToast(loadingMessage);

  try {
    const result = await submitFn();
    updateToast(toastId, successMessage, "success");
    return result;
  } catch (error) {
    dismissToast(toastId);
    showApiErrorToast(error, errorMessage);
    return null;
  }
};
