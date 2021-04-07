<template>
  <div class="formula-input-wrapper">
    <div
      ref="formula"
      class="input"
      :class="{ error: errorMsg }"
      :contenteditable="disabled ? 'false' : 'plaintext-only'"
      :placeholder="placeholder"
      style="ime-mode: disabled;"
      @keydown.stop="onKeydown"
      @keyup="onKeyup"
      @blur="setValue"
    ></div>
    <div class="hint" v-if="errorMsg">{{ errorMsg }}</div>
    <div
      class="formula-input-selection"
      v-if="showSelection"
      ref="selection"
      @click.stop
    >
      <el-input
        v-model="filter"
        ref="input"
        placeholder="输入关键字筛选"
      ></el-input>
      <div class="options" v-if="displayOptions.length">
        <span
          class="option"
          v-for="(item, i) in displayOptions"
          :key="i"
          @click="optionClick(item)"
        >
          {{ item.name }}
        </span>
      </div>
      <div class="empty" v-else>暂无数据</div>
    </div>
  </div>
</template>
<script>
import {
  getHTMLList,
  str2dom,
  dom2str,
  isHTML,
  validKeys,
  setFocus,
  getDiffIndex,
  getParentNode
} from './utils'
import throttle from 'lodash/throttle'
import ElInput from 'element-ui/lib/input'
import 'element-ui/lib/theme-chalk/input.css'

const initDefaultInnerModol = () => ({
  formula: '',
  vars: {}
})

export default {
  name: 'FormulaInput',
  components: { ElInput },
  props: {
    value: {
      type: Object,
      default: () => ({
        formula: '',
        vars: {}
      })
    },
    placeholder: String,
    disabled: {
      type: Boolean,
      default: false
    },
    scrollWrapperClassName: String,
    options: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    value(v) {
      this.innerModel = v || initDefaultInnerModol()
      this.initDisplay()
    },
    showSelection(v) {
      if (!v) {
        this.removeEventListener()
      }
    }
  },
  computed: {
    displayOptions() {
      const { filter, options } = this
      return options.filter(({ name }) => name.includes(filter))
    }
  },
  created() {
    this.throttleSetSelectionStyle = throttle(this.setSelectionStyle, 100)
  },
  data() {
    this.innerModel = this.value || initDefaultInnerModol()
    return {
      filter: '',
      showSelection: false,
      errorMsg: ''
    }
  },
  mounted() {
    this.initDisplay()
  },
  beforeDestroy() {
    // 删除全局监听
    this.removeEventListener()
    // 删掉下拉框
    const ele = document.querySelector('.formula-input-selection')
    ele && ele.parentNode.removeChild(ele)
  },
  methods: {
    addEventListener() {
      // 添加全局click监听
      window.addEventListener('click', this.removeSelection)
      // 监听滚定事件 定位下拉框
      if (this.scrollWrapperClassName) {
        const el = getParentNode(
          this.$refs.formula,
          this.scrollWrapperClassName
        )
        el && el.addEventListener('scroll', this.throttleSetSelectionStyle)
      }
    },
    removeEventListener() {
      // 解绑全局click监听关闭选项弹框
      window.removeEventListener('click', this.removeSelection)
      // 解绑全局滚动监听
      if (this.scrollWrapperClassName) {
        const el = getParentNode(
          this.$refs.formula,
          this.scrollWrapperClassName
        )
        el && el.addEventListener('scroll', this.throttleSetSelectionStyle)
      }
    },
    onKeyup() {
      const target = this.$refs.formula
      const originStr = target.innerHTML
      let list = str2dom(originStr)
      list = list.map(v =>
        isHTML(v)
          ? dom2str(v)
          : v.data
              .split('')
              .filter(v => validKeys.includes(v))
              .join('')
      )
      const filteredStr = list.join('')
      if (originStr !== filteredStr) {
        const index = getDiffIndex(originStr, filteredStr)
        this.$refs.formula.innerHTML = filteredStr
        setFocus(this.$refs.formula, index)
      }
    },
    initDisplay() {
      const { vars, formula } = this.innerModel
      let result = formula
      for (let key in vars) {
        const rule = new RegExp(key, 'g')
        const name = `<div contenteditable="false">${vars[key]}<span>${key}</span></div>`
        result = result.replace(rule, (v, index, string) => {
          const length = v.length
          const str = string.slice(index - 1, length + index + 1)
          if (str.startsWith('_') || str.endsWith('_')) {
            return key
          } else {
            return name
          }
        })
      }
      this.$refs.formula.innerHTML = result
    },
    removeSelection(e) {
      this.showSelection = false
      e && this.resetDisplay('@')
    },
    onKeydown(e) {
      const { key } = e
      switch (key) {
        // 禁止回车
        case 'Enter':
          e.preventDefault()
          break
        case '@':
        case 'Process': // 中文输入法的 @
          this.openSelection()
          break
        default:
      }
    },
    isValid(v) {
      return validKeys.indexOf(v) >= 0
    },
    openSelection() {
      this.filter = ''
      this.showSelection = true
      setTimeout(() => {
        // append to body
        document.body.appendChild(this.$refs.selection)
        this.setSelectionStyle()
        // 绑定监听
        this.addEventListener()
        // 焦点到下拉框filter input中
        this.$refs.input.focus()
      }, 0)
    },
    setSelectionStyle() {
      const { formula, selection } = this.$refs
      if (!formula) return
      const { top, left, height, width } = formula.getBoundingClientRect()
      selection &&
        selection.setAttribute(
          'style',
          `left: ${left}px; top: ${top + height}px; width: ${
            width > 300 ? width : 300
          }px`
        )
    },
    optionClick(item) {
      const { name, field } = item
      this.showSelection = false
      const res = `<div contenteditable="false">${name}<span>${field}</span></div>`
      this.resetDisplay('@', res)
    },
    resetDisplay(from, to = '') {
      let text = this.$refs.formula.innerHTML
      if (text.includes(from)) {
        text = text.replace(new RegExp(from, 'g'), to)
        this.$refs.formula.innerHTML = text
      }
      this.setValue()
    },
    // 更新 v-model
    setValue() {
      this.errorMsg = ''
      let formula = ''
      const vars = {}
      const text = this.$refs.formula.innerHTML.replace(
        /\sdata-spm-anchor-id=".*?"/g,
        ''
      )
      const list = getHTMLList({
        text,
        prefix: '<div contenteditable="false">',
        suffix: '</div>'
      })
      list.forEach(item => {
        const [v1, v2] = getHTMLList({
          text: item,
          prefix: '<span>',
          suffix: '</span>'
        })
        if (v2) {
          formula += v2
          vars[v2] = v1
        } else {
          formula += v1
        }
      })
      const res = {
        formula,
        vars
      }
      this.$emit('input', res)
      this.$emit('change', res)
    },
    validate() {
      this.errorMsg = ''
      const { formula } = this.value || {}
      if (!formula) {
        this.errorMsg = '公式不能为空'
        return false
      }
      return true
    }
  }
}
</script>
<style lang="less">
@import './index.less';
</style>
