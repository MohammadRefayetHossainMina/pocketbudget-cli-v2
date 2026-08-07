"""Domain model for PocketBudget account state and balance rules."""

from __future__ import annotations

from datetime import date
from typing import Any


class Account:
    """Personal finance account with encapsulated balance mutations."""

    def __init__(self) -> None:
        self._balance: float = 0.0
        self._transactions: list[dict[str, Any]] = []

    @property
    def balance(self) -> float:
        """Current account balance (read-only)."""
        return self._balance

    def add_income(self, amount: float) -> None:
        """Increase the balance by a positive income amount."""
        self._validate_positive_amount(amount)
        self._balance += amount
        self._transactions.append(
            {"type": "income", "amount": amount, "date": date.today().isoformat()}
        )

    def add_expense(self, amount: float) -> None:
        """Decrease the balance by a positive expense amount.

        Per rules.md, expenses that would create a negative balance are blocked.
        """
        self._validate_positive_amount(amount)
        if amount > self._balance:
            raise ValueError("Expense exceeds available balance")
        self._balance -= amount
        self._transactions.append(
            {"type": "expense", "amount": amount, "date": date.today().isoformat()}
        )

    def get_transactions(self) -> list[dict[str, Any]]:
        """Return a shallow copy of the transaction history."""
        return list(self._transactions)

    @staticmethod
    def _validate_positive_amount(amount: float) -> None:
        if amount <= 0:
            raise ValueError("Transaction amount must be positive")
