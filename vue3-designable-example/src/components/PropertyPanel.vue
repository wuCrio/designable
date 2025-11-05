<script setup lang="ts">
import { computed, inject, watch } from 'vue';
import { ComponentRegistry } from '../engine/ComponentRegistry';
import { FormProvider } from '@formily/vue';
import { createForm } from '@formily/core';

// 获取设计器状态
const designerState = inject<any>('designerState');

// 计算选中的组件
const selectedComponent = computed(() => {
  if (!designerState || !designerState.selectedComponentId) return null;
  return designerState.getComponentById(designerState.selectedComponentId);
});

// 计算组件的元数据
const componentMeta = computed(() => {
  if (!selectedComponent.value) return null;
  return ComponentRegistry.getComponent(selectedComponent.value.type);
});

// 计算属性架构
const propsSchema = computed(() => {
  if (!componentMeta.value) return {};
  return componentMeta.value.propsSchema || {};
});

// 设置嵌套属性值的辅助函数
const setNestedProperty = (obj: any, path: string, value: any) => {
  const paths = path.split('.');
  let current: any = obj !== null && obj !== undefined ? obj : {};
  
  for (let i = 0; i < paths.length - 1; i++) {
    const p = paths[i];
    if (typeof p !== 'string' || p.trim() === '') continue;
    if (current === null || current === undefined || typeof current !== 'object') {
      current = {};
    }
    if (!(p in current) || current[p] === null || current[p] === undefined) {
      current[p] = {};
    }
    current = current[p] !== null && current[p] !== undefined ? current[p] : {};
  }
  
  const lastPath = paths[paths.length - 1];
  if (current && typeof current === 'object' && lastPath !== undefined && typeof lastPath === 'string') {
    current[lastPath] = value;
  }
};

// 处理属性变更
const handlePropChange = (propPath: string, value: any) => {
  if (!designerState || !selectedComponent.value) return;
  
  const props = { ...(selectedComponent.value.props || {}) };
  setNestedProperty(props, propPath, value);
  
  designerState.updateComponent(selectedComponent.value.id, { props });
  
  // 通知Formily表单更新
  if (isFormilyComponent.value) {
    console.log('Formily组件属性更新:', selectedComponent.value.type, props);
  }
};

// 判断是否是Formily组件
const isFormilyComponent = computed(() => {
  if (!selectedComponent.value) return false;
  const formilyTypes = ['Form', 'Input', 'Select', 'Switch'];
  return formilyTypes.includes(selectedComponent.value.type);
});

// 获取属性值
const getPropValue = (propPath: string): any => {
  if (!selectedComponent.value?.props) return undefined;
  
  const paths = propPath.split('.');
  let current: any = selectedComponent.value.props;
  
  for (const path of paths) {
    if (current === undefined || current === null) return undefined;
    current = current[path];
  }
  
  return current;
};

// 删除组件
const handleDeleteComponent = () => {
  if (!designerState || !selectedComponent.value) return;
  designerState.removeComponent(selectedComponent.value.id);
};
</script>

<template>
  <div class="property-panel">
    <div class="panel-header">
      <h3>{{ ComponentRegistry.t('panel.title') }}</h3>
      <div class="panel-actions">
        <a-button type="link" size="small" @click="handleDeleteComponent">删除组件</a-button>
      </div>
    </div>
    
    <div v-if="!selectedComponent" class="empty-state">
      <p>请选择一个组件进行编辑</p>
    </div>
    
    <div v-else class="property-content">
      <div class="component-info">
        <p class="component-type">{{ selectedComponent.type }}</p>
        <p class="component-id">{{ selectedComponent.id }}</p>
      </div>
      
      <a-form label-position="top" size="small">
        <!-- 渲染基础属性 -->
        <div class="property-section">
          <h4>基础属性</h4>
          <a-form-item label="组件ID">
            <a-input v-model:value="selectedComponent.id" disabled />
          </a-form-item>
          <a-form-item label="组件类型">
            <a-input v-model:value="selectedComponent.type" disabled />
          </a-form-item>
        </div>
        
        <!-- 渲染自定义属性 -->
        <div class="property-section" v-if="Object.keys(propsSchema).length > 0">
          <h4>自定义属性</h4>
          <template v-for="(schema, propKey) in propsSchema" :key="propKey">
            <div v-if="schema.type === 'object'" class="object-group">
              <h4 class="object-group-title">{{ schema.label || propKey }}</h4>
              <template v-for="(subSchema, subKey) in schema.properties" :key="subKey">
                <a-form-item :label="subSchema.label || subKey">
                  <a-input
                    :value="getPropValue(`${propKey}.${subKey}`)"
                    @input="(val: string) => handlePropChange(`${propKey}.${subKey}`, val)"
                    :placeholder="`请输入${subSchema.label || subKey}`"
                  />
                </a-form-item>
              </template>
            </div>
            <a-form-item v-else :label="schema.label || propKey">
              <a-input
                v-if="schema.type === 'string' && schema.format !== 'color'"
                :value="getPropValue(String(propKey))"
                @input="(val: string) => handlePropChange(String(propKey), val)"
                :placeholder="`请输入${schema.label || propKey}`"
              />
              <a-color-picker
                v-else-if="schema.type === 'string' && schema.format === 'color'"
                :value="getPropValue(String(propKey))"
                :show-alpha="true"
                @change="(val: string) => handlePropChange(String(propKey), val)"
              />
              <a-input-number
                v-else-if="schema.type === 'number'"
                :value="getPropValue(String(propKey))"
                @change="(val: string | number) => handlePropChange(String(propKey), val)"
                :min="schema.min"
                :max="schema.max"
                :step="schema.step || 1"
              />
              <a-switch
                v-else-if="schema.type === 'boolean'"
                :checked="getPropValue(String(propKey))"
                @change="(val: boolean) => handlePropChange(String(propKey), val)"
              />
              <a-select
                v-else-if="schema.type === 'select'"
                :value="getPropValue(String(propKey))"
                @change="(val: string) => handlePropChange(String(propKey), val)"
                :placeholder="`请选择${schema.label || propKey}`"
              >
                <a-select-option
                  v-for="option in schema.options"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </a-select>
              <a-input
                v-else
                :value="getPropValue(String(propKey))"
                @input="(val: string) => handlePropChange(String(propKey), val)"
                :placeholder="`请输入${schema.label || propKey}`"
              />
            </a-form-item>
          </template>
        </div>
        
        <!-- 渲染样式属性 -->
        <div class="property-section">
          <h4>样式属性</h4>
          <a-form-item label="宽度">
            <a-input 
              :value="selectedComponent.props?.style?.width || ''"
              @input="(val: string) => handlePropChange('style.width', val)"
              placeholder="例如: 200px"
            />
          </a-form-item>
          <a-form-item label="高度">
            <a-input 
              :value="selectedComponent.props?.style?.height || ''"
              @input="(val: string) => handlePropChange('style.height', val)"
              placeholder="例如: 100px"
            />
          </a-form-item>
          <a-form-item label="背景色">
            <a-color-picker 
              :value="selectedComponent.props?.style?.background || ''"
              :show-alpha="true"
              @change="(val: string) => handlePropChange('style.background', val)"
            />
          </a-form-item>
        </div>
      </a-form>
    </div>
  </div>
</template>

<style scoped>
.property-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-left: 1px solid #e0e0e0;
}

.panel-header {
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
  background: #f5f7fa;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.property-content {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.component-info {
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 20px;
}

.component-type {
  font-weight: 500;
  margin: 0 0 5px 0;
  color: #303133;
}

.component-id {
  font-size: 12px;
  margin: 0;
  color: #909399;
}

.property-section {
  margin-bottom: 25px;
}

.property-section h4 {
  margin: 0 0 15px 0;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.object-group {
  margin-bottom: 20px;
  padding: 15px;
  background: #fafafa;
  border-radius: 4px;
}

.object-group-title {
  margin: 0 0 15px 0;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

/* 滚动条样式 */
.property-content::-webkit-scrollbar {
  width: 6px;
}

.property-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.property-content::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.property-content::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>