# 🎉 智能自动抽奖系统

一个功能完整的在线抽奖系统，支持分类抽奖、Excel批量导入导出、一次性多人抽奖等功能，采用Microsoft Fluent Design设计风格。

## ✨ 功能特性

- 🎲 **灵活抽奖**：支持1到全部参与者的任意人数抽奖
- 📊 **分类管理**：可按不同类别进行抽奖，支持多种奖品
- 📋 **参与者管理**：完整的CRUD功能，简洁的信息字段
- 📈 **Excel支持**：支持批量导入参与者信息和导出数据报表
- 🎨 **现代化UI**：Microsoft Fluent Design风格，炫酷动画效果
- 📱 **响应式设计**：完美适配移动端和桌面端
- ⚡ **实时同步**：基于Supabase的实时数据更新
- 🔒 **数据安全**：安全的数据存储和访问控制

## 🛠️ 技术栈

- **前端**：React + TypeScript + Tailwind CSS + Framer Motion
- **后端**：Supabase (PostgreSQL + Edge Functions)
- **UI组件**：Radix UI + shadcn/ui
- **动画**：CSS3 + Framer Motion
- **文件处理**：XLSX库
- **部署**：支持Github Pages等静态部署

## 🚀 快速开始

### 1. 环境配置

\`\`\`bash
# 克隆项目
git clone https://github.com/你的用户名/auto-lottery-system.git
cd auto-lottery-system

# 安装依赖
pnpm install
\`\`\`

### 2. Supabase配置

1. 在 [Supabase](https://supabase.com) 创建新项目
2. 在项目设置中获取项目URL和API密钥
3. 在 \`src/lib/supabase.ts\` 中配置您的Supabase信息

### 3. 运行项目

\`\`\`bash
# 开发环境
pnpm dev

# 生产构建
pnpm build
\`\`\`

## 📱 使用说明

### 抽奖功能
1. 选择抽奖分类
2. 设置抽奖人数（1到全部参与者）
3. 点击"开始抽奖"按钮
4. 欣赏炫酷的抽奖动画效果

### 管理功能
1. 点击"管理"进入后台
2. **参与者管理**：添加、编辑、删除参与者
3. **分类管理**：创建和管理抽奖分类
4. **Excel导入**：批量导入参与者信息
5. **数据导出**：导出参与者和抽奖记录

## 🌐 部署

### Github Pages部署
1. 构建项目：\`pnpm build\`
2. 将\`dist\`目录内容上传到Github Pages

## 📄 许可证

MIT License

---

🎉 **享受抽奖的乐趣！**
