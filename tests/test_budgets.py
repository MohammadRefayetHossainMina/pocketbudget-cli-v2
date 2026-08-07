"""Tests for category budget limits per rules.md."""

from __future__ import annotations

import pytest

from pocketbudget.account import Account
from pocketbudget.exceptions import InsufficientFundsError


def test_expense_under_budget_has_no_warning_flags() -> None:
    account = Account()
    account.add_income(500)
    account.set_budget("Food", 200)

    result = account.add_expense(50, category="Food")

    assert account.balance == 450
    assert result.over_budget is False
    assert result.approaching_limit is False


def test_expense_approaching_budget_limit_is_flagged() -> None:
    """Warn when remaining budget would drop to <= 20% of the limit."""
    account = Account()
    account.add_income(500)
    account.set_budget("Food", 100)

    # Remaining after this expense: 15 -> 15% of 100 (<= 20%).
    result = account.add_expense(85, category="Food")

    assert account.balance == 415
    assert result.approaching_limit is True
    assert result.over_budget is False


def test_expense_exceeding_category_budget_is_recorded_with_over_budget_flag() -> None:
    """rules.md: over-budget expenses are recorded with a warning flag, not blocked."""
    account = Account()
    account.add_income(500)
    account.set_budget("Food", 100)

    result = account.add_expense(120, category="Food", confirmed=True)

    assert account.balance == 380
    assert len(account.get_transactions()) == 2
    assert result.over_budget is True


def test_over_budget_does_not_bypass_negative_balance_protection() -> None:
    """Balance protection always wins over budget warnings."""
    account = Account()
    account.add_income(50)
    account.set_budget("Food", 200)

    with pytest.raises(InsufficientFundsError):
        account.add_expense(60, category="Food")

    assert account.balance == 50
    assert len(account.get_transactions()) == 1
