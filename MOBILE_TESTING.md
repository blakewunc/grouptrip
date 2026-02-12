# Mobile Responsiveness Testing Checklist

## Test Viewports
- ✓ 320px (iPhone SE, small phones)
- ✓ 375px (iPhone standard)
- ✓ 768px (iPad portrait)
- ✓ 1024px (iPad landscape, desktop)

## Pages to Test

### Landing Page (/)
- [ ] Hero section stacks properly on mobile
- [ ] Feature cards are full-width on mobile, 3-column on tablet+
- [ ] CTA buttons are full-width on mobile
- [ ] Text is readable (min 16px font size)

### Authentication (/login, /signup)
- [ ] Forms are full-width with proper padding
- [ ] Input fields are min 44px height
- [ ] Submit buttons are full-width on mobile
- [ ] Error messages don't overflow

### Trip List (/trips)
- [ ] Trip cards stack vertically on mobile
- [ ] 2-column grid on tablet+
- [ ] Card content doesn't overflow
- [ ] Action buttons are accessible

### Trip Detail (/trips/[id])
- [ ] 2-column layout stacks on mobile
- [ ] All cards are full-width on mobile
- [ ] Navigation tabs scroll horizontally if needed
- [ ] Member avatars don't cause horizontal scroll

### Trip Creation (/trips/new)
- [ ] Form is single column on all mobile sizes
- [ ] Date inputs are properly sized
- [ ] Select dropdown works on touch devices
- [ ] Form doesn't cause horizontal scroll

### Budget Page
- [ ] Budget categories list is mobile-friendly
- [ ] Split calculator UI is usable on small screens
- [ ] Tables scroll horizontally with proper indicators
- [ ] Add/edit dialogs fit on screen

### Itinerary Page
- [ ] Day-by-day view stacks properly
- [ ] Comment section is touch-friendly
- [ ] Time inputs work on mobile
- [ ] Add item dialog fits screen

### Expenses Page
- [ ] Expense list is readable
- [ ] Balance sheet table scrolls properly
- [ ] Add expense form is mobile-optimized
- [ ] Settlement suggestions are clear

### Golf/Ski Modules
- [ ] Tee time cards stack on mobile
- [ ] Equipment checklists are touch-friendly
- [ ] Scorecard input works on small screens
- [ ] Ability level groups display properly

### Settings Page
- [ ] Profile form is single column
- [ ] Input fields are properly sized
- [ ] Sign out button is accessible
- [ ] Account sections stack properly

## Component Checks

### Navigation
- ✓ Hamburger menu on mobile (if implemented)
- ✓ Desktop navigation on tablet+
- ✓ Logo/brand is visible and sized properly
- ✓ User menu is accessible on all sizes

### Dialogs/Modals
- ✓ Dialogs have max-width and padding
- ✓ Content scrolls if too tall (max-h-90vh)
- ✓ Close button is min 44x44px
- ✓ Backdrop prevents scroll on body

### Forms
- ✓ Input fields are min h-11 (44px)
- ✓ Labels are above inputs on mobile
- ✓ Buttons are min 44px height
- ✓ Error messages display without breaking layout

### Cards
- ✓ Cards have proper min/max width
- ✓ Card content has adequate padding (p-4 on mobile, p-6 on desktop)
- ✓ Card images are responsive
- ✓ Card actions don't overflow

### Tables
- ✓ Tables scroll horizontally on mobile
- ✓ Scroll indicators are visible
- ✓ Important columns are sticky if needed
- ✓ Table actions are touch-friendly

## Touch Target Guidelines
✓ All interactive elements min 44x44px
✓ Adequate spacing between touch targets (min 8px)
✓ No hover-only interactions
✓ Clear focus states for keyboard navigation

## Typography
✓ Body text min 16px (prevents zoom on iOS)
✓ Headings scale proportionally
✓ Line height min 1.5 for readability
✓ Text doesn't overflow containers

## Images & Media
✓ Images are responsive (max-w-full)
✓ Aspect ratios are maintained
✓ Loading states for images
✓ Optimized file sizes

## Performance
✓ Page load < 3s on 3G
✓ No layout shift (CLS score)
✓ Smooth scrolling
✓ Animations are performant (60fps)

## Accessibility
✓ Color contrast meets WCAG AA (4.5:1)
✓ Focus indicators visible
✓ Semantic HTML
✓ Alt text for images
✓ Keyboard navigation works
✓ Screen reader friendly

## Browser Testing
- [ ] Chrome mobile
- [ ] Safari iOS
- [ ] Firefox mobile
- [ ] Samsung Internet

## Common Issues to Fix
- Horizontal scroll on small screens
- Text too small to read
- Touch targets too close together
- Forms causing layout issues
- Modals not fitting on screen
- Images not responsive
- Navigation breaking on mobile
