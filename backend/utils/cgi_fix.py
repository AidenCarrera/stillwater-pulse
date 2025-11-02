"""
Temporary fix for Python 3.13 compatibility.
The feedparser library requires the deprecated `cgi` module.
This module provides a minimal replacement.
"""

import sys
import types


def apply_cgi_fix():
    """Apply CGI module fix for Python 3.13+"""
    if "cgi" not in sys.modules:
        sys.modules["cgi"] = types.ModuleType("cgi")

        # Define the missing parse_header function used by feedparser
        def _fake_parse_header(value):
            """Minimal replacement for cgi.parse_header (removed in Python 3.13)."""
            parts = value.split(";")
            key = parts[0].strip().lower()
            pdict = {}
            for p in parts[1:]:
                if "=" in p:
                    k, v = p.strip().split("=", 1)
                    pdict[k.lower()] = v.strip('"')
            return key, pdict

        sys.modules["cgi"].parse_header = _fake_parse_header