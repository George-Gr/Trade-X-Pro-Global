---
agent: agent
---
# Complete Codebase Audit & Implementation Roadmap

## Context
You are auditing a full-stack web application. Analyze the entire project holistically, considering frontend (React/Next.js), backend (APIs, databases), styling (Tailwind CSS), state management, routing, and deployment configuration.

## Phase 1: Comprehensive Codebase Audit

### Frontend Analysis
- **Component Architecture**
  - Review all React components for structure, reusability, and best practices
  - Check for prop drilling, unnecessary re-renders, and missing memoization
  - Identify components that need splitting or consolidation
  - Verify proper TypeScript typing and interfaces

- **UI/UX Implementation**
  - Audit Tailwind CSS usage for consistency and optimization
  - Check responsive design breakpoints and mobile compatibility
  - Identify accessibility issues (ARIA labels, keyboard navigation, color contrast)
  - Review loading states, error boundaries, and user feedback mechanisms

- **State Management**
  - Analyze state organization (local vs. global)
  - Check for redundant state or prop passing
  - Review data fetching patterns and caching strategies
  - Identify race conditions or stale data issues

### Backend & Integration Analysis
- **API Layer**
  - Review all API endpoints and their implementations
  - Check error handling, validation, and response formats
  - Verify authentication/authorization flows
  - Identify missing endpoints or incomplete CRUD operations

- **Database Schema**
  - Audit database models and relationships
  - Check for missing indexes or query optimization needs
  - Verify data integrity constraints
  - Identify normalization or denormalization opportunities

- **Integration Points**
  - Review third-party service integrations
  - Check environment variable configuration
  - Verify CORS, rate limiting, and security headers
  - Identify hardcoded values that should be configurable

### Code Quality & Security
- **Quality Issues**
  - Unused imports, variables, or dead code
  - Console logs or debug statements left in production code
  - Inconsistent naming conventions or code style
  - Missing error handling or try-catch blocks
  - Overly complex functions that need refactoring

- **Security Vulnerabilities**
  - Input validation and sanitization gaps
  - Potential XSS, CSRF, or injection vulnerabilities
  - Exposed sensitive data or API keys
  - Insecure authentication/session management
  - Missing rate limiting or abuse prevention

- **Performance Concerns**
  - Bundle size and code-splitting opportunities
  - Unoptimized images or assets
  - N+1 query problems
  - Missing caching strategies
  - Slow-loading pages or components

### Testing & Documentation
- Check test coverage and missing test cases
- Review inline documentation and comments
- Identify complex logic needing better explanation
- Verify README accuracy and setup instructions

## Phase 2: PRD Alignment Analysis

### Requirements Extraction
From **PRD.md**, extract and categorize:
- **User Stories**: List all defined user flows and acceptance criteria
- **Features**: Core functionality vs. nice-to-have features
- **Technical Requirements**: Performance targets, browser support, scalability needs
- **Design Specifications**: UI/UX requirements, branding guidelines
- **Business Rules**: Logic constraints, data validation rules, workflow requirements

### Gap Identification
For each PRD requirement, determine:
- ✅ **Fully Implemented**: Working as specified
- ⚠️ **Partially Implemented**: Started but incomplete or buggy
- ❌ **Not Implemented**: Missing entirely
- 🔄 **Needs Refactoring**: Implemented but poorly or incorrectly

Create a matrix mapping requirements to implementation status.

## Phase 3: Current Status Report

Provide a comprehensive summary:

### Project Health Dashboard
```
Overall Completion: [X%]
Frontend Status: [X%] - [Brief assessment]
Backend Status: [X%] - [Brief assessment]
Testing Coverage: [X%]
Critical Blockers: [Number]
```

### What's Working Well
- List successfully implemented features
- Highlight solid architectural decisions
- Note good code patterns to maintain

### Critical Issues Requiring Immediate Attention
Priority-ranked list of blockers preventing deployment or core functionality

### Technical Debt Summary
- Major refactoring needed
- Performance bottlenecks
- Security vulnerabilities
- Missing error handling

## Phase 4: Actionable Implementation Roadmap

Structure tasks in **deployment-ready phases**:

### 🚨-phase-0-critical-fixes Critical Fixes (Block Deployment)
**Task 0.1: Issue Title**
- **Location**: `path/to/file.tsx` (lines X-Y)
- **Problem**: Clear description of what's wrong
- **Impact**: Why this blocks progress
- **Solution Steps**:
  1. Specific code change needed
  2. Files to create/modify
  3. Dependencies to install (if any)
- **Code Example**: 
```typescript
  // Show before and after code
```
- **Verification**: How to test the fix works
- **Estimated Time**: \[X hours\]

### 🔴 Phase 1: Core Features (MVP Requirements)
Follow the same task structure for each feature

### 🟡 Phase 2: Enhanced Functionality
[Secondary features from PRD]

### 🟢 Phase 3: Polish & Optimization
Performance, UX improvements, nice-to-haves

### 🔵 Phase 4: Future Enhancements
Post-launch considerations

## Task Template (Use for Every Item)

**Task Phase.Number: Clear Action Title**
- **Status**: ❌ Not Started | 🔄 In Progress | ✅ Complete
- **Priority**: 🚨 Critical | 🔴 High | 🟡 Medium | 🟢 Low
- **Component/Module**: Specific file paths
- **PRD Reference**: Section/requirement this addresses
- **Dependencies**: Must complete [Task 0.1: Critical Fixes](Phase 0 Critical Fixes Block Deployment) first
- **Changes Required**:
  - [ ] Create/modify files: \[list\]
  - [ ] Install packages: (list the required packages here)
  - [ ] Update config: (specify configuration changes here)
- **Implementation Guide**:
  1. Step-by-step instructions
  2. Include component structure if creating new files
  3. Specify prop types, state shape, API contracts
  4. Note Tailwind classes or styling approach
- **Acceptance Criteria**:
  - [ ] Specific, testable outcome 1
  - [ ] Specific, testable outcome 2
- **Testing Steps**:
  1. How to manually verify
  2. User flows to test
- **Estimated Effort**: X hours/days

## Workflow & Best Practices

### Development Workflow
1. **Before starting any task**:
   - Review dependencies
   - Check for conflicting changes
   - Ensure dev environment is updated

2. **During implementation**:
   - Follow existing code style
   - Add TypeScript types for new code
   - Include error handling
   - Write responsive, accessible UI

3. **Before marking complete**:
   - Test in multiple browsers/devices
   - Check console for errors/warnings
   - Verify against acceptance criteria
   - Update documentation if needed

### Coding Guidelines
- Use functional components with hooks
- Implement proper error boundaries
- Follow Tailwind CSS utility-first approach
- Keep components under 300 lines
- Extract reusable logic into custom hooks
- Use semantic HTML elements
- Ensure all interactive elements are keyboard accessible

### Git Strategy
- Branch naming: `feature/task-id-description`
- Commit messages: Clear, descriptive, reference task IDs
- PR checklist items for each phase

## Visual Roadmap

Provide a timeline view:
```
Week 1-2: Phase 0 + Phase 1 (Tasks 0.1-1.5)
Week 3-4: Phase 1 continued + Phase 2 start
Week 5-6: Phase 2 completion + Phase 3
Week 7+: Phase 4 + Buffer
```

Mark critical path dependencies with arrows/connections.

## Output Format Requirements

[Secondary features from PRD]: #phase-2-enhanced-functionality

## Phase 2: Enhanced Functionality
This section outlines secondary features from the PRD that enhance the application's functionality.

- Single markdown file named: `IMPLEMENTATION_ROADMAP.md`
- Include table of contents with anchor links
- Use consistent emoji system for visual scanning
- Include code snippets for complex changes
- Add file tree diagrams where helpful
- Link to specific PRD sections
- Every task must be independently actionable
- No vague instructions like "improve performance" - be specific

## Success Metrics

The roadmap should enable:
- ✅ Any developer can pick up any task and complete it
- ✅ Progress is measurable and trackable
- ✅ Dependencies are clear to avoid blocking
- ✅ PRD requirements are 100% mapped
- ✅ Timeline is realistic and achievable
- ✅ Code quality improves with each phase