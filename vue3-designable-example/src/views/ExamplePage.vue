<template>
  <div class="example-page">
    <div class="example-header">
      <h1>Vue 3 设计器示例</h1>
      <p>这是一个基于 Vue 3 和 Element Plus 构建的可视化设计器示例</p>
    </div>

    <div class="example-nav">
      <a-tabs v-model:activeKey="activeTab" type="card" @change="handleTabChange">
        <a-tab-pane key="designer" tab="设计器">
          <div class="tab-content">
            <p>使用设计器创建和编辑你的页面布局，拖拽组件到设计区域即可开始设计。</p>
          </div>
        </a-tab-pane>
        <a-tab-pane key="guide" tab="使用指南">
          <div class="tab-content">
            <h3>快速开始</h3>
            <ol class="guide-list">
              <li>从左侧组件库中拖拽组件到中间设计区域</li>
              <li>选中组件后，可以在右侧属性面板中编辑其属性</li>
              <li>使用工具栏按钮执行保存、导出、撤销等操作</li>
              <li>拖拽调整组件位置或使用属性面板设置精确位置和大小</li>
            </ol>
          </div>
        </a-tab-pane>
        <a-tab-pane key="docs" tab="组件文档">
          <div class="tab-content">
            <h3>组件说明</h3>
            <div class="component-docs">
              <a-collapse v-model:activeKey="activeDocs">
                <a-collapse-panel header="表单组件" key="forms">
                  <div class="doc-content">
                    <h4>Input 输入框</h4>
                    <p>用于文本输入，支持单行和多行模式，可设置占位符、默认值等。</p>
                    <pre><code>{{ getComponentSample('Input') }}</code></pre>
                    
                    <h4>Select 选择器</h4>
                    <p>用于从预定义选项中选择一个或多个值，支持单选和多选。</p>
                    <pre><code>{{ getComponentSample('Select') }}</code></pre>
                    
                    <h4>Switch 开关</h4>
                    <p>用于布尔值切换，可设置选中和未选中时的文本和颜色。</p>
                    <pre><code>{{ getComponentSample('Switch') }}</code></pre>
                  </div>
                </a-collapse-panel>
                <a-collapse-panel header="布局组件" key="layout">
                  <div class="doc-content">
                    <h4>Card 卡片</h4>
                    <p>用于内容分组，可设置标题、边框、阴影等样式。</p>
                    <pre><code>{{ getComponentSample('Card') }}</code></pre>
                    
                    <h4>Row/Col 栅格布局</h4>
                    <p>基于 24 分栏的栅格系统，用于页面布局。</p>
                    <pre><code>{{ getComponentSample('Row') }}</code></pre>
                  </div>
                </a-collapse-panel>
                
                <a-collapse-panel header="基础组件" key="basic">
                  <div class="doc-content">
                    <h4>Button 按钮</h4>
                    <p>可点击的操作按钮，支持多种类型和尺寸。</p>
                    <pre><code>{{ getComponentSample('Button') }}</code></pre>
                    
                    <h4>Text 文本</h4>
                    <p>用于显示文本内容，可设置字体大小、颜色等样式。</p>
                    <pre><code>{{ getComponentSample('Text') }}</code></pre>
                    
                    <h4>Divider 分割线</h4>
                    <p>用于分隔内容区域。</p>
                    <pre><code>{{ getComponentSample('Divider') }}</code></pre>
                  </div>
                </a-collapse-panel>
                
                <a-collapse-panel header="数据展示" key="data">
                  <div class="doc-content">
                    <h4>Table 表格</h4>
                    <p>用于展示结构化数据，支持分页、排序等功能。</p>
                    <pre><code>{{ getComponentSample('Table') }}</code></pre>
                  </div>
                </a-collapse-panel>
              </a-collapse>
            </div>
          </div>
        </a-tab-pane>
    </a-tabs>
    </div>

    <div class="example-showcase">
      <h2>示例展示</h2>
      <div class="showcase-grid">
        <div class="showcase-item" v-for="example in examples" :key="example.id">
          <el-card :body-style="{ padding: '0px' }">
            <img :src="example.imageUrl" :alt="example.title" class="card-image" />
            <div class="card-body">
              <h3>{{ example.title }}</h3>
              <p>{{ example.description }}</p>
              <el-button type="primary" @click="loadExample(example)" size="small">
                加载示例
              </el-button>
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <div class="example-footer">
      <p>&copy; 2023 Vue 3 设计器示例</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue';
import { message } from 'ant-design-vue';

// 引入设计器引擎
const designerEngine = inject<any>('designerEngine');

// Tab 状态
const activeTab = ref('designer');

// 文档折叠面板状态
const activeDocs = ref(['forms']);

// 示例列表
const examples = [
  {
    id: 1,
    title: '简单表单',
    description: '包含基本输入框、选择器和提交按钮的表单示例',
    imageUrl: 'https://placehold.co/300x200?text=Simple+Form',
    data: () => ({
      type: 'Form',
      props: {
        title: '用户注册',
        layout: 'vertical'
      },
      children: [
        {
          type: 'Input',
          props: {
            label: '用户名',
            placeholder: '请输入用户名'
          }
        },
        {
          type: 'Input',
          props: {
            label: '邮箱',
            placeholder: '请输入邮箱',
            type: 'email'
          }
        },
        {
          type: 'Select',
          props: {
            label: '性别',
            options: [
              { label: '男', value: 'male' },
              { label: '女', value: 'female' },
              { label: '其他', value: 'other' }
            ]
          }
        },
        {
          type: 'Button',
          props: {
            type: 'primary',
            label: '提交'
          }
        }
      ]
    })
  },
  {
    id: 2,
    title: '数据卡片',
    description: '使用卡片和栅格布局展示统计数据',
    imageUrl: 'https://placehold.co/300x200?text=Data+Cards',
    data: () => ({
      type: 'Row',
      props: {
        gutter: 16
      },
      children: [
        {
          type: 'Col',
          props: {
            span: 8
          },
          children: [
            {
              type: 'Card',
              props: {
                title: '今日访问',
                icon: 'el-icon-view'
              },
              children: [
                {
                  type: 'Text',
                  props: {
                    content: '12,345',
                    size: 'large'
                  }
                }
              ]
            }
          ]
        },
        {
          type: 'Col',
          props: {
            span: 8
          },
          children: [
            {
              type: 'Card',
              props: {
                title: '注册用户',
                icon: 'el-icon-user'
              },
              children: [
                {
                  type: 'Text',
                  props: {
                    content: '892',
                    size: 'large'
                  }
                }
              ]
            }
          ]
        },
        {
          type: 'Col',
          props: {
            span: 8
          },
          children: [
            {
              type: 'Card',
              props: {
                title: '转化率',
                icon: 'el-icon-s-data'
              },
              children: [
                {
                  type: 'Text',
                  props: {
                    content: '23.8%',
                    size: 'large'
                  }
                }
              ]
            }
          ]
        }
      ]
    })
  },
  {
    id: 3,
    title: '数据表格',
    description: '包含分页、排序功能的数据表格示例',
    imageUrl: 'https://placehold.co/300x200?text=Data+Table',
    data: () => ({
      type: 'Card',
      props: {
        title: '用户列表'
      },
      children: [
        {
          type: 'Table',
          props: {
            columns: [
              { label: '用户名', prop: 'username', width: 120 },
              { label: '邮箱', prop: 'email', width: 200 },
              { label: '状态', prop: 'status', width: 100 },
              { label: '创建时间', prop: 'createdAt', width: 180 },
              { label: '操作', prop: 'action', width: 150 }
            ],
            data: [
              {
                username: 'admin',
                email: 'admin@example.com',
                status: '启用',
                createdAt: '2023-01-01'
              },
              {
                username: 'user1',
                email: 'user1@example.com',
                status: '启用',
                createdAt: '2023-01-02'
              },
              {
                username: 'user2',
                email: 'user2@example.com',
                status: '禁用',
                createdAt: '2023-01-03'
              }
            ],
            pagination: true,
            pageSize: 10
          }
        }
      ]
    })
  }
];

// Tab 切换处理
const handleTabChange = (activeKey: string) => {
  activeTab.value = activeKey;
};

// 加载示例
const loadExample = (example: any) => {
  if (designerEngine) {
    try {
      // 获取示例数据
      const exampleData = example.data();
      // 清空当前设计
      designerEngine.clear();
      // 加载示例数据
      designerEngine.load(exampleData);
      message.success(`已加载示例: ${example.title}`);
      // 切换到设计器标签
      activeTab.value = 'designer';
    } catch (error) {
      message.error('加载示例失败');
      console.error('加载示例失败:', error);
    }
  } else {
    message.warning('设计器引擎未就绪');
  }
};

// 获取组件代码示例
const getComponentSample = (componentType: string) => {
  const samples: Record<string, string> = {
    Input: `{
  "type": "Input",
  "props": {
    "label": "输入框",
    "placeholder": "请输入内容",
    "defaultValue": "默认值",
    "maxlength": 100
  }
}`,
    Select: `{
  "type": "Select",
  "props": {
    "label": "选择器",
    "options": [
      { "label": "选项1", "value": "1" },
      { "label": "选项2", "value": "2" }
    ],
    "multiple": false,
    "defaultValue": "1"
  }
}`,
    Switch: `{
  "type": "Switch",
  "props": {
    "label": "开关",
    "defaultValue": true,
    "activeText": "开",
    "inactiveText": "关"
  }
}`,
    Card: `{
  "type": "Card",
  "props": {
    "title": "卡片标题",
    "shadow": "hover"
  },
  "children": [
    {
      "type": "Text",
      "props": {
        "content": "卡片内容"
      }
    }
  ]
}`,
    Row: `{
  "type": "Row",
  "props": {
    "gutter": 16
  },
  "children": [
    {
      "type": "Col",
      "props": {
        "span": 12
      },
      "children": [
        {
          "type": "Text",
          "props": {
            "content": "左侧内容"
          }
        }
      ]
    },
    {
      "type": "Col",
      "props": {
        "span": 12
      },
      "children": [
        {
          "type": "Text",
          "props": {
            "content": "右侧内容"
          }
        }
      ]
    }
  ]
}`,
    Button: `{
  "type": "Button",
  "props": {
    "label": "按钮",
    "type": "primary",
    "size": "medium",
    "disabled": false
  }
}`,
    Text: `{
  "type": "Text",
  "props": {
    "content": "文本内容",
    "size": "default",
    "color": "#303133",
    "bold": false
  }
}`,
    Divider: `{
  "type": "Divider",
  "props": {
    "content": "分割线",
    "direction": "horizontal"
  }
}`,
    Table: `{
  "type": "Table",
  "props": {
    "columns": [
      { "label": "名称", "prop": "name" },
      { "label": "值", "prop": "value" }
    ],
    "data": [
      { "name": "项1", "value": "值1" },
      { "name": "项2", "value": "值2" }
    ],
    "pagination": true
  }
}`
  };
  
  return samples[componentType] || '暂无示例';
};
</script>

<style scoped>
.example-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.example-header {
  text-align: center;
  margin-bottom: 40px;
}

.example-header h1 {
  color: #303133;
  font-size: 32px;
  margin-bottom: 10px;
}

.example-header p {
  color: #606266;
  font-size: 16px;
}

.example-nav {
  margin-bottom: 40px;
}

.tab-content {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  border-top: none;
}

.guide-list {
  padding-left: 20px;
}

.guide-list li {
  margin-bottom: 10px;
  line-height: 1.8;
  color: #606266;
}

.component-docs {
  margin-top: 20px;
}

.doc-content {
  padding: 15px;
  background-color: #fafafa;
  border-radius: 4px;
}

.doc-content h4 {
  margin-top: 20px;
  margin-bottom: 10px;
  color: #303133;
}

.doc-content h4:first-child {
  margin-top: 0;
}

.doc-content p {
  margin-bottom: 10px;
  color: #606266;
  line-height: 1.6;
}

.doc-content pre {
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  margin-bottom: 15px;
}

.doc-content code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  color: #303133;
}

.example-showcase {
  margin-bottom: 40px;
}

.example-showcase h2 {
  color: #303133;
  font-size: 24px;
  margin-bottom: 20px;
}

.showcase-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.showcase-item {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.showcase-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card-body {
  padding: 15px;
}

.card-body h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #303133;
  font-size: 18px;
}

.card-body p {
  margin-bottom: 15px;
  color: #606266;
  line-height: 1.6;
  font-size: 14px;
}

.example-footer {
  text-align: center;
  padding: 20px;
  border-top: 1px solid #ebeef5;
  color: #909399;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .example-page {
    padding: 10px;
  }
  
  .example-header h1 {
    font-size: 24px;
  }
  
  .example-header p {
    font-size: 14px;
  }
  
  .showcase-grid {
    grid-template-columns: 1fr;
  }
}
</style>