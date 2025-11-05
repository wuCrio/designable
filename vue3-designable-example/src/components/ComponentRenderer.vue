<script setup lang="ts">
import { computed, inject } from 'vue';
import type { ComponentTree } from '../engine/DesignerEngine';
import { ComponentRegistry } from '../engine/ComponentRegistry';
import { ElMessage } from 'element-plus';

const props = defineProps<{
  component: ComponentTree;
  isDesignMode?: boolean;
}>();

// 获取设计器状态
const designerState = inject<any>('designerState');

// 计算是否选中
const isSelected = computed(() => {
  return props.isDesignMode && designerState?.selectedComponentId === props.component.id;
});

// 计算组件行为
const behavior = computed(() => {
  return ComponentRegistry.getBehavior(props.component);
});

// 处理组件点击
const handleClick = (event: MouseEvent) => {
  event.stopPropagation();
  if (props.isDesignMode && designerState) {
    designerState.selectComponent(props.component.id);
  }
};

// 处理拖拽进入
const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  if (props.isDesignMode && behavior.value?.droppable) {
    event.dataTransfer!.dropEffect = 'move';
  }
};

// 处理放置
const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  if (!props.isDesignMode || !designerState) return;
  
  const componentId = event.dataTransfer?.getData('application/json');
  if (componentId && behavior.value?.droppable) {
    try {
      const component = ComponentRegistry.createComponentInstance(componentId);
      designerState.addComponent(props.component.id, component);
      ElMessage.success(`已添加${component.type}`);
    } catch (error) {
      ElMessage.error('添加组件失败');
    }
  }
};

// 计算类名
const classes = computed(() => ({
  'design-component': props.isDesignMode,
  'selected': isSelected.value,
  'container-component': props.component.children && props.component.children.length > 0,
  'droppable': props.isDesignMode && behavior.value?.droppable
}));

// 获取组件元数据
const componentMeta = computed(() => {
  return ComponentRegistry.getComponent(props.component.type);
});
</script>

<template>
  <div
    :class="classes"
    @click="handleClick"
    @dragover="handleDragOver"
    @drop="handleDrop"
    :style="component.props?.style || {}"
  >
    <template v-if="isDesignMode">
      <div class="component-overlay">
        <div class="component-type">{{ component.type }}</div>
      </div>
    </template>
    
    <!-- 组件内容渲染 -->
    <template v-if="!componentMeta">
      <div>未知组件: {{ component.type }}</div>
    </template>
    
    <!-- Input组件 -->
    <template v-else-if="component.type === 'Input'">
      <div class="input-wrapper">
        <label v-if="component.props?.title">{{ component.props.title }}</label>
        <el-input 
          v-bind="component.props || {}"
          :placeholder="component.props?.placeholder || '请输入内容'"
        />
      </div>
    </template>
    
    <!-- Card组件 -->
    <template v-else-if="component.type === 'Card'">
      <div class="card-wrapper" :style="component.props?.style">
        <div v-if="component.props?.title" class="card-header">{{ component.props.title }}</div>
        <div class="card-body">
          <template v-if="component.children && component.children.length > 0">
            <div class="card-children">
              <component-renderer
                v-for="child in component.children"
                :key="child.id"
                :component="child"
                :is-design-mode="isDesignMode"
              />
            </div>
          </template>
          <template v-else>
            <div class="empty-placeholder">
              {{ isDesignMode ? '拖拽组件到此处' : '暂无内容' }}
            </div>
          </template>
        </div>
      </div>
    </template>
    
    <!-- 其他组件 -->
    <template v-else>
      <div>{{ componentMeta.name }}</div>
    </template>
  </div>
</template>

<script lang="ts">
// 使用script setup不需要defineComponent
</script>

<style scoped>
.design-component {
  position: relative;
  cursor: pointer;
  margin: 10px 0;
  transition: all 0.3s ease;
}

.design-component:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.design-component.selected {
  outline: 2px solid #409eff;
  border-radius: 4px;
}

.design-component.droppable {
  min-height: 50px;
}

.design-component.droppable:hover {
  background-color: rgba(64, 158, 255, 0.05);
}

.component-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background-color: rgba(64, 158, 255, 0.1);
  border-bottom: 1px solid #409eff;
  padding: 2px 8px;
  font-size: 12px;
  color: #409eff;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 输入框样式 */
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 10px;
}

.input-wrapper label {
  font-weight: 500;
  color: #606266;
}

/* 卡片样式 */
.card-wrapper {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  min-height: 100px;
}

.card-header {
  padding: 15px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  font-weight: 500;
  color: #303133;
}

.card-body {
  padding: 15px;
  min-height: 50px;
}

.card-children {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.empty-placeholder {
  color: #909399;
  text-align: center;
  padding: 20px;
  font-size: 14px;
}
</style>