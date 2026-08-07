"""Domain model for PocketBudget account state and balance rules."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Any

ALLOWED_CATEGORIES = frozenset({"Food", "Transport", "Salary", "Bill"})
APPROACHING_LIMIT_RATIO = 0.20
LARGE_EXPENSE_THRESHOLD = 100.0


@dataclass(frozen=True)
class TransactionResult:
    """Outcome flags for a recorded expense."""

    over_budget: bool = False
    approaching_limit: bool = False


class Account:
    """Personal finance account with encapsulated balance mutations."""

    def __init__(self) -> None:
        self._balance: float = 0.0
        self._transactions: list[dict[str, Any]] = []
        self._budgets: dict[str, float] = {}
        self._spent: dict[str, float] = {}

    @property
    def balance(self) -> float:
        """Current account balance (read-only)."""
        return self._balance

    def set_budget(self, category: str, limit: float) -> None:
        """Set a spending limit for an allowed category."""
        normalized = self._normalize_category(category)
        if limit <= 0:
            raise ValueError("Budget limit must be positive")
        self._budgets[normalized] = float(limit)

    def add_income(self, amount: float, category: str | None = None) -> None:
        """Increase the balance by a positive income amount."""
        self._validate_positive_amount(amount)
        record: dict[str, Any] = {
            "type": "income",
            "amount": amount,
            "date": date.today().isoformat(),
        }
        if category is not None:
            record["category"] = self._normalize_category(category)
        self._balance += amount
        self._transactions.append(record)

    def add_expense(
        self,
        amount: float,
        category: str | None = None,
        *,
        confirmed: bool = False,
    ) -> TransactionResult:
        """Decrease the balance by a positive expense amount.

        Per rules.md:
        - expenses that would create a negative balance are blocked
        - amounts over $100 require confirmation
        - category budget breaches are flagged, not blocked
        """
        self._validate_positive_amount(amount)
        if amount > LARGE_EXPENSE_THRESHOLD and not confirmed:
            raise ValueError("Expenses over $100 require confirmation")
        if amount > self._balance:
            raise ValueError("Expense exceeds available balance")

        normalized: str | None = None
        if category is not None:
            normalized = self._normalize_category(category)

        result = self._budget_flags(amount, normalized)

        self._balance -= amount
        if normalized is not None:
            self._spent[normalized] = self._spent.get(normalized, 0.0) + amount

        record: dict[str, Any] = {
            "type": "expense",
            "amount": amount,
            "date": date.today().isoformat(),
            "over_budget": result.over_budget,
            "approaching_limit": result.approaching_limit,
        }
        if normalized is not None:
            record["category"] = normalized
        self._transactions.append(record)
        return result

    def get_transactions(self) -> list[dict[str, Any]]:
        """Return a shallow copy of the transaction history."""
        return list(self._transactions)

    def _budget_flags(self, amount: float, category: str | None) -> TransactionResult:
        if category is None or category not in self._budgets:
            return TransactionResult()

        limit = self._budgets[category]
        projected_spent = self._spent.get(category, 0.0) + amount
        remaining_after = limit - projected_spent

        if projected_spent > limit:
            return TransactionResult(over_budget=True, approaching_limit=False)
        if remaining_after <= limit * APPROACHING_LIMIT_RATIO:
            return TransactionResult(over_budget=False, approaching_limit=True)
        return TransactionResult()

    @staticmethod
    def _normalize_category(category: str) -> str:
        cleaned = category.strip()
        if not cleaned:
            raise ValueError("Category must not be empty")
        normalized = cleaned.title()
        if normalized not in ALLOWED_CATEGORIES:
            raise ValueError(f"Unknown category: {category!r}")
        return normalized

    @staticmethod
    def _validate_positive_amount(amount: float) -> None:
        if amount <= 0:
            raise ValueError("Transaction amount must be positive")
