---
title: "CeleryのBrokerとResultBackendをElastiCash(Redis)からSQS+DynamoDBに移行した話"
date: 2024-07-20T12:58:50+09:00
draft: false
author: gild
layout: article
templateEngineOverride: njk,md
tags:
  - posts
  - Python
  - AWS
---
  
  ## はじめに

Crowd4u開発チームでは[AWSのコストを$200減らすために行ったこと](../2023-08-04-aws-cost-reduce/) や[しがないエンジニアがレガシーコードに向き合った感想](../2022-12-24-advent_calendar/) のとおり、AWSのコスト削減やレガシー改善への取り組みを続けています。

今回は、AWSでElastiCache(Redis)が月30ドル以上かかっており、コスト削減の際に問題となったため、RedisをSQSに移行するまでは書いていきます。

## Celeryとは

CeleryはPythonベースの分散タスクキューツールです。

Pythonでの柔軟かつ信頼性の高いタスクキューとして、Pythonベースのウェブサービスを作成する際によく用いられています。

Celeryにはタスクキューとして使う`CELERY_BROKER`と必要に応じてタスクの結果を格納する`CELERY_RESULT_BACKEND`を設定します。今回は、`CELERY_BROKER`だけでなく、`RESULT_BACKEND`も使用する必要がありました。

## AWSでのCELERY_BROKERの選択肢

AWS上でのCELERY_BROKERの主な選択肢として以下の3つがあります。

- ElastiCache
- Amazon MQ
- Amazon SQS

現在、私たちが開発しているシステムではElastiCacheを使用しています。

しかし、ElastiCacheやAmazon MQはインスタンスを建てるため時間単位で課金されます。そのため、常にリクエストが何万件も来るシステムならともかく、そうでない場合は必要以上のコストがかかります。

一方で、Amazon SQSはリクエスト単位での課金かつ、毎月100万リクエストまでは無料のため大幅な節約となります。そのため、SQSへ移行することとしました。

## SQSではRESULT_BACKENDを受け取ることができない…

さて、以上のような理由でSQSへの移行を決めましたが、現在のシステムでは`RESULT_BACKEND`を使用していますが、SQSでは`RESULT_BACKEND`を受け取れないため別で用意する必要があります。

こちらの主な選択肢としては

- S3
- RDS(RDBMS)
- DynamoDB(noSQL)
- メモリ

のような選択肢があります。今回はDynamoDBを選択しました。
理由としては、コスト面(RDSにも無料利用枠が存在しますが)、スケーリングの対応がしやすい点などが挙げられます。

## どう実現するか

今回の構成の実現にあたり、以下のような`celeryconfig.py`を作成し、Celeryに読み込ませるような形で実現をしています。環境変数は`.env`や`Amazon Secret Manager`などを使用して読み込んでください。

```python
import os
from kombu.utils.url import safequote

broker_url = "sqs://{aws_access_key}:{aws_secret_key}@".format(
	aws_access_key=safequote(os.environ.get["AWS_ACCESS_KEY"]),
  aws_secret_key=safequote(os.environ.get["AWS_SECRET_KEY"]),
)
		        
broker_transport_options = {
	"region": os.environ.get("AWS_REGION", "your_region"),
  "visibility_timeout": os.environ.get("AWS_SQS_VISIBILITY_TIMEOUT", 3600),
  "polling_interval": os.environ.get("AWS_SQS_POLLING_INTERVAL", 1),
  "wait_time_seconds": os.environ.get("AWS_SQS_WAIT_TIME_SECONDS", 15),
  "queue_name_prefix": os.environ.get("AWS_SQS_QUEUE_NAME_PREFIX", "hoge-"),
}

# change dynamodb 'table name'
result_backend = f"dynamodb://@{os.environ.get('AWS_REGION', 'your_region')}/table_name"
```

以上のような設定により、BROKERにSQS、 RESULT_BACKENDにDynamoDBを設定することができます。ちなみに、SQSのキューに関しては特に何も設定しなかった場合は「`celery`」という名前のキューが自動で生成されるみたいですね。今回の場合は`queue_name_prefix`でPrefixを指定し、`hoge-celery`というような名前のキューが作成されるようにしています。

最後に、これらのコードを実行するIAMロールやIAMユーザーにSQSとDynamoDBのRead権限やWrite権限を与えるようなインラインポリシーを作成してアタッチして下さい(ここのポリシーは省略します)。

## おわりに

今回はSQSへの移行を行いましたが、当然環境によってはElastiCacheやAmazon MQが最適な選択肢となる場合は多く存在すると思います。たとえば、SQSを使用する場合はCeleryイベントやリモートコントロールコマンドに対応していないといった問題があり、SQSを使用する際には自分たちで監視・ヘルスチェックのための環境が必要と言えるでしょう(現在はこちらの対応はできていませんが、順次作成していかないとなとは思っています...)。

以上のような理由により、CeleryのBrokerやBackendの適応先はサービスの運営状況と合わせて選定する必要なあるなと感じています。

ここまで読んでいただきありがとうございました！



## 出典
- [https://docs.celeryq.dev/en/stable/userguide/configuration.html#aws-dynamodb-backend-settings](https://docs.celeryq.dev/en/stable/userguide/configuration.html#aws-dynamodb-backend-settings)

- [https://docs.celeryq.dev/en/stable/getting-started/backends-and-brokers/sqs.html](https://docs.celeryq.dev/en/stable/getting-started/backends-and-brokers/sqs.html)

- [https://qiita.com/hankehly/items/c3e0496eb04327a53ac4](https://qiita.com/hankehly/items/c3e0496eb04327a53ac4)