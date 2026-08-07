"""CLI integration tests for command routing and printed output."""

from __future__ import annotations

from pathlib import Path

import pytest

from pocketbudget import cli


@pytest.fixture  # type: ignore[misc]
def data_file(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    """Point the CLI at an isolated JSON save file."""
    path = tmp_path / "budget.json"
    monkeypatch.setattr(cli, "DATA_PATH", path, raising=False)
    return path


def test_show_balance_prints_zero_for_new_account(
    data_file: Path,
    capsys: pytest.CaptureFixture[str],
) -> None:
    exit_code = cli.main(["show-balance"])

    captured = capsys.readouterr()
    assert exit_code == 0
    assert "$0.00" in captured.out


def test_add_income_then_show_balance(
    data_file: Path,
    capsys: pytest.CaptureFixture[str],
) -> None:
    add_exit = cli.main(["add-income", "100", "Salary"])
    add_output = capsys.readouterr().out

    assert add_exit == 0
    assert "Salary" in add_output or "$100.00" in add_output

    balance_exit = cli.main(["show-balance"])
    balance_output = capsys.readouterr().out

    assert balance_exit == 0
    assert "$100.00" in balance_output
