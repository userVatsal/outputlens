
# Plan: Enhance OutputLens Google Search Appearance

## Overview

Your current SEO setup is already solid. This plan adds specific enhancements to ensure the OutputLens logo appears in Google search results and improves overall search visibility.

## Current Status (Already Configured)
- Title: "OutputLens: AI Risk & Scenario Intelligence | Monte Carlo Simulation"
- Meta description with OutputLens branding
- Favicon set to `/logo.png`
- Open Graph image for social sharing
- Basic Schema.org structured data

## Enhancements to Make

### 1. Add Logo URL to Organization Schema
Google uses the `logo` property in Organization schema to display logos in Knowledge Panels and search results.

**Change in `index.html`:**
Add `"logo": "https://outputlens.com/logo.png"` to the Organization schema

### 2. Add WebSite Schema for Sitelinks
This helps Google understand the site structure and may enable sitelinks in search results.

**Add to Schema.org in `index.html`:**
```json
{
  "@type": "WebSite",
  "name": "OutputLens",
  "url": "https://outputlens.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://outputlens.com/workspace?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

### 3. Add Additional Favicon Sizes
For better cross-platform support, add multiple favicon sizes:
- 16x16, 32x32 (standard)
- 192x192, 512x512 (Android/PWA)

**Note:** This requires creating additional logo sizes. For now, I'll add references that will work with your existing `/logo.png`.

### 4. Ensure Logo in SoftwareApplication Schema
Add `"image"` property to link the logo for the application listing.

## Technical Changes

| File | Change |
|------|--------|
| `index.html` | Add `logo` to Organization schema |
| `index.html` | Add `WebSite` schema for sitelinks |
| `index.html` | Add `image` to SoftwareApplication schema |
| `index.html` | Add additional favicon link tags for various sizes |

## Implementation Details

The Schema.org Organization will be updated to:
```json
{
  "@type": "Organization",
  "name": "OutputLens",
  "url": "https://outputlens.com",
  "logo": "https://outputlens.com/logo.png",
  "description": "...",
  "sameAs": []
}
```

## Important Note About Google

After publishing:
1. **Indexing delay**: Google takes time to crawl and update search results (days to weeks)
2. **Logo display**: Google doesn't guarantee logo display; it depends on various factors
3. **Verify in Search Console**: You can use Google Search Console to verify your structured data is being read correctly

## Files to Modify
- `index.html` - Update Schema.org structured data with logo references and WebSite schema
