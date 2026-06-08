import pNecklace from "@/assets/product-necklace.jpg";
import pEarrings from "@/assets/product-earrings.jpg";
import pBangles from "@/assets/product-bangles.jpg";
import pRing from "@/assets/product-ring.jpg";
import pMangal from "@/assets/product-mangalsutra.jpg";

export const categoryFallbackImage: Record<string, string> = {
  necklaces: pNecklace,
  earrings: pEarrings,
  bangles: pBangles,
  rings: pRing,
  mangalsutra: pMangal,
};

export const defaultFallback = pNecklace;