// @ts-nocheck
import { h } from '../../lib/guide-mini-vue.esm.js'

window.self = null
export const App = {
  render() {
    window.self = this
    // ui
    return h(
      'div',
      {
        id: 'root',
        class: ['red', 'bold'],
        onClick() {
          console.log('click')
        },
        onMousedown() {
          console.log('mousedown')
        },
      },
      `hi, ${this.msg}`,
      // string
      // 'hi, mini-vue',
      // array
      // [h('p', { class: 'red' }, 'hi'), h('p', { class: 'blue' }, 'mini-vue')],
    )
  },

  setup() {
    return { msg: 'mini-vue, hh' }
  },
}
