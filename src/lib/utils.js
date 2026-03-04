export const BUCKET_NAME = "resort-images";
const DEFAULT_SUPABASE_IMAGE_WIDTHS = [480, 768, 1024, 1440];

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
  if (!isSupabasePublicStorageUrl(url)) return undefined;
  return widths
    .map((width) => `${getTransformedSupabaseImageUrl(url, { width, quality, format: "webp" })} ${width}w`)
    .join(", ");
}
