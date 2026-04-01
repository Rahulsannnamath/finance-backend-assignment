import mongoose from 'mongoose';
import { TRANSACTION_TYPES, CATEGORIES } from '../utils/constants.js';

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Transaction must belong to a user'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      enum: {
        values: Object.values(TRANSACTION_TYPES),
        message: 'Type must be either income or expense',
      },
      required: [true, 'Transaction type is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: `Category must be one of: ${CATEGORIES.join(', ')}`,
      },
    },
    date: {
      type: Date,
      required: [true, 'Transaction date is required'],
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description must be at most 500 characters'],
      default: '',
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false, // Soft delete — hidden by default
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        delete ret.isDeleted;
        return ret;
      },
    },
  }
);

// ─── Compound indexes for efficient querying ───
transactionSchema.index({ type: 1, date: -1 });
transactionSchema.index({ category: 1, date: -1 });
transactionSchema.index({ user: 1, isDeleted: 1, date: -1 });

// ─── Query middleware: exclude soft-deleted by default ───
transactionSchema.pre(/^find/, function (next) {
  // Only apply if isDeleted hasn't been explicitly set in the query
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
