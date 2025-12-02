# Component Architecture Refactoring - Detailed Todo List

## Prerequisites & Preparation

---

### Initial Audit: Monolithic Components (>200 lines)

| Component File | Line Count | Primary Responsibilities |
|----------------|------------|--------------------------|
| admin/RiskPanel.tsx | 704 | Risk management admin UI, table, dialogs, forms |
| admin/KYCPanel.tsx | 626 | KYC admin UI, table, dialogs, forms |
| trading/EnhancedPositionsTable.tsx | 615 | Positions table, sorting, metrics, dialogs |
| ui/sidebar.tsx | 600 | Sidebar UI, context, navigation, state mgmt |
| kyc/KycAdminDashboard.tsx | 555 | KYC dashboard, tabs, table, dialogs |
| kyc/KycUploader.tsx | 549 | KYC document upload UI, progress, tabs |
| trading/__tests__/OrdersTableComprehensive.test.tsx | 529 | Orders table test suite |
| admin/UsersPanel.tsx | 493 | User management admin UI, table, dialogs |
| ui/LoadingSkeleton.tsx | 489 | Skeleton loaders for dashboard, tables, etc. |
| ui/DarkModeTest.tsx | 483 | Dark mode UI, theme toggles, preview |
| trading/__tests__/OrderComponents.test.tsx | 475 | Order form/test suite |
| wallet/WithdrawalForm.tsx | 470 | Withdrawal form, validation, dialogs |
| trading/PortfolioDashboard.tsx | 423 | Portfolio dashboard, metrics, charts |
| trading/OrderForm.tsx | 401 | Order form, validation, UI |
| layout/AppSidebar.tsx | 399 | App sidebar, navigation, error boundary |
| ui/chart.tsx | 392 | Chart rendering, config, context |
| common/Layout/index.tsx | 387 | Layout components, spacing system |
| risk/RiskChartsPanel.tsx | 381 | Risk charts, tabs, visualizations |
| risk/RiskSettingsForm.tsx | 380 | Risk settings form, validation |

---

Line counts and primary responsibilities have been documented for the largest components.
Next: For each, detail sub-functionalities to extract, external dependencies, and props interface complexity.
Prioritize refactoring order based on usage frequency, performance impact, and business criticality.

### Detailed Breakdown: `EnhancedPositionsTable.tsx` (615 lines)

**Primary Responsibilities:**
- Real-time positions table (virtualized, sortable, filterable)
- Quick-close & quick-edit actions
- Real-time P&L updates
- Expandable position details
- Responsive design (table for desktop, cards for mobile)
- Margin level indicators
- Dialogs for editing and closing positions

**Sub-functionalities to Extract:**
- Table header (SortHeader, filter controls)
- Metrics cards (PositionsMetrics)
- Table row rendering (desktop and mobile)
- Position details (PositionDetails sub-component)
- Action buttons (edit, close)
- Dialogs (edit position, close confirmation)
- State management for sorting, filtering, expansion, dialogs

**External Dependencies:**
- UI: Button, Badge, Card, Dialog, AlertDialog
- Hooks: useRealtimePositions, usePnLCalculations, usePositionClose, useAuth, useToast
- Types: Position, PositionPnLDetails
- Utility: react-window (virtualized list)

**Props Interface Complexity:**
- No props (uses hooks for data/state)
- Internal state: sortConfig, filterType, expandedPositionId, selectedForClose, editDialogOpen, editingPosition, showConfirmClose

#### Recommended Refactoring Plan

1. **Extract Presentational Sub-components:**
  - Table row (desktop): `PositionRow`
  - Card (mobile): `PositionCard`
  - Action buttons: `PositionActions`
  - Dialogs: `EditPositionDialog`, `ClosePositionDialog`
  - Metrics: `PositionsMetrics` (already separate)
  - Details: `PositionDetails` (already separate, but can be moved out)

2. **Extract Logic/Container Components:**
  - Sorting/filtering logic
  - State management for dialogs and expansion

3. **Define TypeScript Interfaces:**
  - For each new sub-component, define clear props interfaces (typed, optional/required, event handlers).

4. **Testing:**
  - Create tests for extracted components to preserve functionality.

Proceed to document and refactor the next most critical component, or begin extraction for this one.

---

### Extraction & Refactoring: `EnhancedPositionsTable.tsx` (Completed)

**Changes Made:**
- Created `PositionRow.tsx` (desktop row component)
- Created `PositionCard.tsx` (mobile card component)
- Moved `PositionDetails` to its own file
- Updated `EnhancedPositionsTable.tsx` to use these new components
- Updated `PositionsTable.tsx` and `PositionsTableVirtualized.tsx` to use `PositionRow`
- Resolved TypeScript errors and ensured build success

**Result:**
- Reduced `EnhancedPositionsTable.tsx` from 615 lines to ~511 lines
- Improved maintainability and reusability
- Consistent interfaces across components
- Build passes successfully

---

Proceed to extraction and refactoring for this component.

### Extraction & Refactoring: `admin/RiskPanel.tsx` (Completed)

**Changes Made:**
- Created `RiskMetrics.tsx` (4 metric cards component)
- Created `MarginCallsTable.tsx` (active margin calls table)
- Created `RiskEventsTable.tsx` (filterable risk events table)
- Created `FilterControls.tsx` (search and filter controls)
- Created `EventDetailDialog.tsx` (event detail modal)
- Created `ResolutionDialog.tsx` (resolution workflow dialog)
- Updated `RiskPanel.tsx` to use these extracted components
- Removed ~400 lines of orphaned JSX code
- Added proper TypeScript exports for interfaces (RiskEvent, Position, MarginCall)
- Fixed icon imports (AlertTriangle, TrendingDown, Flag, Zap, AlertCircle, Shield)

**Files Created:**
- `src/components/admin/RiskMetrics.tsx` (45 lines)
- `src/components/admin/MarginCallsTable.tsx` (95 lines)
- `src/components/admin/RiskEventsTable.tsx` (156 lines)
- `src/components/admin/FilterControls.tsx` (89 lines)
- `src/components/admin/EventDetailDialog.tsx` (117 lines)
- `src/components/admin/ResolutionDialog.tsx` (67 lines)

**Result:**
- Reduced `RiskPanel.tsx` from 704 lines to 334 lines (52% reduction)
- Improved code organization and maintainability
- Each component has single responsibility
- TypeScript strict mode compliance
- Build passes successfully: ✓ built in 12.65s
- Linting passes with no errors
- All type imports properly exported and resolved

---

---

### Detailed Breakdown: `admin/RiskPanel.tsx` (704 lines)

**Primary Responsibilities:**
- Risk management admin UI with metrics dashboard
- Table of risk events with filtering and search
- Active margin calls display
- Event detail dialogs and resolution workflow
- Real-time data fetching and updates

**Sub-functionalities to Extract:**
- Risk metrics cards (4 metrics: total events, critical events, active risks, high risk positions)
- Margin calls table (active margin calls with user details)
- Risk events table (filterable, searchable, with actions)
- Event detail dialog (view event details)
- Resolution dialog (resolve events with notes)
- Filter controls (search, severity, status, type)
- State management for filters and dialogs

**External Dependencies:**
- UI: Button, Card, Input, Badge, Table, Dialog, Textarea, Label
- Hooks: useAuth, useToast
- Icons: AlertTriangle, Shield, TrendingDown, DollarSign, Users, Eye, Loader2, Search, Filter, Clock, Flag, Zap, AlertCircle, RefreshCw
- Supabase client for data fetching
- Logger utility
- Types: RiskEvent, Position, MarginCall, Json

**Props Interface Complexity:**
- Simple props: refreshTrigger (number, optional)
- Internal state: riskEvents, positions, marginCalls, isLoading, search filters, dialog states

#### Recommended Refactoring Plan

1. **Extract Presentational Sub-components:**
   - RiskMetrics (4 metric cards)
   - MarginCallsTable (active margin calls)
   - RiskEventsTable (filterable events table)
   - EventDetailDialog (view event details)
   - ResolutionDialog (resolve events)
   - FilterControls (search and filter controls)

2. **Extract Logic/Container Components:**
   - Data fetching logic (useRiskData hook)
   - Filter logic (useRiskFilters hook)
   - Resolution logic (useRiskResolution hook)

3. **Define TypeScript Interfaces:**
   - For each new sub-component, define clear props interfaces
   - Create hooks interfaces for data and state management

4. **Testing:**
   - Create tests for extracted components to preserve functionality

Proceed to extraction and refactoring for this component.

### Extraction & Refactoring: `admin/KYCPanel.tsx` (Completed)

**Changes Made:**
- Created `KYCMetrics.tsx` (4 stat cards component)
- Created `KYCFiltersCard.tsx` (search and filter controls)
- Created `KYCDocumentsTable.tsx` (filterable documents table)
- Updated `KYCPanel.tsx` to use these extracted components
- Exported KYCDocument interface for use in sub-components
- All TypeScript imports properly configured

**Files Created:**
- `src/components/admin/KYCMetrics.tsx` (56 lines)
- `src/components/admin/KYCFiltersCard.tsx` (61 lines)
- `src/components/admin/KYCDocumentsTable.tsx` (163 lines)

**Result:**
- Reduced `KYCPanel.tsx` from 626 lines to 418 lines (208 lines removed, 33% reduction)
- Improved code organization and maintainability
- Each component has single responsibility
- TypeScript strict mode compliance
- Build passes successfully: ✓ built in 12.92s
- Linting passes with no errors
- All type imports properly exported and resolved

---

### Extraction & Refactoring: `kyc/KycAdminDashboard.tsx` (In Progress)

**Changes Made:**
- Created `KycStatistics.tsx` (4 stat cards component)
- Created `KycQueueControls.tsx` (search and filter controls)
- Created `KycQueueTable.tsx` (requests table with review dialog integration)
- Exported KycDocument, KycRequest, UserProfile interfaces for sub-components
- Updated imports in main component

**Files Created:**
- `src/components/kyc/KycStatistics.tsx` (53 lines)
- `src/components/kyc/KycQueueControls.tsx` (78 lines)
- `src/components/kyc/KycQueueTable.tsx` (95 lines)

**Current Status:**
- Sub-components created and validated
- Build passes: ✓ built in 12.13s
- Linting passes with no errors
- Main component refactoring in progress (will reduce from 556 to ~380 lines estimated)

---

## Task 1: Analysis & Planning

### Step 1: Component Identification & Assessment
- [ ] **Scan codebase** for components exceeding 200 lines using automated tools
- [ ] **Document each monolithic component** with:
  - Current line count
  - Primary responsibilities
  - Sub-functionalities that can be extracted
  - External dependencies
  - Props interface complexity
- [ ] **Prioritize refactoring order** based on:
  - Component usage frequency
  - Performance impact
  - Maintenance difficulty
  - Business criticality

### Step 2: Architecture Planning
- [ ] **Design component hierarchy** for each monolithic component
- [ ] **Define extraction strategy** following single responsibility principle
- [ ] **Plan TypeScript interfaces** for new component props
- [ ] **Identify reusable patterns** across multiple components

## Task 2: Component Breakdown

### Step 1: Extract Sub-Components
- [ ] **Create feature branches** for each major component refactor
- [ ] **Extract UI components first** (presentational components):
  - Headers, footers, navigation elements
  - Form fields and input groups
  - Display cards and list items
  - Modal and dialog components
- [ ] **Extract logic components** (container components):
  - Data fetching logic
  - State management
  - Event handlers
  - Business logic

### Step 2: Implement Proper Interfaces
- [ ] **Define TypeScript interfaces** for each new component:
  - Props interfaces with proper typing
  - Event handler types
  - Children prop types where applicable
  - Optional vs required props clearly marked
- [ ] **Create prop validation** using TypeScript strict mode
- [ ] **Document component APIs** with JSDoc comments

### Step 3: Maintain Functionality
- [ ] **Create comprehensive tests** for original functionality before refactoring
- [ ] **Implement refactored components** with identical external behavior
- [ ] **Run regression tests** after each component extraction
- [ ] **Verify no breaking changes** in parent components

## Task 3: Component Composition Implementation

### Step 1: Base Component Creation
- [ ] **Identify common patterns** across extracted components
- [ ] **Create reusable base components**:
  - Button variants (primary, secondary, danger)
  - Input field bases (text, select, checkbox)
  - Layout containers (flex, grid, stack)
  - Typography components (headings, body text)
- [ ] **Follow design system specifications** from attached documents
- [ ] **Implement consistent styling** using design tokens

### Step 2: Compound Component Patterns
- [ ] **Implement compound components** for complex UI patterns:
  - Accordion with Header/Content
  - Tabs with TabList/Tab/TabPanel
  - Modal with Header/Body/Footer
  - Form with FieldGroup/Field/Label/Input
- [ ] **Use React.Children utilities** for flexible composition
- [ ] **Implement context-based communication** between compound components

### Step 3: Render Props Implementation
- [ ] **Identify components needing flexible rendering** (data tables, lists, forms)
- [ ] **Implement render prop patterns** for:
  - Custom cell rendering in tables
  - Custom item rendering in lists
  - Custom field rendering in forms
- [ ] **Provide default renderers** as fallbacks
- [ ] **Ensure TypeScript compatibility** with render prop types

## Task 4: Performance Optimization

### Step 1: React.memo Implementation
- [ ] **Identify expensive components** using React DevTools Profiler
- [ ] **Wrap pure components** with React.memo
- [ ] **Implement custom comparison functions** for complex props
- [ ] **Verify memo effectiveness** with before/after profiling

### Step 2: Hook Optimization
- [ ] **Audit useMemo usage**:
  - Wrap expensive calculations
  - Memoize complex object/array creations
  - Avoid over-memoization of simple values
- [ ] **Audit useCallback usage**:
  - Memoize event handlers passed to child components
  - Memoize functions used in dependency arrays
  - Remove unnecessary useCallback wrapping
- [ ] **Optimize dependency arrays**:
  - Include all dependencies
  - Remove unnecessary dependencies
  - Use refs for stable references when needed

### Step 3: Performance Profiling
- [ ] **Profile each refactored component** individually
- [ ] **Measure render frequency** and duration
- [ ] **Identify performance bottlenecks** in component trees
- [ ] **Document performance improvements** with metrics

## Task 5: Component Library Standards

### Step 1: Documentation Standards
- [ ] **Create component documentation** following established guidelines:
  - Component purpose and usage
  - Props API documentation
  - Usage examples with code snippets
  - Accessibility considerations
- [ ] **Set up Storybook** or similar tool for component showcase
- [ ] **Create component usage guidelines** for team members

### Step 2: Code Standards Enforcement
- [ ] **Implement ESLint rules** for component architecture:
  - Maximum component line limits (200 lines)
  - Required prop types
  - Naming conventions
  - File organization standards
- [ ] **Set up pre-commit hooks** to enforce standards
- [ ] **Create component templates** for consistent structure

### Step 3: Testing Standards
- [ ] **Establish testing requirements** for all components:
  - Unit tests for component logic
  - Integration tests for component interactions
  - Visual regression tests for UI components
  - Accessibility tests using testing-library
- [ ] **Achieve minimum 80% test coverage** for refactored components
- [ ] **Set up automated testing** in CI/CD pipeline

## Task 6: Quality Assurance & Validation 

### Step 1: Functionality Verification
- [ ] **Run complete test suite** for all refactored components
- [ ] **Perform manual testing** of critical user flows
- [ ] **Verify cross-browser compatibility** for refactored components
- [ ] **Test responsive behavior** across different screen sizes

### Step 2: Performance Validation
- [ ] **Measure final performance metrics**:
  - Component render times
  - Bundle size impact
  - Memory usage
  - First contentful paint improvements
- [ ] **Verify 20% performance improvement** target is met
- [ ] **Document performance gains** with before/after comparisons

### Step 3: Code Review & Cleanup
- [ ] **Conduct thorough code reviews** with team members
- [ ] **Remove dead code** and unused imports
- [ ] **Optimize bundle splitting** for new component structure
- [ ] **Update documentation** to reflect new architecture

## Acceptance Criteria Validation

### Component Size Compliance
- [ ] **Verify no component exceeds 200 lines** using automated checks
- [ ] **Document any exceptions** with justification
- [ ] **Set up monitoring** to prevent future violations

### Single Responsibility Verification
- [ ] **Review each component** for single, clear responsibility
- [ ] **Ensure proper separation** of concerns between components
- [ ] **Validate component cohesion** and loose coupling

### Performance Achievement
- [ ] **Confirm 20% performance improvement** through profiling
- [ ] **Document specific metrics** showing improvement
- [ ] **Identify areas** for future optimization
- [ ] **Update task document** with each implemented steps and tasks

### Functionality Preservation
- [ ] **Verify all existing functionality** works as expected
- [ ] **Confirm no regressions** in user experience
- [ ] **Validate API compatibility** for consuming components

## Deliverables
- [ ] **Refactored component codebase** with improved architecture
- [ ] **Updated component library** with proper documentation
- [ ] **Performance improvement report** with metrics
- [ ] **Migration guide** for team members
- [ ] **Updated coding standards** and guidelines
- [ ] **Comprehensive test suite** for all refactored components
- [ ] **Zero errors** in lint, type checks, build, and this task tests