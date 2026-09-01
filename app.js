const FILES = [
  "pocketbudget/__init__.py",
  "pocketbudget/account.py",
  "pocketbudget/exceptions.py",
  "pocketbudget/storage.py",
  "pocketbudget/cli.py",
  "web_demo.py",
  "data/budget.json",
];

const els = {
  status: document.getElementById("boot-status"),
  flash: document.getElementById("flash"),
  balance: document.getElementById("balance"),
  summary: document.getElementById("summary"),
  history: document.getElementById("history"),
  income: document.getElementById("form-income"),
  expense: document.getElementById("form-expense"),
  budget: document.getElementById("form-budget"),
  overdraft: document.getElementById("btn-overdraft"),
  large: document.getElementById("btn-large"),
  reset: document.getElementById("btn-reset"),
};

let py;
let ready = false;

function formatError(error) {
  if (error == null) return "Unknown error";
  if (typeof error === "string") return error;
  const type = error.type ? String(error.type) : "";
  const msg = error.message ? String(error.message) : "";
  if (msg) return type ? `${type}: ${msg}` : msg;
  const keys = Object.getOwnPropertyNames(error).join(", ");
  return keys ? `Error (${keys})` : "Unknown error";
}

function setStatus(text, isError = false) {
  els.status.textContent = text;
  els.status.classList.toggle("is-error", isError);
}

function setEnabled(on) {
  ready = on;
  [...document.querySelectorAll("form button, .try-row button")].forEach((button) => {
    button.disabled = !on;
  });
}

function toJs(expr) {
  const value = py.runPython(expr);
  if (value && typeof value.toJs === "function") {
    const converted = value.toJs({ dict_converter: Object.fromEntries });
    if (typeof value.destroy === "function") value.destroy();
    return converted;
  }
  return value;
}

function render() {
  const snap = toJs("web_demo.snapshot()");
  els.balance.textContent = snap.balance_text;
  els.flash.textContent = snap.message;
  els.flash.className = `flash ${snap.ok ? "ok" : "bad"}`;

  els.summary.replaceChildren();
  if (!snap.summary.length) {
    els.summary.textContent = "No budgets or category spending yet.";
  } else {
    snap.summary.forEach((line) => {
      const row = document.createElement("div");
      row.textContent = line;
      els.summary.append(row);
    });
  }

  els.history.replaceChildren();
  if (!snap.history.length) {
    const empty = document.createElement("li");
    empty.textContent = "No transactions yet.";
    els.history.append(empty);
    return;
  }
  snap.history.forEach((line) => {
    const item = document.createElement("li");
    item.textContent = line;
    els.history.append(item);
  });
}

function call(name, ...args) {
  if (!ready) return;
  const payload = JSON.stringify(args);
  py.runPython(`import json, web_demo\nweb_demo.${name}(*json.loads(${JSON.stringify(payload)}))`);
  render();
}

async function boot() {
  try {
    py = await loadPyodide();
    py.runPython("import os; os.makedirs('pocketbudget', exist_ok=True); os.makedirs('data', exist_ok=True)");
    for (const path of FILES) {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`Could not fetch ${path}`);
      const source = await response.text();
      py.globals.set("_demo_path", path);
      py.globals.set("_demo_src", source);
      py.runPython("from pathlib import Path; Path(_demo_path).write_text(_demo_src, encoding='utf-8')");
    }
    py.runPython("from pathlib import Path; Path('data/sample.json').write_text(Path('data/budget.json').read_text(encoding='utf-8'), encoding='utf-8')");
    py.runPython("import web_demo");
    setStatus("Python is ready. Actions call Account and storage from the pocketbudget package.");
    setEnabled(true);
    render();
  } catch (error) {
    const text = formatError(error);
    setStatus(`Could not start Python in the browser: ${text}`, true);
    els.flash.textContent = text;
    els.flash.className = "flash bad";
  }
}

els.income.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(els.income);
  call("add_income", data.get("amount"), data.get("category"));
});

els.expense.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(els.expense);
  call("add_expense", data.get("amount"), data.get("category"), data.get("confirm") === "on");
});

els.budget.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(els.budget);
  call("set_budget", data.get("category"), data.get("limit"));
});

els.overdraft.addEventListener("click", () => call("add_expense", 9999, "Food", true));
els.large.addEventListener("click", () => call("add_expense", 150, "Transport", false));
els.reset.addEventListener("click", () => call("reset_demo"));

boot();
