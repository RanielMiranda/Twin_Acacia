export const BUCKET_NAME = "resort-images";
const DEFAULT_SUPABASE_IMAGE_WIDTHS = [480, 768, 1024, 1440];
const SUPABASE_TRANSFORMS_ENABLED = process.env.NEXT_PUBLIC_ENABLE_SUPABASE_TRANSFORMS === "true";

export function getStoragePathFromPublicUrl(url, bucketName = BUCKET_NAME) {
  if (!url || typeof url !== "string") return null;
  const markers = [
    `/storage/v1/object/public/${bucketName}/`,
    `/object/public/${bucketName}/`,
    `/storage/v1/object/sign/${bucketName}/`,
    `/object/sign/${bucketName}/`,
  ];
  const marker = markers.find((m) => url.includes(m));
  if (!marker) return null;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  const remainder = url.slice(index + marker.length);
  // Signed URLs include a query string that should not be part of the object path.
  const [path] = remainder.split("?");
  return decodeURIComponent(path);
}

export async function convertImageFileToWebp(file, quality = 0.82) {
  if (!file || !(file instanceof File) || !file.type?.startsWith("image/")) return file;
  if (typeof window === "undefined") return file;
  if ((file.type || "").toLowerCase() === "image/webp") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
    if (!blob) return file;
    const base = file.name.replace(/\.[^.]+$/, "") || `image-${Date.now()}`;
    return new File([blob], `${base}.webp`, { type: "image/webp" });
  } catch {
    return file;
  }
}

export function getResortStoragePath(resortName, category, subFolder = "", fileName = "") {
  const safeName = resortName.replace(/\s+/g, '-').toLowerCase();
  // category: 'profile', 'facilities', 'gallery', 'rooms'
  // subFolder: used for room names or specific facility names
  
  let path = `${safeName}`;
  if (category) path += `/${category}`;
  if (subFolder) path += `/${subFolder.replace(/\s+/g, '-').toLowerCase()}`;
  if (fileName) path += `/${fileName}`;
  
  return path;
}

export function getPublicUrl(path) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${path}`;
}

export function isSupabasePublicStorageUrl(url) {
  return typeof url === "string" && url.includes("/storage/v1/object/public/");
}

export function getTransformedSupabaseImageUrl(url, { width, quality = 80, format = "webp" } = {}) {
  if (!SUPABASE_TRANSFORMS_ENABLED) return url || "";
  if (!url || !isSupabasePublicStorageUrl(url)) return url || "";
  try {
    const parsed = new URL(url);
    if (width) parsed.searchParams.set("width", String(width));
    parsed.searchParams.set("quality", String(quality));
    parsed.searchParams.set("format", format);
    return parsed.toString();
  } catch {
    return url;
  }
}

export function getSupabaseSrcSet(url, widths = DEFAULT_SUPABASE_IMAGE_WIDTHS, quality = 80) {
  if (!SUPABASE_TRANSFORMS_ENABLED) return undefined;
  if (!isSupabasePublicStorageUrl(url)) return undefined;
  return widths
    .map((width) => `${getTransformedSupabaseImageUrl(url, { width, quality, format: "webp" })} ${width}w`)
    .join(", ");
}

export async function deleteSupabasePublicUrls(supabase, urls, bucketName = BUCKET_NAME) {
  if (!supabase || !Array.isArray(urls) || urls.length === 0) return;
  const paths = urls
    .map((url) => getStoragePathFromPublicUrl(url, bucketName))
    .filter(Boolean);
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(bucketName).remove(paths);
  if (error) throw error;
}

export function toSafeSegment(value) {
  return String(value || "unknown")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_\s]/g, "")
    .replace(/\s+/g, "-");
}

export function getStorageFolderFromPublicUrl(url, bucketName = BUCKET_NAME) {
  const path = getStoragePathFromPublicUrl(url, bucketName);
  if (!path) return null;
  const segments = path.split("/");
  segments.pop();
  return segments.join("/");
}

export async function deleteSupabaseFolder(supabase, folderPath, bucketName = BUCKET_NAME) {
  if (!supabase || !folderPath) return;
  const normalizedFolder = String(folderPath).replace(/\\/g, "/").replace(/\/+$/, "");

  // List all objects in the folder
  const { data: items, error: listError } = await supabase.storage
    .from(bucketName)
    .list(normalizedFolder, { limit: 1000, offset: 0, sortBy: { column: "name", order: "asc" } });
  if (listError) throw listError;
  if (!items || items.length === 0) return;

  const paths = items.map((item) => `${normalizedFolder}/${item.name}`);
  const { error: removeError } = await supabase.storage.from(bucketName).remove(paths);
  if (removeError) throw removeError;
}
