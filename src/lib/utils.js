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
// ------------ Booking / payment helpers ------------

export function parseMoney(value) {
  if (value == null) return 0;
  const normalized = String(value).replace(/,/g, "").trim();
  const num = Number(normalized);
  return Number.isFinite(num) ? num : 0;
}

export function normalizeServicePricingType(service) {
  const raw = String(service?.pricingType || "").trim().toLowerCase();
  return raw === "hourly" ? "hourly" : "flat";
}

export function getServiceUnitLabel(service) {
  return normalizeServicePricingType(service) === "hourly" ? "/ hour" : "";
}

export function getServiceBaseRate(service) {
  if (!service) return 0;
  if (normalizeServicePricingType(service) === "hourly") {
    return parseMoney(service.hourlyRate ?? service.cost ?? service.price ?? 0);
  }
  return parseMoney(service.cost ?? service.price ?? 0);
}

export function parseTimeToMinutes(timeValue) {
  if (!timeValue || typeof timeValue !== "string") return null;
  const [rawHours, rawMinutes] = timeValue.split(":");
  const hours = Number(rawHours);
  const minutes = Number(rawMinutes ?? 0);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return (hours * 60) + minutes;
}

export function computeScheduleSlotHours(slot) {
  const startMinutes = parseTimeToMinutes(slot?.startTime);
  const endMinutes = parseTimeToMinutes(slot?.endTime);
  if (startMinutes == null || endMinutes == null) return 0;
  if (endMinutes <= startMinutes) {
    return ((24 * 60) - startMinutes + endMinutes) / 60;
  }
  return (endMinutes - startMinutes) / 60;
}

export function normalizeServiceScheduleSlots(service) {
  const rawSlots = Array.isArray(service?.scheduleSlots) && service.scheduleSlots.length > 0
    ? service.scheduleSlots
    : (service?.startTime || service?.endTime || service?.serviceDate)
      ? [{
          date: service?.serviceDate || "",
          startTime: service?.startTime || "",
          endTime: service?.endTime || "",
        }]
      : [];

  const normalized = rawSlots.map((slot, index) => ({
    id: slot?.id || `slot-${index + 1}`,
    date: slot?.date || "",
    startTime: slot?.startTime || "",
    endTime: slot?.endTime || "",
    hours: computeScheduleSlotHours(slot),
  }));

  return normalized;
}

export function computeHourlyServiceHours(service) {
  const scheduleSlots = normalizeServiceScheduleSlots(service);
  if (scheduleSlots.length > 0) {
    return scheduleSlots.reduce((sum, slot) => sum + computeScheduleSlotHours(slot), 0);
  }
  const directHours = Math.max(0, Number(service?.requestedHours || 0));
  if (directHours > 0) return directHours;
  return computeScheduleSlotHours(service);
}

export function computeServiceCost(service) {
  if (!service) return 0;
  const pricingType = normalizeServicePricingType(service);
  const baseRate = getServiceBaseRate(service);
  if (pricingType === "hourly") {
    return baseRate * computeHourlyServiceHours(service);
  }
  return baseRate;
}

export function getServiceKey(service) {
  if (!service) return "";
  if (typeof service === "string") return service;
  return service.id || service.name || "";
}

export function buildServiceSnapshot(serviceInput, extraServices = []) {
  const normalizedKey = String(getServiceKey(serviceInput) || "");
  const found = (extraServices || []).find(
    (s) => s && (String(s.id) === normalizedKey || String(s.name) === normalizedKey)
  );
  const incoming = serviceInput && typeof serviceInput === "object" ? serviceInput : {};
  const pricingType = normalizeServicePricingType(incoming?.pricingType ? incoming : found);
  const scheduleSlots = pricingType === "hourly"
    ? normalizeServiceScheduleSlots({
        ...found,
        ...incoming,
      })
    : [];
  const requestedHours =
    pricingType === "hourly"
      ? computeHourlyServiceHours({
          ...found,
          ...incoming,
          scheduleSlots,
        })
      : 0;
  const hourlyRate = pricingType === "hourly"
    ? getServiceBaseRate({
        pricingType,
        hourlyRate: incoming.hourlyRate ?? found?.hourlyRate,
        cost: incoming.cost ?? found?.cost,
        price: incoming.price ?? found?.price,
      })
    : 0;
  const flatCost = pricingType === "flat"
    ? getServiceBaseRate({
        pricingType,
        cost: incoming.cost ?? found?.cost,
        price: incoming.price ?? found?.price,
      })
    : 0;
  const snapshot = {
    id: normalizedKey,
    name: incoming?.name || found?.name || normalizedKey,
    description: incoming?.description || found?.description || "",
    pricingType,
    hourlyRate,
    requestedHours,
    serviceDate: incoming?.serviceDate || scheduleSlots[0]?.date || "",
    startTime: incoming?.startTime || scheduleSlots[0]?.startTime || "",
    endTime: incoming?.endTime || scheduleSlots[0]?.endTime || "",
    scheduleSlots,
    cost: flatCost,
    unitCost: pricingType === "hourly" ? hourlyRate : flatCost,
  };
  const computedCost = computeServiceCost(snapshot);
  return {
    ...snapshot,
    computedCost,
    totalCost: computedCost,
    cost: computedCost,
  };
}

export function buildServiceSnapshots(serviceEntries = [], extraServices = []) {
  const entries = Array.isArray(serviceEntries) ? serviceEntries : [];
  return entries
    .map((entry) => buildServiceSnapshot(entry, extraServices))
    .filter((s) => s && s.id);
}

export function computeBookingTotalAmount({ basePrice = 0, selectedServiceKeys = [], extraServices = [], serviceSnapshots = [] }) {
  const base = parseMoney(basePrice);
  const serviceTotal = (serviceSnapshots && serviceSnapshots.length > 0
    ? serviceSnapshots
    : (selectedServiceKeys || []).map((key) => buildServiceSnapshot(key, extraServices)))
    .reduce((sum, snapshot) => sum + computeServiceCost(snapshot), 0);
  return base + serviceTotal;
}

export function computeSelectedServicesTotal(serviceSnapshots = []) {
  return (Array.isArray(serviceSnapshots) ? serviceSnapshots : []).reduce(
    (sum, snapshot) => sum + computeServiceCost(snapshot),
    0
  );
}

export function resolveBookingBaseAmount({ bookingForm = {}, resortPrice = 0, serviceSnapshots = [] }) {
  const explicitBase = parseMoney(bookingForm?.baseAmount);
  if (explicitBase > 0) return explicitBase;
  const totalAmount = parseMoney(bookingForm?.totalAmount);
  const selectedServicesTotal = computeSelectedServicesTotal(serviceSnapshots);
  if (totalAmount > 0) {
    return Math.max(0, totalAmount - selectedServicesTotal);
  }
  return parseMoney(resortPrice);
}

export function formatServiceScheduleLabel(service) {
  const slots = normalizeServiceScheduleSlots(service);
  if (slots.length === 0) return "";
  return slots
    .map((slot) => {
      const dateLabel = slot.date
        ? new Date(`${slot.date}T00:00:00`).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Date not set";
      const timeLabel = slot.startTime && slot.endTime ? `${slot.startTime} - ${slot.endTime}` : "Time not set";
      const hoursLabel = slot.hours > 0 ? `${slot.hours}h` : "0h";
      return `${dateLabel}, ${timeLabel} (${hoursLabel})`;
    })
    .join("; ");
}

export function hasServiceScheduleData(service) {
  return normalizeServiceScheduleSlots(service).some(
    (slot) => Boolean(slot.date || slot.startTime || slot.endTime)
  );
}
