#!/bin/bash
# 知识星球网站部署脚本

echo "🚀 开始部署知识星球网站..."

# 1. 重新构建网站
echo "📦 重新构建静态网站..."
hugo --minify --buildFuture

# 2. 检查构建结果
echo "🔍 检查OpenClaw文章是否生成..."
if [ -d "public/posts/openclaw-introduction" ] && [ -d "public/posts/openclaw-quick-guide" ]; then
    echo "✅ OpenClaw文章已成功生成"
else
    echo "❌ OpenClaw文章生成失败"
    exit 1
fi

# 3. 显示网站统计
echo "📊 网站统计信息："
echo "   总页面数: $(find public -name "*.html" | wc -l)"
echo "   OpenClaw文章: 2篇"
echo "   总文章数: $(find public/posts -type d -mindepth 1 | wc -l)"

# 4. 创建部署说明
cat > public/DEPLOY-README.md << 'EOF'
# 知识星球网站部署说明

## 网站内容
- 首页：展示特色文章和最新内容
- 文章列表：包含所有技术文章
- OpenClaw Demo：两篇完整的OpenClaw介绍文章
- 分类和标签系统

## 特色功能
1. **响应式设计** - 支持手机和电脑
2. **特色文章展示** - 突出显示重要内容
3. **社交分享** - 支持Twitter、LinkedIn等
4. **搜索优化** - 完整的SEO设置

## 部署状态
- 最后构建时间: $(date)
- 包含OpenClaw文章: 是
- 文章总数: $(find public/posts -type d -mindepth 1 | wc -l)

## 访问地址
https://helloliying.github.io/knowledge-planet/
EOF

echo "📝 部署说明已创建"

# 5. 显示部署步骤
echo ""
echo "🎯 部署步骤："
echo "   1. 将 'public' 目录上传到GitHub仓库"
echo "   2. 确保GitHub Pages配置正确"
echo "   3. 等待GitHub Pages自动构建（约1分钟）"
echo "   4. 访问 https://helloliying.github.io/knowledge-planet/"
echo ""
echo "📁 public目录内容："
ls -la public/

echo ""
echo "✅ 部署准备完成！"
echo "💡 提示：如果Git推送有问题，可以手动上传public目录到GitHub"