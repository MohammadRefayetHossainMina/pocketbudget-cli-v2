"""Minimal smoke test for the PocketBudget CLI entry point."""

from __future__ import annotations

import subprocess
import sys


def test_cli_entry_point_prints_startup_message_and_exits_zero() -> None:
    """Running the CLI module should print a hello message and exit 0."""
    result = subprocess.run(
        [sys.executable, "-m", "pocketbudget.cli"],
        capture_output=True,
        text=True,
        check=False,
    )

    assert result.returncode == 0
    assert "Hello PocketBudget" in result.stdout
