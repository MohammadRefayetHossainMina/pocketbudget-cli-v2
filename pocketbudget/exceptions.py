"""Custom exceptions for PocketBudget domain and storage errors."""

from __future__ import annotations


class PocketBudgetError(Exception):
    """Base class for all PocketBudget application errors."""


class InvalidAmountError(PocketBudgetError):
    """Raised when a transaction amount is missing, zero, or negative."""


class InsufficientFundsError(PocketBudgetError):
    """Raised when an expense would drive the balance below zero."""


class ConfirmationRequiredError(PocketBudgetError):
    """Raised when an expense over $100 is submitted without confirmation."""


class InvalidCategoryError(PocketBudgetError):
    """Raised when a category is empty or not in the allowed set."""


class InvalidBudgetError(PocketBudgetError):
    """Raised when a budget limit is invalid."""


class CorruptStorageError(PocketBudgetError):
    """Raised when a save file is missing required structure or is unreadable."""
