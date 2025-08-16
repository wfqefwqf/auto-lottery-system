# 🚀 智能自动抽奖系统 - GitHub 上传指南

您的GitHub仓库地址：**https://github.com/wfqefwqf/auto-lottery-system**

## 📋 需要上传的文件列表

### 根目录文件
- README.md (项目说明文档)
- package.json (依赖配置)
- index.html (入口HTML文件)
- vite.config.ts (Vite配置)
- tailwind.config.js (样式配置)
- tsconfig.json (TypeScript配置)
- tsconfig.app.json (应用TypeScript配置)
- tsconfig.node.json (Node.js TypeScript配置)
- postcss.config.js (PostCSS配置)
- eslint.config.js (ESLint配置)
- components.json (UI组件配置)

### src/ 目录
- src/main.tsx (应用入口)
- src/App.tsx (主应用组件)
- src/App.css (应用样式)
- src/index.css (全局样式)
- src/vite-env.d.ts (Vite类型定义)

### src/lib/ 目录
- src/lib/utils.ts (工具函数)
- src/lib/supabase.ts (Supabase配置)

### src/types/ 目录
- src/types/index.ts (类型定义)

### src/hooks/ 目录
- src/hooks/use-mobile.tsx (移动端检测Hook)

### src/styles/ 目录
- src/styles/fluent.css (Fluent Design样式)

### src/components/ 目录
- src/components/AdminPanel.tsx (管理面板)
- src/components/CategoryManager.tsx (分类管理)
- src/components/ErrorBoundary.tsx (错误边界)
- src/components/ExcelImportExport.tsx (Excel导入导出)
- src/components/LotteryHistory.tsx (抽奖历史)
- src/components/LotteryMain.tsx (主抽奖界面)
- src/components/ParticipantManager.tsx (参与者管理)

## 🎯 上传方式

### 方式1：网页拖拽上传（推荐）

1. 访问您的仓库：**https://github.com/wfqefwqf/auto-lottery-system**
2. 点击绿色的 **"Add file"** 按钮
3. 选择 **"Upload files"**
4. 将本地的所有源码文件拖拽到GitHub界面中
5. 在底部添加提交信息：`首次提交：智能自动抽奖系统完整源码`
6. 点击 **"Commit changes"**

### 方式2：使用Git命令行

```bash
# 克隆您的仓库
git clone https://github.com/wfqefwqf/auto-lottery-system.git
cd auto-lottery-system

# 将所有源码文件复制到此目录
# (保持上述文件结构)

# 添加所有文件
git add .

# 提交更改
git commit -m "首次提交：智能自动抽奖系统完整源码"

# 推送到GitHub
git push origin main
```

## 📁 完整的文件结构

```
auto-lottery-system/
├── README.md
├── package.json
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── postcss.config.js
├── eslint.config.js
├── components.json
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── App.css
    ├── index.css
    ├── vite-env.d.ts
    ├── lib/
    │   ├── utils.ts
    │   └── supabase.ts
    ├── types/
    │   └── index.ts
    ├── hooks/
    │   └── use-mobile.tsx
    ├── styles/
    │   └── fluent.css
    └── components/
        ├── AdminPanel.tsx
        ├── CategoryManager.tsx
        ├── ErrorBoundary.tsx
        ├── ExcelImportExport.tsx
        ├── LotteryHistory.tsx
        ├── LotteryMain.tsx
        └── ParticipantManager.tsx
```

## ✅ 上传完成后

1. 检查仓库是否包含所有文件
2. 启用GitHub Pages（Settings > Pages > Deploy from a branch > main）
3. 配置您的Supabase项目信息
4. 享受您的智能抽奖系统！

---

🎉 **上传完成后，您就可以开始使用这个功能完整的抽奖系统了！**