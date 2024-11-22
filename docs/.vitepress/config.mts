import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Learn knowledge base',
  description: 'ZooHero KnowledgeBase',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' }
    ],

    sidebar: [
      {
        text: '目录',
        link: '/catalogue'
      },
      {
        text: 'React',
        collapsed: true,
        items: [
          { text: 'React 介绍', link: '/React/index' },
          { 
            text: 'Hook',
            collapsed: true,
            items: [
              { text: 'Hook 概述', link: '/React/Hook/overview' },
              { text: 'useState', link: '/React/Hook/useState' },
              { text: 'useEffect', link: '/React/Hook/useEffect' },
              { text: 'useContext', link: '/React/Hook/useContext' },
              { text: 'useReducer', link: '/React/Hook/useReducer' },
              { text: 'useCallback', link: '/React/Hook/useCallback' },
              { text: 'useMemo', link: '/React/Hook/useMemo' },
              { text: 'useRef', link: '/React/Hook/useRef' },
              { text: 'useImperativeHandle', link: '/React/Hook/useImperativeHandle' },
              { text: 'useLayoutEffect', link: '/React/Hook/useLayoutEffect' }
            ]
          },
          { text: '生命周期', link: '/React/lifecycle' },
          { text: '纯函数', link: '/React/pure-function' },
          { text: '虚拟DOM', link: '/React/virtualdom' }
        ]
      },
      {
        text: 'TypeScript',
        collapsed: true,
        items: [
          { text: 'TypeScript 介绍', link: '/TypeScript/index' },
          { text: '基础', link: '/TypeScript/basis' },
          { text: '进阶用法', link: '/TypeScript/better' },
          { text: '类', link: '/TypeScript/class' },
          { text: '装饰器', link: '/TypeScript/decorators' },
          { text: '函数', link: '/TypeScript/function' },
          { text: '泛型', link: '/TypeScript/generics' },
          { text: '高级类型', link: '/TypeScript/advanced-types' },
          { text: '高级技巧', link: '/TypeScript/high-level' },
          { text: '接口', link: '/TypeScript/interface' },
          { text: '互操作性', link: '/TypeScript/interoperability' },
          { text: '模块', link: '/TypeScript/module' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
