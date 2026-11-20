---
docs: true
title: 道具をそろえる
---

# 道具をそろえる

![01 章 道具をそろえる](./images/00-thumbnail.svg)

このハンズオンで使うのは、**Node.js 26**・**VS Code**・**AWS アカウント** の 3 つです。

## お使いの OS を選ぶ

手順が OS で分かれるところでは、選んだ OS の手順だけを表示します。あとから、ナビゲーションバーの選択欄でも変えられます。

::platform-choice

:::::platform
::::macos
macOS では、ターミナル（「アプリケーション」→「ユーティリティ」→「ターミナル」）で進めます。
::::
::::windows
Windows では、**PowerShell 7** で進めます。Windows 11 か Windows 10（64 ビット）、メモリ 8 GB 以上、ディスクの空き 5 GB 以上を用意してください。

最初から入っている「Windows PowerShell」（5.1）では、`&&` でコマンドをつなげない・`curl` が別のコマンドになっている、などでこのハンズオンのコマンドが動きません。スタートメニューから「Windows PowerShell」を開き、PowerShell 7 を入れます。

```powershell
winget install --id Microsoft.PowerShell --source winget
```

入れたら、スタートメニューから **PowerShell 7**（`pwsh`）を開きます。以降のコマンドは、すべて PowerShell 7 で実行します。

```powershell
$PSVersionTable.PSVersion
```

`7.` から始まる番号が出れば大丈夫です。
::::
::::linux
Linux では、ふだんのターミナルで進めます。
::::
:::::

## Node.js 26 を入れる

NestJS は Node.js の上で動きます。[Node.js のダウンロードのページ](https://nodejs.org/ja/download) でバージョンに **v26（LTS）** を選び、公式のインストーラーで入れます。

:::::platform
::::macos
macOS 用のインストーラー（`.pkg`）をダウンロードして開き、画面の案内に従って進めます。
::::
::::windows
Windows 用のインストーラー（`.msi`）をダウンロードして開き、画面の案内に従って進めます。
::::
::::linux
ダウンロードのページで OS に **Linux** を選び、表示されたコマンドを実行します。
::::
:::::

入れたら、ターミナル（Windows では PowerShell 7）を開き直して確かめます。

```bash
node -v
npm -v
```

```text
v26.13.1
11.12.1
```

`v26.` から始まっていれば大丈夫です（細かい番号は入れた日によって違います）。npm は Node.js といっしょに入るパッケージマネージャーです。

## VS Code を入れる

エディタには [Visual Studio Code](https://code.visualstudio.com/) を使います。公式サイトからインストーラーをダウンロードして入れます。使い方は [開発ツール](../../TOOLS.md) にまとめています。

## AWS アカウントを用意する

03 章から、Amazon Cognito のユーザープールを AWS のコンソールで作ります。AWS アカウントを持っていなければ、[AWS のサインアップのページ](https://aws.amazon.com/jp/free/) から作ってください（クレジットカードと電話番号が要ります）。

コンソール（<https://console.aws.amazon.com/>）にサインインできれば、この節の準備は終わりです。

:::notice
Cognito のユーザープールは、月のアクティブユーザーが 1 万人までなら無料です（Lite プラン）。このハンズオンで作るユーザーは数人なので、料金はかかりません。
:::

## 参考にした公式ドキュメント

この節は、次の公式ドキュメントをもとに書いています。

- [Node.js: ダウンロード](https://nodejs.org/ja/download) … Node.js の入れ方
- [Microsoft Learn: Windows への PowerShell のインストール](https://learn.microsoft.com/ja-jp/powershell/scripting/install/installing-powershell-on-windows) … winget で PowerShell 7 を入れる方法
- [Visual Studio Code: Setup Overview](https://code.visualstudio.com/docs/setup/setup-overview) … VS Code の入れ方
- [Amazon Cognito の料金](https://aws.amazon.com/jp/cognito/pricing/) … Lite プランの無料枠（月 1 万アクティブユーザー）
