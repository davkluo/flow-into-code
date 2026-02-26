# flow-into-code — Claude Notes

## Commit Preferences
- Short, lowercase imperative message (e.g. `add completed indicator to problems table`)
- No "Co-Authored-By" / Claude tags
- Stage specific files — never `git add -A` or `git add .`

---

## Task 3: Mobile-Friendly ChatBox with Slide-In Panel

### Overview
The `ChatBox` component (`src/components/pages/ChatBox.tsx`) is currently inline within the
section layout. On mobile it should collapse into a panel toggled by a floating/side button.

### Current state
- `ChatBox` accepts `layoutMode: "grow" | "fixed"` — designed for desktop column layouts
- No mobile-specific behavior exists yet
- The component is used within `PracticeSession.tsx` section views

### Desired behavior
- On mobile: chat is hidden by default; a button (floating or edge-anchored) shows/hides it as an overlay or slide-in drawer
- On desktop: existing behavior unchanged
- The toggle button should be visually distinct and accessible

### Suggested approach
- Use a Radix `Sheet` component (already likely available via shadcn) for the slide-in drawer on mobile
- Use a `useMediaQuery` hook or Tailwind's responsive classes to switch between modes
- Keep the toggle button fixed to the screen edge (e.g. bottom-right) on mobile

---

## Task 4: Refactor Timer UI + Move Section Navigation Next to It

### Overview
The Timer bar is fixed to the bottom of the screen (`src/components/pages/Timer.tsx`). The
session section navigation (currently in `SessionBreadcrumb` at the top) should move to sit
alongside the timer in that bottom bar.

### Current state
- `Timer` — fixed bottom bar (`fixed bottom-0 left-0 z-50 h-16 w-full`), contains: time display, progress bar, play/pause/reset/settings buttons
- `SessionBreadcrumb` (`src/components/pages/SessionBreadcrumb.tsx`) — rendered at the top of the session, shows problem title + section tabs as breadcrumb buttons; driven by `currentSectionIndex`, `highestVisitedIndex`, `onSectionClick`

### Desired outcome
- Section navigation sits in the bottom bar alongside (or replacing the top breadcrumb for) the timer
- The bottom bar may need to grow or restructure to accommodate both
- Consider whether the top breadcrumb is removed entirely or kept as a simpler title-only display
