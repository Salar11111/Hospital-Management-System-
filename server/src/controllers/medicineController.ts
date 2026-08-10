import type { Request, Response } from 'express';
import { Medicine } from '../models/Medicine.js';
import { ApiError } from '../middleware/error.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { buildPagination, parsePagination } from '../utils/paginate.js';
import { LOW_STOCK_THRESHOLD } from '../config/constants.js';

export const listMedicines = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = parsePagination(req.query);
  const filter: Record<string, unknown> = {};

  if (req.query.search) {
    const search = String(req.query.search);
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { genericName: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];
  }
  if (req.query.category) filter.category = String(req.query.category);
  if (req.query.lowStock === 'true') filter.stockQuantity = { $lte: LOW_STOCK_THRESHOLD };

  const [total, medicines] = await Promise.all([
    Medicine.countDocuments(filter),
    Medicine.find(filter)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  res.status(200).json({ success: true, data: medicines, pagination: buildPagination(total, page, limit) });
});

export const getMedicine = asyncHandler(async (req: Request, res: Response) => {
  const medicine = await Medicine.findById(req.params.id);
  if (!medicine) throw new ApiError(404, 'Medicine not found');
  res.status(200).json({ success: true, data: medicine });
});

export const createMedicine = asyncHandler(async (req: Request, res: Response) => {
  const existing = await Medicine.findOne({ name: req.body.name });
  if (existing) throw new ApiError(409, 'A medicine with this name already exists');

  const medicine = await Medicine.create(req.body);
  res.status(201).json({ success: true, message: 'Medicine added', data: medicine });
});

export const updateMedicine = asyncHandler(async (req: Request, res: Response) => {
  const medicine = await Medicine.findById(req.params.id);
  if (!medicine) throw new ApiError(404, 'Medicine not found');

  const allowed = [
    'genericName',
    'category',
    'stockQuantity',
    'price',
    'expiryDate',
    'supplier',
    'reorderLevel',
  ];
  const updates: Record<string, unknown> = {};
  for (const field of allowed) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  medicine.set(updates);
  await medicine.save();
  res.status(200).json({ success: true, message: 'Medicine updated', data: medicine });
});

export const deleteMedicine = asyncHandler(async (req: Request, res: Response) => {
  const medicine = await Medicine.findById(req.params.id);
  if (!medicine) throw new ApiError(404, 'Medicine not found');

  medicine.stockQuantity = 0;
  await medicine.save();
  res.status(200).json({ success: true, message: 'Medicine removed' });
});