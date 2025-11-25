import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '@/pages/Login';
import Register from '@/pages/Register';

/**
 * Accessibility Tests for Form Components
 * Tests ARIA labels, focus indicators, and keyboard navigation
 */

describe('Accessibility - Form Components', () => {
  describe('Login Form', () => {
    beforeEach(() => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );
    });

    it('should have ARIA labels for all form inputs', () => {
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });

    it('should have aria-describedby for input descriptions', () => {
      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
      expect(emailInput.getAttribute('aria-describedby')).toBeTruthy();
    });

    it('should support keyboard navigation (Tab)', async () => {
      const user = userEvent.setup();
      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;

      // Focus starts on first input
      await user.tab();
      expect(emailInput).toHaveFocus();
    });

    it('should display focus indicator when focused', async () => {
      const user = userEvent.setup();
      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;

      await user.click(emailInput);
      expect(emailInput).toHaveFocus();
      // Check for ring class (focus indicator)
      expect(emailInput.className).toContain('focus');
    });
  });

  describe('Register Form', () => {
    beforeEach(() => {
      render(
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      );
    });

    it('should have ARIA labels for all form inputs', () => {
      const fullNameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInputs = screen.getAllByLabelText(/password/i);

      expect(fullNameInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      expect(passwordInputs.length).toBe(2); // password + confirmPassword
    });

    it('should have descriptive help text for password field', () => {
      const passwordDescription = screen.getByText(/create a strong password/i);
      expect(passwordDescription).toBeInTheDocument();
    });

    it('should have descriptive help text for confirm password field', () => {
      const passwordInputs = screen.getAllByLabelText(/password/i);
      const confirmPasswordInput = passwordInputs[1];
      const ariaDescribedBy = confirmPasswordInput.getAttribute('aria-describedby');
      
      // The description should be linked via aria-describedby
      expect(ariaDescribedBy).toBeTruthy();
    });

    it('should have aria-describedby linking inputs to descriptions', () => {
      const fullNameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
      expect(fullNameInput.getAttribute('aria-describedby')).toBeTruthy();

      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
      expect(emailInput.getAttribute('aria-describedby')).toBeTruthy();
    });

    it('should support keyboard navigation through all fields', async () => {
      const user = userEvent.setup();

      // Tab through form fields
      await user.tab();
      let focusedElement = document.activeElement;
      const tabbedElements: Element[] = [focusedElement!];

      // Continue tabbing and collect focused elements
      for (let i = 0; i < 5; i++) {
        await user.tab();
        focusedElement = document.activeElement;
        if (focusedElement && focusedElement !== tabbedElements[tabbedElements.length - 1]) {
          tabbedElements.push(focusedElement);
        }
      }

      // Should have tabbed through multiple form inputs
      expect(tabbedElements.length).toBeGreaterThan(2);
    });
  });

  describe('Form Input Component Focus States', () => {
    it('should have visible focus indicator (ring-offset-2)', () => {
      const { container } = render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      const inputs = container.querySelectorAll('input[type="text"], input[type="password"], input[type="email"]');
      
      inputs.forEach((input) => {
        // Check that input has focus styling classes
        const className = input.className;
        expect(className).toMatch(/focus:ring|focus-visible:ring/);
      });
    });
  });
});
