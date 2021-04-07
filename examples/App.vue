<template>
  <formula-input
    placeholder="输入「@」后选择指标"
    :options="options"
    v-model="model"
    @change="afterChange"
  ></formula-input>
</template>

<script>
export default {
  data() {
    return {
      model: {
        formula: '1+superman+2-batman+3*aquaman+4/wonderwoman',
        vars: {
          superman: 'ClarkKent',
          batman: 'BruceWayne',
          aquaman: 'ArthurCurry',
          wonderwoman: 'DianaPrince'
        }
      },
      options: [
        {
          field: 'superman',
          name: 'ClarkKent'
        },
        {
          field: 'batman',
          name: 'BruceWayne'
        },
        {
          field: 'theflash',
          name: 'BarryAllen'
        },
        {
          field: 'wonderwoman',
          name: 'DianaPrince'
        },
        {
          field: 'aquaman',
          name: 'ArthurCurry'
        },
        {
          field: 'cyborg',
          name: 'VictorStone'
        },
        {
          field: 'greenlantern',
          name: 'HalJordan'
        }
      ]
    }
  },
  methods: {
    afterChange(v) {
      console.log(v)
    }
  }
}
</script>
