import { useState } from "react";
import {
  SemanticHTMLManager,
  CreateContentSectionOptions,
  type ContentSection,
} from "../components/accessibility/SemanticHTMLEnhancer";

/**
 * Hook for semantic HTML management
 *
 * Provides utilities to analyze page structure, create semantic sections,
 * and generate unique IDs for semantic HTML elements.
 *
 * @returns Object containing structure state, analysis function, section creator, and ID generator
 */
export function useSemanticHTML() {
  const manager = SemanticHTMLManager.getInstance();
  const [structure, setStructure] = useState<ContentSection[]>([]);

  const analyzePageStructure = () => {
    const pageStructure = manager.getPageStructure();
    setStructure(pageStructure);
    return pageStructure;
  };

  const createSection = (
    title: string,
    content: React.ReactNode,
    options?: CreateContentSectionOptions,
  ) => {
    return manager.createContentSection(title, content, 2, options);
  };

  return {
    structure,
    analyzePageStructure,
    createSection,
    generateId: (title: string) => manager.generateSectionId(title),
  };
}
