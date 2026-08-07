"""Tests for custom domain exceptions and failed-operation state safety."""

from __future__ import annotations

from pathlib import Path

import pytest

from pocketbudget.account import Account
from pocketbudget.exceptions import (
    ConfirmationRequiredError,
    CorruptStorageError,
    InsufficientFundsError,
    InvalidAmountError,
    InvalidCategoryError,
)
from pocketbudget.storage import load_account


def test_negative_income_raises_invalid_amount_and_keeps_balance() -> None:
    account = Account()
    account.add_income(100)

    with pytest.raises(InvalidAmountError):
        account.add_income(-25)

    assert account.balance == 100
    assert len(account.get_transactions()) == 1


def test_negative_expense_raises_invalid_amount_and_keeps_balance() -> None:
    account = Account()
    account.add_income(100)

    with pytest.raises(InvalidAmountError):
        account.add_expense(-10, category="Food")

    assert account.balance == 100
    assert len(account.get_transactions()) == 1


def test_overdraft_raises_insufficient_funds_and_keeps_state() -> None:
    account = Account()
    account.add_income(40)

    with pytest.raises(InsufficientFundsError):
        account.add_expense(41, category="Bill")

    assert account.balance == 40
    assert len(account.get_transactions()) == 1


def test_large_expense_without_confirmation_raises_and_keeps_state() -> None:
    account = Account()
    account.add_income(500)

    with pytest.raises(ConfirmationRequiredError):
        account.add_expense(150, category="Transport")

    assert account.balance == 500
    assert len(account.get_transactions()) == 1


def test_unknown_category_raises_and_keeps_state() -> None:
    account = Account()
    account.add_income(100, category="Salary")

    with pytest.raises(InvalidCategoryError):
        account.add_expense(20, category="Travel")

    assert account.balance == 100
    assert len(account.get_transactions()) == 1


def test_corrupt_storage_raises_without_returning_bad_account(tmp_path: Path) -> None:
    path = tmp_path / "broken.json"
    path.write_text("not-json", encoding="utf-8")

    with pytest.raises(CorruptStorageError):
        load_account(path)
