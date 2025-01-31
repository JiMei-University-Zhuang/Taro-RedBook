export default defineAppConfig({
  pages: [
    'pages/index/index',      // 社交广场主页
    'pages/ai-drawing/index'  // AI绘画页面
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '创作社区',
    navigationBarTextStyle: 'black'
  },
  lazyCodeLoading: "requiredComponents"
}) 