// resumequick.pro/frontend/src/api/pdfService.js
import { API_CONFIG, isDevelopment } from "./config";

const API_URL = isDevelopment
  ? API_CONFIG.baseUrl
  : `${window.location.protocol}//${window.location.hostname}`;

const fetchPdf = async (htmlContent) => {
  const response = await fetch(`${API_URL}/download-resume`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ html: htmlContent }),
  });

  if (!response.ok) throw new Error("PDF generation failed");
  return response.blob();
};

const deviceUtils = {
  isIOS: () => /iPhone|iPad|iPod/i.test(navigator.userAgent),
  isAndroid: () => /Android/i.test(navigator.userAgent),
  isTelegram: () => /Telegram/i.test(navigator.userAgent),
  isMobile: () => deviceUtils.isIOS() || deviceUtils.isAndroid(),
};

export const sharePDF = async (htmlContent) => {
  try {
    const date = new Date().toISOString().split("T")[0]; // Gets YYYY-MM-DD
    const filename = `resume_${date}.pdf`;

    const blob = await fetchPdf(htmlContent);
    const file = new File([blob], filename, { type: "application/pdf" });

    if (!navigator.share || !navigator.canShare({ files: [file] })) {
      throw new Error("Sharing not supported");
    }

    await navigator.share({
      files: [file],
      title: "Resume",
    });
    return true;
  } catch {
    return false;
  }
};

const downloadUtils = {
  createDownloadUrl: (blob) => {
    const pdfBlob = new Blob([blob], { type: "application/pdf" });
    return window.URL.createObjectURL(pdfBlob);
  },

  mobileDownload: (url) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = "resume.pdf";

    if (deviceUtils.isIOS()) {
      link.target = "_blank";
      link.rel = "noopener";
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  desktopDownload: (url) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = "resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};

export const downloadPDF = async (htmlContent) => {
  try {
    const blob = await fetchPdf(htmlContent);
    const url = downloadUtils.createDownloadUrl(blob);

    // Attempt download
    if (deviceUtils.isMobile() || deviceUtils.isTelegram()) {
      downloadUtils.mobileDownload(url);
    } else {
      downloadUtils.desktopDownload(url);
    }

    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    return { success: true };
  } catch {
    return { success: false };
  }
};
