import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger.js';
import { ErrorCode } from '../constants/index.js';

export const STANDARD_CATEGORIES = [
  'Meals & Entertainment',
  'Office Supplies',
  'Travel',
  'Software & Subscriptions',
  'Rent & Utilities',
  'Marketing & Advertising',
  'Professional Services',
  'Insurance',
  'Taxes & Licenses',
  'Other'
] as const;

export async function categorizeExpense(
  apiKey: string,
  modelName: string,
  description: string,
  amount: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: 'application/json'
    }
  });

  const prompt = `You are a professional accountant AI. Categorize the following expense transaction into exactly one of these allowed tax categories:
${STANDARD_CATEGORIES.map(c => `- "${c}"`).join('\n')}

Transaction details:
- Description: "${description}"
- Amount: $${amount}

You must return a single JSON object containing exactly one key "category" whose value is exactly one of the allowed strings above. No other text or reasoning.
Format:
{
  "category": "Office Supplies"
}`;

  try {
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();

    if (!textResponse || textResponse.trim().length === 0) {
      throw new Error(`[${ErrorCode.AI_CATEGORIZATION_FAILED}] Gemini returned an empty response.`);
    }

    const parsed = JSON.parse(textResponse) as { category?: string };
    const matchedCategory = STANDARD_CATEGORIES.find(
      (c) => c.toLowerCase() === parsed.category?.trim().toLowerCase()
    );

    if (matchedCategory) {
      return matchedCategory;
    }

    // Default match or fallback to 'Other' if categorizer gets creative
    return 'Other';
  } catch (error: unknown) {
    logger.error('AI_SERVICE', 'Categorization failed', error);
    throw new Error(`[${ErrorCode.AI_CATEGORIZATION_FAILED}] Failed to categorize expense using Gemini. Please check your API key and model config.`);
  }
}
