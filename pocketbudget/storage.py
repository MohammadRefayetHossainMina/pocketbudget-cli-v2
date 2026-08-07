"""JSON persistence for PocketBudget accounts."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from pocketbudget.account import Account


def save_account(account: Account, filepath: str | Path) -> None:
    """Write account transaction history to a JSON file."""
    path = Path(filepath)
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {"transactions": account.get_transactions()}
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def load_account(filepath: str | Path) -> Account:
    """Load an account from JSON, rebuilding state via public domain methods.

    Missing files yield an empty account. Corrupt JSON raises ValueError.
    """
    path = Path(filepath)
    if not path.exists():
        return Account()

    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError(f"Corrupt save file: {path}") from exc

    if not isinstance(raw, dict):
        raise ValueError(f"Corrupt save file: {path}")

    transactions = raw.get("transactions", [])
    if not isinstance(transactions, list):
        raise ValueError(f"Corrupt save file: {path}")

    account = Account()
    for item in transactions:
        _apply_transaction(account, item)
    return account


def _apply_transaction(account: Account, item: Any) -> None:
    if not isinstance(item, dict):
        raise ValueError("Invalid transaction record in save file")

    tx_type = item.get("type")
    amount = item.get("amount")
    if not isinstance(amount, (int, float)):
        raise ValueError("Invalid transaction amount in save file")

    if tx_type == "income":
        account.add_income(float(amount))
    elif tx_type == "expense":
        account.add_expense(float(amount))
    else:
        raise ValueError(f"Unknown transaction type: {tx_type!r}")
