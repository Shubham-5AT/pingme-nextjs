export interface ProductVariant {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  image?: string;
  emoji?: string;
  popular?: boolean;
  features: string[];
}

export interface ProductCategory {
  slug: string;
  name: string;
  description: string;
  icon: string;
  coverImage: string;
  gradient: string;
  products: ProductVariant[];
}

export interface CategoryTutorial {
  title: string;
  subtitle: string;
  steps: string[];
  tip: string;
}

const storageBucketName = (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "").replace(/^gs:\/\//, "");

const normalizeStorageObjectPath = (rawPath: string): string => {
  const normalized = rawPath.trim().replace(/\\/g, "/").replace(/^\/+/, "");

  if (!normalized) {
    return "";
  }

  return normalized.startsWith("products/") ? normalized : `products/${normalized}`;
};

const decodeObjectPath = (path: string): string => {
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
};

const extractStoragePathFromUrl = (urlValue: string): string => {
  try {
    const parsed = new URL(urlValue);
    const marker = "/o/";
    const markerIndex = parsed.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return "";
    }

    const encodedPath = parsed.pathname.slice(markerIndex + marker.length);
    return normalizeStorageObjectPath(decodeObjectPath(encodedPath));
  } catch {
    return "";
  }
};

export const buildProductImageUrl = (fileNameOrPath: string): string => {
  const objectPath = normalizeStorageObjectPath(fileNameOrPath);

  if (!storageBucketName || !objectPath) {
    return "";
  }

  const encodedPath = encodeURIComponent(objectPath);
  return `https://firebasestorage.googleapis.com/v0/b/${storageBucketName}/o/${encodedPath}?alt=media`;
};

export const resolveProductImageUrl = (image?: string): string => {
  const rawImage = (image || "").trim();

  if (!rawImage) {
    return "";
  }

  if (/^data:/i.test(rawImage)) {
    return rawImage;
  }

  if (/^https?:\/\//i.test(rawImage)) {
    const objectPath = extractStoragePathFromUrl(rawImage);
    return objectPath ? buildProductImageUrl(objectPath) : rawImage;
  }

  const withoutQuery = rawImage.split("?")[0].split("#")[0].trim();
  const normalized = withoutQuery.replace(/\\/g, "/");

  const productsIndex = normalized.toLowerCase().lastIndexOf("products/");
  if (productsIndex >= 0) {
    const pathFromProducts = normalizeStorageObjectPath(normalized.slice(productsIndex));
    return pathFromProducts ? buildProductImageUrl(pathFromProducts) : "";
  }

  const fileName = decodeObjectPath(normalized.split("/").pop() || "").trim();

  if (!fileName) {
    return "";
  }

  return buildProductImageUrl(fileName);
};

const CATEGORY_GRADIENTS = [
  "from-amber-500/20 to-yellow-500/10",
  "from-rose-500/20 to-pink-500/10",
  "from-teal-500/20 to-emerald-500/10",
  "from-sky-500/20 to-blue-500/10",
  "from-slate-500/20 to-zinc-500/10",
  "from-gray-500/20 to-neutral-500/10",
];

const DEFAULT_CATEGORY_ICON = "📦";

export const normalizeCategorySlug = (rawSlug: string): string => {
  return rawSlug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const categoryNameFromSlug = (slug: string): string => {
  const normalized = normalizeCategorySlug(slug);

  if (!normalized) {
    return "Uncategorized";
  }

  return normalized
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const hashString = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const categoryGradientFromSlug = (slug: string): string => {
  const normalized = normalizeCategorySlug(slug);
  if (!normalized) {
    return CATEGORY_GRADIENTS[0];
  }

  return CATEGORY_GRADIENTS[hashString(normalized) % CATEGORY_GRADIENTS.length];
};

export const categoryDescriptionFromName = (categoryName: string): string => {
  return `Smart ${categoryName} products for secure identification and faster owner contact.`;
};

export const categoryIconFromProducts = (products: ProductVariant[]): string => {
  const iconSource = products.find((product) => typeof product.emoji === "string" && product.emoji.trim());
  return iconSource?.emoji?.trim() || DEFAULT_CATEGORY_ICON;
};

export const categoryCoverImageFromProducts = (products: ProductVariant[]): string => {
  const coverSource = [...products]
    .filter((product) => typeof product.image === "string" && product.image.trim())
    .sort((left, right) => {
      if (Boolean(left.popular) !== Boolean(right.popular)) {
        return Number(Boolean(right.popular)) - Number(Boolean(left.popular));
      }

      return left.title.localeCompare(right.title);
    })[0];

  return coverSource?.image?.trim() || "";
};

export const buildGenericCategoryTutorial = (categoryName: string): CategoryTutorial => {
  return {
    title: `How to Use Your ${categoryName}`,
    subtitle: "Set it up once, keep details updated, and stay reachable when someone scans it.",
    steps: [
      "Choose your design and complete checkout.",
      "Open your profile and add the contact details you want to share.",
      "Place or carry the product where it stays visible and easy to scan.",
      "Update your details anytime from your profile without replacing the product.",
    ],
    tip: "Run one quick scan test after setup to confirm your public profile opens correctly.",
  };
};
