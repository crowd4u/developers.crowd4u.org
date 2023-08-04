---
title: "AWSのコストを$200減らすために行ったこと"
date: 2023-08-04T14:59:26+09:00
draft: false
author: gild
layout: article
templateEngineOverride: njk,md
tags:
  - "posts"
  - "AWS"
---
    
## はじめに

NextCrowd4uの開発に当たり、STAGING環境の整備や為替レートの上昇に伴い、AWSの利用料が4月時点で700USDを越えてしまいました。

![教員から来たメッセージ]({{ "./chat.png" | url }})


主にSTAGING環境の調整を行い400～500USDまで下げたので行ったことについて紹介していきます。

## 1. 余計なリソースの削除

定番ですが、余計なリソースの削除です。以下の不要なリソースを削除していきました。

- 使用していないEC2インスタンス
- 1つでいいのになぜか2つ立っていたECSタスク
- たまりまくったECRのイメージ

ECRイメージに関しては、使用していない5日以上作成してから立っているコンテナを削除するようなライフサイクルポリシーを作成し、定期的にクリーニングするようにしました。

## 2. STAGING環境の改善

### ①FargateのSpotインスタンス化

Fargate Spotとは[AWS公式ブログ](https://aws.amazon.com/jp/blogs/news/aws-fargate-spot-now-generally-available/)(7/27参照)では以下のような説明をされています。

> Fargate Spotは[AWS Fargate](https://aws.amazon.com/fargate/)の新しい機能です。中断に強い[Amazon Elastic Container Service (Amazon ECS)](https://aws.amazon.com/ecs/)タスクに最適であり、Fargate価格から最大70%割引で提供します。
(中略)
Fargate Spotは、AWSクラウドの空きキャパシティを活用してタスクを実行します。Fargate Spotが空きキャパシティを確保できるかぎり、ユーザーは指定したタスクを起動することができます。AWSにキャパシティが必要になったとき、Fargate Spotで稼働するタスクは2分前の通知とともに中断されることになります。Fargate Spot用のキャパシティが使用できなくなると、Fargateは稼働中の通常のタスクを保持しながら、Fargate Spotで稼働するタスクをスケールダウンします。
> 

AWSの空きリソースを使用することで安く利用することが出来るとのことです。実際に金額を比較してみると(2023/07/27時点)、

|  | Fargate | Fargate Spot |
| --- | --- | --- |
| vCPU(1時間当たりのUSD) | 0.05056 | 0.015168 |
| Memory(1時間当たりのUSD) | 0.00553 | 0.001659 |

とかなり安いことが分かります。

STAGING環境であるという点や、Spotインスタンスが使えなくなった場合、通常のFargateに移行するような設定も可能なことからSpotインスタンスの導入を行いました。

### ②タイムスケーリングの導入

当然、STAGING環境は誰も使用しないような時間が存在します。

そのため開発メンバーが作業しない時間帯はFargateの実行タスクを0にすることでダウンさせるようにしました。

実現の方法としてAWS CLIで設定する方法や、EventBridgeとLambdaで実行する方法がありますが、今回はAWS CLIを使用する方法で実行しました。（AWSマネジメントコンソールで確認できないのつらい。。。）

以下のようなCronで、実行タスクを0にする設定と実行タスクを1以上にする設定をCLIで仕込むことでタイムスケーリングの設定をすることが可能です。

```bash
aws application-autoscaling put-scheduled-action --service-namespace ecs --resource-id service/{クラスタ名}/{サービス名} --scheduled-action-name {スケジュール名(schedule-onなど)} --schedule "cron({Scaling Time})" --scalable-dimension ecs:service:DesiredCount --scalable-target-action MinCapacity=0,MaxCapacity=0
```

設定した時間を確認したい場合は以下のコマンドで実行できます。

```bash
aws application-autoscaling describe-scheduled-actions --service-namespace ecs --resource-id service/{クラスタ名}/{サービス名}
```

削除する場合はリソースとスケジュール名を入力することで実行することが可能です。

```bash
aws application-autoscaling delete-scheduled-action --service-namespace ecs --resource-id service/{クラスタ}/{サービス名} --scheduled-action-name {スケジュール名} --scalable-dimension ecs:service:DesiredCount
```

## おわりに

まだ考えられるコスト軽減策はあるかと思いますが、今回は主にFargateのタイムスケールについて書いてきました。

実際に以上の対策の実行後、一日当たりのFargateのコストが明らかに減少しました。

![減ったAWSコスト]({{ "./graph.png" | url }})

今後、Fargateは更に活用していくことになると思うので、コスト面では気をつけつつ、使いこなしていきたいなと思っています！

ここまで読んでいただきありがとうございました。
