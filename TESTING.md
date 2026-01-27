# Manual Testing Checklist - Menu Create MVP

This document provides a comprehensive manual testing checklist for the Menu Create application. Execute all tests before considering the MVP complete.

## Testing Environment Setup

Before testing, ensure:
- [ ] PostgreSQL is running (`npm run docker:up`)
- [ ] Database is migrated (`npm run db:migrate:dev`)
- [ ] Database is seeded (`npm run db:seed`)
- [ ] Development server is running (`npm run dev`)
- [ ] Browser DevTools console is open for error monitoring

## Default Test Credentials

**Super Admin:**
- Email: `admin@menu.local`
- Password: `admin123`

**Test Tenant User** (create during testing):
- Will be created in onboarding flow

---

## 1. Authentication Flow

### Login
- [ ] Can login with correct super admin credentials
- [ ] Login fails with incorrect email
- [ ] Login fails with incorrect password
- [ ] Error messages are clear and displayed via toast
- [ ] Password field is masked
- [ ] Form validates required fields

### Session Persistence
- [ ] After login, session persists on page refresh
- [ ] Session persists on browser tab close/reopen (within 7 days)
- [ ] Closing browser and reopening maintains session

### Logout
- [ ] Logout button is visible in navigation
- [ ] Clicking logout redirects to login page
- [ ] After logout, cannot access protected routes
- [ ] After logout, login page shows no errors

### Route Protection
- [ ] Accessing `/admin/*` without login redirects to `/login`
- [ ] Accessing `/` (tenant dashboard) without login redirects to `/login`
- [ ] Accessing `/menu` without login redirects to `/login`
- [ ] Super admin cannot access tenant routes (`/`, `/menu`, `/settings`)
- [ ] Tenant user cannot access admin routes (`/admin/*`)

---

## 2. Onboarding Flow (New Tenant Creation)

### Step 1: Welcome
- [ ] Welcome page displays correctly
- [ ] "Get Started" button is visible
- [ ] Clicking "Get Started" goes to Step 2

### Step 2: Restaurant Information
- [ ] Form displays: Restaurant Name, Description fields
- [ ] Restaurant Name is required (shows error if empty)
- [ ] Slug is auto-generated from name (e.g., "My Restaurant" → "my-restaurant")
- [ ] Slug validation shows error if slug already exists
- [ ] Can manually edit slug
- [ ] "Next" button is enabled when form is valid
- [ ] Clicking "Next" goes to Step 3

### Step 3: Contact Details
- [ ] Form displays: Email, Phone, Address fields
- [ ] Email validation works (invalid email shows error)
- [ ] Phone accepts various formats
- [ ] Can skip optional fields
- [ ] "Next" button goes to Step 4

### Step 4: Template Selection
- [ ] All 4 templates are displayed: Classic, Modern, Minimal, Elegant
- [ ] Template cards show preview or description
- [ ] Can select a template (visual indication of selection)
- [ ] "Complete Setup" button creates restaurant and settings
- [ ] After completion, redirects to tenant dashboard
- [ ] Toast notification confirms successful setup

### Post-Onboarding Verification
- [ ] Restaurant is created in database
- [ ] Restaurant settings are created with selected template
- [ ] User is associated with the restaurant
- [ ] Can immediately access `/menu` and `/settings`

---

## 3. Menu Editor (Tenant User)

### Categories

#### Create Category
- [ ] "Add Category" button is visible
- [ ] Clicking opens create category modal/form
- [ ] Form has: Name (required), Description (optional)
- [ ] Name validation: shows error if empty
- [ ] Creating category adds it to the list
- [ ] New category appears at the bottom (highest displayOrder)
- [ ] Toast confirms successful creation

#### Edit Category
- [ ] Each category has an "Edit" button
- [ ] Clicking "Edit" opens edit modal with pre-filled values
- [ ] Can change category name
- [ ] Can change category description
- [ ] Saving updates the category in the list
- [ ] Toast confirms successful update
- [ ] Changes reflect immediately without refresh

#### Delete Category
- [ ] Each category has a "Delete" button
- [ ] Clicking "Delete" shows confirmation dialog
- [ ] Confirmation message mentions category name
- [ ] Canceling confirmation keeps category
- [ ] Confirming deletion removes category from list
- [ ] All items in deleted category are also deleted (cascade soft delete)
- [ ] Toast confirms successful deletion

#### Drag & Drop Categories
- [ ] Can grab category by drag handle
- [ ] Dragging shows visual feedback (ghosting, placeholder)
- [ ] Can reorder categories by dragging up/down
- [ ] Releasing mouse commits the new order
- [ ] Order persists after page refresh
- [ ] Toast confirms successful reorder

### Menu Items

#### Create Item
- [ ] Each category has "Add Item" button
- [ ] Clicking opens create item modal
- [ ] Form has: Name (required), Description (optional), Base Price (optional)
- [ ] Name validation: shows error if empty
- [ ] Price validation: accepts decimal numbers (e.g., 12.50)
- [ ] Price validation: shows error for negative numbers
- [ ] Creating item adds it to the category
- [ ] New item appears at the bottom of the category
- [ ] Toast confirms successful creation

#### Edit Item
- [ ] Each item has an "Edit" button
- [ ] Clicking "Edit" opens edit modal with pre-filled values
- [ ] Can change item name
- [ ] Can change item description
- [ ] Can change item price
- [ ] Saving updates the item in the list
- [ ] Toast confirms successful update
- [ ] Changes reflect immediately without refresh

#### Delete Item
- [ ] Each item has a "Delete" button
- [ ] Clicking "Delete" shows confirmation dialog
- [ ] Confirmation message mentions item name
- [ ] Canceling confirmation keeps item
- [ ] Confirming deletion removes item from list
- [ ] Toast confirms successful deletion

#### Drag & Drop Items
- [ ] Can grab item by drag handle
- [ ] Dragging shows visual feedback
- [ ] Can reorder items within the same category
- [ ] Order persists after page refresh
- [ ] Toast confirms successful reorder

### Visibility Toggle
- [ ] Categories have visibility toggle (eye icon)
- [ ] Items have visibility toggle
- [ ] Hidden categories/items are visually indicated (grayed out)
- [ ] Hidden items don't appear in public menu
- [ ] Hidden categories don't appear in public menu

---

## 4. Restaurant Settings (Tenant User)

### Restaurant Information Section
- [ ] Section appears ABOVE "Template Selection"
- [ ] Form displays current restaurant info
- [ ] Can edit: Restaurant Name, Description, Contact Email, Contact Phone, Address
- [ ] Can edit: Facebook URL, Instagram Handle, TikTok Handle
- [ ] Email field validates email format
- [ ] "Save Changes" button is visible
- [ ] Clicking save shows loading state
- [ ] Successful save shows toast notification
- [ ] Changes persist after page refresh
- [ ] Validation errors show toast with details

### Template Selection
- [ ] Current template is highlighted
- [ ] All 4 templates are shown: Classic, Modern, Minimal, Elegant
- [ ] Can select a different template
- [ ] Changing template shows confirmation or saves immediately
- [ ] Preview updates to show new template
- [ ] Toast confirms template change

### Color Customization
- [ ] 5 color pickers are visible:
  - [ ] Primary Color
  - [ ] Secondary Color
  - [ ] Accent Color
  - [ ] Background Color
  - [ ] Text Color
- [ ] Each color picker shows current value
- [ ] Clicking color picker opens color selector
- [ ] Can input hex codes manually (e.g., #FF0000)
- [ ] Invalid hex codes show validation error
- [ ] Changing colors updates preview in real-time or after save
- [ ] "Save" button commits changes
- [ ] Toast confirms successful save

### Font Selection
- [ ] Heading Font dropdown shows available fonts
- [ ] Body Font dropdown shows available fonts
- [ ] Available fonts include: Inter, Cormorant, Lora, (others as configured)
- [ ] Changing font updates preview
- [ ] "Save" button commits changes
- [ ] Toast confirms successful save

### Settings Persistence
- [ ] All settings changes persist after page refresh
- [ ] Changes are applied to public menu immediately (or after ISR revalidation)

---

## 5. Preview & QR Code

### Preview
- [ ] Preview button/link is accessible from dashboard or menu editor
- [ ] Preview opens public menu in new tab or iframe
- [ ] Preview shows current template
- [ ] Preview shows current colors and fonts
- [ ] Preview shows all visible categories and items
- [ ] Preview hides items/categories marked as not visible
- [ ] "Refresh Preview" button updates preview with latest changes

### QR Code Generation
- [ ] QR code is displayed on dashboard or preview page
- [ ] QR code encodes correct URL (e.g., `http://localhost:3000/my-restaurant-slug`)
- [ ] QR code can be downloaded (PNG or SVG)
- [ ] Downloaded QR code scans correctly with phone camera
- [ ] Scanning QR code opens public menu

---

## 6. Public Menu (Public Route)

### Accessing Menu
- [ ] Can access menu via `http://localhost:3000/[slug]`
- [ ] Accessing invalid slug shows 404 page
- [ ] Accessing deleted restaurant shows 404 page

### Template Rendering
- [ ] Classic template renders correctly
- [ ] Modern template renders correctly
- [ ] Minimal template renders correctly
- [ ] Elegant template renders correctly (serif fonts, gold colors, ornamental dividers)

### Custom Colors
- [ ] Primary color is applied to headings/accents
- [ ] Secondary color is applied to descriptions
- [ ] Accent color is applied to dividers/borders
- [ ] Background color is applied to page background
- [ ] Text color is applied to body text

### Custom Fonts
- [ ] Heading font is applied to titles and category names
- [ ] Body font is applied to descriptions and item text
- [ ] Fonts load correctly (no flash of unstyled text)

### Content Display
- [ ] Restaurant name appears in header
- [ ] All visible categories appear in order
- [ ] All visible items appear under their categories in order
- [ ] Hidden categories/items do NOT appear
- [ ] Item names, descriptions, and prices display correctly
- [ ] Prices show 2 decimal places (e.g., $12.00)
- [ ] Items without prices show no price (or "Price on request")

### Paused Restaurant
- [ ] Accessing a paused restaurant shows "Service Unavailable" banner
- [ ] Banner explains the restaurant is temporarily paused
- [ ] Menu content is hidden when paused
- [ ] After unpause, menu becomes accessible again

### Mobile Responsiveness
- [ ] Public menu displays correctly on mobile (portrait)
- [ ] Public menu displays correctly on tablet (landscape)
- [ ] Text is readable at mobile sizes
- [ ] No horizontal scrolling required
- [ ] Touch interactions work (no hover-dependent features)

---

## 7. Admin Dashboard (Super Admin)

### Dashboard Overview
- [ ] Dashboard loads without errors
- [ ] KPIs are displayed:
  - [ ] Total Restaurants
  - [ ] Total Menu Views
  - [ ] Total Bandwidth
  - [ ] Active Users
- [ ] KPI values are accurate (match database counts)
- [ ] Top 5 restaurants by bandwidth are listed
- [ ] Quick actions are visible and functional

### Analytics
- [ ] Analytics show data for all restaurants
- [ ] Date range filter works (if implemented)
- [ ] Charts/graphs render correctly (if implemented)

---

## 8. Admin Tenant Management (Super Admin)

### View Tenants
- [ ] Tenants list loads without errors
- [ ] Table shows: Restaurant Name, Owner Email, Created At, Status, Actions
- [ ] Active tenants show status badge (green)
- [ ] Paused tenants show status badge (red/yellow)
- [ ] Tenant list is paginated (if many tenants exist)

### Create Tenant
- [ ] "Create Tenant" button is visible
- [ ] Clicking opens create tenant form
- [ ] Form has: Owner Email, Password, Restaurant Name, Slug
- [ ] Email validation works
- [ ] Slug validation prevents duplicates
- [ ] Creating tenant succeeds
- [ ] New tenant appears in list
- [ ] Toast confirms creation

### Pause Tenant
- [ ] Each active tenant has "Pause" action
- [ ] Clicking "Pause" opens dialog for reason
- [ ] Reason field is optional
- [ ] Pausing tenant updates status to "Paused"
- [ ] Paused tenant's public menu shows "Service Unavailable"
- [ ] Toast confirms pause

### Unpause Tenant
- [ ] Each paused tenant has "Unpause" action
- [ ] Clicking "Unpause" restores tenant
- [ ] Unpaused tenant's public menu becomes accessible
- [ ] Toast confirms unpause

### View Tenant Details
- [ ] Can click tenant row to view details
- [ ] Details show: owner info, restaurant info, menu stats
- [ ] Can navigate back to tenant list

---

## 9. Admin User Management (Super Admin)

### View Users
- [ ] Users list loads without errors
- [ ] Table shows: Email, Role, Restaurant, Created At, Actions
- [ ] Role badge displays correctly (super_admin = red, tenant_user = blue)
- [ ] Super admins are distinguishable from tenant users

### Filter by Role
- [ ] Role filter dropdown has options: All, Super Admin, Tenant User
- [ ] Selecting "Super Admin" shows only super admins
- [ ] Selecting "Tenant User" shows only tenant users
- [ ] Selecting "All" shows all users

### Search by Email
- [ ] Search input field is visible
- [ ] Typing in search filters users by email
- [ ] Search is case-insensitive
- [ ] Search updates results in real-time or on Enter
- [ ] Clearing search shows all users again

### Delete User
- [ ] Each user has "Delete" button
- [ ] Clicking "Delete" shows confirmation dialog
- [ ] Confirmation message mentions user email
- [ ] Canceling keeps user
- [ ] Confirming soft-deletes user (sets deletedAt)
- [ ] Deleted user disappears from list
- [ ] Toast confirms deletion
- [ ] Cannot delete own account (button disabled or error shown)
- [ ] Cannot delete last super admin (error shown)

---

## 10. Error Handling & Validation

### API Errors
- [ ] Network errors show toast notification
- [ ] 401 Unauthorized redirects to login
- [ ] 403 Forbidden shows error message
- [ ] 404 Not Found shows appropriate page or message
- [ ] 500 Server Error shows generic error message
- [ ] Error messages are user-friendly (not raw stack traces)

### Form Validation
- [ ] Required fields show error when empty
- [ ] Email fields validate email format
- [ ] Price fields reject negative numbers
- [ ] Price fields accept decimals (e.g., 12.50)
- [ ] Slug fields validate uniqueness
- [ ] Hex color fields validate format (#RRGGBB)
- [ ] Validation errors show inline or via toast
- [ ] Form cannot be submitted with validation errors

### Global Error Boundary
- [ ] React errors are caught by error boundary
- [ ] Error boundary shows friendly error page
- [ ] "Try Again" button resets error state
- [ ] "Go Home" button navigates to home/dashboard

### Toast Notifications
- [ ] Success toasts appear for successful operations (green)
- [ ] Error toasts appear for failed operations (red)
- [ ] Toasts auto-dismiss after 3-5 seconds
- [ ] Toasts can be manually dismissed
- [ ] Multiple toasts stack correctly

---

## 11. Loading States & UX

### Loading Indicators
- [ ] Buttons show loading spinner during async operations
- [ ] Buttons are disabled during loading
- [ ] Forms cannot be double-submitted
- [ ] Page loading shows skeleton or spinner
- [ ] Data fetching shows loading state

### Confirmations
- [ ] Delete actions require confirmation
- [ ] Confirmation dialogs are clear and specific
- [ ] Confirmation dialogs have "Cancel" and "Confirm" buttons
- [ ] Confirmation uses AlertDialog (not window.confirm)

### Optimistic UI Updates
- [ ] Creating item adds it to list immediately
- [ ] Editing item updates list immediately
- [ ] Deleting item removes it from list immediately
- [ ] Reordering updates order immediately
- [ ] If API fails, UI reverts to previous state

---

## 12. Performance & Optimization

### ISR (Incremental Static Regeneration)
- [ ] Public menus load quickly on first visit
- [ ] Public menus are cached (revalidate: 3600 seconds)
- [ ] After 1 hour, changes to menu reflect on next visit
- [ ] Stale-while-revalidate works (shows old version while updating)

### Database Queries
- [ ] No visible N+1 query issues (check console for slow queries)
- [ ] Menu editor loads quickly with many items (test with 50+ items)
- [ ] Admin dashboard loads quickly

### Bandwidth Tracking
- [ ] Page views are tracked in database
- [ ] Bandwidth is tracked in database
- [ ] Bandwidth tracking doesn't block page render (async)
- [ ] Bandwidth tracking errors don't crash page

---

## 13. Security

### Session Security
- [ ] Session cookie is HTTP-only (check DevTools → Application → Cookies)
- [ ] Session cookie has Secure flag in production
- [ ] Session expires after 7 days
- [ ] Cannot access another user's data by manipulating requests

### Authorization
- [ ] Tenant users can only access their own restaurant data
- [ ] Tenant users cannot access other restaurants' data
- [ ] Super admins cannot access tenant-specific routes
- [ ] API endpoints validate restaurant ownership

### Input Sanitization
- [ ] HTML in menu item names/descriptions is escaped
- [ ] Script tags in input don't execute
- [ ] SQL injection is prevented (Prisma ORM handles this)

---

## 14. Cross-Browser Testing

### Chrome
- [ ] All features work in Chrome
- [ ] No console errors
- [ ] UI renders correctly

### Firefox
- [ ] All features work in Firefox
- [ ] No console errors
- [ ] UI renders correctly

### Safari
- [ ] All features work in Safari
- [ ] No console errors
- [ ] UI renders correctly

### Edge
- [ ] All features work in Edge
- [ ] No console errors
- [ ] UI renders correctly

---

## 15. Mobile Testing (Responsive Design)

### Mobile Menu Editor
- [ ] Menu editor is usable on mobile
- [ ] Drag & drop works with touch gestures
- [ ] Forms are usable (inputs not too small)
- [ ] Navigation is accessible

### Mobile Settings
- [ ] Settings page is responsive
- [ ] Color pickers work on mobile
- [ ] Forms are usable

### Mobile Admin Pages
- [ ] Admin dashboard is usable on tablet
- [ ] Tables scroll horizontally on small screens
- [ ] All actions are accessible

---

## Bug Tracking

### Critical Bugs (P0) - Must Fix Before MVP
Document any critical bugs found during testing:

1.
2.
3.

### High Priority Bugs (P1) - Should Fix Before MVP
1.
2.
3.

### Medium Priority Bugs (P2) - Can Fix Post-MVP
1.
2.
3.

### Low Priority Bugs (P3) - Nice to Have
1.
2.
3.

---

## Testing Sign-Off

### Tester Information
- **Tester Name**: ___________________
- **Date**: ___________________
- **Environment**: Development / Staging / Production

### Summary
- **Total Tests**: ___________
- **Passed**: ___________
- **Failed**: ___________
- **Blocked**: ___________

### Final Approval
- [ ] All critical features work as expected
- [ ] All P0 bugs are resolved
- [ ] Documentation is complete and accurate
- [ ] Ready for MVP launch

**Approved By**: ___________________
**Date**: ___________________

---

## Notes & Observations

Use this section to document any additional observations, edge cases, or suggestions for improvement:

1.
2.
3.
