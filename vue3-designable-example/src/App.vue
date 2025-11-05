<script setup lang="ts">
import './assets/designer-styles.css';
import { reactive, provide, ref, onMounted } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { DesignerEngine } from './engine/DesignerEngine';
import { ComponentRegistry } from './engine/ComponentRegistry';
import type { ComponentTree } from './engine/DesignerEngine';
import ComponentRenderer from './components/ComponentRenderer.vue';
import PropertyPanel from './components/PropertyPanel.vue';
import ComponentLibrary from './components/ComponentLibrary.vue';
import ExamplePage from './views/ExamplePage.vue';
// Formily相关导入
import { createForm } from '@formily/core';
import { FormProvider } from '@formily/vue';

// 设计器引擎实例
const engine = new DesignerEngine();

// 创建全局Formily表单实例
const formilyForm = createForm({
  initialValues: {},
  onSubmit: (values) => {
    console.log('表单提交:', values);
    message.success('表单提交成功');
  }
});

// 设计器状态
  const baseDesignerState = reactive<any>({
    // 组件树 - 与DesignerEngine保持一致的数组结构
    componentTree: ref<ComponentTree[]>([
      {
        id: 'root',
        type: 'Root',
        props: {},
        children: []
      }
    ]),
    // 选中的组件ID
    selectedComponentId: ref<string | null>(null),
    // 历史记录状态
    history: {
      canUndo: false,
      canRedo: false
    },
    activeView: 'designer', // 使用any类型避免类型错误
    previousView: 'designer' // 保存上一个视图
  });
  
  // 创建包含方法的扩展设计器状态
  const designerState = reactive<any>({
    ...baseDesignerState,
    // 选择组件
    selectComponent: (componentId: string) => {
      baseDesignerState.selectedComponentId.value = componentId;
    },
    // 获取组件
    getComponentById: (_id: string) => {
      return engine.getSelectedComponent();
    },
    // 添加组件
    addComponent: (parentId: string, component: ComponentTree) => {
      try {
        const componentData = { ...component, type: component.type };
        const newId = engine.addComponent(parentId, componentData);
        if (newId) {
          const state = engine.getState();
          baseDesignerState.componentTree.value = state.componentTree;
          updateHistoryState();
          message.success('组件添加成功');
          
          if (['Form', 'Input', 'Select', 'Switch'].includes(component.type)) {
            console.log('Formily组件添加:', component.type, componentData);
            const formilySchema = ComponentRegistry.convertToFormilySchema(baseDesignerState.componentTree.value);
            console.log('Formily Schema:', formilySchema);
          }
          
          return true;
        }
        updateHistoryState();
        return false;
      } catch (error) {
        console.error('组件添加失败:', error);
        message.error('组件添加失败');
        return false;
      }
    },
    // 更新组件
    updateComponent: (id: string, updates: Partial<ComponentTree>) => {
      try {
        const success = engine.updateComponentProps(id, updates.props || {});
        if (success) {
          const state = engine.getState();
          baseDesignerState.componentTree.value = state.componentTree;
          updateHistoryState();
          return true;
        }
        updateHistoryState();
        return false;
      } catch (error) {
        message.error('组件更新失败');
        return false;
      }
    },
    // 删除组件
    removeComponent: (id: string) => {
      Modal.confirm({
        title: '提示',
        content: '确定要删除这个组件吗？',
        okText: '确定',
        cancelText: '取消',
        onOk() {
          try {
            const success = engine.removeComponent(id);
            if (success) {
              const state = engine.getState();
              baseDesignerState.componentTree.value = state.componentTree;
              baseDesignerState.selectedComponentId.value = null;
              updateHistoryState();
              message.success('组件删除成功');
              return true;
            }
            baseDesignerState.selectedComponentId.value = null;
            updateHistoryState();
            return false;
          } catch (error) {
            message.error('组件删除失败');
          }
        }
      });
    },
    // 撤销
    undo: () => {
      if (engine.undo()) {
        const state = engine.getState();
        baseDesignerState.componentTree.value = state.componentTree;
        updateHistoryState();
        return true;
      }
      return false;
    },
    // 重做
    redo: () => {
      if (engine.redo()) {
        const state = engine.getState();
        baseDesignerState.componentTree.value = state.componentTree;
        updateHistoryState();
        return true;
      }
      return false;
    }
  });

// 提供设计器引擎给子组件
provide('designerEngine', engine);

// 提供Formily表单实例给子组件
provide('formilyForm', formilyForm);

// 提供设计器状态给子组件
provide('designerState', designerState);

// 生成组件树数据（用于大纲树）
const generateTreeData = (node: ComponentTree): any => {
  const data: any = {
    label: `${node.type} (${node.id})`,
    key: node.id,
    children: []
  };
  
  if (node.children && node.children.length > 0) {
    data.children = node.children.map(child => generateTreeData(child));
  }
  
  return data;
};

// 计算树数据
const treeData = ref<any[]>([]);

// 更新树数据
const updateTreeData = () => {
  // 确保componentTree.value存在且有元素
  if (designerState.componentTree.value && designerState.componentTree.value.length > 0) {
    treeData.value = [generateTreeData(designerState.componentTree.value[0])];
  } else {
    treeData.value = [];
  }
};

// 处理树节点点击
const handleTreeNodeClick = (data: any) => {
  designerState.selectedComponentId = data.key;
};

// 处理撤销
const handleUndo = () => {
  try {
    const success = engine.undo();
    if (success) {
      const state = engine.getState();
                designerState.componentTree.value = state.componentTree;
                updateHistoryState();
      message.success('撤销成功');
    }
  } catch (error) {
    message.error('无法撤销');
  }
};

// 处理重做
const handleRedo = () => {
  try {
    const success = engine.redo();
    if (success) {
      const state = engine.getState();
                designerState.componentTree.value = state.componentTree;
                updateHistoryState();
      message.success('重做成功');
    }
  } catch (error) {
    message.error('无法重做');
  }
};

// 更新历史记录状态
const updateHistoryState = () => {
  // 检查历史记录栈判断是否可以撤销/重做
  const state = engine.getState();
  designerState.history.canUndo = state.history.undoStack.length > 0;
  designerState.history.canRedo = state.history.redoStack.length > 0;
  updateTreeData();
};

// 保存设计
  const handleSave = () => {
    try {
      const data = JSON.stringify(designerState.componentTree, null, 2);
      // 创建Blob对象
      const blob = new Blob([data], { type: 'application/json' });
      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'design_' + new Date().getTime() + '.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      message.success('保存成功');
    } catch (error) {
      message.error('保存失败');
    }
  };

// 导入设计
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            // 使用engine的importTree方法来导入设计
            if (engine.importTree(JSON.stringify(data))) {
              const state = engine.getState();
              designerState.componentTree.value = state.componentTree;
              updateHistoryState();
              message.success('导入成功');
              return;
            } else {
              message.error('导入失败：文件格式不正确');
              return;
            }
          } catch (error) {
            message.error('文件格式不正确');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

// 发布设计
const handlePublish = () => {
  message.success('发布成功');
};

// 切换预览模式
const togglePreviewMode = () => {
  // 使用activeView来控制预览模式
  if (designerState.activeView === 'preview') {
    designerState.activeView = 'designer';
  } else {
    // 保存当前视图，以便返回到之前的视图
    designerState.previousView = designerState.activeView;
    designerState.activeView = 'preview';
  }
};

// 切换视图
const switchView = (view: string) => {
  designerState.activeView = view;
};

// 清空设计
  const handleClear = () => {
    Modal.confirm({
          title: '警告',
          content: '确定要清空所有设计内容吗？',
          okText: '确定',
          cancelText: '取消',
          onOk() {
            // 注意：saveHistory是私有方法，不能直接调用
            const newTree: ComponentTree = {
              id: 'root',
              type: 'Root',
              props: {},
              children: []
            };
            // 使用engine的importTree方法来重置设计
              // 将单个根节点包装为数组格式
              const treeArray = [newTree];
              if (engine.importTree(JSON.stringify(treeArray))) {
                const state = engine.getState();
                designerState.componentTree.value = state.componentTree;
                designerState.selectedComponentId.value = null;
                updateHistoryState();
              }
            message.success('已清空设计');
          }
        });
  };

// 初始化
  onMounted(() => {
    // 历史记录在engine内部自动处理
    updateHistoryState();
    
    // 添加一个示例组件到画布，方便测试
    setTimeout(() => {
      try {
        const initialComponent = {
          id: 'card_example_' + Date.now(),
          type: 'Card',
          props: {
            title: '示例卡片',
            style: {
              width: '300px',
              height: '200px',
              margin: '20px'
            }
          },
          children: []
        };
        
        // 添加到根组件
        const success = engine.addComponent('root', initialComponent);
        if (success) {
          console.log('示例组件添加成功');
          const state = engine.getState();
          designerState.componentTree.value = state.componentTree;
          updateHistoryState();
        }
      } catch (error) {
        console.error('添加示例组件失败:', error);
      }
    }, 1000);
  });
</script>

<template>
  <div class="app-container">
    <!-- 工具栏 -->
    <div class="designer-toolbar">
      <div class="toolbar-left">
        <h1>Vue 3 设计器</h1>
      </div>
      <div class="toolbar-center">
        <a-button 
          @click="switchView('designer')" 
          :type="designerState.activeView === 'designer' ? 'primary' : 'default'"
          icon="edit"
          title="设计器"
        >设计器</a-button>
        <a-button 
          @click="switchView('example')" 
          :type="designerState.activeView === 'example' ? 'primary' : 'default'"
          icon="file-text"
          title="示例"
        >示例</a-button>
        <a-button 
          v-if="designerState.activeView === 'designer'"
          @click="handleUndo" 
          :disabled="!designerState.history.canUndo"
          icon="undo"
          title="撤销"
        >撤销</a-button>
        <a-button 
          v-if="designerState.activeView === 'designer'"
          @click="handleRedo" 
          :disabled="!designerState.history.canRedo"
          icon="redo"
          title="重做"
        >重做</a-button>
      </div>
      <div class="toolbar-right" v-if="designerState.activeView === 'designer'">
        <a-button @click="togglePreviewMode" icon="eye">
          {{ designerState.activeView === 'preview' ? '编辑模式' : '预览模式' }}
        </a-button>
        <a-button @click="handleSave" type="primary" icon="download">保存</a-button>
        <a-button @click="handleImport" icon="upload">导入</a-button>
        <a-button @click="handlePublish" type="success" icon="rocket">发布</a-button>
        <a-button @click="handleClear" type="danger" icon="delete">清空</a-button>
      </div>
    </div>
    
    <!-- 主内容区 -->
    <FormProvider :form="formilyForm">
      <div v-if="designerState.activeView === 'designer'" class="designer-main">
      <!-- 左侧组件库 -->
      <ComponentLibrary />
      
      <!-- 中间设计区域 -->
      <div class="design-area">
        <div class="design-canvas">
          <ComponentRenderer 
            v-if="designerState.componentTree.value && designerState.componentTree.value.length > 0"
            :component="designerState.componentTree.value[0]" 
            :is-design-mode="designerState.activeView !== 'preview'"
            :designer-state="designerState"
          />
        </div>
        
        <!-- 大纲树 -->
        <div class="outline-panel">
          <div class="outline-header">
            <h3>大纲</h3>
          </div>
          <div class="outline-content">
            <a-tree 
          :tree-data="treeData" 
          :default-expanded-keys="['root']"
          @select="handleTreeNodeClick"
        />
          </div>
        </div>
      </div>
      
      <!-- 右侧属性面板 -->
      <PropertyPanel />
    </div>
    
    <!-- 示例页面 -->
    <div v-else-if="designerState.activeView === 'example'" class="example-container">
      <ExamplePage />
    </div>
    </FormProvider>
  </div>
</template>

<style scoped>
.designer-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  overflow: hidden;
}

/* 工具栏样式 */
.designer-toolbar {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.toolbar-left h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  color: #303133;
}

.toolbar-center {
  display: flex;
  gap: 10px;
}

.toolbar-right {
  display: flex;
  gap: 10px;
}

/* 主内容区样式 */
.designer-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 设计区域样式 */
.design-area {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.design-canvas {
  flex: 1;
  padding: 20px;
  overflow: auto;
  background-color: #f5f5f5;
  background-image: 
    linear-gradient(45deg, #e0e0e0 25%, transparent 25%), 
    linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), 
    linear-gradient(45deg, transparent 75%, #e0e0e0 75%), 
    linear-gradient(-45deg, transparent 75%, #e0e0e0 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}

/* 大纲树样式 */
.outline-panel {
  width: 250px;
  background-color: #fff;
  border-left: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

/* 示例页面容器 */
.example-container {
  flex: 1;
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.outline-header {
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f5f7fa;
}

.outline-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.outline-content {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .outline-panel {
    width: 200px;
  }
}

@media (max-width: 768px) {
  .designer-main {
    flex-direction: column;
  }
  
  .design-area {
    flex-direction: column;
  }
  
  .outline-panel {
    width: 100%;
    height: 200px;
    border-left: none;
    border-top: 1px solid #e0e0e0;
  }
  
  .toolbar-center,
  .toolbar-right {
    flex-wrap: wrap;
  }
}

/* 滚动条样式 */
.design-canvas::-webkit-scrollbar,
.outline-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.design-canvas::-webkit-scrollbar-track,
.outline-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.design-canvas::-webkit-scrollbar-thumb,
.outline-content::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.design-canvas::-webkit-scrollbar-thumb:hover,
.outline-content::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
