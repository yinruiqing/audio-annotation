<template>
  <div>
    <div class="box" v-for="(item, index) in dataListNew" :key="item.id">
      <div class="switch" @change="showA(item.id)">
          <el-switch  active-color="#13ce66" inactive-color="#ff4949"  v-model="item.active" :id="item.id">
          </el-switch>
        </div>
        <div class="deletes">
           <el-button type="danger" icon="el-icon-delete" class="delete" @click="Delete(index, item.id)">Delete</el-button>
        </div>
      <el-dropdown :hide-on-click="false" type="text" ref="nameform" class="person" :style="getSpeakerColor()"><span>{{item.spk}}</span>
        <el-dropdown-menu slot="dropdown">
        <el-dropdown-item><el-button  @click="btnn(item)">Rename</el-button></el-dropdown-item>
        <el-dropdown-item><el-button>Create new speaker</el-button></el-dropdown-item>
        <el-dropdown-item><el-button>Choose another Speaker</el-button></el-dropdown-item></el-dropdown-menu></el-dropdown>
      <div class="time" @click="btnl(item)" @change="startendchange(item)"><span v-show="!item.isSee">{{item.start}}s</span><input type="text" v-model="item.start" v-show="item.isSee" @blur="baiby(item)"> - <span v-show="!item.isSee">{{item.end}}s</span><input type="text" v-model="item.end" v-show="item.isSee" @blur="baiby(item)"></div>
      <div class="text" @change="textchange(item)">{{item.text}}</div>
    </div>
  </div>
</template>

<script>
import rtrans from '../assets/information/rtrans.json'
import id2spk from '../assets/information/id2spk.json'
export default {
  name: 'SentList',
  data () {
    return {
      dataListNew: [],
      value: '',
      dataList: [],
      rtrans: [],
      id2spk: {},
      nameform: '',
      forList: [],
      colorList: '',
      colortlist: [],
      showAown: {}
    }
  },
  mounted () {
    this.dataList = rtrans
    this.id2spk = id2spk
    this.dataListNew = this.getDataListFromRtrans(rtrans)
    this.$bus.$on('toggleSpk', (data) => {
      if (data.flag === true) {
        this.activateRecordBySpkId(data.spkId)
      } else {
        this.deactivateRecordBySpkId(data.spkId)
      }
    })
  },
  updated () {
    this.forList = this.$el.childNodes
    this.forList.forEach((item, index) => {
      this.colortlist.push(item.childNodes[2].style.color)
    })
    this.$bus.$emit('colors', this.colortlist[0])
  },
  methods: {
    getDataListFromRtrans (rtrans) {
      const dataList = []
      const _this = this
      rtrans.forEach((item) => {
        var ele = {
          id: item.id,
          start: item.start,
          end: item.end,
          spk: _this.id2spk[item.spk_id],
          text: item.text,
          active: true
        }
        dataList.push(ele)
      })
      dataList.sort(function (a, b) {
        return a.start - b.start
      })
      return dataList
    },
    activateRecord (id) {
      this.dataList.forEach(item => {
        if (item.id === id) {
          item.active = true
        }
      })
    },
    deactivateRecord (id) {
      this.dataList.forEach(item => {
        if (item.id === id) {
          item.active = true
        }
      })
    },
    activateRecordBySpkId (spkId) {
      const _this = this
      this.dataList.forEach(item => {
        if (item.spk === _this.id2spk[spkId]) {
          item.active = true
        }
      })
    },
    deactivateRecordBySpkId (spkId) {
      const _this = this
      this.dataList.forEach(item => {
        if (item.spk === _this.id2spk[spkId]) {
          item.active = false
        }
      })
    },
    addNewRecordToDatalist (record) {
      this.dataList.push(record)
      this.dataList.sort(function (a, b) {
        return a.start - b.start
      })
    },
    updateRecordByText (id, text) {
      this.dataList.forEach(item => {
        if (item.id === id) {
          item.text = text
        }
      })
    },
    updateRecordByStartEnd (id, start, end) {
      this.dataList.forEach(item => {
        if (item.id === id) {
          item.start = start
          item.end = end
        }
      })
    },
    updateRecordBySpkId (id, spkId) {
      const _this = this
      this.dataList.forEach(item => {
        if (item.id === id) {
          item.spk = _this.id2spk[spkId]
        }
      })
    },
    Delete (index, id) {
      if (id === this.dataList[index].id) {
        this.dataList.splice(index, 1)
      }
    },
    btnn (item) {
      this.$set(item, 'isEdit', true)
      this.open(item)
    },
    btnl (item) {
      this.$set(item, 'isSee', true)
    },
    baiby (item) {
      item.isSee = false
      this.$bus.$emit('tm', { tm: item.start, tml: item.end })
    },
    color16 () {
      const r = Math.floor(Math.random() * 256)
      const g = Math.floor(Math.random() * 256)
      const b = Math.floor(Math.random() * 256)
      const color = '#' + r.toString(16) + g.toString(16) + b.toString(16)
      return color
    },
    getSpeakerColor () {
      // this.$bus.$emit('colors',color)
      return { color: '#000000' }
    },
    showA (id) {
      if (this.showAown.b === id) {
        this.value = this.showAown.a
      }
    },
    textchange (item) {
      this.updateRecordByText(item.id, item.text)
      this.$bus.$emit('begin', item)
    },
    startendchange (item) {
      this.$bus.$emit('timeModified', item)
      this.updateRecordByStartEnd(item.id, item.start, item.end)
    },
    open (item) {
      this.$prompt('请输入', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: item.spk
      }).then(({ value }) => {
        this.$message({
          type: 'success',
          message: '你的新名称是: ' + value
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消输入'
        })
      })
    }
  }
}
</script>

<style scoped>
  /deep/ .el-button{
    border: none;
  }
  .box{
    display: flex;
    justify-content: space-between;
    width:800px;
    height:100px;
    font-size:16px;
    line-height:20px;
    margin:10px 0;
  }
  .switch{
    width:50px;
    align-items: center;
    display: flex;
  }
  .person{
    width:100px;
    margin: 52px 15px;
    align-items: center;
    display: flex;
    height: 0;
  }
  .time{
    width:200px;
    align-items: center;
    display: flex;
  }
  .text{
    width:400px;
    text-align: left;
    display: flex;
    align-items: center;
  }
  .delete{
    font-size: 14px;
    height: 25px;
    display: flex;
    align-items: center;
    width: 100px;
  }
  .deletes{
    display: flex;
    align-items: center;
    margin: 0 5px;
  }
  input{
    width: 80px;
    border-style: none;
    outline: none;
    background: none;
    font-size: 16px;
    color: #2c3e50;
    background-color: #fff;
  }
</style>
