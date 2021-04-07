import FormulaInput from './FormulaInput/index.vue'
import * as Vue from 'vue'
;(FormulaInput as any).install = (VM: Vue.VueConstructor) => {
  VM.component('FormulaInput', FormulaInput)
}

export default FormulaInput
