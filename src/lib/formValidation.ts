/**
 * Form Validation Schemas using Zod
 * 
 * Provides real-time field-level validation for all trading forms.
 */

import { z } from 'zod';

/**
 * Order form validation schema
 */
export const orderFormSchema = z.object({
  symbol: z
    .string()
    .min(1, 'Symbol is required')
    .max(20, 'Symbol too long')
    .regex(/^[A-Z0-9:_-]+$/i, 'Invalid symbol format'),
  
  side: z.enum(['buy', 'sell'], {
    required_error: 'Select buy or sell',
  }),
  
  quantity: z
    .number({
      required_error: 'Volume is required',
      invalid_type_error: 'Volume must be a number',
    })
    .min(0.01, 'Minimum volume is 0.01 lots')
    .max(100, 'Maximum volume is 100 lots'),
  
  orderType: z.enum(['market', 'limit', 'stop', 'stop_limit'], {
    required_error: 'Select order type',
  }),
  
  limitPrice: z.number().positive('Price must be positive').optional().nullable(),
  stopPrice: z.number().positive('Price must be positive').optional().nullable(),
  stopLoss: z.number().positive('Stop loss must be positive').optional().nullable(),
  takeProfit: z.number().positive('Take profit must be positive').optional().nullable(),
  timeInForce: z.enum(['GTC', 'GTD', 'FOK', 'IOC']).default('GTC'),
});

/**
 * Price alert form schema
 */
export const priceAlertSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').max(20, 'Symbol too long'),
  targetPrice: z.number({ required_error: 'Target price is required' }).positive('Price must be positive'),
  condition: z.enum(['above', 'below'], { required_error: 'Select price condition' }),
});

/**
 * Risk settings form schema
 */
export const riskSettingsSchema = z.object({
  maxPositionSize: z.number().min(0.01, 'Minimum 0.01 lots').max(100, 'Maximum 100 lots'),
  maxPositions: z.number().int('Must be a whole number').min(1, 'Minimum 1 position').max(100, 'Maximum 100 positions'),
  dailyLossLimit: z.number().min(0, 'Cannot be negative').max(100, 'Maximum 100%'),
  marginCallLevel: z.number().min(50, 'Minimum 50%').max(200, 'Maximum 200%'),
  stopOutLevel: z.number().min(20, 'Minimum 20%').max(100, 'Maximum 100%'),
  enforceStopLoss: z.boolean(),
});

/**
 * Type exports
 */
export type OrderFormData = z.infer<typeof orderFormSchema>;
export type PriceAlertData = z.infer<typeof priceAlertSchema>;
export type RiskSettingsData = z.infer<typeof riskSettingsSchema>;

/**
 * Validate entire form and return all errors
 */
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Record<string, string> {
  try {
    schema.parse(data);
    return {};
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = err.message;
        }
      });
      return errors;
    }
    return {};
  }
}
