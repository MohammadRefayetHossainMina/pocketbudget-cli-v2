# PocketBudget Domain Rules

These rules define application behaviour before any domain code is written.
Implementation and tests must match this file.

Use **fictional financial data only** — never real bank details or personal statements.

---

## 1. Currency Symbol

| Setting | Value |
|---|---|
| Currency | Australian Dollar (AUD) |
| Display symbol | `$` |
| Amount format | Two decimal places (e.g. `$12.50`) |

All amounts shown in the CLI use the `$` prefix. Internal storage uses decimal/number types, not formatted strings.

---

## 2. Standard Categories

Only these categories are accepted (case-insensitive on input; stored in Title Case):

1. **Food**
2. **Transport**
3. **Salary**
4. **Bill**

| Rule | Behaviour |
|---|---|
| Allowed set | Exactly the four categories above |
| Unknown category | Rejected — raise a domain error; state unchanged |
| Empty / blank category | Rejected — raise a domain error; state unchanged |

Notes:
- **Salary** is typically used with income.
- **Food**, **Transport**, and **Bill** are typically used with expenses.
- The domain still validates category membership the same way for both income and expenses (must be one of the four).

---

## 3. Overspending Behaviour (Account Balance)

**Decision: Block negative balances.**

| Rule | Behaviour |
|---|---|
| Expense ≤ current balance | Allowed (subject to other rules) |
| Expense > current balance | **Blocked** — raise a domain error; balance and history unchanged |
| Direct balance assignment | Forbidden — balance is read-only from outside the domain |

The account must never go below `$0.00`.

### Expense amount confirmation (over `$100`)

| Rule | Behaviour |
|---|---|
| Expense amount ≤ `$100.00` | No extra confirmation required |
| Expense amount > `$100.00` | Domain requires explicit confirmation (e.g. `confirmed=True`) |
| Expense > `$100.00` without confirmation | **Blocked** — raise a domain error asking for confirmation; state unchanged |

“Ask” means: the domain refuses the unconfirmed large expense; the CLI is responsible for prompting the user and retrying with confirmation. The domain does not print prompts.

---

## 4. Budget Limit Behaviour

Budgets are optional per category. When a category has a spending limit set:

| Rule | Behaviour |
|---|---|
| Expense within remaining budget | Allowed |
| Expense that would exceed the category budget | **Recorded with an over-budget warning flag** (not hard-blocked by the budget alone) |
| Expense that brings remaining budget to **20% or less** of the limit (but still within limit) | Allowed, and marked with an **approaching-limit warning** |
| No budget set for a category | No budget warnings; balance rules still apply |

Priority when multiple rules apply:
1. Invalid category / empty category → reject
2. Non-positive amount → reject
3. Would create negative balance → reject (block)
4. Amount > `$100` without confirmation → reject (ask/confirm)
5. Else accept; attach approaching-limit and/or over-budget warning flags as needed

Balance protection always wins over budget warnings: an expense that would overdraw the account is blocked even if the category budget would allow it.

---

## TDD Blueprint

Map each rule to the assertions we will write first (failing tests before implementation).

| # | Rule | Expected test assertion |
|---|---|---|
| 1 | Currency display | Formatted money / CLI output uses `$` for AUD amounts |
| 2 | Allowed categories | `add_income` / `add_expense` succeeds for Food, Transport, Salary, Bill |
| 3 | Unknown category | Invalid category raises a domain error; balance unchanged |
| 4 | Empty category | Blank category raises a domain error; balance unchanged |
| 5 | Block negative balance | Expense greater than balance raises a domain error; balance unchanged |
| 6 | Valid expense under balance | Expense ≤ balance succeeds; balance decreases by the amount |
| 7 | Large expense needs confirmation | Expense `> 100` without confirmation raises a domain error; state unchanged |
| 8 | Large expense with confirmation | Expense `> 100` with confirmation succeeds (if balance allows) |
| 9 | Approaching budget warning | Expense that leaves ≤ 20% of category budget remaining succeeds and is flagged as approaching limit |
| 10 | Over-budget warning | Expense that exceeds category budget succeeds (if balance allows) and is flagged over-budget |
| 11 | Under-budget quiet path | Expense comfortably under budget succeeds with no budget warning flags |

---

## Summary Decisions

1. **Currency:** AUD displayed as `$`
2. **Categories:** Food, Transport, Salary, Bill
3. **Overspend balance:** Block (no negative balance)
4. **Budget limits:** Warn when close (≤ 20% remaining); warn/flag when over budget (do not hard-block on budget alone); separately require confirmation for any expense over `$100`
