<script setup lang="ts">
import { computed, inject } from 'vue';
import { ComponentRegistry } from '../engine/ComponentRegistry';
import { ElIcon } from 'element-plus';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

// 获取设计器状态
// 仅注入以支持组件库功能，当前未直接使用
inject<any>('designerState');

// 获取按组分类的组件
const componentsByGroup = computed(() => {
  return ComponentRegistry.getComponentsByGroup();
});

// 处理拖拽开始
const handleDragStart = (event: DragEvent, componentId: string) => {
  event.dataTransfer!.setData('application/json', componentId);
  // 设置拖拽图像
  if (event.target) {
    const img = new Image();
    img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="40" viewBox="0 0 80 40" fill="none"%3E%3Crect width="80" height="40" rx="4" fill="%23f0f0f0" stroke="%23409eff" stroke-width="2"/%3E%3Ctext x="40" y="25" font-family="Arial" font-size="14" fill="%23606266" text-anchor="middle" dominant-baseline="middle"%3E组件%3C/text%3E%3C/svg%3E';
    event.dataTransfer!.setDragImage(img, 40, 20);
  }
};

// 引入Element Plus图标组件
// 全局注册图标，不需要defineComponent
</script>

<template>
  <div class="component-library">
    <div class="library-header">
      <h3>组件库</h3>
    </div>
    
    <div class="library-content">
      <div 
        v-for="(components, group) in componentsByGroup" 
        :key="group" 
        class="component-group"
      >
        <div class="group-header">
          <h4>{{ ComponentRegistry.t(`components.${group}`) || group }}</h4>
        </div>
        
        <div class="component-list">
          <div 
            v-for="component in components" 
            :key="component.id"
            class="component-item"
            draggable
            @dragstart="handleDragStart($event, component.id)"
          >
            <div class="component-icon">
              <ElIcon>
                <component :is="ElementPlusIconsVue[component.icon as keyof typeof ElementPlusIconsVue] || ElementPlusIconsVue.Box" />
              </ElIcon>
            </div>
            <div class="component-name">{{ component.name }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.component-library {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-right: 1px solid #e0e0e0;
}

.library-header {
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
  background: #f5f7fa;
}

.library-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.library-content {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
}

.component-group {
  margin-bottom: 25px;
}

.group-header {
  margin-bottom: 15px;
}

.group-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.component-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.component-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px 10px;
  background: #f5f7fa;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  cursor: move;
  transition: all 0.3s ease;
}

.component-item:hover {
  background: #ecf5ff;
  border-color: #c6e2ff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.component-icon {
  font-size: 24px;
  color: #409eff;
  margin-bottom: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.component-name {
  font-size: 12px;
  color: #606266;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .component-list {
    grid-template-columns: 1fr;
  }
}

/* 滚动条样式 */
.library-content::-webkit-scrollbar {
  width: 6px;
}

.library-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.library-content::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.library-content::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>