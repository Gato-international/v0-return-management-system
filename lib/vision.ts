"use server"

/**
 * Google Cloud Vision integration for return image validation.
 *
 * Validates that uploaded images are:
 *  1. Real camera photos (not screenshots)
 *  2. Contain actual products (not random images)
 *
 * Uses the Vision API Safe Search + Label + Web detection.
 *
 * Required env: GOOGLE_VISION_API_KEY
 */

const VISION_API_URL = "https://vision.googleapis.com/v1/images:annotate"

export interface VisionValidationResult {
  isValid: boolean
  isScreenshot: boolean
  isProductPhoto: boolean
  confidence: number
  labels: string[]
  reasons: string[]
}

/**
 * Analyze an image using Google Cloud Vision API
 * Accepts a public URL or base64 encoded image.
 */
export async function validateReturnImage(imageUrl: string): Promise<VisionValidationResult> {
  const apiKey = process.env.GOOGLE_VISION_API_KEY
  if (!apiKey) {
    console.warn("[Vision] No GOOGLE_VISION_API_KEY set — skipping validation")
    return {
      isValid: true,
      isScreenshot: false,
      isProductPhoto: true,
      confidence: 1,
      labels: [],
      reasons: ["Vision API key not configured — validation skipped"],
    }
  }

  try {
    const requestBody = {
      requests: [
        {
          image: { source: { imageUri: imageUrl } },
          features: [
            { type: "LABEL_DETECTION", maxResults: 15 },
            { type: "WEB_DETECTION", maxResults: 5 },
            { type: "IMAGE_PROPERTIES" },
            { type: "SAFE_SEARCH_DETECTION" },
          ],
        },
      ],
    }

    const response = await fetch(`${VISION_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error("[Vision] API error:", errText)
      return {
        isValid: true,
        isScreenshot: false,
        isProductPhoto: true,
        confidence: 0.5,
        labels: [],
        reasons: ["Vision API call failed — allowing image"],
      }
    }

    const data = await response.json()
    const result = data.responses?.[0]
    if (!result) {
      return {
        isValid: true,
        isScreenshot: false,
        isProductPhoto: true,
        confidence: 0.5,
        labels: [],
        reasons: ["No Vision response — allowing image"],
      }
    }

    // ── Extract labels ───────────────────────────────────────
    const labels: string[] = (result.labelAnnotations || []).map(
      (l: any) => l.description?.toLowerCase() || ""
    )

    // ── Screenshot detection ─────────────────────────────────
    // Screenshots typically have: "screenshot", "display", "screen",
    // "software", "multimedia", "text", "font", "graphic design"
    const screenshotKeywords = [
      "screenshot", "screen capture", "display device", "computer monitor",
      "laptop", "multimedia software", "graphic design", "web page",
      "software", "operating system", "user interface", "desktop computer",
    ]
    const screenshotHits = labels.filter((l) =>
      screenshotKeywords.some((kw) => l.includes(kw))
    )
    const isScreenshot = screenshotHits.length >= 2

    // Also check web detection for "full matching images" which suggests
    // the image is from elsewhere on the internet
    const webDetection = result.webDetection || {}
    const fullMatchingImages = webDetection.fullMatchingImages || []
    const isStockImage = fullMatchingImages.length >= 2

    // ── Product photo detection ──────────────────────────────
    // Real product photos typically contain: "product", "shoe", "clothing",
    // "box", "packaging", "sportswear", "textile", "footwear", etc.
    const productKeywords = [
      "product", "shoe", "footwear", "clothing", "sportswear", "textile",
      "box", "packaging", "parcel", "shipping", "sneaker", "boot",
      "apparel", "fashion", "bag", "accessory", "equipment", "goods",
      "jersey", "shirt", "jacket", "pants", "cap", "hat", "ball",
      "glove", "sock", "material", "fabric", "leather", "rubber",
      "item", "merchandise", "retail", "package",
    ]
    const productHits = labels.filter((l) =>
      productKeywords.some((kw) => l.includes(kw))
    )
    const isProductPhoto = productHits.length >= 1

    // ── Build reasons ────────────────────────────────────────
    const reasons: string[] = []
    if (isScreenshot) {
      reasons.push(`Screenshot detected (matched: ${screenshotHits.join(", ")})`)
    }
    if (isStockImage) {
      reasons.push(`Image appears to be from the internet (${fullMatchingImages.length} matching sources)`)
    }
    if (!isProductPhoto && labels.length > 0) {
      reasons.push(`No product detected in image (labels: ${labels.slice(0, 5).join(", ")})`)
    }

    const isValid = !isScreenshot && !isStockImage && (isProductPhoto || labels.length === 0)
    const confidence = isValid
      ? Math.min(1, 0.5 + productHits.length * 0.1)
      : Math.max(0, 0.5 - reasons.length * 0.15)

    return {
      isValid,
      isScreenshot,
      isProductPhoto,
      confidence,
      labels: labels.slice(0, 10),
      reasons: reasons.length > 0 ? reasons : ["Image passed all checks"],
    }
  } catch (error) {
    console.error("[Vision] Error:", error)
    return {
      isValid: true,
      isScreenshot: false,
      isProductPhoto: true,
      confidence: 0.5,
      labels: [],
      reasons: ["Vision validation error — allowing image"],
    }
  }
}
