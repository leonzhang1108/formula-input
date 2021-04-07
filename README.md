# Formula Input
## 公式输入框
要求能够编辑公式，需求是能够自由编辑数字和加减乘除符号，并能插入指标作为变量

### 开发
```
yarn serve
```

### 打包
```
yarn build
```

### 使用方法
输入框内只能输入数字及```+-*/.@()```，其中键入```@```可触发下拉筛选变量
```typescript
// main.js
import FormulaInput from "@ali/formula-input"
Vue.use(FormulaInput)

// xxxPage.vue
<formula-input
  v-model="model"
  :options="options"
  :disabled="disabled"
  placeholder="placeholder"
  scrollWrapperClassName="scrollWrapperClassName"
  @change="afterChangeFunction"
></formula-input>
```

### 组件参数

| 参数     | 说明             | 类型                   | 默认值 |
| -------- | ---------------- | ------------------------ | ------ |
| v-model  | 值 | [model](#model) | { formula: "", vars: {} } |
| options  | 选项 | [options](#options) | [] |
| disabled | 能否修改 | Boolean | false |
| placeholder | input说明 | String | "" |
| scrollWrapperClassName | 外层滚动的className,定位用 | String   | ""  |

### model
```json
{
  "formula": "1+superman+2-batman+3*aquaman+4/wonderwoman",
  "vars": {
    "superman": "ClarkKent",
    "batman": "BruceWayne",
    "aquaman": "ArthurCurry",
    "wonderwoman": "DianaPrince"
  }
}
```
![组件展示](https://cube.elemecdn.com/5/02/cdc9917b0b01ae690ca2e4f13ef14png.png)


### options
```json
// example
[
  {
    "field": "superman",
    "name": "ClarkKent"
  },
  {
    "field": "batman",
    "name": "BruceWayne"
  },
  {
    "field": "theflash",
    "name": "BarryAllen"
  },
  {
    "field": "wonderwoman",
    "name": "DianaPrince"
  },
  {
    "field": "aquaman",
    "name": "ArthurCurry"
  },
  {
    "field": "cyborg",
    "name": "VictorStone"
  },
  {
    "field": "greenlantern",
    "name": "HalJordan"
  }
]
```


### 事件参数
| 事件     | 说明             | 类型                   | 默认值 |
| -------- | ---------------- | ------------------------ | ------ |
| @change | 值更改事件监听 | Function   | noop |