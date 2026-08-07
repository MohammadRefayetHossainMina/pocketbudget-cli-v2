"""JSON persistence for PocketBudget accounts."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from pocketbudget.account import Account
from pocketbudget.exceptions import CorruptStorageError


def save_account(account: Account, filepath: str | Path) -> None:
    """Write account budgets and transaction history to a JSON file."""
    path = Path(filepath)
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "budgets": account.get_budgets(),
        "transactions": account.get_transactions(),
    }
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def load_account(filepath: str | Path) -> Account:
    """Load an account from JSON, rebuilding state via public domain methods.

    Missing files yield an empty account. Corrupt JSON raises CorruptStorageError.
    """
    path = Path(filepath)
    if not path.exists():
        return Account()

    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise CorruptStorageError(f"Corrupt save file: {path}") from exc

    if not isinstance(raw, dict):
        raise CorruptStorageError(f"Corrupt save file: {path}")

    account = Account()
    _apply_budgets(account, raw.get("budgets", {}))

    transactions = raw.get("transactions", [])
    if not isinstance(transactions, list):
        raise CorruptStorageError(f"Corrupt save file: {path}")

    for item in transactions:
        _apply_transaction(account, item)
    return account


def _apply_budgets(account: Account, budgets: Any) -> None:
    if budgets is None:
        return
    if not isinstance(budgets, dict):
        raise CorruptStorageError("Invalid budgets section in save file")
    for category, limit in budgets.items():
        if not isinstance(category, str) or not isinstance(limit, (int, float)):
            raise CorruptStorageError("Invalid budget entry in save file")
        account.set_budget(category, float(limit))


def _apply_transaction(account: Account, item: Any) -> None:
    if not isinstance(item, dict):
        raise CorruptStorageError("Invalid transaction record in save file")

    tx_type = item.get("type")
    amount = item.get("amount")
    if not isinstance(amount, (int, float)):
        raise CorruptStorageError("Invalid transaction amount in save file")

    category = item.get("category")
    if category is not None and not isinstance(category, str):
        raise CorruptStorageError("Invalid transaction category in save file")

    if tx_type == "income":
        account.add_income(float(amount), category)
    elif tx_type == "expense":
        # Replays must pass confirmation so large historical expenses can load.
        account.add_expense(float(amount), category, confirmed=True)
    else:
        raise CorruptStorageError(f"Unknown transaction type: {tx_type!r}")
