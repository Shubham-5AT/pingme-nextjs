import MainLayout from "@/layouts/MainLayout";
import { Shield, ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Product images
import productCard from "@/assets/product-card.png";
import nfcShinchan from "@/assets/products/nfc_shinchan.png";
import nfcOnepiece from "@/assets/products/nfc_onepiece.png";
import nfcPhoenix from "@/assets/products/nfc_phoenix.png";
import nfcMindset from "@/assets/products/nfc_mindset.png";
import nfcYoucan from "@/assets/products/nfc_youcan1.png";
import nfcFront from "@/assets/products/nfc_front.png";
import backpackSticker from "@/assets/products/backpack_sticker.png";
import keytagBlack from "@/assets/products/keytag_black.png";
import keytagRed from "@/assets/products/keytag_red.png";
import keytagNavy from "@/assets/products/keytag_navy.png";
import keytagTeal from "@/assets/products/keytag_teal.png";
import tagCircle from "@/assets/products/tag_circle.png";
import tagOval from "@/assets/products/tag_oval.png";
import tagSquareBlack from "@/assets/products/tag_square_black.png";
import tagSquareYellow from "@/assets/products/tag_square_yellow.png";
import carcardFront from "@/assets/products/carcard_front.png";
import carcardBack from "@/assets/products/carcard_back.png";

// ─── Data ───────────────────────────────────────────────

interface ProductVariant {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  image?: string;
  emoji?: string;
  popular?: boolean;
  features: string[];
}

interface ProductCategory {
  slug: string;
  name: string;
  description: string;
  icon: string;
  coverImage: string;
  gradient: string;
  products: ProductVariant[];
}

const categories: ProductCategory[] = [
  {
    slug: "car-tags",
    name: "Car Tags",
    description: "Premium QR cards for your car dashboard — get contacted anonymously if parked wrong.",
    icon: "🚗",
    coverImage: carcardFront,
    gradient: "from-amber-500/20 to-yellow-500/10",
    products: [
      {
        id: "car-card-standard",
        title: "PingME Car Card – Standard",
        price: "₹499",
        originalPrice: "₹599",
        image: carcardFront,
        popular: true,
        features: [
          "Premium quality card with QR code",
          "Fits perfectly on car's front mirror",
          "Weatherproof and durable",
          "Lifetime QR code activation",
        ],
      },
      {
        id: "car-card-variant-b",
        title: "PingME Car Card – Design B",
        price: "₹499",
        originalPrice: "₹599",
        image: carcardBack,
        features: [
          "Alternate design layout",
          "Same premium QR functionality",
          "Weatherproof and durable",
          "Lifetime QR code activation",
        ],
      },
    ],
  },
  {
    slug: "bike-tags",
    name: "Bike Tags",
    description: "Compact, UV-resistant tags that attach easily to your two-wheeler.",
    icon: "🏍️",
    coverImage: tagOval,
    gradient: "from-rose-500/20 to-pink-500/10",
    products: [
      {
        id: "bike-tag-classic",
        title: "Bike Tag – Circle",
        price: "₹249",
        originalPrice: "₹299",
        image: tagCircle,
        popular: true,
        features: ["Circular compact design", "UV resistant material", "Easy keychain installation", "Lifetime QR code activation"],
      },
      {
        id: "bike-tag-oval",
        title: "Bike Tag – Oval",
        price: "₹249",
        originalPrice: "₹299",
        image: tagOval,
        features: ["Elegant oval shape", "UV resistant material", "Easy installation", "Lifetime activation"],
      },
    ],
  },
  {
    slug: "pet-tags",
    name: "Pet Tags",
    description: "Attach to any pet collar — instant QR scan reveals owner info to finders.",
    icon: "🐾",
    coverImage: keytagTeal,
    gradient: "from-teal-500/20 to-emerald-500/10",
    products: [
      {
        id: "pet-tag-teal",
        title: "Smart Pet Tag – Teal",
        price: "₹299",
        originalPrice: "₹349",
        image: keytagTeal,
        popular: true,
        features: ["Vibrant teal colour", "Attach to any pet collar", "Quick scan for owner info", "Waterproof & lifetime activation"],
      },
      {
        id: "pet-tag-red",
        title: "Smart Pet Tag – Red",
        price: "₹299",
        originalPrice: "₹349",
        image: keytagRed,
        features: ["Bold red design", "Attach to any pet collar", "Quick scan for owner info", "Waterproof & lifetime activation"],
      },
    ],
  },
  {
    slug: "nfc-cards",
    name: "NFC Cards",
    description: "Custom-designed NFC-enabled smart cards — tap to share contact or social profile.",
    icon: "💳",
    coverImage: nfcShinchan,
    gradient: "from-sky-500/20 to-blue-500/10",
    products: [
      {
        id: "nfc-shinchan",
        title: "NFC Card – Shin-chan",
        price: "₹399",
        originalPrice: "₹499",
        image: nfcShinchan,
        popular: true,
        features: ["Fun Shin-chan anime design", "NFC + QR code enabled", "Premium PVC material", "Lifetime activation"],
      },
      {
        id: "nfc-onepiece",
        title: "NFC Card – One Piece",
        price: "₹399",
        originalPrice: "₹499",
        image: nfcOnepiece,
        features: ["One Piece Luffy design", "NFC + QR code enabled", "Premium PVC material", "Lifetime activation"],
      },
      {
        id: "nfc-phoenix",
        title: "NFC Card – Phoenix Dark",
        price: "₹399",
        originalPrice: "₹499",
        image: nfcPhoenix,
        features: ["Sleek dark phoenix design", "NFC + QR code enabled", "Premium PVC material", "Lifetime activation"],
      },
      {
        id: "nfc-mindset",
        title: "NFC Card – Mindset",
        price: "₹399",
        originalPrice: "₹499",
        image: nfcMindset,
        features: ["Motivational chess design", "NFC + QR code enabled", "Premium PVC material", "Lifetime activation"],
      },
      {
        id: "nfc-youcan",
        title: "NFC Card – You Can",
        price: "₹399",
        originalPrice: "₹499",
        image: nfcYoucan,
        features: ["Inspirational quote design", "NFC + QR code enabled", "Premium PVC material", "Lifetime activation"],
      },
    ],
  },
  {
    slug: "keychain-tags",
    name: "Keychain Tags",
    description: "Sturdy metal keychain tags with embedded QR to identify & return lost keys.",
    icon: "🔑",
    coverImage: keytagBlack,
    gradient: "from-slate-500/20 to-zinc-500/10",
    products: [
      {
        id: "keytag-black",
        title: "Keychain Tag – Black",
        price: "₹179",
        originalPrice: "₹199",
        image: keytagBlack,
        popular: true,
        features: ["Classic black design", "Durable metal body", "Water resistant", "Lifetime QR activation"],
      },
      {
        id: "keytag-navy",
        title: "Keychain Tag – Navy",
        price: "₹179",
        originalPrice: "₹199",
        image: keytagNavy,
        features: ["Elegant navy colour", "Durable metal body", "Water resistant", "Lifetime QR activation"],
      },
      {
        id: "keytag-red",
        title: "Keychain Tag – Red",
        price: "₹179",
        originalPrice: "₹199",
        image: keytagRed,
        features: ["Vibrant red design", "Durable metal body", "Water resistant", "Lifetime QR activation"],
      },
      {
        id: "keytag-teal",
        title: "Keychain Tag – Teal",
        price: "₹179",
        originalPrice: "₹199",
        image: keytagTeal,
        features: ["Refreshing teal colour", "Durable metal body", "Water resistant", "Lifetime QR activation"],
      },
    ],
  },
  {
    slug: "backpack-stickers",
    name: "Backpack & Laptop Stickers",
    description: "Stylish stickers with embedded QR to help return lost bags and laptops.",
    icon: "🎒",
    coverImage: backpackSticker,
    gradient: "from-gray-500/20 to-neutral-500/10",
    products: [
      {
        id: "backpack-sticker-standard",
        title: "Backpack Sticker – Standard",
        price: "₹199",
        originalPrice: "₹249",
        image: backpackSticker,
        popular: true,
        features: ["Sleek motivational design", "Easy peel-and-stick", "UV & water resistant", "Lifetime QR activation"],
      },
      {
        id: "bag-tag-square-black",
        title: "Bag Tag – Square Black",
        price: "₹189",
        originalPrice: "₹249",
        image: tagSquareBlack,
        features: ["Minimalist black design", "Sturdy PVC material", "Attaches to any bag", "Lifetime QR activation"],
      },
      {
        id: "bag-tag-square-yellow",
        title: "Bag Tag – Square Yellow",
        price: "₹189",
        originalPrice: "₹249",
        image: tagSquareYellow,
        features: ["Bright yellow PingME design", "Sturdy PVC material", "Attaches to any bag", "Lifetime QR activation"],
      },
    ],
  },
];

// ─── Components ─────────────────────────────────────────

const ProductCardItem = ({ product }: { product: ProductVariant }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      emoji: product.emoji,
    });
    toast({ title: "Added to Cart", description: `${product.title} was added to your cart.` });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className={`bg-card rounded-2xl p-5 border transition-all hover:shadow-xl flex flex-col h-full relative group cursor-pointer ${
          product.popular ? "border-primary/60 border-2 shadow-md" : "border-border"
        }`}>
          {product.popular && (
            <span className="absolute top-4 right-4 z-10 px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-bold shadow-sm">
              Best Seller
            </span>
          )}

          <div className="aspect-[4/3] bg-secondary/40 rounded-xl mb-5 flex items-center justify-center p-3 overflow-hidden transition-colors group-hover:bg-secondary/70">
            {product.image ? (
              <img src={product.image} alt={product.title} className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105" />
            ) : (
              <span className="text-6xl transition-transform duration-300 group-hover:scale-110">{product.emoji}</span>
            )}
          </div>

          <h3 className="font-bold text-base mb-1.5 leading-tight group-hover:text-primary transition-colors">{product.title}</h3>
          <div className="flex items-end gap-2 mb-4">
            <span className="text-xl font-black text-primary">{product.price}</span>
            {product.originalPrice && <span className="text-muted-foreground line-through text-sm mb-0.5">{product.originalPrice}</span>}
          </div>

          <p className="text-sm text-foreground/75 mt-auto">Click to view details</p>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-card rounded-2xl">
        <div className="bg-secondary/30 p-8 flex justify-center items-center relative">
          {product.popular && (
            <span className="absolute top-4 left-4 z-10 px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-bold shadow-sm">
              Best Seller
            </span>
          )}
          {product.image ? (
            <img src={product.image} alt={product.title} className="max-h-[300px] object-contain drop-shadow-xl" />
          ) : (
            <span className="text-9xl">{product.emoji}</span>
          )}
        </div>
        <div className="p-6">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-2xl font-bold">{product.title}</DialogTitle>
          </DialogHeader>
          
          <div className="flex items-end gap-3 mb-6">
            <span className="text-3xl font-black text-primary">{product.price}</span>
            {product.originalPrice && (
              <span className="text-muted-foreground line-through text-lg mb-1">{product.originalPrice}</span>
            )}
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Key Features</h4>
            <ul className="space-y-3">
              {product.features.map((feature, i) => (
                <li key={i} className="text-sm font-medium flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary shrink-0" />
                  <span className="leading-snug">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20" onClick={() => {
            handleAddToCart();
            // Optional: You could close the dialog here by controlling the dialog state, 
            // but for simplicity it stays open and shows toast.
          }}>
            Add to Cart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── Main Component ─────────────────────────────────────

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const activeCategory = categories.find(c => c.slug === selectedCategory);

  return (
    <MainLayout>
      <div className="py-16 md:py-24">
        <div className="container">

          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-block py-1.5 px-4 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-wider uppercase mb-4">
              Our Products
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              {selectedCategory ? activeCategory?.name : "Explore PingME Tags"}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto md:text-lg">
              {selectedCategory
                ? activeCategory?.description
                : "Choose a category to explore our range of smart NFC & QR-enabled tags for every use-case."}
            </p>
          </div>

          {/* Back Button when inside a category */}
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-2 mb-10 text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium">Back to All Categories</span>
            </button>
          )}

          {/* ── Category Grid (Landing View) ── */}
          {!selectedCategory && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`group relative rounded-2xl border border-border bg-gradient-to-br ${cat.gradient} p-6 text-left transition-all hover:shadow-xl hover:border-primary/40 hover:scale-[1.02] active:scale-[0.98] overflow-hidden`}
                >
                  {/* Cover Image */}
                  <div className="aspect-[16/10] rounded-xl bg-white/60 dark:bg-white/10 mb-5 flex items-center justify-center p-4 overflow-hidden">
                    <img
                      src={cat.coverImage}
                      alt={cat.name}
                      className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{cat.icon}</span>
                        <h3 className="font-bold text-lg">{cat.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{cat.description}</p>
                      <span className="inline-block mt-3 text-xs font-medium text-primary">
                        {cat.products.length} design{cat.products.length > 1 ? "s" : ""} available
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ── Product Grid (Category View) ── */}
          {selectedCategory && activeCategory && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {activeCategory.products.map((product) => (
                <ProductCardItem key={product.id} product={product} />
              ))}
            </div>
          )}

        </div>
      </div>
    </MainLayout>
  );
};

export default Products;
