# PocketBudget CLI

A simple personal finance app you run in the terminal. You can add income, log expenses, set category budgets, check your balance, and keep everything saved in a local JSON file.

Repo: https://github.com/MohammadRefayetHossainMina/pocketbudget-cli-v2

> Please only use made-up / practice money data here. Don’t put in real bank details, card numbers, or your actual spending history.

---

## What this project is

The old “PocketBudget” idea was messy — rules mixed with file saving, and the balance was easy to break. I rebuilt it cleanly in Python with three jobs kept apart:

| Part | File | What it does | Jump to |
|---|---|---|---|
| Domain | `pocketbudget/account.py` | Holds the money rules and account state | [Balance](#keeping-the-balance-safe) · [History](#keeping-the-history-safe) · [Layers](#splitting-the-app-into-three-parts) |
| Storage | `pocketbudget/storage.py` | Saves and loads JSON | [Layers](#splitting-the-app-into-three-parts) · [Failures](#what-happens-when-something-goes-wrong) |
| CLI | `pocketbudget/cli.py` | Talks to you in the terminal | [Workflow](#how-a-command-moves-through-the-app) · [Usage](#how-to-run-the-app) |
| Errors | `pocketbudget/exceptions.py` | Clear error types when something’s wrong | [Custom errors](#custom-errors-instead-of-generic-ones) · [Failures](#what-happens-when-something-goes-wrong) |

There’s no database and no web API. Everything stays in memory while you work, then gets written to `data/budget.json`.

The repo already includes a small **sample save file** in `data/budget.json` (made-up Salary / Food / Transport / Bill data) so you can clone and run commands straight away. When you add new transactions, that file updates on your machine.

Want the full walkthrough? Start at [How a command moves through the app](#how-a-command-moves-through-the-app).

### The rules I locked in first

Before writing the app, I wrote them down in [`rules.md`](rules.md):

- Money is in **Australian dollars (AUD)** and shows up as `$`
- Allowed categories are **Food**, **Transport**, **Salary**, and **Bill**
- You **can’t go below $0** — overspending the balance is blocked
- Any expense over **$100** needs `--confirm`
- If you go near a category budget (20% or less left), you get a warning
- If you go over a category budget, the expense still records, but it’s flagged as over budget

---

## Project layout

```text
pocketbudget-cli-v2/
├── pocketbudget/
│   ├── account.py       # domain rules and state
│   ├── storage.py       # JSON save/load
│   ├── cli.py           # commands
│   └── exceptions.py    # custom errors
├── tests/               # pytest suite
├── data/budget.json     # sample save file so the app runs immediately
├── rules.md             # product rules written before the code
├── requirements.txt
├── .pre-commit-config.yaml
└── README.md
```

---

## Setup

You’ll need Python 3.11+ (`pip` and `git` help too).

```bash
git clone https://github.com/MohammadRefayetHossainMina/pocketbudget-cli-v2.git
cd pocketbudget-cli-v2

python -m venv .venv

# Windows (PowerShell)
.\.venv\Scripts\Activate.ps1

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
pre-commit install
```

Every commit runs a few checks for me:

- **Ruff** — cleans up the code and keeps complexity at 7 or under
- **MyPy** — strict type checks
- **Pytest** — runs the tests

---

## How to run the app

From the project folder:

```bash
python -m pocketbudget.cli
```

That just says hello. Here are the real commands:

```bash
# Money in and out
python -m pocketbudget.cli add-income 1000 Salary
python -m pocketbudget.cli add-expense 45 Food
python -m pocketbudget.cli add-expense 150 Transport --confirm

# Budgets and reports
python -m pocketbudget.cli set-budget Food 200
python -m pocketbudget.cli show-balance
python -m pocketbudget.cli show-history
python -m pocketbudget.cli show-summary
```

After a successful change, the app saves to `data/budget.json`.

If something fails validation, you’ll see a short `Error: ...` line — not a long Python traceback.

---

## How to run the tests

```bash
# Everything
pytest -v

# Or zoom in
pytest tests/test_account.py -v
pytest tests/test_storage.py -v
pytest tests/test_errors.py -v
pytest tests/test_cli.py -v

# Same checks git runs on commit
pre-commit run --all-files
```

---

## Design Decisions

### How a command moves through the app

This is the same story as the [architecture chart](#what-this-project-is), just in order — like walking someone through what happens when you type a command.

```text
You (terminal)
   │
   ▼
┌─────────┐
│   CLI   │  reads the command, prints the answer
└────┬────┘
     │ load / save
     ▼
┌─────────┐
│ Storage │  reads/writes data/budget.json
└────┬────┘
     │ public methods only
     ▼
┌─────────┐
│ Domain  │  applies money rules, updates safe state
└────┬────┘
     │ if something’s invalid
     ▼
┌─────────┐
│ Errors  │  typed failure → CLI shows a short message
└─────────┘
```

**Happy path (example: add an expense)**

1. You run a command in the [CLI](#how-to-run-the-app).
2. The CLI asks [Storage](#splitting-the-app-into-three-parts) to load `data/budget.json`.
3. Storage builds a fresh account through public methods — it does not poke private fields. See [Keeping the balance safe](#keeping-the-balance-safe) and [Keeping the history safe](#keeping-the-history-safe).
4. The CLI asks the [Domain](#splitting-the-app-into-three-parts) to record the expense.
5. Domain checks the [rules](#the-rules-i-locked-in-first). If everything’s fine, balance/history update.
6. CLI asks Storage to save again.
7. CLI prints a normal success message.

**Failure path**

1. Domain (or Storage) raises a [custom error](#custom-errors-instead-of-generic-ones).
2. Nothing half-updates — state stays as it was. Details are in [What happens when something goes wrong](#what-happens-when-something-goes-wrong).
3. CLI catches it and prints `Error: ...` — no traceback.

**Quick map from the chart**

| Chart box | In plain English | Read more |
|---|---|---|
| CLI | Front door. Takes your words, shows results. | [Usage](#how-to-run-the-app) · [Layers](#splitting-the-app-into-three-parts) |
| Storage | Filing cabinet. Saves/loads JSON only. | [Layers](#splitting-the-app-into-three-parts) |
| Domain | Brain. Owns balance, history, budgets, rules. | [Balance](#keeping-the-balance-safe) · [History](#keeping-the-history-safe) |
| Errors | Alarm system. Names the problem clearly. | [Custom errors](#custom-errors-instead-of-generic-ones) · [Failures](#what-happens-when-something-goes-wrong) |

Also useful: [Project layout](#project-layout) · [Tests](#how-to-run-the-tests) · [How I built it](#how-i-built-it)

### Keeping the balance safe

I keep the balance in a private field called `_balance`. You can read it with `account.balance`, but you can’t set it directly. If someone tries `account.balance = 500`, Python raises an `AttributeError`.

If you want to change the money, you have to go through `add_income()` or `add_expense()`. Those methods check the input first. If something’s wrong, they stop — the balance doesn’t move at all.

Back to the [workflow](#how-a-command-moves-through-the-app).

### Keeping the history safe

Transactions live in a private list. When you ask for them with `get_transactions()`, you get a copy, not the real list. So if someone does `.clear()` or `.pop()` on what they got back, the account’s own history stays untouched.

Same idea for budgets and spending totals — you get copies, not the internal ones.

Back to the [workflow](#how-a-command-moves-through-the-app).

### Splitting the app into three parts

I kept the jobs separate on purpose (same four boxes as the [chart](#what-this-project-is)):

- The **domain** (`account.py`) is where the rules live. That’s what decides if an amount is valid, if you can overspend, if a category is allowed, and whether a big expense needs confirmation. See [balance](#keeping-the-balance-safe) and [history](#keeping-the-history-safe).
- **Storage** (`storage.py`) only saves and loads files. When it loads data, it builds a new `Account` and replays everything through the normal methods (`set_budget`, `add_income`, `add_expense`). It never reaches in and edits private fields. File data has to pass the same checks as typing something in by hand. When old expenses over `$100` come back from disk, storage replays them with confirmation so history can load safely without weakening the live “ask first” rule.
- The **CLI** (`cli.py`) just talks to the user. It reads commands, calls the domain and storage, and prints the result. If something fails, it shows a short error message instead of a scary traceback. It doesn’t invent its own money rules.
- **Errors** (`exceptions.py`) give each failure a clear name. Jump to [custom errors](#custom-errors-instead-of-generic-ones).

Back to the [workflow](#how-a-command-moves-through-the-app).

### Custom errors instead of generic ones

I use specific exception types so the reason for a failure is obvious:

- `InvalidAmountError`
- `InsufficientFundsError`
- `ConfirmationRequiredError`
- `InvalidCategoryError`
- `CorruptStorageError`

That way “you overspent your balance” doesn’t look the same as “your save file is broken.”

See the full failure table in [What happens when something goes wrong](#what-happens-when-something-goes-wrong), or jump back to the [workflow](#how-a-command-moves-through-the-app).

### What happens when something goes wrong

| If this happens | Here’s what the app does |
|---|---|
| Negative or zero amount | Raises `InvalidAmountError` and leaves everything as it was |
| Expense bigger than the balance | Raises `InsufficientFundsError` and leaves everything as it was |
| Expense over `$100` without `--confirm` | Raises `ConfirmationRequiredError` and leaves everything as it was |
| Empty or unknown category | Raises `InvalidCategoryError` and leaves everything as it was |
| Save file is missing | Starts with a fresh empty account |
| Save file is corrupted | Raises `CorruptStorageError` — it won’t quietly load a wrong balance |

Budgets can warn you when you’re close to the limit, or when you go over. But they never override the balance rule. If you don’t have enough money, the expense is blocked.

These are the alarms on the [failure path](#how-a-command-moves-through-the-app).

### How I built it

I wrote the product rules in [`rules.md`](rules.md) first, then built the app test-first: write a failing test, make it pass, then commit. You can see that step-by-step progress in the git history.

I also kept the design simple on purpose — plain Python, JSON files, no database, no web framework. That made the encapsulation and boundaries easier to prove with [tests](#how-to-run-the-tests).

Start from the [workflow](#how-a-command-moves-through-the-app) if you want the big picture again.
