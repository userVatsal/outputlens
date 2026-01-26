

# Remove Lovable Badge & Add OutputLens Favicon

## Overview

This plan implements two quick changes:
1. **Hide the "Edit with Lovable" badge** on the published website using a CSS rule
2. **Use the OutputLens logo as the favicon** for browser tabs and bookmarks

---

## What We're Changing

### 1. Hide Lovable Badge

The "Edit with Lovable" badge is injected with ID `lovable-badge`. We'll hide it globally via CSS.

**File**: `src/index.css`

Add to the existing `@layer base` block:
```css
#lovable-badge {
  display: none !important;
}
```

### 2. Update Favicon to OutputLens Logo

Currently using a generic `favicon.ico`. We'll:
1. Copy the existing `src/assets/logo.png` to `public/` for static access
2. Update `index.html` to reference the logo as favicon

**Files**:
- Copy `src/assets/logo.png` → `public/logo.png`
- Update `index.html` to add favicon link

---

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `src/index.css` | Modify | Add CSS rule to hide `#lovable-badge` |
| `public/logo.png` | Create | Copy logo from src/assets for static serving |
| `index.html` | Modify | Add favicon link to logo.png |

---

## Technical Details

### CSS Change (index.css)

```css
@layer base {
  /* ... existing styles ... */
  
  #lovable-badge {
    display: none !important;
  }
}
```

### Favicon HTML (index.html)

Add inside `<head>`:
```html
<link rel="icon" type="image/png" href="/logo.png" />
<link rel="apple-touch-icon" href="/logo.png" />
```

---

## Result

After these changes:
- The "Edit with Lovable" badge will be hidden on all pages
- Browser tabs will show the OutputLens logo instead of a generic icon
- Bookmarks and mobile home screen icons will use the OutputLens logo

