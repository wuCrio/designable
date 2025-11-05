// 组件注册中心，管理可用组件和组件行为

import type { ComponentTree } from './DesignerEngine';
import { ExtendedComponents } from './ExtendedComponents';
// 移除错误的FormilyAdapter导入，因为FormilyAdapter.ts中没有这个导出

export interface ComponentMetadata {
  id: string;
  name: string;
  icon: string;
  group: string;
  defaultProps: Record<string, any>;
  propsSchema?: Record<string, any>;
  isContainer?: boolean;
  droppable?: boolean;
}

export interface ComponentBehavior {
  selector: (node: ComponentTree) => boolean;
  designerProps?: Record<string, any>;
  droppable?: boolean;
  resizable?: {
    width?: (node: ComponentTree, element?: HTMLElement) => {
      plus: () => void;
      minus: () => void;
    };
    height?: (node: ComponentTree, element?: HTMLElement) => {
      plus: () => void;
      minus: () => void;
    };
  };
  translatable?: boolean;
}

export class ComponentRegistry {
  private static components: Map<string, ComponentMetadata> = new Map();
  private static behaviors: ComponentBehavior[] = [];
  private static locales: Record<string, Record<string, string>> = {};
  private static currentLanguage: string = 'zh-cn';

  // 注册组件
  static registerComponent(component: ComponentMetadata) {
    this.components.set(component.id, component);
  }

  // 获取所有组件
  static getComponents(): ComponentMetadata[] {
    return Array.from(this.components.values());
  }

  // 获取按组分类的组件
  static getComponentsByGroup(): Record<string, ComponentMetadata[]> {
    const groups: Record<string, ComponentMetadata[]> = {};
    
    this.components.forEach(component => {
      const group = component.group || 'default';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(component);
    });
    
    return groups;
  }

  // 获取单个组件
  static getComponent(id: string): ComponentMetadata | undefined {
    return this.components.get(id);
  }

  // 注册组件行为
  static registerBehavior(behavior: ComponentBehavior) {
    this.behaviors.push(behavior);
  }

  // 获取组件的行为
  static getBehavior(node: ComponentTree): ComponentBehavior | null {
    for (const behavior of this.behaviors) {
      if (behavior.selector(node)) {
        return behavior;
      }
    }
    return null;
  }

  // 注册多语言支持
  static registerLocales(lang: string, translations: Record<string, string>) {
    if (!this.locales[lang]) {
      this.locales[lang] = {};
    }
    this.locales[lang] = { ...this.locales[lang], ...translations };
  }

  // 设置当前语言
  static setLanguage(lang: string) {
    if (Object.keys(this.locales).includes(lang)) {
      this.currentLanguage = lang;
    }
  }

  // 获取当前语言
  static getLanguage(): string {
    return this.currentLanguage;
  }

  // 获取翻译
  static t(key: string): string {
    const translations = this.locales[this.currentLanguage] || {};
    return translations[key] || key;
  }

  // 创建组件实例
  static createComponentInstance(componentId: string): ComponentTree {
    const component = this.getComponent(componentId);
    if (!component) {
      throw new Error(`Component ${componentId} not found`);
    }

    return {
      id: `${componentId.toLowerCase()}_${Date.now()}`,
      type: componentId,
      props: { ...component.defaultProps },
      children: component.isContainer ? [] : undefined
    };
  }

  // 获取Formily组件Schema
  static getComponentSchema(componentId: string): any {
    const component = this.getComponent(componentId);
    if (!component) {
      throw new Error(`Component ${componentId} not found`);
    }

    // 直接返回基于组件信息的简单schema
    return {
      type: 'object',
      properties: component.propsSchema || {}
    };
  }

  // 转换组件树为Formily Schema
  static convertToFormilySchema(componentTree: ComponentTree): any {
    // 简单实现，返回基本的schema结构
    return {
      type: 'object',
      properties: {}
    };
  }

  // 获取Formily表单实例
  static createFormilyForm(initialValues?: Record<string, any>) {
    // 直接返回null，因为FormilyAdapter已移除
    return null;
  }
}

// 初始化扩展组件 - 适配ComponentRegistry的结构
// 注册所有扩展组件
Object.values(ExtendedComponents).forEach(component => {
  // 直接使用组件数据，已经符合ComponentMetadata格式
  const componentData: ComponentMetadata = {
    id: component.id,
    name: component.name,
    icon: component.icon,
    group: component.group,
    defaultProps: component.defaultProps,
    propsSchema: {
      // 从propsConfig构建propsSchema
      ...Object.fromEntries((component.propsConfig || []).map((prop: any) => [
        prop.name,
        {
          type: prop.type,
          label: prop.name,
          default: prop.default,
          ...(prop.options && { enum: prop.options }),
          ...(prop.min !== undefined && { minimum: prop.min }),
          ...(prop.max !== undefined && { maximum: prop.max })
        }
      ]))
    },
    isContainer: ['Form', 'Card', 'Row', 'Col'].includes(component.id),
    droppable: ['Form', 'Card', 'Row', 'Col'].includes(component.id)
  };
  ComponentRegistry.registerComponent(componentData);
});

// 注册组件分类 - 存储分类信息
ComponentRegistry.registerLocales('zh-cn', {
  'components.basic': '基础组件',
  'components.form': '表单组件',
  'components.layout': '布局组件',
  'components.data': '数据展示'
});

ComponentRegistry.registerLocales('en-us', {
  'components.basic': 'Basic Components',
  'components.form': 'Form Components',
  'components.layout': 'Layout Components',
  'components.data': 'Data Display'
});

// 注册所有组件的行为
// Root行为
ComponentRegistry.registerBehavior({
  selector: (node) => node.type === 'Root',
  droppable: true,
  designerProps: {
    displayName: '根容器'
  }
});

// 表单组件行为
ComponentRegistry.registerBehavior({
  selector: (node) => ['Form', 'Input', 'Select', 'Switch'].includes(node.type),
  resizable: {
    width: (node) => ({
      plus: () => {
            if (!node.props) node.props = {};
            if (!node.props.style) node.props.style = {};
            if (node.props.style.width) {
              const width = typeof node.props.style.width === 'string' 
                ? parseInt(node.props.style.width) || 200 
                : 200;
              node.props.style.width = `${width + 10}px`;
            } else {
              node.props.style.width = '210px';
            }
          },
          minus: () => {
            if (!node.props || !node.props.style || !node.props.style.width) return;
            const width = typeof node.props.style.width === 'string' 
              ? parseInt(node.props.style.width) || 200 
              : 200;
            if (width > 100) {
              node.props.style.width = `${width - 10}px`;
            }
          }
    })
  },
  translatable: true
});

// 布局组件行为
ComponentRegistry.registerBehavior({
  selector: (node) => ['Card', 'Row', 'Col'].includes(node.type),
  droppable: true,
  resizable: {
    width: (node) => ({
      plus: () => {
            if (!node.props) node.props = {};
            if (!node.props.style) node.props.style = {};
            if (node.props.style.width) {
              const width = typeof node.props.style.width === 'string' 
                ? parseInt(node.props.style.width) || 200 
                : 200;
              node.props.style.width = `${width + 20}px`;
            } else {
              node.props.style.width = '220px';
            }
          },
          minus: () => {
            if (!node.props || !node.props.style || !node.props.style.width) return;
            const width = typeof node.props.style.width === 'string' 
              ? parseInt(node.props.style.width) || 200 
              : 200;
            if (width > 120) {
              node.props.style.width = `${width - 20}px`;
            }
          }
    }),
    height: (node) => ({
      plus: () => {
            if (!node.props) node.props = {};
            if (!node.props.style) node.props.style = {};
            if (node.props.style.height) {
              const height = typeof node.props.style.height === 'string' 
                ? parseInt(node.props.style.height) || 100 
                : 100;
              node.props.style.height = `${height + 20}px`;
            } else {
              node.props.style.height = '120px';
            }
          },
          minus: () => {
            if (!node.props || !node.props.style || !node.props.style.height) return;
            const height = typeof node.props.style.height === 'string' 
              ? parseInt(node.props.style.height) || 100 
              : 100;
            if (height > 60) {
              node.props.style.height = `${height - 20}px`;
            }
          }
    })
  },
  translatable: true
});

// 基础组件行为
ComponentRegistry.registerBehavior({
  selector: (node) => ['Button', 'Text', 'Divider'].includes(node.type),
  resizable: {
    width: (node) => ({
      plus: () => {
            if (!node.props) node.props = {};
            if (!node.props.style) node.props.style = {};
            if (node.props.style.width) {
              const width = typeof node.props.style.width === 'string' 
                ? parseInt(node.props.style.width) || 80 
                : 80;
              node.props.style.width = `${width + 10}px`;
            } else {
              node.props.style.width = '90px';
            }
          },
          minus: () => {
            if (!node.props || !node.props.style || !node.props.style.width) return;
            const width = typeof node.props.style.width === 'string' 
              ? parseInt(node.props.style.width) || 80 
              : 80;
            if (width > 60) {
              node.props.style.width = `${width - 10}px`;
            }
          }
    })
  },
  translatable: true
});

// 数据组件行为
ComponentRegistry.registerBehavior({
  selector: (node) => ['Table'].includes(node.type),
  droppable: false,
  resizable: {
    width: (node) => ({
      plus: () => {
            if (!node.props) node.props = {};
            if (!node.props.style) node.props.style = {};
            if (node.props.style.width) {
              const width = typeof node.props.style.width === 'string' 
                ? parseInt(node.props.style.width) || 300 
                : 300;
              node.props.style.width = `${width + 30}px`;
            } else {
              node.props.style.width = '330px';
            }
          },
          minus: () => {
            if (!node.props || !node.props.style || !node.props.style.width) return;
            const width = typeof node.props.style.width === 'string' 
              ? parseInt(node.props.style.width) || 300 
              : 300;
            if (width > 200) {
              node.props.style.width = `${width - 30}px`;
            }
          }
    }),
    height: (node) => ({
      plus: () => {
            if (!node.props) node.props = {};
            if (!node.props.style) node.props.style = {};
            if (node.props.style.height) {
              const height = typeof node.props.style.height === 'string' 
                ? parseInt(node.props.style.height) || 200 
                : 200;
              node.props.style.height = `${height + 30}px`;
            } else {
              node.props.style.height = '230px';
            }
          },
          minus: () => {
            if (!node.props || !node.props.style || !node.props.style.height) return;
            const height = typeof node.props.style.height === 'string' 
              ? parseInt(node.props.style.height) || 200 
              : 200;
            if (height > 150) {
              node.props.style.height = `${height - 30}px`;
            }
          }
    })
  },
  translatable: true
});