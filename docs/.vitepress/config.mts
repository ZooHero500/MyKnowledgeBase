import { defineConfig } from 'vitepress'
import { withMermaid } from "vitepress-plugin-mermaid"

// https://vitepress.dev/reference/site-config
export default withMermaid({
  title: 'Learn knowledge base',
  description: 'ZooHero KnowledgeBase',
  markdown: {
    config: (md) => {
      // 可以配置 markdown-it 插件
    }
  },
  // Mermaid 配置
  mermaid: {
    // 自定义主题
    theme: 'default',
    // 启用局部主题
    themeVariables: {
      // 主题变量配置
      fontFamily: 'roboto',
      primaryColor: '#00897B',
      primaryTextColor: '#fff',
      primaryBorderColor: '#00897B',
      lineColor: '#F8B229',
      secondaryColor: '#006064',
      tertiaryColor: '#fff'
    }
  },
  ignoreDeadLinks: true,
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' }
    ],

    sidebar: [
      {
        text: 'JavaScript',
        collapsed: false,
        items: [
          {
            text: '核心概念',
            collapsed: true,
            items: [
              { text: '闭包', link: '/Javascript/Core/closure' },
              
              { text: '事件循环', link: '/Javascript/Core/event-loop' },
              { text: '原型和继承', link: '/Javascript/Core/prototype' },
              { text: '函数式编程', link: '/Javascript/Core/functional' },
              { text: '面向对象', link: '/Javascript/Core/object' }
            ]
          },
          {
            text: 'ES6+',
            collapsed: true,
            items: [
              { text: '新特性总览', link: '/Javascript/ES6/index' },
              { text: '类与继承', link: '/Javascript/ES6/class' },
              { text: '模块系统', link: '/Javascript/ES6/module' },
              { text: 'Promise', link: '/Javascript/ES6/promise' },
              { text: 'async/await', link: '/Javascript/ES6/async-await' },
              { text: '装饰器', link: '/Javascript/ES6/decorator' },
              { text: '可选链和空值合并', link: '/Javascript/ES6/optional-chaining' }
            ]
          },
          {
            text: '设计模式',
            collapsed: true,
            items: [
              { text: '设计模式概述', link: '/Javascript/Patterns/index' },
              { text: '创建型模式', link: '/Javascript/Patterns/creational' },
              { text: '结构型模式', link: '/Javascript/Patterns/structural' },
              { text: '行为型模式', link: '/Javascript/Patterns/behavioral' }
            ]
          }
        ]
      },
      {
        text: 'React',
        collapsed: false,
        items: [
          { text: '进阶概念', link: '/React/index' },
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
        collapsed: false,
        items: [
          { text: '进阶概念', link: '/TypeScript/index' },
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
      },
      {
        text: '前端工程化',
        collapsed: false,
        items: [
          { text: 'Gulp', link: '/Engineering/gulp' },
          { text: 'Vite', link: '/Engineering/vite' },
          { text: 'Webpack', link: '/Engineering/webpack' },
          { text: 'Rollup', link: '/Engineering/rollup' },
          { text: 'ESbuild', link: '/Engineering/esbuild' },
        ]
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/zouhero/learn-knowledge-base' }
    ]
  }
})
