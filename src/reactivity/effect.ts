let activeEffect: ReactiveEffect
let shouldTrack = false

type Runner = {
  effect: ReactiveEffect
  (): void
}

export class ReactiveEffect {
  private isActive = true
  public deps: Set<Set<ReactiveEffect>> = new Set()
  constructor(
    private fn: () => any,
    public scheduler?: () => void,
    public onStop?: () => void,
  ) {}

  run() {
    // 如果被停止之后调用，仅仅执行传入方法
    if (!this.isActive) return this.fn()

    // 正常收集依赖
    shouldTrack = true
    activeEffect = this
    const ret = this.fn()
    shouldTrack = false

    return ret
  }

  stop() {
    if (this.isActive) {
      this.deps.forEach(dep => {
        dep.delete(this)
      })
      this.isActive = false
      if (this.onStop) this.onStop()
    }
  }
}

type EffectOptions = {
  scheduler?: () => void
  onStop?: () => void
}
export function effect(fn: () => any, options?: EffectOptions) {
  const _effect = new ReactiveEffect(fn, options?.scheduler, options?.onStop)
  _effect.run()

  const runner = (_effect.run as Runner).bind(_effect)
  runner.effect = _effect
  return runner
}

//* 依赖收集
type TargetMap = Map<
  Record<string, any>,
  Map<string | symbol, Set<ReactiveEffect>>
>
const targetMap: TargetMap = new Map()

export function trackEffect(dep: Set<ReactiveEffect>) {
  // 从对象的角度出发，收集相关的 effect
  dep.add(activeEffect)

  // 如果只是单纯的 reactive 并没有 effect，此时 activeEffect 是 undefined
  // 因此这里需要做一下判断
  activeEffect?.deps.add(dep)
}

export function track<T extends Record<string, any>>(
  target: T,
  key: string | symbol,
) {
  //! runner 在被停止之后再访问对象时不应该再被收集依赖，考虑如下场景
  //! obj.prop++ <=> obj.prop = obj.prop + 1
  if (!shouldTrack) return

  // target -> key -> dep
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }

  trackEffect(dep)
}

//* 触发依赖
export function runEffect(dep: Set<ReactiveEffect>) {
  dep.forEach(e => {
    if (e.scheduler) {
      e.scheduler()
    } else {
      e.run()
    }
  })
}

export function trigger(target: Record<string, unknown>, key: string | symbol) {
  const dep = targetMap.get(target)!.get(key)!
  runEffect(dep)
}

//* 停止跟踪依赖
export function stop(runner: () => void) {
  ;(runner as Runner).effect.stop()
}
