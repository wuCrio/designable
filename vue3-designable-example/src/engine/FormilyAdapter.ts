import { createForm } from '@formily/core';
import type { Form as FormInstance, FormOptions } from '@formily/core';
import { createSchemaField } from '@formily/vue';
import * as AntdComponents from '@formily/antdv';
import { h } from 'vue';

// Formily组件映射
export const FormilyComponents = {
  // 表单组件
  Form: AntdComponents.Form,
  Input: AntdComponents.Input,
  Select: AntdComponents.Select,
  DatePicker: AntdComponents.DatePicker,
  Checkbox: AntdComponents.Checkbox,
  Radio: AntdComponents.Radio,
  Switch: AntdComponents.Switch,
  Slider: AntdComponents.Slider,
  Rate: AntdComponents.Rate,
  // 布局组件
  Space: AntdComponents.Space,
  Card: AntdComponents.Card,
  Row: AntdComponents.Row,
  Col: AntdComponents.Col,
  // 基础组件
  Button: AntdComponents.Button,
  Text: 'span',
  Divider: AntdComponents.Divider,
  // 数据展示组件
  Table: AntdComponents.Table,
  List: AntdComponents.List,
};

// 创建SchemaField实例
export const createFormilySchemaField = () => {
  return createSchemaField({
    components: FormilyComponents,
  });
};

// 创建表单实例
export const createFormilyForm = (options?: FormOptions) => {
  return createForm({
    ...options,
    initialValues: options?.initialValues || {},
  });
};

// 将组件配置转换为Formily Schema
export const componentToSchema = (component: any) => {
  if (!component) return null;
  
  const schema = {
    type: 'object',
    properties: {
      [component.id]: {
        type: 'void',
        'x-component': component.type,
        'x-component-props': component.props || {},
        ...(component.children && component.children.length > 0 && {
          properties: component.children.reduce((acc: any, child: any) => {
            const childSchema = componentToSchema(child);
            if (childSchema && childSchema.properties) {
              Object.assign(acc, childSchema.properties);
            }
            return acc;
          }, {})
        })
      }
    }
  };
  
  return schema;
};

// Formily渲染器
export const FormilyRenderer = {
  // 将组件树转换为可渲染的Formily组件
  renderComponentTree(componentTree: any, form: FormInstance) {
    const SchemaField = createFormilySchemaField();
    const schema = componentToSchema(componentTree);
    
    return h(SchemaField, {
      schema,
      form,
    });
  },
  
  // 单独渲染一个组件
  renderComponent(component: any) {
    const Component = FormilyComponents[component.type] || 'div';
    
    return h(Component, {
      ...component.props,
    }, component.children?.map((child: any) => this.renderComponent(child)) || []);
  }
};

// 移除重复导出的SchemaField，避免与ComponentRenderer中的声明冲突