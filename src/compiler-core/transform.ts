import type { ChildrenType } from './parse'

export type NodeType =
  | (ChildrenType & { codeGenNode?: any })
  | {
      children: ChildrenType[]
      type?: number
      content?: any
      codeGenNode?: any
    }

type Options = { nodeTransforms?: Array<(node: NodeType) => void> }

export function transform(root: NodeType, options?: Options) {
  const context = createTransformContext(root, options)
  traverseNode(root, context)

  createRootCodeGen(root)
}

function createRootCodeGen(root: NodeType) {
  return (root.codeGenNode = root.children?.[0])
}

function createTransformContext(root: NodeType, options?: Options) {
  const context = { root, nodeTransforms: options?.nodeTransforms ?? [] }

  return context
}

function traverseNode(
  node: NodeType,
  context: ReturnType<typeof createTransformContext>,
) {
  const nodeTransforms = context.nodeTransforms

  for (let i = 0; i < nodeTransforms.length; i++) {
    const transform = nodeTransforms[i]
    transform(node)
  }

  traverseChildren(node, context)
}

function traverseChildren(
  node: NodeType,
  context: ReturnType<typeof createTransformContext>,
) {
  const children = node.children

  if (children) {
    for (let i = 0; i < children.length; i++) {
      const node = children[i]
      traverseNode(node, context)
    }
  }
}
