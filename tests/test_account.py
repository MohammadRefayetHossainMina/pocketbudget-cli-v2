"""Unit tests for Account encapsulation and balance rules."""

from __future__ import annotations

import pytest

from pocketbudget.account import Account
from pocketbudget.exceptions import InsufficientFundsError, InvalidAmountError


def test_balance_is_readable_but_not_directly_assignable() -> None:
    account = Account()

    assert account.balance == 0

    with pytest.raises(AttributeError):
        account.balance = 500  # type: ignore[misc]


def test_add_income_increases_balance() -> None:
    account = Account()

    account.add_income(100)

    assert account.balance == 100


def test_add_expense_decreases_balance() -> None:
    account = Account()
    account.add_income(100)

    account.add_expense(40)

    assert account.balance == 60


def test_negative_income_raises_value_error() -> None:
    account = Account()

    with pytest.raises(InvalidAmountError):
        account.add_income(-10)

    assert account.balance == 0


def test_negative_expense_raises_value_error() -> None:
    account = Account()
    account.add_income(50)

    with pytest.raises(InvalidAmountError):
        account.add_expense(-5)

    assert account.balance == 50


def test_overdrawing_is_blocked_and_leaves_balance_unchanged() -> None:
    """rules.md: expenses that would create a negative balance are blocked."""
    account = Account()
    account.add_income(50)

    with pytest.raises(InsufficientFundsError):
        account.add_expense(51)

    assert account.balance == 50


def test_expense_equal_to_balance_is_allowed() -> None:
    """rules.md: expense <= balance is allowed; balance may reach exactly $0."""
    account = Account()
    account.add_income(50)

    account.add_expense(50)

    assert account.balance == 0
