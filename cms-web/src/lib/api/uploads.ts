import { apiFetch } from "./client";

export interface UploadResponse {
  url: string;
  sizeBytes: number;
  mimeType: string;
  originalFilename: string;
}

export function uploadFile(file: File): Promise<UploadResponse> {
  const fd = new FormData();
  fd.append("file", file);
  return apiFetch<UploadResponse>("/api/cms/uploads", {
    method: "POST",
    body: fd,
    json: false,
  });
}
