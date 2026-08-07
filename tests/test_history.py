"""Tests for transaction history encapsulation and mutability protection."""

from __future__ import annotations

from pocketbudget.account import Account


def test_get_transactions_returns_copy_not_internal_list() -> None:
    """Mutating the returned history must not affect the account's internal state."""
    account = Account()
    account.add_income(100)
    account.add_expense(25)

    history = account.get_transactions()
    assert len(history) == 2

    history.clear()
    assert history == []

    # Internal history must remain intact after external mutation.
    assert len(account.get_transactions()) == 2


def test_popping_returned_history_does_not_alter_account() -> None:
    account = Account()
    account.add_income(50)
    account.add_expense(10)

    history = account.get_transactions()
    history.pop()

    remaining = account.get_transactions()
    assert len(remaining) == 2
