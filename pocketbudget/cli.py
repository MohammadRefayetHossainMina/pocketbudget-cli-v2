"""CLI entry point for PocketBudget."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from pocketbudget.account import Account
from pocketbudget.exceptions import PocketBudgetError
from pocketbudget.storage import load_account, save_account

DATA_PATH = Path("data") / "budget.json"


def format_money(amount: float) -> str:
    """Format an AUD amount for display."""
    return f"${amount:.2f}"


def build_parser() -> argparse.ArgumentParser:
    """Create the top-level argument parser with subcommands."""
    parser = argparse.ArgumentParser(
        prog="pocketbudget", description="PocketBudget CLI"
    )
    subparsers = parser.add_subparsers(dest="command")

    add_income = subparsers.add_parser("add-income", help="Record income")
    add_income.add_argument("amount", type=float)
    add_income.add_argument("category")

    add_expense = subparsers.add_parser("add-expense", help="Record an expense")
    add_expense.add_argument("amount", type=float)
    add_expense.add_argument("category")
    add_expense.add_argument(
        "--confirm",
        action="store_true",
        help="Confirm expenses over $100",
    )

    subparsers.add_parser("show-balance", help="Show current balance")
    subparsers.add_parser("show-history", help="Show transaction history")

    set_budget = subparsers.add_parser("set-budget", help="Set a category budget")
    set_budget.add_argument("category")
    set_budget.add_argument("limit", type=float)

    subparsers.add_parser("show-summary", help="Show spending versus budgets")
    return parser


def main(argv: list[str] | None = None) -> int:
    """Run the CLI and return a process exit code."""
    parser = build_parser()
    args = parser.parse_args(argv)

    if args.command is None:
        print("Hello PocketBudget")
        return 0

    try:
        return _dispatch(args)
    except PocketBudgetError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1


def _dispatch(args: argparse.Namespace) -> int:
    handlers = {
        "add-income": _cmd_add_income,
        "add-expense": _cmd_add_expense,
        "show-balance": _cmd_show_balance,
        "show-history": _cmd_show_history,
        "set-budget": _cmd_set_budget,
        "show-summary": _cmd_show_summary,
    }
    return handlers[args.command](args)


def _load() -> Account:
    return load_account(DATA_PATH)


def _save(account: Account) -> None:
    save_account(account, DATA_PATH)


def _cmd_add_income(args: argparse.Namespace) -> int:
    account = _load()
    account.add_income(args.amount, args.category)
    _save(account)
    print(f"Recorded income {format_money(args.amount)} under {args.category}")
    return 0


def _cmd_add_expense(args: argparse.Namespace) -> int:
    account = _load()
    result = account.add_expense(
        args.amount,
        args.category,
        confirmed=args.confirm,
    )
    _save(account)
    print(f"Recorded expense {format_money(args.amount)} under {args.category}")
    if result.over_budget:
        print("Warning: this expense is over budget for the category.")
    elif result.approaching_limit:
        print("Warning: this expense brings spending close to the category budget.")
    return 0


def _cmd_show_balance(_: argparse.Namespace) -> int:
    account = _load()
    print(f"Balance: {format_money(account.balance)}")
    return 0


def _cmd_show_history(_: argparse.Namespace) -> int:
    account = _load()
    transactions = account.get_transactions()
    if not transactions:
        print("No transactions yet.")
        return 0

    for index, tx in enumerate(transactions, start=1):
        category = tx.get("category", "Uncategorised")
        print(
            f"{index}. {tx['type']} {format_money(float(tx['amount']))} "
            f"[{category}] ({tx.get('date', 'n/a')})"
        )
    return 0


def _cmd_set_budget(args: argparse.Namespace) -> int:
    account = _load()
    account.set_budget(args.category, args.limit)
    _save(account)
    print(f"Budget for {args.category} set to {format_money(args.limit)}")
    return 0


def _cmd_show_summary(_: argparse.Namespace) -> int:
    account = _load()
    budgets = account.get_budgets()
    spent = account.get_spending_by_category()
    if not budgets and not spent:
        print("No budgets or category spending yet.")
        return 0

    categories = sorted(set(budgets) | set(spent))
    for category in categories:
        limit = budgets.get(category)
        used = spent.get(category, 0.0)
        if limit is None:
            print(f"{category}: spent {format_money(used)} (no budget set)")
        else:
            remaining = limit - used
            print(
                f"{category}: spent {format_money(used)} / "
                f"{format_money(limit)} (remaining {format_money(remaining)})"
            )
    return 0


if __name__ == "__main__":
    sys.exit(main())
