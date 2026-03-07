/**
 * Shared upload/delete for resort payment reference image (e.g. GCash QR).
 * Stores under [resortname]/payment in the resort-images bucket, WebP.
 */
import { BUCKET_NAME, convertImageFileToWebp, getStoragePathFromPublicUrl, getResortStoragePath } from "./utils";

const PAYMENT_CATEGORY = "payment";

/**
 * Convert file to WebP (if needed) and upload to [resortName]/payment/filename.webp.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {File} file
 * @param {string} resortName
 * @returns {Promise<string|null>} Public URL or null
 */
export async function uploadResortPaymentImage(supabase, file, resortName) {
  if (!file || !(file instanceof File) || !file.type?.startsWith("image/") || !resortName) return null;
  const normalized = await convertImageFileToWebp(file);
  const basePath = getResortStoragePath(resortName, PAYMENT_CATEGORY);
  const fileName = `${Date.now()}-${normalized.name.replace(/\s+/g, "-")}`;
  const path = `${basePath}/${fileName}`;

  const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, normalized, {
    upsert: true,
    contentType: normalized.type || "image/webp",
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data?.publicUrl || null;
}

/**
 * Remove payment image from storage when it is removed or replaced.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string|null|undefined} imageUrl - Current public URL of the image to delete
 * @returns {Promise<void>}
 */
export async function deleteResortPaymentImage(supabase, imageUrl) {
  if (!imageUrl || typeof imageUrl !== "string") return;
  const path = getStoragePathFromPublicUrl(imageUrl, BUCKET_NAME);
  if (!path || !path.includes(`/${PAYMENT_CATEGORY}/`)) return;
  await supabase.storage.from(BUCKET_NAME).remove([path]);
}
