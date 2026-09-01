"""Browser demo helpers. Uses the same Account and storage as the CLI."""

from __future__ import annotations

from pathlib import Path

from pocketbudget.cli import format_money
from pocketbudget.exceptions import PocketBudgetError
from pocketbudget.storage import load_account, save_account

DATA_PATH = Path("data") / "budget.json"
SAMPLE_PATH = Path("data") / "sample.json"

account = load_account(DATA_PATH)
last_message = "Sample data loaded from data/budget.json."
last_ok = True


def _save() -> None:
    save_account(account, DATA_PATH)


def add_income(amount: float, category: str) -> None:
    global last_message, last_ok
    try:
        account.add_income(float(amount), category)
        _save()
        last_ok = True
        last_message = f"Recorded income {format_money(float(amount))} under {category}"
    except PocketBudgetError as exc:
        last_ok = False
        last_message = f"Error: {exc}"


def add_expense(amount: float, category: str, confirmed: bool) -> None:
    global last_message, last_ok
    try:
        result = account.add_expense(float(amount), category, confirmed=bool(confirmed))
        _save()
        last_ok = True
        last_message = f"Recorded expense {format_money(float(amount))} under {category}"
        if result.over_budget:
            last_message += " Warning: this expense is over budget for the category."
        elif result.approaching_limit:
            last_message += " Warning: this expense brings spending close to the category budget."
    except PocketBudgetError as exc:
        last_ok = False
        last_message = f"Error: {exc}"


def set_budget(category: str, limit: float) -> None:
    global last_message, last_ok
    try:
        account.set_budget(category, float(limit))
        _save()
        last_ok = True
        last_message = f"Budget for {category} set to {format_money(float(limit))}"
    except PocketBudgetError as exc:
        last_ok = False
        last_message = f"Error: {exc}"


def reset_demo() -> None:
    global account, last_message, last_ok
    DATA_PATH.write_text(SAMPLE_PATH.read_text(encoding="utf-8"), encoding="utf-8")
    account = load_account(DATA_PATH)
    last_ok = True
    last_message = "Sample data reloaded."


def snapshot() -> dict[str, object]:
    budgets = account.get_budgets()
    spent = account.get_spending_by_category()
    summary: list[str] = []
    for category in sorted(set(budgets) | set(spent)):
        used = spent.get(category, 0.0)
        limit = budgets.get(category)
        if limit is None:
            summary.append(f"{category}: spent {format_money(used)} (no budget set)")
        else:
            remaining = limit - used
            summary.append(
                f"{category}: spent {format_money(used)} / {format_money(limit)} "
                f"(remaining {format_money(remaining)})"
            )

    history: list[str] = []
    for index, tx in enumerate(account.get_transactions(), start=1):
        category = tx.get("category", "Uncategorised")
        history.append(
            f"{index}. {tx['type']} {format_money(float(tx['amount']))} "
            f"[{category}] ({tx.get('date', 'n/a')})"
        )

    return {
        "balance_text": format_money(account.balance),
        "message": last_message,
        "ok": last_ok,
        "summary": summary,
        "history": history,
    }
