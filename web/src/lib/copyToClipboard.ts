import { toast } from "sonner";

export async function copyWithToast(text: string, message = "Copied to clipboard") {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(message);
  } catch {
    toast.error("Could not copy to clipboard");
  }
}
