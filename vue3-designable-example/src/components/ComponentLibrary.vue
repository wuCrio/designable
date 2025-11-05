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
          <h4>{{ group }}</h4>
        </div>
        
        <div class="component-list">
          <div 
            v-for="component in components" 
            :key="component.id"
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, component)"
            @dragend="handleDragEnd"
          >
            <div class="component-icon">
              <i :class="['anticon', `anticon-${component.icon || 'appstore'}`]"></i>
            </div>
            <div class="component-name">{{ component.name }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ComponentRegistry } from '../engine/ComponentRegistry';

// 获取按组分类的组件
const componentsByGroup = computed(() => {
  return ComponentRegistry.getComponentsByGroup();
});

// 处理拖拽开始
const handleDragStart = (event: DragEvent, component: any) => {
  try {
    // 创建组件数据对象
    const componentData = {
      id: component.id,
      name: component.name,
      group: component.group,
      type: 'component' // 明确标识这是组件拖拽数据
    };
    
    // 序列化为JSON字符串
    const jsonString = JSON.stringify(componentData);
    console.log('ComponentLibrary: 设置拖拽数据:', componentData);
    
    // 同时设置两种格式的数据，确保兼容性
    // 1. 优先使用application/json格式
    event.dataTransfer!.setData('application/json', jsonString);
    // 2. 同时设置text/plain格式作为备选
    event.dataTransfer!.setData('text/plain', jsonString);
    
    // 设置拖拽效果
    event.dataTransfer!.effectAllowed = 'copy';
    
    // 添加拖拽时的视觉提示
    if (event.target) {
      (event.target as HTMLElement).style.opacity = '0.5';
    }
  } catch (error) {
    console.error('拖拽开始错误:', error);
  }
};

// 处理拖拽结束
const handleDragEnd = (event: DragEvent) => {
  try {
    // 恢复元素样式
    if (event.target) {
      (event.target as HTMLElement).style.opacity = '1';
    }
  } catch (error) {
    console.error('拖拽结束错误:', error);
  }
};
</script>

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