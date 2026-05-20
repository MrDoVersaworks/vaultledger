import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { expenseSchema } from '../types/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getExpenses,
  getExpenseById,
  createExpense,
  createExpenseAI,
  updateExpense,
  deleteExpense
} from '../services/expense.service.js';

const router = Router();

router.use(authMiddleware);

// GET /api/expenses
router.get('/', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;
  const expenses = await getExpenses(userId);

  res.status(200).json({
    success: true,
    data: expenses,
  });
}));

// GET /api/expenses/:id
router.get('/:id', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;
  const expenseId = req.params.id;

  try {
    const expense = await getExpenseById(userId, expenseId);
    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('ERR_EXPENSE_NOT_FOUND')) {
      res.status(404).json({
        success: false,
        error: { code: 'ERR_EXPENSE_NOT_FOUND', message: 'Expense record not found.' },
      });
      return;
    }
    throw error;
  }
}));

// POST /api/expenses (Manual create)
router.post(
  '/',
  validate(expenseSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId!;
    const expense = await createExpense(userId, req.body);

    res.status(201).json({
      success: true,
      data: expense,
    });
  })
);

// POST /api/expenses/ai (AI-assisted categorization create)
router.post(
  '/ai',
  validate(expenseSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId!;
    const expense = await createExpenseAI(userId, req.body);

    res.status(201).json({
      success: true,
      data: expense,
    });
  })
);

// PUT /api/expenses/:id
router.put(
  '/:id',
  validate(expenseSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId!;
    const expenseId = req.params.id;

    try {
      const expense = await updateExpense(userId, expenseId, req.body);
      res.status(200).json({
        success: true,
        data: expense,
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('ERR_EXPENSE_NOT_FOUND')) {
        res.status(404).json({
          success: false,
          error: { code: 'ERR_EXPENSE_NOT_FOUND', message: 'Expense record not found.' },
        });
        return;
      }
      throw error;
    }
  })
);

// DELETE /api/expenses/:id
router.delete('/:id', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;
  const expenseId = req.params.id;

  try {
    await deleteExpense(userId, expenseId);
    res.status(200).json({
      success: true,
      data: null,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('ERR_EXPENSE_NOT_FOUND')) {
      res.status(404).json({
        success: false,
        error: { code: 'ERR_EXPENSE_NOT_FOUND', message: 'Expense record not found.' },
      });
      return;
    }
    throw error;
  }
}));

export default router;
