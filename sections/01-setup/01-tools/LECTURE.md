---
docs: true
title: 道具をそろえる
---

# 道具をそろえる

![01 章 道具をそろえる](./images/00-thumbnail.svg)

このハンズオンで使うのは、**Node.js 26**・**VS Code**・**AWS アカウント** の 3 つだけです。コンテナや画面のフレームワークは使いません。

## お使いの OS を選ぶ

手順が OS で分かれるところでは、選んだ OS の手順だけを表示します。最初に、お使いの OS を選んでください。あとから、ページの上のナビゲーションバーの選択欄でも変えられます。

::platform-choice

:::::platform
::::macos
macOS では、ターミナル（「アプリケーション」→「ユーティリティ」→「ターミナル」）で進めます。
::::
::::windows
Windows では、**PowerShell 7** で進めます。コマンドの書き方が macOS・Linux と違うところは、Windows の書き方を表示します。

**必要なスペック**

| 項目 | 必要なもの |
|---|---|
| OS | Windows 11 か Windows 10（64 ビット）。Windows 10 は Microsoft のサポートが終わっているので、11 をすすめます |
| メモリ | 8 GB 以上（エディタ・ブラウザ・NestJS を同時に開きます） |
| ディスクの空き | 5 GB 以上（Node.js・VS Code・`node_modules`） |
| シェル | PowerShell 7（下の手順で入れます） |

**PowerShell 7 を入れる**

Windows に最初から入っている「Windows PowerShell」（5.1）ではなく、新しい PowerShell 7 を使います。5.1 では、`&&` でコマンドをつなげない・`curl` が別のコマンドになっている、など、このハンズオンのコマンドがそのままでは動かないためです。

スタートメニューから「Windows PowerShell」を開き、次のコマンドで入れます。

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

NestJS は Node.js の上で動きます。このハンズオンでは **Node.js 26（LTS）** を使います。まず、入っているか確かめます。

```bash
node -v
```

`v26.` から始まる番号が出れば、もう入っています。次の「[VS Code を入れる](#vs-code-を入れる)」に進んでください。出ないときは、[Node.js のダウンロードのページ](https://nodejs.org/ja/download) でバージョンに **v26（LTS）** を選び、お使いの OS の入れ方に従います。

:::::platform
::::macos
macOS 用のインストーラー（`.pkg`）をダウンロードして開き、画面の案内に従って進めます。nvm などのバージョン管理ツールを使っている人は、`nvm install 26` でもかまいません。
::::
::::windows
Windows 用のインストーラー（`.msi`）をダウンロードして開き、画面の案内に従って進めます。winget で入れることもできます。

```powershell
winget install OpenJS.NodeJS.LTS
```

`OpenJS.NodeJS.LTS` は、その時点の LTS を入れます。2026 年 10 月から 2027 年 10 月までは Node.js 26 です。
::::
::::linux
ダウンロードのページで OS に **Linux** を選び、表示されたコマンドを実行します。Ubuntu の `apt install nodejs` で入る Node.js は古いことが多いので、使いません。
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

`v26.` から始まっていれば大丈夫です（細かい番号は入れた日によって違います）。npm は Node.js といっしょに入るパッケージマネージャーで、NestJS のライブラリを入れるときに使います。

## VS Code を入れる

エディタには [Visual Studio Code](https://code.visualstudio.com/) を使います。公式サイトからインストーラーをダウンロードして入れます。

:::::platform
::::macos
Homebrew を使っているなら、コマンドでも入れられます。

```bash
brew install --cask visual-studio-code
```
::::
::::windows
winget でも入れられます。

```powershell
winget install --id Microsoft.VisualStudioCode --source winget
```
::::
::::linux
公式サイトから、お使いのディストリビューションに合ったパッケージ（`.deb` / `.rpm`）を選んで入れます。
::::
:::::

使い方のこつは [開発ツール](../../TOOLS.md) にまとめています。

## AWS アカウントを用意する

03 章から、Amazon Cognito のユーザープールを AWS のコンソールで作ります。AWS アカウントを持っていなければ、[AWS のサインアップのページ](https://aws.amazon.com/jp/free/) から作ってください。作るときにクレジットカードと電話番号が要ります。

コンソール（<https://console.aws.amazon.com/>）にサインインできれば、この節の準備は終わりです。

:::notice
Cognito のユーザープールは、月のアクティブユーザーが 1 万人までなら無料で使えます（Lite プランの場合）。このハンズオンで作るユーザーは数人なので、料金はかかりません。最新の料金は [Amazon Cognito の料金](https://aws.amazon.com/jp/cognito/pricing/) で確かめてください。
:::

## 参考にした公式ドキュメント

この節は、次の公式ドキュメントをもとに書いています。

- [Node.js: ダウンロード](https://nodejs.org/ja/download) … Node.js の入れ方（インストーラー・パッケージマネージャー）
- [Node.js: Previous Releases](https://nodejs.org/en/about/previous-releases) … LTS の決まりと、各バージョンのサポート期間
- [Microsoft Learn: Windows への PowerShell のインストール](https://learn.microsoft.com/ja-jp/powershell/scripting/install/installing-powershell-on-windows) … winget で PowerShell 7 を入れる方法
- [Visual Studio Code: Setup Overview](https://code.visualstudio.com/docs/setup/setup-overview) … VS Code の入れ方
- [Amazon Cognito の料金](https://aws.amazon.com/jp/cognito/pricing/) … Lite プランの無料枠（月 1 万アクティブユーザー）

:::faq

### Node.js 24 でも動く？

このハンズオンで使う NestJS 12 は Node.js 24 でも動きます。ただし、手順は Node.js 26 で確かめています。迷ったら 26 を使ってください。

### 会社の AWS アカウントを使ってもいい？

Cognito のユーザープールを作る権限があれば使えます。練習で作ったユーザープールは、終わったら消してください（消し方は 03 章にあります）。

:::
