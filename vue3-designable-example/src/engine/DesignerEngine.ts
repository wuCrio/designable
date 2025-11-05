// 设计器引擎类，管理组件树和设计状态

export interface ComponentTree {
  id: string;
  type: string;
  props?: Record<string, any>;
  children?: ComponentTree[];
}

export interface DesignerState {
  componentTree: ComponentTree[];
  selectedComponentId: string | null;
  history: {
    undoStack: ComponentTree[][];
    redoStack: ComponentTree[][];
  };
}

export class DesignerEngine {
  private state: DesignerState;
  private listeners: Array<(state: DesignerState) => void> = [];

  constructor() {
    this.state = {
      componentTree: [
        {
          id: 'root',
          type: 'Root',
          children: []
        }
      ],
      selectedComponentId: null,
      history: {
        undoStack: [],
        redoStack: []
      }
    };
  }

  // 获取当前状态
  getState(): DesignerState {
    return { ...this.state };
  }

  // 添加监听器
  subscribe(listener: (state: DesignerState) => void) {
    this.listeners.push(listener);
    // 立即触发一次，传递当前状态
    listener(this.getState());
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // 通知所有监听器
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  // 保存当前状态到历史记录
  private saveHistory() {
    // 深拷贝当前组件树
    const treeCopy = JSON.parse(JSON.stringify(this.state.componentTree));
    this.state.history.undoStack.push(treeCopy);
    // 限制历史记录长度
    if (this.state.history.undoStack.length > 50) {
      this.state.history.undoStack.shift();
    }
    // 清空重做栈
    this.state.history.redoStack = [];
  }

  // 添加组件
  addComponent(parentId: string, component: Omit<ComponentTree, 'id'>): string {
    this.saveHistory();
    
    const newId = `${component.type.toLowerCase()}_${Date.now()}`;
    const newComponent: ComponentTree = {
      id: newId,
      ...component
    };

    const addToTree = (tree: ComponentTree[]): boolean => {
      for (const node of tree) {
        if (node.id === parentId) {
          if (!node.children) node.children = [];
          node.children.push(newComponent);
          return true;
        }
        if (node.children && node.children.length > 0) {
          if (addToTree(node.children)) return true;
        }
      }
      return false;
    };

    addToTree(this.state.componentTree);
    this.state.selectedComponentId = newId;
    this.notifyListeners();
    
    return newId;
  }

  // 删除组件
  removeComponent(componentId: string): boolean {
    if (componentId === 'root') return false;
    
    this.saveHistory();

    const removeFromTree = (tree: ComponentTree[]): boolean => {
      if (!tree) return false;
      for (let i = 0; i < tree.length; i++) {
        const node = tree[i];
        if (node && node.id === componentId) {
          tree.splice(i, 1);
          this.state.selectedComponentId = null;
          this.notifyListeners();
          return true;
        }
        if (node && node.children && node.children.length > 0) {
          if (removeFromTree(node.children)) return true;
        }
      }
      return false;
    };

    return removeFromTree(this.state.componentTree);
  }

  // 更新组件属性
  updateComponentProps(componentId: string, props: Record<string, any>): boolean {
    this.saveHistory();

    const updateInTree = (tree: ComponentTree[]): boolean => {
      for (const node of tree) {
        if (node.id === componentId) {
          node.props = { ...node.props, ...props };
          this.notifyListeners();
          return true;
        }
        if (node.children && node.children.length > 0) {
          if (updateInTree(node.children)) return true;
        }
      }
      return false;
    };

    return updateInTree(this.state.componentTree);
  }

  // 选择组件
  selectComponent(componentId: string | null) {
    this.state.selectedComponentId = componentId;
    this.notifyListeners();
  }

  // 获取选中的组件
  getSelectedComponent(): ComponentTree | null {
    if (!this.state.selectedComponentId) return null;

    const findInTree = (tree: ComponentTree[]): ComponentTree | null => {
      for (const node of tree) {
        if (node.id === this.state.selectedComponentId) {
          return node;
        }
        if (node.children && node.children.length > 0) {
          const found = findInTree(node.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findInTree(this.state.componentTree);
  }

  // 撤销
  undo() {
    if (this.state.history.undoStack.length === 0) return false;
    
    const currentState = JSON.parse(JSON.stringify(this.state.componentTree));
    this.state.history.redoStack.push(currentState);
    
    this.state.componentTree = this.state.history.undoStack.pop()!;
    this.notifyListeners();
    return true;
  }

  // 重做
  redo() {
    if (this.state.history.redoStack.length === 0) return false;
    
    const currentState = JSON.parse(JSON.stringify(this.state.componentTree));
    this.state.history.undoStack.push(currentState);
    
    this.state.componentTree = this.state.history.redoStack.pop()!;
    this.notifyListeners();
    return true;
  }

  // 导出组件树
  exportTree(): string {
    return JSON.stringify(this.state.componentTree, null, 2);
  }

  // 导入组件树
  importTree(json: string): boolean {
    try {
      const tree = JSON.parse(json);
      if (!Array.isArray(tree) || tree.length !== 1 || tree[0].id !== 'root') {
        return false;
      }
      this.saveHistory();
      this.state.componentTree = tree;
      this.state.selectedComponentId = null;
      this.notifyListeners();
      return true;
    } catch (e) {
      return false;
    }
  }
}