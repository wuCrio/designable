// 移除未使用的导入

// 扩展组件元数据定义
export const ExtendedComponents: Record<string, any> = {
  // 表单组件
  Form: {
    id: 'Form',
    name: '表单',
    icon: 'DocumentCopy',
    group: 'form',
    defaultProps: {
      labelPosition: 'right',
      labelWidth: 80,
      style: {
        width: '100%',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
      }
    },
    propsConfig: [
      { name: 'labelPosition', type: 'select', options: ['left', 'right', 'top'], default: 'right' },
      { name: 'labelWidth', type: 'number', default: 80 },
      { name: 'disabled', type: 'boolean', default: false }
    ]
  },
  
  Input: {
    id: 'Input',
    name: '输入框',
    icon: 'Edit',
    group: 'form',
    defaultProps: {
      placeholder: '',
      value: '',
      disabled: false,
      clearable: true,
      style: {
        width: '100%'
      }
    },
    propsConfig: [
      { name: 'placeholder', type: 'string', default: '' },
      { name: 'value', type: 'string', default: '' },
      { name: 'disabled', type: 'boolean', default: false },
      { name: 'clearable', type: 'boolean', default: true },
      { name: 'size', type: 'select', options: ['large', 'default', 'small'], default: 'default' }
    ]
  },
  
  Select: {
    id: 'Select',
    name: '选择器',
    icon: 'Select',
    group: 'form',
    defaultProps: {
      placeholder: '请选择',
      value: '',
      options: [
        { label: '选项1', value: '1' },
        { label: '选项2', value: '2' },
        { label: '选项3', value: '3' }
      ],
      disabled: false,
      style: {
        width: '100%'
      }
    },
    propsConfig: [
      { name: 'placeholder', type: 'string', default: '请选择' },
      { name: 'value', type: 'string', default: '' },
      { name: 'options', type: 'json', default: [{ label: '选项1', value: '1' }] },
      { name: 'disabled', type: 'boolean', default: false },
      { name: 'multiple', type: 'boolean', default: false },
      { name: 'size', type: 'select', options: ['large', 'default', 'small'], default: 'default' }
    ]
  },
  
  Switch: {
    id: 'Switch',
    name: '开关',
    icon: 'Switch',
    group: 'form',
    defaultProps: {
      value: false,
      disabled: false,
      activeText: '',
      inactiveText: ''
    },
    propsConfig: [
      { name: 'value', type: 'boolean', default: false },
      { name: 'disabled', type: 'boolean', default: false },
      { name: 'activeText', type: 'string', default: '' },
      { name: 'inactiveText', type: 'string', default: '' },
      { name: 'activeColor', type: 'color', default: '#409eff' },
      { name: 'inactiveColor', type: 'color', default: '#dcdfe6' }
    ]
  },
  
  // 布局组件
  Card: {
    id: 'Card',
    name: '卡片',
    icon: 'Box',
    group: 'layout',
    defaultProps: {
      title: '卡片标题',
      bordered: true,
      shadow: 'hover',
      style: {
        width: '100%',
        marginBottom: '20px'
      }
    },
    propsConfig: [
      { name: 'title', type: 'string', default: '卡片标题' },
      { name: 'bordered', type: 'boolean', default: true },
      { name: 'shadow', type: 'select', options: ['always', 'hover', 'never'], default: 'hover' },
      { name: 'bodyStyle', type: 'json', default: {} }
    ]
  },
  
  Row: {
    id: 'Row',
    name: '行',
    icon: 'Grid',
    group: 'layout',
    defaultProps: {
      gutter: 16,
      justify: 'start',
      align: 'top',
      style: {
        width: '100%',
        marginBottom: '16px'
      }
    },
    propsConfig: [
      { name: 'gutter', type: 'number', default: 16 },
      { name: 'justify', type: 'select', options: ['start', 'end', 'center', 'space-around', 'space-between'], default: 'start' },
      { name: 'align', type: 'select', options: ['top', 'middle', 'bottom'], default: 'top' }
    ]
  },
  
  Col: {
    id: 'Col',
    name: '列',
    icon: 'Grid',
    group: 'layout',
    defaultProps: {
      span: 12,
      offset: 0,
      push: 0,
      pull: 0,
      style: {}
    },
    propsConfig: [
      { name: 'span', type: 'number', default: 12, min: 1, max: 24 },
      { name: 'offset', type: 'number', default: 0, min: 0, max: 24 },
      { name: 'push', type: 'number', default: 0, min: 0, max: 24 },
      { name: 'pull', type: 'number', default: 0, min: 0, max: 24 }
    ]
  },
  
  // 展示组件
  Button: {
    id: 'Button',
    name: '按钮',
    icon: 'Operation',
    group: 'basic',
    defaultProps: {
      type: 'primary',
      label: '按钮',
      size: 'default',
      disabled: false,
      round: false,
      plain: false,
      icon: '',
      style: {}
    },
    propsConfig: [
      { name: 'label', type: 'string', default: '按钮' },
      { name: 'type', type: 'select', options: ['primary', 'success', 'warning', 'danger', 'info', 'text', 'default'], default: 'primary' },
      { name: 'size', type: 'select', options: ['large', 'default', 'small', 'mini'], default: 'default' },
      { name: 'disabled', type: 'boolean', default: false },
      { name: 'round', type: 'boolean', default: false },
      { name: 'plain', type: 'boolean', default: false },
      { name: 'icon', type: 'string', default: '' }
    ]
  },
  
  Text: {
    id: 'Text',
    name: '文本',
    icon: 'Font',
    group: 'basic',
    defaultProps: {
      text: '文本内容',
      type: 'default',
      size: 'default',
      strong: false,
      italic: false,
      style: {}
    },
    propsConfig: [
      { name: 'text', type: 'string', default: '文本内容' },
      { name: 'type', type: 'select', options: ['default', 'primary', 'success', 'warning', 'danger'], default: 'default' },
      { name: 'size', type: 'select', options: ['large', 'default', 'small', 'mini'], default: 'default' },
      { name: 'strong', type: 'boolean', default: false },
      { name: 'italic', type: 'boolean', default: false }
    ]
  },
  
  Divider: {
    id: 'Divider',
    name: '分割线',
    icon: 'Scissor',
    group: 'basic',
    defaultProps: {
      content: '',
      direction: 'horizontal',
      contentPosition: 'center',
      style: {}
    },
    propsConfig: [
      { name: 'content', type: 'string', default: '' },
      { name: 'direction', type: 'select', options: ['horizontal', 'vertical'], default: 'horizontal' },
      { name: 'contentPosition', type: 'select', options: ['left', 'center', 'right'], default: 'center' }
    ]
  },
  
  // 数据展示组件
  Table: {
    id: 'Table',
    name: '表格',
    icon: 'Grid',
    group: 'data',
    defaultProps: {
      columns: [
        { prop: 'name', label: '姓名' },
        { prop: 'age', label: '年龄' },
        { prop: 'address', label: '地址' }
      ],
      data: [
        { name: '张三', age: 18, address: '北京市海淀区' },
        { name: '李四', age: 20, address: '上海市浦东新区' },
        { name: '王五', age: 22, address: '广州市天河区' }
      ],
      border: false,
      style: {
        width: '100%',
        marginBottom: '20px'
      }
    },
    propsConfig: [
      { name: 'columns', type: 'json', default: [{ prop: 'name', label: '姓名' }] },
      { name: 'data', type: 'json', default: [{ name: '张三' }] },
      { name: 'border', type: 'boolean', default: false },
      { name: 'stripe', type: 'boolean', default: false },
      { name: 'highlightCurrentRow', type: 'boolean', default: false }
    ]
  }
};

// 组件分类
export const ComponentCategories = {
  basic: {
    name: '基础组件',
    icon: 'List',
    components: ['Button', 'Text', 'Divider']
  },
  form: {
    name: '表单组件',
    icon: 'Form',
    components: ['Form', 'Input', 'Select', 'Switch']
  },
  layout: {
    name: '布局组件',
    icon: 'Grid',
    components: ['Card', 'Row', 'Col']
  },
  data: {
    name: '数据展示',
    icon: 'DataAnalysis',
    components: ['Table']
  }
};