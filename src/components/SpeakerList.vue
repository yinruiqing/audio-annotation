<template>
  <el-card>
    <div class="fbox" ref="speakList" v-for="(item, index) in speakerList" :key="item.id"  @click="toggle(item, index)"><span>{{item.name}}</span></div>
  </el-card>
</template>

<script>
import spk2id from '../assets/information/spk2id.json'

export default {
  name: 'SpeakerList',
  data () {
    return {
      speakerList: [],
      isShow: false
    }
  },
  mounted () {
    this.speakerList = this.getSpeakerList(spk2id)
    console.log(this.speakerList)
  },
  methods: {
    getSpeakerList (spk2id) {
      const speakerList = []
      Object.keys(spk2id).forEach((spk) => {
        var item = {
          id: spk2id[spk],
          name: spk
        }
        speakerList.push(item)
      })
      return speakerList
    },
    renameSpk (spkId, name) {
      this.speakerList.forEach(item => {
        if (item.id === spkId) {
          item.name = name
          // TODO 发送事件 通知datalist speaker名字改了
        }
      })
    },
    toggle (item, index) {
      this.isShow = !this.isShow
      this.$bus.$emit('toggleSpk', { flag: this.isShow, spkId: item.id })
      return null
    }
  }
}
</script>

<style scoped>
  .el-card{
    padding:0;
    width:300px;
    height:200px;
    overflow-y: scroll;
  }
 /deep/ .el-card__body{
    width:100%;
    height:200px;
    padding:0 10px;
    display:flex;
    flex-wrap:wrap;
    justify-content:space-between;
  }
  .fbox{
    border:1px solid #cecece;
    padding:15px;
    width:100px;
    margin:5px 5px;
    display: flex;
    align-items: center;
    cursor: pointer;
  }
</style>
