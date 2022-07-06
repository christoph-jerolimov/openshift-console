export enum Type {
  root = 'root',
  file = 'file',
  describe = 'describe',
  it = 'it',
  before = 'before',
  after = 'after',
  // watch = 'watch',
}

export type Callback = () => void | Promise<void>;

export interface Item {
  type: Type;
  name: string;
  callback?: Callback;
  children?: Item[]
}

export const createRootItem = (): Item => ({
  type: Type.root,
  name: 'root',
  children: [],
})

let rootItem = createRootItem();
let currentItem = rootItem;

export const setRootItem = (newRootItem: Item) => {
  rootItem = newRootItem;
  currentItem = newRootItem;
}

export const getRootItem = () => rootItem;

export const builder = (type: Type) => async (name: string, callback: Callback) => {
  if (!currentItem) {
    throw new Error(`You need to call setRoot before calling ${type}('${name}', ...)`);
  }
  if (!currentItem.children) {
    throw new Error(`Unsupported children ${type}('${name}', ...) of ${currentItem.type}('${currentItem.name}', ...)`);
  }
  if ([Type.file, Type.describe].includes(type)) {
    const newItem: Item = {
      type,
      name,
      children: [],
    };
    currentItem.children.push(newItem);

    const oldItem = currentItem;
    currentItem = newItem;
    try {
      const callbackResult = callback();
      if (callbackResult && callbackResult.then) await callbackResult;
    } finally {
      currentItem = oldItem;
    }
  } else if ([Type.before, Type.after, Type.it].includes(type)) {
    currentItem.children.push({
      type,
      name,
      callback,
    });
  } else {
    throw new Error(`Unsupported type: ${type}('${name}', ...)`)
  }
}

export const parseFile = builder(Type.file);
export const describe = builder(Type.describe);
export const it = builder(Type.it);
export const before = builder(Type.before);
export const after = builder(Type.after);
