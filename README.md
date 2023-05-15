# devepers.crowd4u.org

## 環境構築

1. Node.jsを用意します（versionはv18以降を想定）
2. `git clone`とリポジトリへの`cd`
3. `pnpm i`

## 著者データの作成

ここでは[mustache構文](http://mustache.github.io/)を用いて説明します。

`src/_data/authors.json`を開き、以下のように追記します。

```json
"{{id}}": {
    "name": "{{人間にやさしい名前}}",
    "id": "{{id}}",
    "description": "{{自己紹介}}",
    "links": [
        {
            "name": "{{リンク先の説明}}",
            "link": "{{リンク}}"
        }
    ]
},
```

具体的には以下のような意味を持ちます。`name`と`id`は記事を作成する際に必須です。

- key（string型）: 著者を識別するid。`authors.json`内でユニーク（一意）である必要があります。
- value（objects型）
  - name（required）: 名前です。これがWebサイトに表示されます。
  - id（required）: keyと同じものを記載します。これはURLなどに利用されます。
  - description: 一言くらいで自己紹介をどうぞ
  - links: 複数のリンクを著者ページに載せられます。そのための配列。
    - name: アンカーテキスト。リンクの説明に使います。（例: Twitter、portfolio、GitHubなど）
    - link: リンク先です。URL、URIを記載してください。（例: https://github.com/eniehack など。）

## 記事の執筆方法

ここでは[mustache構文](http://mustache.github.io/)を用いて説明します。

1. `python newarticle.py {{slug名}}`を実行します。
2. そうすると、`src/posts/YYYY-MM-DD-{{slug名}}/index.md`（以下、`index.md`）が作成されます。
3. `index.md`の2行目には記事のタイトル、5行目には著者のIDを適宜入力します。
4. 11行目から記事の内容を書き始めます。
