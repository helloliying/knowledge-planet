# 知识星球 - 个人知识管理网站

一个基于Hugo的简约个人知识管理网站，支持Markdown写作、评论、分享等功能。

## 功能特性

- ✅ **简约亮色设计** - PaperMod主题，专注于内容
- ✅ **Markdown原生支持** - 用最简洁的方式写作
- ✅ **无需登录的评论系统** - 基于GitHub Issues的Utterances
- ✅ **社交分享** - 支持Twitter、LinkedIn、Reddit等平台
- ✅ **响应式设计** - 手机和电脑都有良好体验
- ✅ **搜索功能** - 快速查找内容
- ✅ **分类标签** - 内容组织清晰
- ✅ **GitHub Pages部署** - 免费托管，自动构建

## 快速开始

### 1. 本地开发
```bash
# 克隆仓库
git clone https://github.com/yourusername/knowledge-planet.git
cd knowledge-planet

# 启动本地服务器
hugo server -D
```

### 2. 添加新文章
```bash
# 创建新文章
hugo new posts/文章标题.md

# 编辑content/posts/文章标题.md
```

### 3. 配置评论系统
1. 在GitHub创建一个公开仓库（如：yourusername/comments）
2. 安装[Utterances](https://github.com/apps/utterances)
3. 修改`hugo.toml`中的配置：
```toml
utterancesRepo = "yourusername/comments"
```

### 4. 部署到GitHub Pages
1. 将代码推送到GitHub
2. 在仓库设置中启用GitHub Pages，选择`gh-pages`分支
3. 访问：https://yourusername.github.io/knowledge-planet/

## 项目结构
```
knowledge-planet/
├── content/          # 内容目录
│   ├── posts/       # 文章
│   └── about/       # 关于页面
├── themes/          # 主题
├── static/          # 静态资源
├── layouts/         # 自定义布局
├── data/            # 数据文件
├── hugo.toml        # 配置文件
└── .github/workflows/ # GitHub Actions
```

## 自定义配置

### 修改网站信息
编辑`hugo.toml`：
```toml
title = "您的网站标题"
description = "网站描述"
author = "您的名字"
```

### 添加菜单项
在`hugo.toml`的`[menu]`部分添加：
```toml
[[menu.main]]
  identifier = "new-page"
  name = "新页面"
  url = "/new-page/"
  weight = 6
```

### 修改主题颜色
编辑`assets/css/extended/custom.css`：
```css
:root {
  --primary-color: #2563eb; /* 修改主色调 */
}
```

## 写作指南

### 文章Front Matter
每篇文章开头需要YAML格式的元数据：
```yaml
---
title: "文章标题"
date: 2024-01-01T10:00:00+08:00
draft: false
tags: ["标签1", "标签2"]
categories: ["分类"]
summary: "文章摘要"
---
```

### 图片管理
将图片放在`static/images/`目录，在文章中使用：
```markdown
![图片描述](/images/图片文件名.jpg)
```

## 故障排除

### 本地无法运行
```bash
# 检查Hugo版本
hugo version

# 安装Hugo扩展版（如果需要）
# 参考：https://gohugo.io/installation/
```

### GitHub Pages不更新
1. 检查GitHub Actions运行状态
2. 确保`gh-pages`分支存在
3. 检查仓库设置中的Pages配置

### 评论不显示
1. 确认Utterances已安装到仓库
2. 检查`hugo.toml`中的`utterancesRepo`配置
3. 确保仓库是公开的

## 贡献
欢迎提交Issue和Pull Request！

## 许可证
MIT License