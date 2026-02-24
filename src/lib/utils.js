export const BUCKET_NAME = "resort-images";

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