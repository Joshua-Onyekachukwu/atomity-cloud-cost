# ATOMITY — Frontend Engineering Challenge

## Objective

You have received a short product video demonstrating Atomity's cloud optimization platform.

Your task: **select one feature from the options below** and recreate it as an animated, scroll-triggered section inside a single webpage.

This challenge evaluates your frontend engineering fundamentals, animation craftsmanship, code structure, and ability to interpret a product into UI.

---

## Choose One Feature

Watch the video and pick **one** of the following two segments:

- **Option A** — the section shown between **0:30–0:40** in the video
- **Option B** — the section shown between **0:45–0:55** in the video

**Important:** These video segments are references, not blueprints. They show you the *type* of feature we want you to build and not the exact output we expect. We are looking for your interpretation, your creativity, and your design thinking.

Do **not** give us a pixel-perfect copy of what you see in the video. Take the concept and make it better, more interesting, or more engaging than what's shown. Show us something that makes us think "we didn't expect that."

The best submissions will surprise us.

---

## Time Limit

**6–8 hours maximum.** We value focus over scope. A polished single section beats a rough full page.

---

## Technical Stack

**Required:**
- React or Next.js
- An animation library: Framer Motion (preferred) or GSAP
- TypeScript (preferred, JavaScript accepted)

**Styling — choose one:**
- Tailwind CSS (preferred)
- CSS Modules
- Styled-components

**Components:**

Every UI element in your submission must be built by you. Do not import pre-made components from libraries like MUI, Chakra, Ant Design, or shadcn. If you need a card, build a card. If you need a badge, build a badge. We want to see how you think about component architecture from scratch.

**Not allowed:**
- Pre-built templates or starter kits
- Copying existing marketing sites

---

## Requirements

### 1. Design Token Approach

Do not hardcode colors as hex values scattered through components. Define a small token set and reference it everywhere.

**Example — define once:**
```ts
// tokens.ts
export const tokens = {
  colors: {
    bgPrimary: "var(--color-bg-primary)",
    textPrimary: "var(--color-text-primary)",
    accentPrimary: "var(--color-accent-primary)",
    accentSuccess: "var(--color-accent-success)",
    accentError: "var(--color-accent-error)",
  },
  // ... spacing, radius, etc.
} as const;
```

**Example — use in CSS variables:**
```css
:root {
  --color-bg-primary: #FFFFFF;
  --color-text-primary: #0E0F11;
  --color-accent-primary: #2F5BFF;
  --color-accent-success: #1F8A4C;
  --color-accent-error: #D93F3F;
}
```

Components should reference tokens, not raw hex values.

### 2. Data Fetching

Your section must fetch data from a public API and render it dynamically. Do not hardcode content into your components.

Use any public API such as:
- [JSONPlaceholder](https://jsonplaceholder.typicode.com)
- [DummyJSON](https://dummyjson.com)
- Any other public REST API

For example, if you're building KPI cards, fetch the numbers from an API. If you're building a feature showcase, fetch the titles and descriptions. The data doesn't need to be "real" cloud data — we want to see how you handle async state: loading, error, and success.

### 3. Caching Strategy

Fetched data should not re-request on every render or navigation. Implement a caching approach.

Acceptable methods:
- React Query / TanStack Query (preferred — shows you know the modern ecosystem)
- SWR
- Manual cache with `useState` + `useEffect` + a stale check
- Next.js built-in fetch caching (if using App Router)

We will check: does the network tab show redundant requests? Is there a loading state on first fetch and instant display on revisit?

### 4. Modern CSS

We want to see that you are aware of modern CSS capabilities. Where appropriate, use features like:
- CSS nesting (native, not Sass)
- Container queries (`@container`) for component-level responsiveness
- The `:has()` selector for parent-aware styling
- `color-mix()` for dynamic color variations
- Logical properties (`inline-size`, `block-size`, `margin-inline`)
- `clamp()` for fluid typography or spacing

You do not need to use all of these. Pick the ones that make sense for your feature. We are checking whether you reach for modern tools or default to outdated patterns. Use modern CSS where appropriate (e.g., container queries, clamp, logical properties). You are not required to use all features.

### 5. Component Structure

Build with reusable, composable components. No single monolithic file.

**Expected structure (example — adapt to your feature):**
```
src/
  tokens/
    colors.ts (or CSS variables file)
  components/
    FeatureSection.tsx
    AnimatedCard.tsx
    Badge.tsx
    ...
  hooks/
    useApiData.ts (or similar)
  pages/
    index.tsx
```

### 6. Responsive Layout

Must work well on:
- Desktop (1280px+)
- Tablet (768px)
- Mobile (375px)

### 7. Animation Quality

Animations should feel intentional, smooth, and physically natural.

**Good:**
- Scroll-triggered entrance with stagger
- Subtle hover feedback (scale, shadow, color shift)
- Number counting animations for data
- Eased transitions (ease-out, spring physics)

**Bad:**
- Everything animating at once
- Jittery or janky movement
- Excessive bounce or overshoot
- Animation for animation's sake

### 8. Accessibility Basics

We don't expect a full WCAG audit, but we do check:
- Semantic HTML (`<section>`, `<h2>`, `<nav>` — not all `<div>`)
- Sufficient color contrast (text must be readable)
- `prefers-reduced-motion` respected (disable or simplify animations)
- Interactive elements keyboard-accessible

### 9. Dark Mode Support (Bonus — Not Required)

If you have time, add a dark/light toggle. This demonstrates token architecture skill. Not required, but will be noticed.

---

## Deployment

Your project **must be deployed** and accessible via a public URL.

Recommended: **Vercel** (one-click deploy from GitHub)

Alternative: Netlify, Cloudflare Pages

---

## Submission

Submit the following:

1. **GitHub repository link** (public)
2. **Live demo URL**
3. **README.md** in the repo explaining:
   - Which feature you chose and why
   - Your approach to animation
   - How you structured tokens/styles
   - How you handled data fetching and caching
   - Libraries used and why
   - Any tradeoffs or decisions you made
   - What you would improve with more time

---

## Evaluation Criteria

| Criteria | Weight | What We Look For |
|----------|--------|-----------------|
| **Code quality** | 25% | Clean self-built components, logical separation, readable code, no dead code, consistent naming |
| **Animation craft** | 20% | Smooth scroll triggers, natural timing/easing, purposeful motion, performance (no jank) |
| **Responsiveness** | 15% | Works on desktop + tablet + mobile, no broken layouts, readable at all sizes |
| **Modern CSS & styling** | 15% | Token architecture, modern CSS features used appropriately, no scattered hardcoded values |
| **Data handling** | 15% | API integration, loading/error states, caching strategy, no redundant fetches |
| **Product thinking & docs** | 10% | Feature interpreted creatively, clear README, honest about tradeoffs |

### What Will Stand Out
- Clean token/variable architecture instead of scattered hex values
- Modern CSS features used naturally (not forced)
- Smart caching — instant on revisit, graceful loading on first fetch
- `prefers-reduced-motion` media query handled
- Intersection Observer or scroll-based triggers (not just load animations)
- Container queries for component-level responsiveness
- Meaningful commit history (not one giant commit)
- Thoughtful README that shows your thinking process
- Commit history matters. Please commit your work incrementally.

### What Will Disqualify
- Not deployed (no live URL)
- Clearly generated by AI without understanding (we will ask you to explain your code)
- Used pre-built UI component libraries (MUI, Chakra, shadcn, etc.) instead of building your own
- Used a pre-built template or copied from another site
- Single monolithic file with no component structure
- All data hardcoded with no API integration
- Repositories with a single large commit will be penalized.


---

## Questions?

If anything is unclear, email **career@atomity.de** before starting.

Good luck. We look forward to seeing your work.
