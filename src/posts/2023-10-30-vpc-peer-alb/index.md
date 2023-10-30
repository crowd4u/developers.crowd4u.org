---
title: "VPC PeeringとALBのバーチャルホストで環境の切り分けとコスト削減を両立させる"
date: 2023-10-30T19:05:00+09:00
draft: false
author: gild
layout: article
templateEngineOverride: njk,md
tags:
  - posts
  - Terraform
  - AWS
---

## はじめに

NextCrowd4U(N4U)では様々なタスクの実行を可能にするためにOpenAIのAPIやGoogleSearchAPIを使用する機能の提供をしています。

これらの機能はN4U本体とは独立したもののためN4Uとは別のリソース(EC2やECSだけでなくVPCなども別です)として立てています。

今回はALBが高くて新しく立てたくないという話と、ALBが存在しないVPCに新規サーバーを建てる際にVPCのためピアリングを使用して、ALBに導線をつなぎバーチャルホストとして立てたという内容を書いていきます。

## 今回作成する環境

まず、今回開発したものについて触れておきます。ザックリ言うと、OpenAIのAPIをたたき、N4U本体に返すような踏み台的な環境を作成しました。イメージとしては下の図のようなものになっております。

![作成する構成]({{ "./ecs-vhost.png" | url}})

以下の様な構成で、VPCピアリングを使用し、別のVPCで使用しているALBをバーチャルホストで使用する、という形での実装を今しています。

API Gatewayを使用しなかった理由としては、Streamをするような設定が面倒だったためですね。。。

このような面倒なことをした理由を書いた上で、具体的な実装についてTerraformを使用して紹介していきます。

## 理由：ELB,高い・・・

私たちの開発チームは毎月80USD程度のコストをELBに使用しています。（ELBの料金体系に関しては[こちらの公式ページ](https://aws.amazon.com/jp/elasticloadbalancing/pricing/)を参照してください。）

合計で5つのELBが立っていますが、そのうち2つはほとんどトラフィックがないNLB（そのため金額はほぼ掛かっていない）で、残りの3つのALBがこのコストのほとんどの割合を占めています。

LLMAPIも今後研究の実験で何度もトラフィックが発生することが分かっているため、ALBの料金が当然ネックになってきます。

一つのALBで可能な限り処理すれば、少なくとも時間当たりの料金が新しく作成するよりも削減することが出来ると踏み、今回の構成にしました。

## 実装

実際に今回作成したIaCの一部を紹介していきます(このままコピー＆ペーストしても動きませんので注意してください)。各リソースは直書きにしていますが、適宜tfvarsで管理したりSecrets Managerを使用したものにするなどして対応してください。

### VPC ピアリング

今回のケースとして、「本番VPCとその上にVPCが作成されており、新しくFargateを立てるVPCは存在しない」というものだったため、新規でVPCを作成し、ピアリングの設定を行います。

- VPCの作成
    - CIDRブロックは適当に書いていますので環境に応じて書き換えてください。

```Terraform
resource "aws_vpc" "hoge-vpc" {
  tags = {
    Name = "hoge-vpc"
  }
  cidr_block = "0.0.0.0/16"
}
```

VPC上にパブリックサブネットを2つ作成します。

```Terraform
resource "aws_subnet" "hoge-subnet-1"{
    vpc_id = aws_vpc.hoge-vpc.id
    cidr_block = "0.0.0.0/24"
    availability_zone = "ap-northeast-1a"
    map_public_ip_on_launch = true
}

resource "aws_subnet" "hoge-subnet-2"{
    vpc_id = aws_vpc.hoge-vpc.id
    cidr_block = "0.0.1.0/24"
    availability_zone = "ap-northeast-1c"
    map_public_ip_on_launch = true
}
```

インターネットゲートウェイも続けて作成します。

```Terraform
resource "aws_internet_gateway" "hoge-internet-gateway" {
  vpc_id = aws_vpc.hoge-vpc.id
}
```

最後に、ピアリングのためにルートテーブルとルートを作成します。

prod-vpc → hoge-vpcとhoge-vpc → prod-vpcの両方について接続の設定をしていきます。

ルートテーブルの設定を間違えると接続がうまく行きませんので、よく確認しながら設定を行ってください。

```Terraform
# ルートテーブルの作成
resource "aws_route_table" "hoge_to_prod-route-table" {
  vpc_id = aws_vpc.hoge-vpc.id

  tags = {
    Name = "hoge_to_prod-route-table"
  }
}

# ルートの作成
resource "aws_route" "hoge_to_prod_route" {
  route_table_id = aws_route_table.hoge_to_prod-route-table.id
  destination_cidr_block = data.aws_vpc.prod-vpc.cidr_block
  vpc_peering_connection_id = aws_vpc_peering_connection.hoge_to_prod.id
}

resource "aws_route" "prod_to_hoge_route" {
  route_table_id = data.aws_route_table.prod-route-table.id
  destination_cidr_block = aws_vpc.hoge-vpc.cidr_block
  vpc_peering_connection_id = aws_vpc_peering_connection.hoge_to_prod.id
}

resource "aws_route" "hoge_to_internet_route" {
  route_table_id = aws_route_table.hoge_to_prod-route-table.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id = aws_internet_gateway.hoge-internet-gateway.id
}

# ルートテーブルの関連付け
resource "aws_route_table_association" "hoge-route-table-association-1" {
  subnet_id = aws_subnet.hoge-subnet-1.id
  route_table_id = aws_route_table.hoge_to_prod-route-table.id

  depends_on = [ aws_route_table.hoge_to_prod-route-table ]
}

resource "aws_route_table_association" "hoge-route-table-association-2" {
  subnet_id = aws_subnet.hoge-subnet-2.id
  route_table_id = aws_route_table.hoge_to_prod-route-table.id
  
  depends_on = [ aws_route_table.n4u_hoge_to_prod-route-table ]
}
```

```Terraform
resource "aws_vpc_peering_connection" "external_to_prod" {
  vpc_id = aws_vpc.hoge-vpc.id
  peer_vpc_id = data.aws_vpc.huga-vpc.id
  auto_accept = true

  tags = {
    Name = "hogehuga-peer"
  }
}
```

### Fargate SPOTの作成

次に、ALBがないVPC側でFargateを構築します。今回はSPOTインスタンスを使用するため、capacity_providerに関しても設定の必要があります。

Fargateのタスク定義は省略しますが、環境に応じて作成してください。

- クラスタの作成

```Terraform
resource "aws_ecs_cluster" "hoge-cluster" {
  name = "hoge"
}
```

- サービスの作成
    - コンテナのポートに関しても環境に応じて書き換えてください。

```Terraform
resource "aws_ecs_service" "hoge-api" {
  name = "hoge-api"
  cluster = var.ecs_cluster
  task_definition = aws_ecs_task_definition.hoge-api-aws_ecs_task_definition.arn
  desired_count = 1

  capacity_provider_strategy {
    capacity_provider = "FARGATE_SPOT"
    weight = 1
  }

  network_configuration {
    assign_public_ip = true
    subnets = ["subnet-hogehuga", "subnet-piyohoge"]
    security_groups = ["sg-hogehugapiyo"]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.hoge-api-tg.arn
    container_name = "hoge"
    container_port = <your port>
  }

}
```

最後に、お好みでタスクを作成するコードを書いていただければ完成です。

以上のコードを`terraform apply`することで、VPCピアリングをして他のVPC上のALBに接続することが出来ます。

## 最後に

作成時に困った点としては、ルートテーブルの知見が少なく、正しくルートが設定されていないことに起因して接続がうまく行かないことでした。もしVPCピアリングを使用してインフラ構築をするときに接続がうまく行かない場合、ルート周りから調べていくと良いのかなと今回の経験を通じて感じました。

今回はほぼIaCの紹介という形になってしまいましたが、ここまでお付き合いいただきありがとうございました！