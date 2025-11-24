/**
 * Composable to normalize image URLs
 * Fixes URLs that point to localhost in production
 */
export const useImageUrl = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string

  /**
   * Normalizes an image URL by replacing localhost with the correct API URL
   */
  const normalizeImageUrl = (url: string | null | undefined): string | null => {
    if (!url) return null
    
    // If URL already starts with http:// or https://, check if it's localhost
    if (url.startsWith('http://localhost:3000') || url.startsWith('https://localhost:3000')) {
      // Replace localhost:3000 with the correct API base URL
      return url.replace(/https?:\/\/localhost:3000/, apiBase)
    }
    
    // If URL is relative (starts with /), prepend API base
    if (url.startsWith('/uploads/')) {
      return `${apiBase}${url}`
    }
    
    // Otherwise return as-is (external URL or already correct)
    return url
  }

  return {
    normalizeImageUrl,
  }
}

