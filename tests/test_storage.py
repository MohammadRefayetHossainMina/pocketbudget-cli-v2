"""Tests for JSON persistence without breaking Account encapsulation."""

from __future__ import annotations

from pathlib import Path

import pytest

from pocketbudget.account import Account
from pocketbudget.exceptions import CorruptStorageError, InvalidAmountError
from pocketbudget.storage import load_account, save_account


def test_save_and_load_round_trip_restores_balance_and_history(
    tmp_path: Path,
) -> None:
    path = tmp_path / "budget.json"
    account = Account()
    account.add_income(100)
    account.add_expense(30)

    save_account(account, path)
    loaded = load_account(path)

    assert loaded.balance == 70
    assert len(loaded.get_transactions()) == 2
    assert loaded.get_transactions()[0]["type"] == "income"
    assert loaded.get_transactions()[1]["type"] == "expense"


def test_load_missing_file_returns_empty_account(tmp_path: Path) -> None:
    path = tmp_path / "does-not-exist.json"

    loaded = load_account(path)

    assert loaded.balance == 0
    assert loaded.get_transactions() == []


def test_load_corrupt_json_raises_error(tmp_path: Path) -> None:
    path = tmp_path / "corrupt.json"
    path.write_text("{not valid json", encoding="utf-8")

    with pytest.raises(CorruptStorageError):
        load_account(path)


def test_load_rejects_invalid_saved_amounts_without_corrupting_state(
    tmp_path: Path,
) -> None:
    """Loaded data must go through domain validation, not private writes."""
    path = tmp_path / "bad-amounts.json"
    path.write_text(
        '{"transactions": [{"type": "income", "amount": -50, "date": "2026-01-01"}]}',
        encoding="utf-8",
    )

    with pytest.raises(InvalidAmountError):
        load_account(path)
