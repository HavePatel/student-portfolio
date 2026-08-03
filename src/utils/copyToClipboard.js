/**
 * copyToClipboard.js
 * Tries modern Clipboard API, falls back to execCommand.
 * Returns a Promise<boolean> indicating success.
 */
export async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to legacy
    }
  }

  // Legacy fallback
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.cssText = "position:fixed;left:-9999px;top:-9999px;opacity:0;";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand("copy");
    return true;
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

/**
 * Share via Web Share API with clipboard fallback.
 * @param {{ title, text, url }} data
 */
export async function shareOrCopy(data) {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return "shared";
    } catch {
      // User cancelled or API unavailable — fall through
    }
  }
  const ok = await copyToClipboard(data.url ?? data.text ?? "");
  return ok ? "copied" : "failed";
}
