import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { invoiceSchema, invoiceStatusSchema } from '../types/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice
} from '../services/invoice.service.js';

const router = Router();

router.use(authMiddleware);

// GET /api/invoices
router.get('/', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;
  const invoices = await getInvoices(userId);

  res.status(200).json({
    success: true,
    data: invoices,
  });
}));

// GET /api/invoices/:id
router.get('/:id', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;
  const invoiceId = req.params.id;

  try {
    const invoice = await getInvoiceById(userId, invoiceId);
    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('ERR_INVOICE_NOT_FOUND')) {
      res.status(404).json({
        success: false,
        error: { code: 'ERR_INVOICE_NOT_FOUND', message: 'Invoice not found.' },
      });
      return;
    }
    throw error;
  }
}));

// POST /api/invoices
router.post(
  '/',
  validate(invoiceSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId!;
    try {
      const invoice = await createInvoice(userId, req.body);
      res.status(201).json({
        success: true,
        data: invoice,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('ERR_CLIENT_NOT_FOUND')) {
          res.status(400).json({
            success: false,
            error: { code: 'ERR_CLIENT_NOT_FOUND', message: 'Specified client does not exist.' },
          });
          return;
        }
      }
      throw error;
    }
  })
);

// PUT /api/invoices/:id
router.put(
  '/:id',
  validate(invoiceSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId!;
    const invoiceId = req.params.id;

    try {
      const invoice = await updateInvoice(userId, invoiceId, req.body);
      res.status(200).json({
        success: true,
        data: invoice,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('ERR_INVOICE_NOT_FOUND')) {
          res.status(404).json({
            success: false,
            error: { code: 'ERR_INVOICE_NOT_FOUND', message: 'Invoice not found.' },
          });
          return;
        }
        if (error.message.includes('ERR_CLIENT_NOT_FOUND')) {
          res.status(400).json({
            success: false,
            error: { code: 'ERR_CLIENT_NOT_FOUND', message: 'Specified client does not exist.' },
          });
          return;
        }
      }
      throw error;
    }
  })
);

// PATCH /api/invoices/:id/status
router.patch(
  '/:id/status',
  validate(invoiceStatusSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId!;
    const invoiceId = req.params.id;
    const { status } = req.body;

    try {
      const invoice = await updateInvoiceStatus(userId, invoiceId, status);
      res.status(200).json({
        success: true,
        data: invoice,
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('ERR_INVOICE_NOT_FOUND')) {
        res.status(404).json({
          success: false,
          error: { code: 'ERR_INVOICE_NOT_FOUND', message: 'Invoice not found.' },
        });
        return;
      }
      throw error;
    }
  })
);

// DELETE /api/invoices/:id
router.delete('/:id', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;
  const invoiceId = req.params.id;

  try {
    await deleteInvoice(userId, invoiceId);
    res.status(200).json({
      success: true,
      data: null,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('ERR_INVOICE_NOT_FOUND')) {
      res.status(404).json({
        success: false,
        error: { code: 'ERR_INVOICE_NOT_FOUND', message: 'Invoice not found.' },
      });
      return;
    }
    throw error;
  }
}));

export default router;
