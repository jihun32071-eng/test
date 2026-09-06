#!/usr/bin/env python3
"""index.html의 외부 CSS/JS를 인라인해 단일 HTML 파일로 묶는다.

Claude Artifact처럼 파일 하나만 올릴 수 있는 곳에 배포할 때 사용한다.
  python3 tools/build-artifact.py            -> dist/artifact.html
  python3 tools/build-artifact.py out.html   -> out.html
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "dist" / "artifact.html"

html = (ROOT / "index.html").read_text(encoding="utf-8")

# <body> 안쪽만 사용 (Artifact는 문서 골격을 직접 감싼다)
body = re.search(r"<body>(.*)</body>", html, re.S).group(1)

title = re.search(r"<title>(.*?)</title>", html).group(1)
fonts = re.search(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com[^>]*>', html).group(0)

css = (ROOT / "assets/css/style.css").read_text(encoding="utf-8")
scripts = "".join(
    "<script>\n%s\n</script>\n" % (ROOT / src).read_text(encoding="utf-8")
    for src in ("assets/js/data.js", "assets/js/app.js")
)

body = re.sub(r'\s*<script src="assets/js/[^"]+"></script>', "", body)

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(
    "<title>%s</title>\n%s\n<style>\n%s\n</style>\n%s\n%s" % (title, fonts, css, body.strip(), scripts),
    encoding="utf-8",
)
print("%s (%.1f KB)" % (OUT, OUT.stat().st_size / 1024))
