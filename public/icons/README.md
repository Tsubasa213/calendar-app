# アプリアイコン配置フォルダ

このフォルダには、Webアプリケーションのアイコンファイルを配置します。

## 現在の構成

```
public/
├── android-chrome-192x192.png  # 既存 - 192x192 px
├── android-chrome-512x512.png  # 既存 - 512x512 px
└── icons/                      # このフォルダ（必要に応じて追加アイコンを配置）
```

## 最低限必要なファイル

### ✅ 既に存在するファイル

- `public/android-chrome-192x192.png` - Android用アイコン（192x192 px）
- `public/android-chrome-512x512.png` - 高解像度アイコン（512x512 px）

### 📝 追加推奨ファイル

1. **favicon.ico** → `public/favicon.ico`

   - ブラウザタブ用アイコン
   - サイズ: 32x32 px（または16x16, 32x32のマルチサイズ）

2. **apple-touch-icon.png** → `public/apple-touch-icon.png`
   - iOS用アイコン
   - サイズ: 180x180 px

## アイコン生成の簡単な方法

### 既存のアイコンから favicon.ico を作成

既にある `android-chrome-512x512.png` を使って favicon.ico を生成できます。

**推奨ツール**: https://favicon.io/favicon-converter/

1. `android-chrome-512x512.png` をアップロード
2. ダウンロード
3. `favicon.ico` を `public/` フォルダに配置

## 参考リンク

- **Favicon Generator**: https://favicon.io/favicon-converter/
- **Next.js Metadata**: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
