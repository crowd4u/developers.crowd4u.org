import os
import argparse
from datetime import datetime, timezone, timedelta

parser = argparse.ArgumentParser(
    prog="article generator",
    description="article generator for developer.crowd4u.org",
)

now = datetime.now(tz=timezone(timedelta(hours=9)))

parser.add_argument("slug")
parser.add_argument("-v", "--verbose", action="store_true")
args = parser.parse_args()

slug = args.slug
slug.replace(" ", "-")
target_dir = os.path.join(os.getcwd(), "src", "posts", now.date().isoformat() + "-" + slug)

if args.verbose:
    print(f"mkdir: {target_dir}")

os.mkdir(target_dir)

markdown_path = os.path.join(target_dir, "index.md")

if args.verbose:
    print(f"opening file: {markdown_path}")

with open(markdown_path, "w") as f:
    if args.verbose:
        print(f"writing file: {markdown_path}")
    f.write(f"""---
title: ""
date: {now.isoformat(timespec="seconds")}
draft: false
author: 
layout: article
templateEngineOverride: njk,md
tags:
  - posts
---
    """)