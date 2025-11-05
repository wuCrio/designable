<template>
  <div
    v-if="isDesignMode"
    class="component-wrapper"
    @click="handleComponentClick"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <!-- 设计模式下的组件渲染 -->
    <div
      v-if="!behavior?.customRender"
      :class="['design-component', { 'selected': isSelected }]"
      :style="component.props?.style || {}"
    >
      <!-- 组件头部信息 -->
      <div class="component-header">
        <span class="component-type">{{ component.type }}</span>
        <span class="component-id">{{ component.id.slice(-6) }}</span>
      </div>
      <!-- 组件内容 -->
      <div class="component-content">
        {{ component.props?.label || component.type }}
      </div>
    </div>
    <!-- 自定义渲染 -->
    <component
      v-else
      :is="behavior.customRender"
      :component="component"
      :designerState="designerState"
    />
    <!-- 子组件渲染 -->
    <component-renderer
      v-for="child in component.children"
      :key="child.id"
      :component="child"
      :is-design-mode="isDesignMode"
      :designer-state="designerState"
    />
  </div>
  <div v-else>
    <!-- 预览模式下的组件渲染 -->
    <template v-if="isFormilyComponent && formilySchema && form">
      <FormProvider :form="form">
        <div v-if="component.type === 'Form'" class="preview-component formily-form">
          <FormilyAntForm layout="vertical">
            <SchemaField :schema="formilySchema" />
            <!-- 递归渲染子组件 -->
            <component-renderer
              v-for="child in component.children"
              :key="child.id"
              :component="child"
              :is-design-mode="false"
            />
          </FormilyAntForm>
        </div>
        <div v-else class="preview-component formily-field">
          <SchemaField :schema="formilySchema" />
        </div>
      </FormProvider>
    </template>
    <div v-else-if="component.type === 'Card'" class="preview-component">
      <a-card
        v-bind="component.props"
        :title="component.props?.title || '卡片标题'"
      >
        {{ component.props?.content || '卡片内容' }}
        <!-- 递归渲染子组件 -->
        <component-renderer
          v-for="child in component.children"
          :key="child.id"
          :component="child"
          :is-design-mode="false"
        />
      </a-card>
    </div>
    <div v-else class="preview-component default">
      {{ component.props?.label || component.type }}
      <!-- 递归渲染子组件 -->
      <component-renderer
        v-for="child in component.children"
        :key="child.id"
        :component="child"
        :is-design-mode="false"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, onMounted, inject } from 'vue';
import { notification } from 'ant-design-vue';
import { ComponentRegistry } from '../engine/ComponentRegistry';
import type { ComponentTree, DesignerState } from '../engine/DesignerEngine';
import { createForm } from '@formily/core';
import { FormProvider } from '@formily/vue';
import { createSchemaField } from '@formily/vue';
import { Input, Select, Switch, Form as FormilyAntForm } from '@formily/antdv';

// 创建SchemaField
const SchemaField = createSchemaField({
  components: {
    Input,
    Select,
    Switch,
    FormItem: FormilyAntForm.Item
  }
});

export default defineComponent({
  name: 'ComponentRenderer',
  components: {
    SchemaField
  },
  props: {
    component: {
      type: Object as PropType<ComponentTree>,
      required: true
    },
    isDesignMode: {
      type: Boolean,
      default: false
    },
    designerState: {
      type: Object as PropType<DesignerState>,
      default: null
    }
  },
  setup(props) {
    
    // 从父组件注入Formily表单实例
    const form = inject('formilyForm', null);
    
    onMounted(() => {
      // 设计模式下的初始化逻辑
      if (props.isDesignMode && props.designerState) {
        console.log('ComponentRenderer挂载，组件类型:', props.component.type, '组件ID:', props.component.id);
        console.log('组件是否可放置:', behavior.value?.droppable);
      }
    });
    
    // 是否为Formily组件
    const isFormilyComponent = computed(() => {
      return ['Form', 'Input', 'Select', 'Switch'].includes(props.component.type);
    });
    
    // 生成Formily Schema
    const formilySchema = computed(() => {
      try {
        return ComponentRegistry.getComponentSchema(props.component.type);
      } catch (error) {
        console.error('生成Formily Schema失败:', error);
        return null;
      }
    });
    // 计算组件行为
    const behavior = computed(() => {
      return ComponentRegistry.getBehavior(props.component);
    });

    // 检查组件是否被选中
    const isSelected = computed(() => {
      return props.designerState?.selectedComponentId === props.component.id;
    });

    // 处理组件点击
    const handleComponentClick = (event: MouseEvent) => {
      if (props.isDesignMode && props.designerState) {
        event.stopPropagation();
        props.designerState.selectComponent(props.component.id);
      }
    };

    // 处理拖拽经过
      const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('handleDragOver triggered', { componentType: props.component.type, componentId: props.component.id });
    
    if (!props.isDesignMode || !props.designerState) {
      console.log('Drop not allowed: isDesignMode or designerState missing');
      return;
    }
    
    console.log('拖拽经过组件:', props.component.type, '是否可放置:', behavior.value?.droppable);
    console.log('DataTransfer types available:', event.dataTransfer?.types);
    
    // 只有在设计模式下且组件为Root类型时才允许放置
    const isDropAllowed = props.isDesignMode && (behavior.value?.droppable || props.component.type === 'Root');
    console.log('Is drop allowed:', isDropAllowed);
    
    if (isDropAllowed) {
      event.dataTransfer!.dropEffect = 'copy';
      // 添加拖拽经过样式
      if (event.currentTarget) {
        (event.currentTarget as HTMLElement).classList.add('drag-over');
        console.log('Added drag-over class to element');
      }
    }
  };

    // 处理拖拽离开
      const handleDragLeave = (event: DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        
        if (!props.isDesignMode || !props.designerState) return;
        
        console.log('拖拽离开组件:', props.component.type);
        
        // 移除拖拽经过样式
        if (event.currentTarget) {
          (event.currentTarget as HTMLElement).classList.remove('drag-over');
        }
      };

    // 处理放置
      const handleDrop = (event: DragEvent) => {
    console.log('handleDrop triggered!', { componentType: props.component.type, componentId: props.component.id });
    
    // 阻止默认行为
    event.preventDefault();
    event.stopPropagation();
    
    // 移除拖拽经过样式
    if (event.currentTarget) {
      (event.currentTarget as HTMLElement).classList.remove('drag-over');
      console.log('Removed drag-over class from element');
    }
    
    if (!props.isDesignMode || !props.designerState) {
      console.log('ComponentRenderer: 不在设计模式或缺少designerState');
      return;
    }
    
    // 检查组件是否可放置（包含Root组件）
    const isDroppable = behavior.value?.droppable || props.component.type === 'Root';
    console.log('Is droppable:', isDroppable, 'Component type:', props.component.type);
    
    if (!isDroppable) {
      console.log('ComponentRenderer: 组件不可放置，组件类型:', props.component.type);
      return;
    }
    
    try {
      // 打印所有可用的数据类型
      console.log('Available dataTransfer types:', event.dataTransfer?.types);
      
      // 尝试获取application/json格式的数据
      const dragDataJson = event.dataTransfer?.getData('application/json');
      console.log('ComponentRenderer: 拖拽数据JSON:', dragDataJson);
      
      // 同时尝试获取text/plain格式作为备选
      const plainData = event.dataTransfer?.getData('text/plain');
      console.log('ComponentRenderer: 拖拽数据纯文本:', plainData);
      
      let dragData = null;
      let dataSource = 'none';
      
      // 优先解析JSON数据
      if (dragDataJson) {
        dragData = JSON.parse(dragDataJson);
        dataSource = 'json';
        console.log('ComponentRenderer: 解析后的JSON拖拽数据:', dragData);
      }
      // 如果JSON解析失败或没有JSON数据，尝试解析纯文本数据
      else if (plainData) {
        try {
          dragData = JSON.parse(plainData);
          dataSource = 'plain_text_as_json';
          console.log('ComponentRenderer: 解析纯文本为JSON:', dragData);
        } catch (e) {
          console.log('ComponentRenderer: 纯文本不是JSON格式:', plainData);
        }
      }
      
      console.log('ComponentRenderer: 最终拖拽数据来源:', dataSource);
      
      // 确保拖拽数据包含必要的信息
      if (!dragData || !dragData.id) {
        console.error('ComponentRenderer: 拖拽数据缺少必要的ID字段');
        notification.error({
          message: '错误',
          description: '拖拽数据格式不正确'
        });
        return;
      }
      
      // 尝试从组件注册表创建组件
      try {
        console.log('ComponentRenderer: 尝试从组件注册表创建组件，ID:', dragData.id);
        console.log('ComponentRegistry createComponentInstance method exists:', !!ComponentRegistry.createComponentInstance);
        
        const componentToAdd = ComponentRegistry.createComponentInstance(dragData.id);
        
        // 检查组件是否成功创建
        if (!componentToAdd) {
          console.error('ComponentRenderer: 组件创建失败');
          notification.error({
            message: '错误',
            description: `无法创建组件: ${dragData.id}`
          });
          return;
        }
        
        console.log('ComponentRenderer: 创建的组件实例:', componentToAdd);
        
        // 移除id字段，因为DesignerEngine的addComponent方法会自动生成id
        const { id, ...componentWithoutId } = componentToAdd;
        console.log('ComponentRenderer: 移除id后的组件数据:', componentWithoutId);
        
        // 调用addComponent方法，传递不包含id的组件数据
        console.log('ComponentRenderer: 调用addComponent，父组件ID:', props.component.id);
        console.log('DesignerState addComponent method exists:', !!props.designerState.addComponent);
        
        const result = props.designerState.addComponent(props.component.id, componentWithoutId);
        
        console.log('ComponentRenderer: addComponent结果:', result);
        
        if (result) {
          notification.success({
            message: '成功',
            description: `已添加${componentToAdd.type}`
          });
          
          // 如果是Formily组件，通知Formily表单更新
          if (form && ['Form', 'Input', 'Select', 'Switch'].includes(dragData.id)) {
            console.log('Formily组件添加成功，通知表单更新');
            // 这里可以添加Formily表单更新逻辑
          }
        } else {
          notification.error({
            message: '错误',
            description: '添加组件失败'
          });
        }
      } catch (createError) {
        console.error('ComponentRenderer: 创建组件实例失败:', createError);
        notification.error({
          message: '错误',
          description: `创建组件失败: ${(createError as Error).message}`
        });
      }
    } catch (parseError) {
      console.error('ComponentRenderer: 解析拖拽数据失败:', parseError);
      notification.error({
        message: '错误',
        description: '解析拖拽数据失败'
      });
    }
  };

    return {
      behavior,
      isSelected,
      isFormilyComponent,
      formilySchema,
      form,
      FormProvider,
      handleComponentClick,
      handleDragOver,
      handleDragLeave,
      handleDrop
    };
  }
});
</script>

<style scoped>
.component-wrapper {
  position: relative;
  min-height: 20px;
}

.component-wrapper.drag-over {
  background-color: rgba(24, 144, 255, 0.1);
  border: 2px dashed #1890ff;
  border-radius: 4px;
}

.design-component {
  position: relative;
  padding: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  margin: 4px 0;
  cursor: pointer;
  transition: all 0.3s;
}

.design-component:hover {
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.design-component.selected {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.component-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.component-type {
  font-weight: 500;
}

.component-id {
  font-family: monospace;
  background-color: #f5f5f5;
  padding: 2px 4px;
  border-radius: 2px;
}

.component-content {
  color: #333;
}

.preview-component {
  margin: 8px 0;
  padding: 8px;
}

.preview-component.default {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  padding: 16px;
  background-color: #fafafa;
}
</style>