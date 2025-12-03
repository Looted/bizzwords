# BizzWords Brand Identity Sheet

## 1. Brand Essence
**"Professionalism, Gamified."**
The design sits at the intersection of enterprise software (clean, trustworthy, efficient) and consumer learning apps (engaging, colorful, soft).

## 2. Color Palette
Your current primary blue is vivid and energetic. The strategy here is to pair it with a "Focus" palette for high contrast and a "Category" palette for different learning topics (like HR, Management, Finance).

### Primary System
*   **Bizz Blue (Primary Brand):** `#4355FA`
    *   *Usage:* Primary buttons, Logo background, active states, key headers.
*   **Deep Navy (Dark Mode Background):** `#111827`
    *   *Usage:* The main background for dark mode (avoid pure black for less eye strain).
*   **Paper White (Light Mode Background):** `#F3F4F6`
    *   *Usage:* Light mode background (slightly off-white to reduce glare).

### Secondary & Action
*   **Review Amber:** `#F59E0B`
    *   *Usage:* Notifications, "Review Needed" tags (as seen in your UI), streaks/gamification elements.
*   **Success Green:** `#10B981`
    *   *Usage:* Correct answers, mastery indicators, progress bars.
*   **Error Red:** `#EF4444`
    *   *Usage:* Incorrect answers, critical alerts.

### Learning Track Gradients (Soft UI)
These colors are for the icon containers (like the HR and Project Management icons in your screenshots). They should be used as pastels in Light Mode and slightly desaturated in Dark Mode.
*   **HR Purple:** `#8B5CF6` (Background: `#F3E8FF`)
*   **Management Blue:** `#3B82F6` (Background: `#DBEAFE`)
*   **Finance Teal:** `#14B8A6` (Background: `#CCFBF1`)
*   **Marketing Pink:** `#EC4899` (Background: `#FCE7F3`)

---

## 3. Typography System
Your screenshots suggest a geometric Sans-Serif font. To maintain a professional yet modern look, I recommend a pairing of **Poppins** (Headings) and **Inter** (Body).

**Headlines: Poppins (SemiBold / Bold)**
*   *Why:* The geometric roundness matches your logo cards and container shapes. It feels friendly but sturdy.
*   *Usage:* "Master Business Lingo", "Continue Learning", Card Titles.

**Body Copy: Inter (Regular / Medium)**
*   *Why:* Inter is the gold standard for UI readability. It is neutral and highly legible on small screens.
*   *Usage:* Definitions, example sentences, UI labels (Difficulty: Easy).

**Type Hierarchy Example:**
*   **H1:** Poppins Bold, 28px (Hero Text)
*   **H2:** Poppins SemiBold, 20px (Section Headers)
*   **Body:** Inter Regular, 16px (Card Content)
*   **Caption:** Inter Medium, 12px (Tags like "HR Words")

---

## 4. Iconography
The current icons are flat and contained within rounded squares (squaricles).

**Recommended Style: "Flat Duotone with Soft Corners"**
*   **Container:** Always use the "Squaricle" shape (a square with heavy rounded corners) for category icons to match the playing cards in your logo.
*   **Style:** Filled icons (not stroked/outlined). Filled icons are easier to recognize quickly during flashcard sessions.
*   **Coloring:** Use a "Duotone" approach where the icon uses two shades of the same color (e.g., a dark purple person icon on a light purple background).
*   **Library Recommendation:**
    *   *Free:* **Phosphor Icons** (Fill weight) or **Material Icons** (Rounded).
    *   *Premium:* **Streamline Core** (Bold).

---

## 5. UI/UX Design Principles

### Principle 1: The "Card" is King
Since the logo represents flashcards, the entire UI should be built around the concept of **Cards**.
*   **Elevation:** In Light Mode, use subtle drop shadows on white cards to lift them off the gray background.
    *   *Shadow CSS:* `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);`
*   **Borders:** In Dark Mode, drop shadows vanish. Use a thin (1px), subtle border on cards to separate them from the background.
    *   *Dark Border:* `#374151` (Dark Gray).

### Principle 2: "Business-Casual" Aesthetics
The app is for professionals, so it shouldn't look childish, but it shouldn't look like a spreadsheet either.
*   **Corner Radius:** Use generous corner radii (12px to 16px) on buttons and cards. This mirrors the friendly "B" in your logo.
*   **Whitespace:** Business professionals are busy. Use ample padding. Don't crowd the interface.

### Principle 3: Adaptive Contrast
Your screenshots show a great start on Dark Mode. Ensure accessibility meets WCAG standards.
*   **Text Colors:**
    *   Light Mode Text: `#1F2937` (Dark Grey - never use pure black).
    *   Dark Mode Text: `#F9FAFB` (Off-white - never use pure white on dark backgrounds as it causes "haloing").

### Principle 4: Micro-Interactions
To make vocabulary drills addictive:
*   **Button Press:** Buttons should physically scale down slightly (95%) when tapped.
*   **Completion:** When a "deck" is finished, use a confetti animation using the brand colors (Blue, Amber, Green).
