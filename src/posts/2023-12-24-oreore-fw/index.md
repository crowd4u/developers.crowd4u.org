---
title: "令和5年に爆誕したオレオレFWの話"
date: 2023-12-24T00:00:00+09:00
draft: false
author: notch_man
layout: article
templateEngineOverride: njk,md
tags:
  - posts
---

この記事は[klis Advent Calendar 2023の記事となります。](https://adventar.org/calendars/8957)

こんにちは、klis19（3編）のnotch_manです。今日はクリスマスイブですね。皆さんはいかがお過ごしでしょうか。私は仕事が多すぎてクリスマスどころか年末年始も消滅する見込みです。
今日はクリスマスイブにピッタリな一家に1つあると嬉しいオレオレFWの紹介をします。街中のカップルを眺めて心が寒くなった皆さん、愛を持ってオレオレFWを育てて豊かな人生を歩みましょう！

※対象はWebアプリケーションフレームワークと思ってください

# 免責事項

この記事は主観がとても強いです。また、融合知能デザイン研究室で1年以上もPythonでWebを書くという苦行を経て辿り着いた1つの作法です。一般的な問題を解決するわけではないので、あまり真に受けないでください。オレオレを現場に持ち込んだ場合、同僚に嫌われます（経験談）

# オレオレFWとは

オレオレFWとは自作のフレームワークのことを指します。巷で有名なものだとDjangoやFlask、LaravelやRailsなどがいわゆるWebアプリケーションフレームワークに分類されるものです。

Webフレームワークは**「Webアプリケーションなどを開発するために必要な機能があらかじめ備えられている開発基盤」**を提供してくれます。これらはベタープラクティスな手法やテストされたライブラリを多数盛り込んでおり「**誰でも**」一定の品質でアプリケーションを書くことが出来ます。つまり、高品質で生産性の高い開発体験を提供するのがフレームワークの役目です。これらのエコシステムは広く知られており、それらをベースにすることで私たちは事業やそのための開発に集中することができるようになります。

**これらの話を十分に理解した上でこの先を読んでください**

オレオレFWについて知りたい人はとりあえずこの動画を視てください。

<https://www.youtube.com/watch?v=TiyJh6QPork>

その上での話ですが、オレオレFWは一般的なWebフレームワークの多くの利点を放棄します。生産性や品質なんて物は制作者に依存しますし、第3者から見ると理解不能な物体が誕生するだけです。知恵袋やStack OverflowでオレオレFWの質問をしても全く回答は返ってきませんし、ChatGPTもまともなことしか答えてくれません。

つまり、令和5年においてオレオレFWを使うモチベーションはゼロです。というか使ってはいけません。Pythonな人ならstarletteやFastAPI、DjangoやFlaskを使うと良いでしょう。

> 最初にstarletteを持ち出す時点で、私の思想はかなり歪んでいます
>

# オレオレFWを作る利点

オレオレFWは現場においてはほぼアンチパターンですが、趣味の範囲では良いことがたくさんあります。まず、フレームワークを作る中でアプリケーションの組み立て方を学ぶことができます。また、アプリケーションの設計を考えたり既存のフレームワークの目指したかった世界観が理解できるなど良いことがたくさんあります。また、既存フレームワークでは解決できない問題に直面したときに、それらを解決する手段を提案することができるようになります（コラコラ）。

ともかく、Webフレームワークを十分に理解して使いこなすために一度自分で作ってみるというのはエンジニアとして良い経験になると思います。というわけでやっていこう！オレオレFW！

# オレオレFWを作った動機

私は研究室でPythonを使ったWeb開発をしています。そもそも、PythonでWebを書くというのは例え既製品のフレームワークを使ったとしてもかなりの地獄が待っています。まず、Pythonはバージョンによってライブラリが壊れやすいことで有名です。Python2 → 3のジャンプを経験した人は色々苦しんだでしょうし、著名ライブラリでもランタイムのバージョンアップにライブラリが追従しない事があり気苦労が多いです。Python3系になってBCは減りましたがメモリ周りの最適化が進む中でJIT依存のライブラリが被害を受けたりは良くあります。

> 特に機械学習系のライブラリでよく使われるnumbaのランタイムの追従が遅くて苦労した人が多いでしょう
>

これに対応するためのパッケージ管理手法も中々難しいところがあります。Pythonではnpmやcomposerに匹敵するその言語のパッケージマネージャというものは確立していない印象です。pipのrequiements.txtは管理が手間だし、poetryなど高級な物を使っても結局requirements.txtを吐いたり環境構築が辛いなどの問題があります。

また、検索汚染もかなり深刻です。例えば、sqlalchemyでモデルのupdateを検索すると、ほとんどの例でselect → session commit()という手順を踏んでいます。この場合はDMLが2回走りますが、実際にはupdate1回で良いことは誰でも分かる事です。

この状況の中で、研究室という特殊な環境で持続的な開発を行うためにはかなり気を遣わないといけません。これについては以前のブログでも述べているのでこちらもご覧ください。

<https://developers.crowd4u.org/posts/2022-12-24-advent_calendar/>

よって、具体的には以下の点を考えて開発を行う必要があります。

- ちょっとの修正で3年は生き残るフレームワーク
- 可能であればORMとかそういう物に頼らず、自分で面倒を見るぞという気になれる設計
- ライブラリやランタイムのBCの影響をなるべく受けない設計
- フレームワーク特有の魔法に頼らない素朴で分かりやすいコードや設計

これらを考えるとデータベース周りでORMに頼りたくなかったり、ルーターとバリデーションがセットになったような`BaseModel`にすらあまりロジックに入ってほしくない、脱出を見込んだ設計にするためにビジネスロジックは標準だけで簡潔させたい…お、これは既存フレームワークだけでは無理なのでは？よし！オレオレだ！という結論になるのは自明だと思います。

> 典型的な言い訳なので、あなたの周りでこのようなことを言い出した人が居たら冷水をぶっかけましょう
>

### ちょっとの修正で長生きするフレームワークを目指す理由

私たちは基本的に研究の片手間に開発をする必要があります。しかし、Pythonを取り巻く状況は進化のスピードが早くそれに追従し続けなければあっという間に負債になってしまいます。普段からライブラリやランタイムの更新は意識するようにしていますが、万一BCがあったとしても影響範囲を最小限にすることで工数を抑えることができると思っています。

あと、素朴な設計のコードは案外長生きします。ここでいう「素朴」とはなるべく標準ライブラリに寄り添った実装を指します。
皆さんも機械学習ブームで盛り上がった2018~2020年頃のCNNで画像識別タスクをやるプログラムを作ったと思います。それを動かしてみてください。多分、動かないと思います（笑）。ベタに変化を急ぐライブラリに手を出すと数年経ったら全く動かなくなります。その一方で、最初に作ったHello Worldのプログラムを動かしてみてください。Python3系の時代に書いた物であれば今でも動くと思います。このような基本的な機能は年月が経っても基本的に壊れることはありません。

つまり、こういう設計を心がけるとランタイムの更新にも追従しやすくなるのです。基本に忠実に基本の組み合わせによって複雑な物を表現したら、それが複雑でも長生きすると思っています。人類、バージョンアップを放棄したらあっという間にレガシーコードが爆誕します。そのために複雑だけど優れた魔法に頼らず、物理でゴリ押すことを選択しています。速度や性能の面で不利になりますが、あとで手を付けにくくなる事は回避したいのが狙いです。

どうです？オレオレしてるでしょ？？？？

> さらに言うと、バージョンアップなどをノーコストに近い状態に持っていくことを目指しています。FWはメジャーアップデートするとミドルウェアが大きく変わって修正工数が増えるということがありますが、限られたリソースの中でそういう状況に持っていきたくはないです。パッケージを弄ってテストを回せばバージョンアップはいける！という状態にしたいです。
>

### ORMを使いたくない

Pythonには有名なORMやその拡張としてマイグレーションツールが提供されています。しかし、以前マイグレーションツールを使ったところ偶然サーバーの瞬断が発生していまいテーブルの不整合が生じてしまいました。ALTERテーブルが走った場合は基本的に戻せないので、マイグレーションツールの世代管理周りのズレを素手で修正する事になってしまいました。この時は、こういった問題に対応できるメンバーが居たから何とかなりましたが研究室にこの先そういう人材が来るかは分かりません。その他にもORMはテーブルとモデルが1:1に密結合してしまうような雰囲気を与えたり、今のテーブル設計とユースケースにズレがありORM的な使い方が苦しいという課題があります。

> 研究室では複数のサービスが運営されており将来的にこれらを統合することが計画されています。それらも考慮するとORMに頼らず自分達でドメイン設計をやっていく気合いを持つ必要があると考えています。そのため、一部ではORMが使われていましたが、一貫性の観点からも全て剥がし切りました。現在は、一部の複雑なクエリにはテンプレートエンジンを使いつつ生SQLを操作する選択を取っています。
>

### ライブラリやフレームワークの魔法に頼らない

個人的にはstarletteやFastAPIの設計が大好きです。これらはシンプルな設計を提供しつつミドルウェアを追加することで複雑な処理も出来るようになります。ただ、ミドルウェアを挟んでしまうと手続き型っぽく何処で何をやっているか追いにくくなってしまいます。大学生は基本的に手続き型プログラミングの世界で生きているので、なるべくその世界の感性で理解できるコードを実装したいと思います。てか、裏で魔法を使わずともif文とかでええやろ！なんで、かっこよくやりたいんや！！

# 今回作ったオレオレFWについて

今回作成したオレオレFWはこちらに公開しています。このオレオレFWはASGI互換のアプリケーションになっていて、これに対応した様々なワーカーを使って動作させることができます。今回はuvicornを使っています。

<https://github.com/notchman8600/ore-1>

> 時間の都合上、POSTのサンプルを提供できていないと思うのでDBから値を取ってそれを表示するだけのシンプルなアプリケーションになっています。
>

今回のフレームワークは以下のことを目標に設計しています。

- 放置しても2年は動くであろうライブラリ選定（実績有）
- メインアプリケーションの部分はライブラリに頼らない基本設計
- **1つの処理を一貫性のある作法に基づいて実装できる設計**
- 闇雲に例外キャッチをしようとしたらコードレビューで叱れるエラーハンドリング設計
- APMなどの連携をある程度考えたカスタマイズしやすいロギング
- **静的解析やIDEに優しいソースコード**

まあ、設計指針についてはほとんど上で述べた課題に対する答えになっているので特段触れませんがいくつか新しい話があるのでそれに触れておきます。

### 1つの処理を一貫性のある作法に基づいて実装する設計

フレームワークでは当たり前といえば当たり前ですが、ある種の一貫性のあるやり方で機能を追加できる設計を目指しています。これによって、いわゆるコピペプログラミングをやったとしても一定の制約の範囲に抑えることができて品質を保つことが出来ます。

今回のオレオレFWでは以下の一貫性のある実装を行えるようにしています。

1. 期待したいレスポンスをControllerで定義
2. そのレスポンスに必要なデータをRepositoryが作成する
3. Repositoryは必要なデータを取得するために意味のある単位でモデル化されたStoreにフェッチする
4. ストアは1つ以上のテーブルから意味のあるデータモデルのCRUDを行う

つまり、1機能を追加したいときはControllerに1メソッド、Repositoryに1メソッド、Storeにメソッドがあればそれを使いなければ追加すれば良いです。基本的にこれを繰り返すことで機能を増やしていける設計にすることでコピペプログラミングをやりやすくしています。

> コピペプログラミングができるということはCopilotやChatGPTにも優しい設計になっています。人間が理解不能なものはLLMも理解不能です。愚直だけど単純な方が後々幸せになれます。
>

今回は実装上、他の概念も登場していますがそれは脱出を見込んだ話になっておりControllerからStoreまでは長期にわたって生き残らせる設計にしています。

# オレオレFWの紹介

早速ディレクトリ構成を見ていきましょう。今回はこのような構成になっておりappがエントリポイントになっています。

- app
  - actions/
  - controllers/
  - dispatchers/
  - routers/
  - model/
  - stores/
  - templates/
  - main.py
- db
  - DDLやテストデータの挿入用、気にしなくて良い
- …（雑多なファイル）

dispatcherはASGIレイヤーの処理をとなっており、HTTPリクエストを発火させてレスポンスを送信する役割を担っています。本来であればフレームワークに内包されていますが、今回はフレームワークお母さんが存在しないので自前で実装しています。

基本的にはフレームワークお母さんが居ないので自前で作ったに過ぎないレイヤーですが、1点だけ重要な事があります。それは、HTTPのイベントに基づいて動いたアプリケーション処理の例外を全てハンドルする役割です。つまり、アプリケーションのロジックで例外が出た場合、最終的にこのレイヤーで全てハンドルできるようになっています。ここで、エラーログを取得してレスポンスを返せば絶対に白いエラー画面を返さずに済みます。エラーハンドリングを分かっていなくても事故ればログが出るので、何かあったときは後輩を救うことができます（とても大事）。

```python
async def dispatch_http_event(scope: HTTPScope, receive: ASGIReceiveCallable, send: ASGISendCallable) -> None:
    # dispatch errorを全体的に囲むことで白い画面を出さないようにする
    # 本当はAPIコールかHTMLコールかによって例外処理を考える必要がある
    # APIコールであればエラーオブジェクトのJSON、HTMLであればエラーページをレンダリングする必要がある
    try:
        content_type, encoded_res = await http_router(scope, receive)
        # レスポンスヘッダ
        headers = [
            (b"content-type", content_type),
            (b"content-length", str(len(encoded_res)).encode(encoding="utf-8")),
        ]
        await send({"type": "http.response.start", "status": 200, "headers": headers})
        await send({"type": "http.response.body", "body": encoded_res})
    except Exception as e:
        # ここでアプリケーションから上がってくる例外は全てハンドリングする
        logger.error(f"error has occured in http event: {e},{traceback.format_exc()}")

        # HTTPレスポンスの準備
        # ここではエラー起因の白い画面を出さないようにするためにエラーページをレンダリングする
        html_content = render_template("error.jinja2.html", {"message": "hello, I am variable value."})
        await send(
            {
                "type": "http.response.start",
                "status": 500,
                "headers": ((b"content-type", b"text/html"),),
            }
        )
        await send({"body": html_content.encode("utf-8"), "type": "http.response.body"})
    return
```

## Router層（Routers+Actions）の説明

Router層ではリクエストを受け取りそれをバリデーションしてControllerに渡す役割を担います。多くのフレームワークではroutersとactionsを合わせたものが提供されています。例えばFastAPIであればエントリポイントの関数+pydanticを使うことで実現できます。

```python
# ルーターではリクエストを受け取ってアクションを実行しレスポンスを返却する。リクエストやレスポンスの内容はアクションに委譲する
async def http_router(scope: HTTPScope, receive: ASGIReceiveCallable) -> tuple[bytes, bytes]:
    path = scope["path"]
    content_type: list[tuple[bytes, bytes]] = scope["headers"]
    if path == "/":
        hello_action = HelloAction()
        # リクエストボディを受け取る
        body = await receive_body(receive)
        # ヘッダーの解析
        headers = parse_headers(content_type)
        # ボディの中身とcontent-typeを渡す
        return hello_action.run(body=body, headers=headers)
    elif path == "/user" and scope["method"] == "POST":
        # リクエストボディを受け取る
        event = receive()
        return b"application/json", json.dumps({"message": {"message": f"とりあえずPOSTはできたからいい加減な値を返す"}}).encode()
    else:
        # 本当に適当なレスポンスを作成したい時はこのように直接書くこともできる
        return b"application/json", json.dumps({"message": "Not Found"}).encode()
```

いや～、if文でルーティングなんて誰の影響を受けたのでしょうか？（笑）この形にすれば存在しないエンドポイントを叩いた時に必ず404を返せるので良いでしょ？そして、とにかく分かりやすい（これ大事）。Router層ではリクエストデータやヘッダの取得を行いそれをActionに流しています。ここでは意味のあるデータの形にせず辞書形式のままにしておきます。パースエラーが起きた場合はここで止まる想定です。

> 多くのフレームワークではrouter.add(”/someroute”,ハンドラ) のようにエンドポイントに対応するハンドラを登録してイベントを定義します。ただ、正直分かりにくくないですか？しかも、既製品だと存在しないパスにアクセスしたときはミドルウェアで例外作って404を返すようにしないと白い画面が出るなど使いづらいところが多いです。この形にすればそういう手間がかからない。しかもミドルウェアを使わないのでシンプル！どうです？オレオレしてますねwww
>

次にActionです。Actionではbodyやheaderの情報を渡してそれをバリデーションします。バリデーションしたオブジェクトはリクエストのDTOか生データに変換してControllerに渡します。

Actionは基底クラスを定義しています。Action.run()を実行することで実際の処理を開始する制約を与えています。派生クラスではrunだけ実装すれば良いのでとてもシンプルですね（主観）

```python
# Standard Library
from typing import Any

# Actionの基底クラスを定義する
# こいつはほぼ何の役にも立たないが、runを起動するという制約を与えることができるので実装している
class Action:
    def __init__(self, name: str, description: str, args: dict) -> None:
        self.name = name
        self.description = description
        self.args = args

    def run(self, *args: Any) -> tuple[bytes, bytes]:
        raise NotImplementedError("Action.run() must be implemented by subclass")

    def __str__(self) -> str:
        return self.name

    def __repr__(self) -> str:
        return self.name
```

Actionは原則、1つのエンドポイントに1つ定義します。Actionとエンドポイントを1:1にすることでコードジャンプで追いやすくしています。例えば、GetHelloActionではあればHelloを取ってくるイベント、AddHelloActionであれば何らか”Hello”を追加するのだなと理解しやすくなります。もちろん、RESTに準拠すれば十分という話もありますがコードを読めば大体理解できるということが大事だと思っています。

> Actionには名前が付けられるのでエラーログにAction名を叩き込むことでどの処理でエラーが出たか若干分かりやすくなるという話もあります
>

Actionの実態はこんな感じです。Actionにはルーターでパースしたbodyの文字列が入ってきます。

返り値がtupleですがこれはレスポンスのバイト列とcontent-typeのバイト列を想定しています。普通のFWだとResponseオブジェクトに辞書を入ればいい感じになるので、後述するControllerが返したレスポンスのDTOからバイトデータを作るようにしています。

```python
class HelloAction(Action):
    def __init__(self) -> None:
        super().__init__("hello", "say hello", {"name": "string"})

    def run(self, headers: dict, body: dict) -> tuple[bytes, bytes]:
        # Actionでレスポンスを作成する
        res = controller.get_hello(1)
        content = render_template(
            "index.jinja2.html",
            {
                "message": "hello, I am variable value.",
                "name": res.user_name,
                "greeting": res.greeting,
                "user_id": res.user_id,
            },
        )
        return b"text/html", content.encode()
```

ここまでのレイヤーは今のASGI準拠の自作FWに深く依存したところになっています。ただ、この辺りの実装は将来的に全て捨てて既製品（FastAPIなど）にスムーズに移行することが可能です。実際、今の現場ではPydanticのBaseModelをさらにDTOに詰め替えることでController以下の互換性を保っています。色々なエコシステムへの脱出が可能でありながら、素朴に実装できるのがオレオレFWのメリットです。引っ越しの際にはファイル数が多いかつActionが1つ1つバラバラになっているので、手間が増えますが1つ1つは単純作業なので工数は読みやすいです。工数の読みやすさは大事で、将来的に改修を依頼したときにスムーズに見積もりを出して発注に至ることもできます（コラコラ）。

## Controller層の説明

ControllerではリクエストのDTOを受け取りService（今回は未実装）やRepositoryを呼び出し、レスポンスのDTOを返却する責務を担います。この設計はSpringFrameworkの設計を意識しています。

```python
class UserGreetingDto:
    def __init__(self, user_id: int, user_name: str, greeting: str):
        self.user_id = user_id
        self.user_name = user_name
        self.greeting = greeting

class HelloController:
    def __init__(self) -> None:
        self.hello_repository = HelloRepository()
        pass

    def get_hello(self, user_id: int) -> UserGreetingDto:
        user_greeting = self.hello_repository.get_hello(user_id)
        return UserGreetingDto(user_greeting.user_id, user_greeting.name, user_greeting.greeting)

controller = HelloController()
```

DTOクラスは全てPythonのclassを使っているので、ライブラリに依存しない世界を実現することができます。また、ランタイムのバージョンアップで壊れることもないので堅牢です。

DTOの定義場所は別のフォルダでも良いですがファイルが散るとちょっとした加工をするときに面倒なのでControllerに置いています。困ったときは移せば良い。

> dataclassを使わない理由ですが、主にasdict()を使わせないためです。辞書は強力なデータ表現ですが、何でも入れることができるので可能性が爆発します。すると、せっかくDTOなどで受け渡しされるデータの透明性を確保したのに水の泡になります。強すぎる武器は時に毒になります、それを使わせるのはヤバい。それを防ぐために意図的に使っていません。いや～、オレオレですね（笑）
>

## Repository層の説明

Repository層ではビジネスロジックにおいて意味のあるモデルを作成、取得する責務を担います。

```python
class HelloRepository:
    def __init__(self) -> None:
        self.hello_store = HelloStore()
        self.user_store = UserStore()

    def get_hello(self, user_id: int) -> UserGreeting:
        user = self.user_store.fetch_user(user_id)
        greeting = self.hello_store.get_by_user_id(user_id)
        return UserGreeting(user.user_id, user.user_name, greeting.greeting)
```

この例ではユーザーの挨拶という1つのモデルをgreetingテーブルとuserテーブルから作成しています。データ作成の例が作れなかった（多分）のですが、登録時は`add_hello`的な関数からそれぞれのstoreのsaveメソッド的なものを呼び出す想定になります。ここもサードパーティライブラリには依存していません。この辺りがFWに依存してしまうと本当に他所に脱出できなくなるので辛いんですよね。storeがインフラに依存してしまうのは仕方ないですが、そこまでで抑えてしまえばデータロジックの部分は崩さずにいけます。いや～、便利だな（笑）

> これは集約とか言われたりするかもですが、私はそういう高級な考え方は十分理解していません。あくまで複数のテーブルから意味のあるモデルを作るという理解で生きています。
>

## Store層の説明

Store層ではDMLを発行してデータの読み書きを行なうレイヤーになっています。基本的にはテーブルと1:1ですがJOINクエリを使う場合は複数テーブルを扱うこともあります。Store層の呼び出しも基本的にDTOを介して行います。DTOを介することでインフラやライブラリに影響されやすいDB操作を吸収し、他のレイヤーに影響しないようにしています。さらに、基底クラスにインフラ知識を寄せることで派生クラス（実態）についてはノータッチで移行が可能です。

```python
class FetchUserDto:
    def __init__(self, user_id: int, user_name: str):
        self.user_id = user_id
        self.user_name = user_name

class UserStore(Store):
    def __init__(self):
        super().__init__()
        pass

    def fetch_user(self, user_id: int) -> FetchUserDto:
        query = f"SELECT id, user_name FROM users WHERE id = %s"
        row_data = self.fetch_data(query, user_id)
        # ここは本当はまともに例外を投げるべき
        assert row_data is not None and len(row_data) == 1, "error, row_data is None or len(row_data) > 1"
        logger.debug(f"row_data: {row_data}")
        return FetchUserDto(row_data[0][0], row_data[0][1])

    def insert_user(self, user_id: int, user_name: str):
        query = f"INSERT INTO users (id, user_name) VALUES (%s, %s)"
        self.execute(query, (user_id, user_name))
```

ここでフェッチに失敗した時にAssertErrorの例外を出すようにしています。本当は例外が出たらRepository側で整合性を担保しないといけませんが、今はそのようなことは特にやっていません。そういうのは必要な時に追加すれば良いのです。

Storeクラスはインフラ知識を吸収しつつfetchとexecuteに相当するメソッドを定義しています。基本的にfetchは読み込み、executeはその他を想定しています。

```python
class DatabasePool:
    def __init__(self) -> None:
        # PooledDBを使用してコネクションプールを作成
        self.pool = PooledDB(
            creator=pymysql,  # 使用するDBAPI
            maxconnections=6,  # プールする最大接続数
            host="mysql",
            user="root",
            passwd="password",
            db="ore",
            charset="utf8mb4",
        )

    def get_connection(self):
        return self.pool.connection()

class Store(DatabasePool):
    def __init__(self):
        super().__init__()

    def fetch_data(self, query, data):
        with self.get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(query, data)
                return cursor.fetchall()

    def execute(self, query, data):
        with self.get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(query, data)
                connection.commit()
```

インフラはPyMySQLに依存していますが、executeとqueryの形を維持しておけば派生クラスへの影響を無くすことができます。インフラ以降の際は基底クラスを弄るだけで済むので現実的な工数で載せ替えが可能になると思っています。いや～、楽ですね…。小噺ですが、今の現場ではライブラリ的に問題のあるライブラリを使っていますが、このような設計にするおかげでスムーズに移行ができそうです。**このように常にライブラリから脱出することを見込んだ設計にするのはとても大事だなと実感しています。**

> idは直で渡していますがこれは要はバランス…（笑）だって、これだけでDTO作るのはそれはそれで面倒でしょう。idで物を引くという極めて多いユースケースに至ってはDTOを使わないというルールを設けてしまえば最初に述べた一貫性も維持できますし、煩わしさも抑制できます。
>

# まとめへ

いや～、オレオレしていたでしょ？とりあえず、このFWの考え方に従えば今の現場における私の課題は解決することが出来ています（大事）。あとはフレームワークを作る中で、既製品の考え方も再確認出来てstarletteは最高！の気分になっています。あと、私はフルスタックフレームワークが余り好きではないので素朴な既製品がより素朴になったなと思うとニヤニヤが止まらないですね。

正直、これをそのまま現場に持ち込んでも同僚の反発は必至です。また、これが大規模になったり、5年後生き残るのか？とか言われたらそれな…という話になります。ただ、随所でクリティカルなケースを考えてそれの脱出を見込んだ設計を心がけてるあたり、そういう気配りとシンプルを積み重ねた物があればある程度は何とかなるのではないでしょうか？

## オレオレを現場に投入したい方へ

**それは家庭菜園でやれ！、以上！**

まあ、世の中綺麗事では通らないこともあるからな…。ただ、実戦テストを通じていない物を投入すると本当にヤバいので止めた方が良いと思います。今回のオレオレFWも自分が今まで様々に開発したり現場に投入して2年近く…（フィクションです）使った実績を元に、今作るならこうするという考えを述べているものです。私は経験の浅いエンジニアですが、それでも数年間取り組んだ成果として半年くらいは何とかなるオレオレFWになっています。

まあ、その上で用量用法を守って同僚を酒や食事で口説き落として部分的にオレオレを使って成果を出して納得していただく…というのが個人的にオススメのオレオレの普及方法です。オレオレFWが現場で機能したら1人のエンジニアとしてちょっと嬉しいですよね（笑）

ただ、最後は何で作るかより何を作るかですよ？手段に捕らわれ過ぎるのは良くない。私たちは事業課題を捉えてそれを技術で解決するプロなのですから…

# 真実のまとめ

いや～、最近はとある現場に思う事が多々ありすぎまして…。まあ、世の中は様々に様々ですが皆さん強く生きていきましょう。現実を捉えて課題を解決する地道な積み重ねをしていけばきっと人生は良き物になると思います。そう信じて、私はけもの道を歩み続けます…。

来年のクリスマスイブはせめて1人温泉でゆっくり…なんて事を思っています。では、外は寒いですが独りぼっちのクリスマスイブを強く生きてください。

---

# ここから先は真実をお伝えします

今年のSOHO祭（架空のイベント）に合わせて爆誕した真実のサイトを研究室のメンバーと作成しました。このサイトはとにかく軽量で必要な情報をミニマムに提供することを目指しています。機能は「ブース一覧」「エリア別フィルタ」「ステージスケジュールのカレンダー（ical互換）」の3つです。

[シン・SOHO祭 TOP](https://sohosai23.basyauma.jp/)

> ちなみにロゴの色ですが#FF7E1Cと#00ACD1を使っています。これには明確な意図がある色で、決してとあるサイトのロゴを参考にしている物ではありません。これが分かる人は私と仲良くなれると思うのでDMをください（笑）
>

ソースコードはこちらで公開しています。見て分かると思いますが、HTML,CSS,JSのシンプルな作りになっています。何で作るのではなく、何を作るかが大事ですよね？必要な人に必要な機能が提供できれば、技術スタックなんてどうでもいいんですよ。

<https://github.com/halca-crowd/soho-Illuminati>

なお、PageSpeed Insightのスコアは何処かのサイトと比べて遙かに好成績をマークしています。GAを入れたせいで若干数値が悪くなっていますが、これを抜くとオール100に近いスコアをマークしました。来年以降も気が向いたら真実をお伝えする予定なので、こちらのアカウントもよろしくお願いします。

[soho-Illuminati (@soho_illuminati) on X](https://x.com/soho_illuminati?s=20)

このサイト制作ではスクラムを実践した開発を行ない、なんと8時間で0からサイトを立ち上げることが出来ました。このサイト制作で培われたスクラムのノウハウについては、いずれ何処かでお話しようと思います。以上、SOHO祭の真実でした。皆さん、よいお年をお迎えください。

---

マチアプの今年の戦績ですが13戦0勝、3サービスBANでした。対戦ありがとうございました。これさ、本気でそういう出会いを求めるときにオレオレFW以上のけもの道になるのでは？まず、手段が断たれているので詰みなんだよね（笑）以上、notch_manの真実をお伝えしました。私は一人イブの夜の街に消えます。
