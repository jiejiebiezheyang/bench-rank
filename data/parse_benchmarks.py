#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从 source_urls 列表抓取 benchmarksgame 性能表格并汇总为单个 JSON。

用法:
    python parse_benchmarks.py
"""
import html
import json
import re
import urllib.request
from html.parser import HTMLParser
from urllib.parse import urljoin

OUT = "benchmarks.json"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

# 数据来源:按分组组织,url 为抓取入口(兼容 Markdown 反引号包裹)
SOURCE_URLS = [
    {
        "group": "Insignificant-IO",
        "urls": [
            {"url": "https://benchmarksgame-team.pages.debian.net/benchmarksgame/performance/fannkuchredux.html", "name": "fannkuch-redux"},
            {"url": "https://benchmarksgame-team.pages.debian.net/benchmarksgame/performance/nbody.html", "name": "n-body"},
            {"url": "https://benchmarksgame-team.pages.debian.net/benchmarksgame/performance/spectralnorm.html", "name": "spectral-norm"},
        ],
    },
    {
        "group": "Significant-IO",
        "urls": [
            {"url": "https://benchmarksgame-team.pages.debian.net/benchmarksgame/performance/mandelbrot.html", "name": "mandelbrot"},
            {"url": "https://benchmarksgame-team.pages.debian.net/benchmarksgame/performance/fasta.html", "name": "fasta"},
            {"url": "https://benchmarksgame-team.pages.debian.net/benchmarksgame/performance/knucleotide.html", "name": "k-nucleotide"},
            {"url": "https://benchmarksgame-team.pages.debian.net/benchmarksgame/performance/revcomp.html", "name": "reverse-complement"},
        ],
    },
]


class TableParser(HTMLParser):
    """提取第一个数据 <table> 的列头与行数据。"""

    def __init__(self):
        super().__init__()
        self.in_table = False
        self.in_tr = False
        self.in_cell = False
        self.is_header = False
        self.cell_link = None
        self.cell_text = []
        self.rows = []  # list of [(text, link), ...] 每行
        self.cur_cells = None
        self._table_stack = 0

    def _close_cell(self):
        if self.cur_cells is None or not self.in_cell:
            return
        raw = html.unescape(" ".join(self.cell_text)).replace("\xa0", " ")
        text = re.sub(r"\s+", " ", raw).strip()
        self.cur_cells.append((text, self.cell_link))
        self.in_cell = False

    def _close_row(self):
        self._close_cell()
        if self.cur_cells:
            self.rows.append(self.cur_cells)
            self.cur_cells = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "table":
            self._table_stack += 1
            self.in_table = True
            self.rows = []
            self.cur_cells = None
            return
        if not self.in_table:
            return
        if tag == "tr":
            self._close_row()
            self.cur_cells = []
            self.in_tr = True
            return
        if tag in ("th", "td"):
            self._close_cell()
            self.is_header = (tag == "th")
            self.in_cell = True
            self.cell_text = []
            self.cell_link = attrs.get("href")
            return
        if tag == "a" and self.in_cell and "href" in attrs:
            self.cell_link = attrs["href"]

    def handle_endtag(self, tag):
        if tag == "table":
            self._close_row()
            self.in_table = False

    def handle_data(self, data):
        if self.in_cell:
            self.cell_text.append(data)


def clean_source(text):
    """去掉 source 列前后的 `*` 与尾部 `#数字`。"""
    text = text.strip()
    text = re.sub(r"^[*\s]+", "", text)            # 去掉开头的 `*`
    text = re.sub(r"\s*#\d+\s*$", "", text)         # 去掉末尾的 `#数字`
    text = re.sub(r"\s+", " ", text).strip()        # 合并空白
    return text


def parse_html(content, base_url):
    """解析性能表格 HTML,返回记录列表;`base_url` 用于把 a 标签链接补全为绝对地址。"""
    p = TableParser()
    p.feed(content)

    # 表头在第 3 行(下标 2),数据从第 4 行开始
    if len(p.rows) < 3:
        raise SystemExit("表格行数不足,未能定位表头")

    header = p.rows[2]  # [(列名, 链接), ...]
    data_rows = p.rows[3:]

    result = []
    for cells in data_rows:
        if not cells:
            continue
        record = {}
        for idx, (name, link) in enumerate(header):
            text, cell_link = cells[idx] if idx < len(cells) else ("", None)
            if idx == 1:  # source 列:清洗文本 + 补全跳转链接
                record[name] = clean_source(text)
                record["link"] = urljoin(base_url, cell_link) if cell_link else None
            else:
                record[name] = text
        result.append(record)
    return result


def fetch(url):
    """抓取页面内容。"""
    url = url.strip("`")
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8", errors="replace")


def main():
    result = []
    for group in SOURCE_URLS:
        benchmarks = []
        for item in group["urls"]:
            url = item["url"].strip("`")
            print(f"抓取 {item['name']} ({url}) ...")
            content = fetch(url)
            data = parse_html(content, url)
            benchmarks.append({"name": item["name"], "url": url, "data": data})
            print(f"  -> {len(data)} 条")
        result.append({"group": group["group"], "benchmarks": benchmarks})

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    total = sum(len(b["data"]) for g in result for b in g["benchmarks"])
    print(f"全部完成,共 {len(result)} 个分组,合计 {total} 条,已写入 {OUT}")


if __name__ == "__main__":
    main()