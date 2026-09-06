#!/usr/bin/env python3
"""외부 CSS/JS를 인라인해 단일 HTML 파일로 묶는다.

Claude Artifact처럼 파일 하나만 올릴 수 있는 곳에 배포할 때 사용한다.
페이지 사이의 링크(href="index.html" 등)는 --link 로 실제 주소로 바꾼다.

  python3 tools/build-artifact.py index.html dist/artifact.html
  python3 tools/build-artifact.py curriculum.html dist/curriculum.html \
      --link index.html=https://example.com/dogam
"""
import argparse
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent

ap = argparse.ArgumentParser()
ap.add_argument("src", nargs="?", default="index.html", help="묶을 페이지")
ap.add_argument("out", nargs="?", help="결과 파일 (기본: dist/<이름>.html)")
ap.add_argument("--link", action="append", default=[], metavar="파일=주소",
                help='페이지 간 링크를 실제 주소로 치환 (예: --link index.html=https://...)')
args = ap.parse_args()

src = pathlib.Path(args.src)
out = pathlib.Path(args.out) if args.out else ROOT / "dist" / (src.stem + ".html")
links = dict(pair.split("=", 1) for pair in args.link)

html = (ROOT / src).read_text(encoding="utf-8")

# <body> 안쪽만 사용 (Artifact가 문서 골격을 직접 감싼다)
body = re.search(r"<body>(.*)</body>", html, re.S).group(1)
title = re.search(r"<title>(.*?)</title>", html).group(1)
fonts = re.search(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com[^>]*>', html).group(0)
css = (ROOT / "assets/css/style.css").read_text(encoding="utf-8")

sources = re.findall(r'<script src="([^"]+)"></script>', body)
scripts = "".join(
    "<script>\n%s\n</script>\n" % (ROOT / s).read_text(encoding="utf-8") for s in sources
)
body = re.sub(r'\s*<script src="[^"]+"></script>', "", body)

for name, url in links.items():
    body = body.replace('href="%s"' % name, 'href="%s"' % url)

out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(
    "<title>%s</title>\n%s\n<style>\n%s\n</style>\n%s\n%s" % (title, fonts, css, body.strip(), scripts),
    encoding="utf-8",
)
print("%s (%.1f KB, script %d개)" % (out, out.stat().st_size / 1024, len(sources)))
