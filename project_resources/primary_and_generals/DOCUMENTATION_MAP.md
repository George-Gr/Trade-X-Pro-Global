# 📑 Complete Documentation Map & Index

**Your guide to finding any information in TradePro v10 documentation**

---

## 🎯 By Question/Need

### "How do I...?"

#### Setup & Environment

| Question                         | Document             | Section                 |
| -------------------------------- | -------------------- | ----------------------- |
| Get the project running?         | DEVELOPMENT_SETUP.md | Quick Start             |
| Configure environment variables? | DEVELOPMENT_SETUP.md | Configure Environment   |
| Start the dev server?            | DEVELOPMENT_SETUP.md | Running Dev Server      |
| Run tests?                       | DEVELOPMENT_SETUP.md | Testing                 |
| Build for production?            | DEVELOPMENT_SETUP.md | Building for Production |

#### Code & Development

| Question                          | Document       | Section                     |
| --------------------------------- | -------------- | --------------------------- |
| Write TypeScript in this project? | STYLE_GUIDE.md | TypeScript Standards        |
| Create a React component?         | STYLE_GUIDE.md | React Component Conventions |
| Name my files correctly?          | STYLE_GUIDE.md | Naming Conventions          |
| Style with Tailwind/CSS?          | STYLE_GUIDE.md | Tailwind CSS & Styling      |
| Handle forms?                     | STYLE_GUIDE.md | Form Validation             |
| Handle errors?                    | STYLE_GUIDE.md | Error Handling              |
| Test my code?                     | STYLE_GUIDE.md | Testing Patterns            |

#### Design & Components

| Question                  | Document         | Section          |
| ------------------------- | ---------------- | ---------------- |
| Use the Button component? | COMPONENT_API.md | Button Component |
| Use the Input component?  | COMPONENT_API.md | Input Component  |
| Use the Form component?   | COMPONENT_API.md | Form Component   |
| Use the Card component?   | COMPONENT_API.md | Card Component   |
| Find color codes?         | DESIGN_SYSTEM.md | Color System     |
| Get typography sizes?     | DESIGN_SYSTEM.md | Typography       |
| Get spacing values?       | DESIGN_SYSTEM.md | Spacing & Layout |
| Understand design tokens? | DESIGN_SYSTEM.md | Design Tokens    |

#### Accessibility & Standards

| Question                      | Document                   | Section                     |
| ----------------------------- | -------------------------- | --------------------------- |
| Make my component accessible? | ACCESSIBILITY_STANDARDS.md | Component A11y Requirements |
| Test accessibility?           | ACCESSIBILITY_STANDARDS.md | Testing & Validation        |
| Meet WCAG requirements?       | ACCESSIBILITY_STANDARDS.md | Compliance Level            |
| Support keyboard navigation?  | ACCESSIBILITY_STANDARDS.md | Keyboard Navigation         |
| Support screen readers?       | ACCESSIBILITY_STANDARDS.md | Screen Reader Support       |

#### Troubleshooting

| Question                   | Document           | Section                  |
| -------------------------- | ------------------ | ------------------------ |
| Port 8080 is in use?       | TROUBLESHOOTING.md | Port Already in Use      |
| Module not found error?    | TROUBLESHOOTING.md | Module Not Found         |
| TypeScript error?          | TROUBLESHOOTING.md | Type Check Errors        |
| Build failing?             | TROUBLESHOOTING.md | Build Errors             |
| Component not rendering?   | TROUBLESHOOTING.md | Component/UI Issues      |
| Styling not applied?       | TROUBLESHOOTING.md | Styling Not Applied      |
| Design validation failing? | TROUBLESHOOTING.md | Design System Validation |
| Test failing?              | TROUBLESHOOTING.md | Testing Issues           |

#### Governance & Processes

| Question                     | Document                      | Section                         |
| ---------------------------- | ----------------------------- | ------------------------------- |
| Contribute to design system? | CONTRIBUTING_DESIGN_SYSTEM.md | Contribution Workflow           |
| Add a new component?         | CONTRIBUTING_DESIGN_SYSTEM.md | Phase 1: Design & Specification |
| Submit code for review?      | CONTRIBUTING_DESIGN_SYSTEM.md | Phase 2: Implementation         |
| Publish new tokens?          | CONTRIBUTING_DESIGN_SYSTEM.md | Token Deprecation Process       |

### "What are the standards for...?"

| Standard          | Document                              |
| ----------------- | ------------------------------------- |
| TypeScript        | STYLE_GUIDE.md - TypeScript Standards |
| React components  | STYLE_GUIDE.md - React Conventions    |
| File organization | STYLE_GUIDE.md - File Organization    |
| Naming things     | STYLE_GUIDE.md - Naming Conventions   |
| Tailwind/CSS      | STYLE_GUIDE.md - Tailwind CSS         |
| Code quality      | QUALITY_GATES.md                      |
| Accessibility     | ACCESSIBILITY_STANDARDS.md            |
| Design system     | DESIGN_SYSTEM.md                      |
| Components        | COMPONENT_API.md                      |

### "Why did we...?"

| Decision                         | Document                  | ADR     |
| -------------------------------- | ------------------------- | ------- |
| Organize by features?            | ARCHITECTURE_DECISIONS.md | ADR 001 |
| Use Tailwind + CSS vars?         | ARCHITECTURE_DECISIONS.md | ADR 002 |
| Use 8px/4px grid?                | ARCHITECTURE_DECISIONS.md | ADR 003 |
| Use loose TypeScript?            | ARCHITECTURE_DECISIONS.md | ADR 004 |
| Use Context + React Query?       | ARCHITECTURE_DECISIONS.md | ADR 005 |
| Use shadcn-ui?                   | ARCHITECTURE_DECISIONS.md | ADR 006 |
| Use CSS variables for dark mode? | ARCHITECTURE_DECISIONS.md | ADR 007 |
| Use Playwright for E2E?          | ARCHITECTURE_DECISIONS.md | ADR 008 |
| Use Supabase?                    | ARCHITECTURE_DECISIONS.md | ADR 009 |

---

## 📚 By Role

### **Frontend Developer**

**Primary Documents** (read first):

1. [QUICK_START.md](QUICK_START.md) - 30 min onboarding
2. STYLE_GUIDE.md - Code standards
3. DESIGN_SYSTEM.md - Design reference
4. COMPONENT_API.md - Component specs

**Reference When Needed**:

- TROUBLESHOOTING.md - Problems
- ACCESSIBILITY_STANDARDS.md - A11y requirements
- DEVELOPMENT_SETUP.md - Environment help

### **Designer / Design System Lead**

**Primary Documents**:

1. DESIGN_SYSTEM.md - Design specifications
2. COMPONENT_API.md - Component specs
3. CONTRIBUTING_DESIGN_SYSTEM.md - Design system process
4. QUALITY_GATES.md - Design validation

**Reference When Needed**:

- ACCESSIBILITY_STANDARDS.md - A11y requirements
- ARCHITECTURE_DECISIONS.md - Why decisions exist

### **New Team Member**

**First 30 Minutes**:

1. [QUICK_START.md](QUICK_START.md) - Get setup
2. [README.md](README.md) - Understand structure

**First Day**: 3. ARCHITECTURE_DECISIONS.md - Why things work this way 4. STYLE_GUIDE.md - How to code

**First Week**: 5. DESIGN_SYSTEM.md - Design patterns 6. COMPONENT_API.md - Components 7. CONTRIBUTING_DESIGN_SYSTEM.md - How to contribute

### **Tech Lead / Architect**

**Strategic Overview**:

1. ARCHITECTURE_DECISIONS.md - All 9 decisions
2. DESIGN_SYSTEM.md - Design foundations
3. CONTRIBUTING_DESIGN_SYSTEM.md - Governance

**Reference When Needed**:

- QUALITY_GATES.md - Standards
- STYLE_GUIDE.md - Code patterns
- ACCESSIBILITY_STANDARDS.md - A11y standards

### **QA / Tester**

**Primary Documents**:

1. ACCESSIBILITY_STANDARDS.md - A11y testing
2. COMPONENT_API.md - Component behavior
3. STYLE_GUIDE.md - Testing patterns
4. TROUBLESHOOTING.md - Common issues

### **Product Manager**

**Overview Only**:

1. [README.md](README.md) - Project overview
2. ARCHITECTURE_DECISIONS.md - Technical decisions
3. DESIGN_SYSTEM.md - Design principles

---

## 📖 By Document

### **Core Documents (7 Total)**

#### 1. **DESIGN_SYSTEM.md** 📐

**Type:** Design Reference  
**Size:** ~1,200 lines  
**For:** All developers  
**Contains:**

- Design principles (5 core)
- Color system (primary, semantic, functional, dark mode)
- Typography (8-level scale)
- Spacing grid (4px/8px)
- Component overview
- Animations & interactions
- Accessibility basics
- Responsive patterns
- Dark mode implementation
- Design tokens

**Location:** `/project_resources/design_system_and_typography/DESIGN_SYSTEM.md`

---

#### 2. **COMPONENT_API.md** 🧩

**Type:** API Reference  
**Size:** ~1,800 lines  
**For:** Frontend developers  
**Contains:**

- Complete API for each component
- Props interfaces
- Usage examples (5-10 per component)
- Do's and Don'ts
- Accessibility requirements
- Dark mode behavior
- Migration guide
- Troubleshooting

**Location:** `/project_resources/components/COMPONENT_API.md`

---

#### 3. **CONTRIBUTING_DESIGN_SYSTEM.md** 🤝

**Type:** Governance  
**Size:** ~700 lines  
**For:** Design system team, contributors  
**Contains:**

- 3-phase contribution workflow
- 3-level governance model
- 40+ code review criteria
- PR requirements
- Testing requirements
- Token deprecation process
- Emergency procedures

**Location:** `/project_resources/design_system_and_typography/CONTRIBUTING_DESIGN_SYSTEM.md`

---

#### 4. **ACCESSIBILITY_STANDARDS.md** ♿

**Type:** A11y Reference  
**Size:** ~600 lines  
**For:** All developers  
**Contains:**

- WCAG 2.1 Level AA criteria (50+)
- Component a11y requirements
- Color & contrast specifications
- Keyboard navigation patterns
- Screen reader support
- Testing methods
- Tools & resources
- Troubleshooting

**Location:** `/project_resources/rules_and_guidelines/ACCESSIBILITY_STANDARDS.md`

---

#### 5. **DEVELOPMENT_SETUP.md** 🚀

**Type:** Getting Started  
**Size:** ~800 lines  
**For:** New developers  
**Contains:**

- Quick start (5 minutes)
- Prerequisites
- Full setup instructions
- Dev server usage
- Design system validation
- Code quality tools
- Testing setup
- Building for production
- Database setup
- Common tasks
- Troubleshooting
- IDE setup

**Location:** `/project_resources/development/DEVELOPMENT_SETUP.md`

---

#### 6. **ARCHITECTURE_DECISIONS.md** 🏗️

**Type:** Design Decisions  
**Size:** ~500 lines  
**For:** Senior developers, architects  
**Contains:**

- 9 Architecture Decision Records (ADRs)
- Decision rationale for each
- Implementation details
- Consequences & trade-offs
- Alternatives considered
- When to revisit decisions

**Location:** `/project_resources/rules_and_guidelines/ARCHITECTURE_DECISIONS.md`

---

#### 7. **TROUBLESHOOTING.md** 🔧

**Type:** Problem Solving  
**Size:** ~600 lines  
**For:** All developers  
**Contains:**

- Development issues (8+ categories)
- Type check errors
- Design validation errors
- Build errors
- Component/UI issues
- Accessibility issues
- Performance issues
- Database issues
- Testing issues
- Getting help resources

**Location:** `/project_resources/development/TROUBLESHOOTING.md`

---

### **Supporting Documents (Existing)**

#### **STYLE_GUIDE.md**

**Type:** Code Standards  
**Contains:** TypeScript, React, Tailwind, naming, patterns, testing  
**Location:** `/project_resources/rules_and_guidelines/STYLE_GUIDE.md`

#### **QUALITY_GATES.md**

**Type:** Standards & Validation  
**Contains:** Pre-commit checks, accessibility checks, code quality rules  
**Location:** `/project_resources/design_system_and_typography/QUALITY_GATES.md`

#### **AGENT.md**

**Type:** AI Agent Guidelines  
**Contains:** Context for AI agents working on codebase  
**Location:** `/project_resources/rules_and_guidelines/AGENT.md`

#### **DESIGN_TOKENS_CHANGELOG.md**

**Type:** Token Versioning  
**Contains:** Token changes, versioning, deprecation timeline  
**Location:** `/project_resources/design_system_and_typography/DESIGN_TOKEN_CHANGELOG.md`

---

## 🗺️ Documentation Structure

```
docs/
├── PRIMARY/
│   ├── README.md (← You are here overview)
│   ├── QUICK_START.md (30-min onboarding)
│   ├── DOCUMENTATION_MAP.md (← This file - index)
│   └── [consolidation planning docs]
│
└── archives/
    ├── audit_reports/ (historical audits)
    ├── project_reports/ (completion reports)
    └── task_reports/ (implementation reports)

project_resources/
├── design_system_and_typography/
│   ├── DESIGN_SYSTEM.md ⭐
│   ├── CONTRIBUTING_DESIGN_SYSTEM.md ⭐
│   ├── QUALITY_GATES.md
│   ├── DESIGN_TOKENS_CHANGELOG.md
│   └── MICRO_INTERACTIONS_REFERENCE.md
│
├── rules_and_guidelines/
│   ├── STYLE_GUIDE.md
│   ├── ACCESSIBILITY_STANDARDS.md ⭐
│   ├── ARCHITECTURE_DECISIONS.md ⭐
│   ├── AGENT.md
│   └── SECURITY.md
│
├── development/
│   ├── DEVELOPMENT_SETUP.md ⭐
│   └── TROUBLESHOOTING.md ⭐
│
├── components/
│   └── COMPONENT_API.md ⭐
│
└── [other folders]
```

⭐ = Newly consolidated/created documents (December 12, 2025)

---

## 🔍 Search Tips

### **Using Ctrl+F to Search**

**Finding a specific component:**

- Search: "Button Component" in COMPONENT_API.md
- or: "button" in DESIGN_SYSTEM.md

**Finding a specific error:**

- Search error message in TROUBLESHOOTING.md
- Example: "Port 8080" → "Port 8080 Already in Use"

**Finding a pattern:**

- Search: "form" in STYLE_GUIDE.md
- or: "Form Component" in COMPONENT_API.md

**Finding a principle:**

- Search: principle name in ARCHITECTURE_DECISIONS.md
- Example: "feature-based" → ADR 001

---

## 📊 Document Statistics

| Document                      | Lines     | Size        | Updated      |
| ----------------------------- | --------- | ----------- | ------------ |
| DESIGN_SYSTEM.md              | 1,200     | ~40 KB      | Dec 12, 2025 |
| COMPONENT_API.md              | 1,800     | ~60 KB      | Dec 12, 2025 |
| CONTRIBUTING_DESIGN_SYSTEM.md | 700       | ~23 KB      | Dec 12, 2025 |
| ACCESSIBILITY_STANDARDS.md    | 600       | ~20 KB      | Dec 12, 2025 |
| DEVELOPMENT_SETUP.md          | 800       | ~27 KB      | Dec 12, 2025 |
| ARCHITECTURE_DECISIONS.md     | 500       | ~17 KB      | Dec 12, 2025 |
| TROUBLESHOOTING.md            | 600       | ~20 KB      | Dec 12, 2025 |
| STYLE_GUIDE.md                | 1,979     | ~66 KB      | Nov 2024     |
| QUALITY_GATES.md              | 658       | ~22 KB      | Dec 2024     |
| **TOTAL**                     | **9,837** | **~295 KB** |              |

---

## ✅ Checklist: Everything is Where It Should Be

- [ ] You know where DESIGN_SYSTEM.md is
- [ ] You know where COMPONENT_API.md is
- [ ] You know where STYLE_GUIDE.md is
- [ ] You know where TROUBLESHOOTING.md is
- [ ] You can find any document using this map
- [ ] You understand document organization
- [ ] You've bookmarked [README.md](README.md)

---

**Last Updated:** December 12, 2025  
**Version:** 1.0  
**Total Documents:** 17 active + archives
