"""CLI entry point for PocketBudget."""

from __future__ import annotations

import argparse
import sys


def build_parser() -> argparse.ArgumentParser:
    """Create the top-level argument parser."""
    return argparse.ArgumentParser(prog="pocketbudget", description="PocketBudget CLI")


def main(argv: list[str] | None = None) -> int:
    """Run the CLI and return a process exit code."""
    parser = build_parser()
    parser.parse_args(argv)
    print("Hello PocketBudget")
    return 0


if __name__ == "__main__":
    sys.exit(main())
