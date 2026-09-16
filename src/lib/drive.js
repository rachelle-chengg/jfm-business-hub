/**
 * Google Drive — PDF generation + upload.
 *
 * generatePdfBlob: captures the .sheet element via html2canvas + jsPDF.
 * uploadInvoiceToDrive: creates "Invoice PDFs" folder if needed, uploads.
 */

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { getAccessToken } from "./googleAuth.js";

const FOLDER_KEY = "jfm-drive-folder-id";
const FOLDER_NAME = "Invoice PDFs";

async function getOrCreateFolder(accessToken) {
  const stored = localStorage.getItem(FOLDER_KEY);
  if (stored) return stored;

  // Search for existing folder
  const q = encodeURIComponent(
    `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
  );
  const search = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const { files } = await search.json();
  if (files?.length) {
    localStorage.setItem(FOLDER_KEY, files[0].id);
    return files[0].id;
  }

  // Create it
  const res = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder",
    }),
  });
  const folder = await res.json();
  localStorage.setItem(FOLDER_KEY, folder.id);
  return folder.id;
}

/** Render the invoice sheet element to a letter-size PDF blob. */
export async function generatePdfBlob() {
  const sheet = document.getElementById("invoice-sheet");
  if (!sheet) throw new Error("Invoice sheet element not found.");

  const canvas = await html2canvas(sheet, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: null,
  });

  const pdf = new jsPDF({ unit: "in", format: "letter", orientation: "portrait" });
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 8.5, 11);
  return pdf.output("blob");
}

/**
 * Upload a PDF blob to Drive.
 * Returns { id, webViewLink } from the Drive API.
 */
export async function uploadInvoiceToDrive({ blob, filename }) {
  const accessToken = await getAccessToken();
  const folderId = await getOrCreateFolder(accessToken);

  const metadata = {
    name: filename,
    mimeType: "application/pdf",
    parents: [folderId],
  };

  const form = new FormData();
  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  );
  form.append("file", blob, filename);

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
    }
  );

  if (!res.ok) throw new Error(`Drive upload failed: ${res.status}`);
  return res.json(); // { id, webViewLink }
}
