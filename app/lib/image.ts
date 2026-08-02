export function normalizeImageUrl(raw: string): string {
  const input = raw.trim();
  if (!input) return "";

  const htmlImgMatch = input.match(/<img[^>]*\bsrc=["']([^"']+)["'][^>]*>/i);
  if (htmlImgMatch?.[1]) return htmlImgMatch[1].trim();

  const markdownImgMatch = input.match(/!\[[^\]]*\]\(([^)]+)\)/);
  if (markdownImgMatch?.[1]) return markdownImgMatch[1].trim();

  return input;
}

export async function readImageFile(file: File): Promise<string> {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type. Only JPEG, PNG, GIF and WebP are allowed.");
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("File too large. Maximum size is 5 MB.");
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string) || "");
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });

  if (!dataUrl || file.type === "image/gif") {
    return dataUrl;
  }

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image file."));
    img.src = dataUrl;
  });

  const MAX_DIM = 1200;
  let width = image.width;
  let height = image.height;

  if (width <= MAX_DIM && height <= MAX_DIM) {
    return dataUrl;
  }

  if (width >= height) {
    height = Math.round((height * MAX_DIM) / width);
    width = MAX_DIM;
  } else {
    width = Math.round((width * MAX_DIM) / height);
    height = MAX_DIM;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    return dataUrl;
  }

  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL(file.type, file.type === "image/png" ? undefined : 0.8);
}