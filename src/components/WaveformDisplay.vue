<template>
  <div v-loading="loading" class="audio">
    <div class="audio-warp">
      <div class="waveform-warp">
        <div id="timeline" ref="timeline" />
        <div id="waveform" ref="waveform" />
      </div>

      <div v-if="!loading" class="button">
        <div class="btnbox">
          <el-button type="primary" @click="plays()">
            <i class="el-icon-video-play"></i>
            Play regions
          </el-button>
          <el-button type="primary" @click="player">
            <i class="el-icon-video-play"></i>
            Play /
            <i class="el-icon-video-pausee"></i>
            Stop
          </el-button>
      </div>
        <!-- 控制视图大小，音量大小 -->
        <div
          v-for="(item,index) in sliderArr"
          v-show="item.show"
          :key="index"
          class="button-warp"
          style="margin:20px 20px 0 20px;"
        >
          <div><img :src="item.left"></div>
          <el-slider v-model="item.model" @change="item.method" />
          <div><img :src="item.right"></div>
        </div>
      </div>

    </div>

  </div>
</template>

<script>
import DataLists from '../assets/information/dataList'
import rtrans from '../assets/information/rtrans.json'
import colors from '../assets/information/colors.json'
import '../assets/zy_icon/iconfont.css'
import WaveSurfer from 'wavesurfer.js'
import Timeline from 'wavesurfer.js/dist/plugin/wavesurfer.timeline'
import Region from 'wavesurfer.js/dist/plugin/wavesurfer.regions'
import Cursor from 'wavesurfer.js/dist/plugin/wavesurfer.cursor'
import Minimap from 'wavesurfer.js/dist/plugin/wavesurfer.minimap'
export default {
  name: 'WaveformDisplay',
  components: {
  },
  props: {
    url: {
      type: String,
      default: ''
    },
    showRound: {
      type: Boolean,
      default: true
    },
    showCurrentTime: {
      type: Boolean,
      default: true
    },
    showSpeed: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      plag: true,
      colorth: '',
      widthregion: '',
      isReady: false,
      va: {},
      loading: true,
      currentTime: '00:00.00',
      sliderArr: [
        { left: require('../assets/images/zoomDown.png'), method: this.changeZoom, model: 50, right: require('../assets/images/zoomUp.png'), show: true }
      ],
      playArr: [
        { type: 'success', icon: 'zy-icon-play', method: this.play },
        { type: 'danger', icon: 'zy-icon-stop', method: this.stop }
      ],
      ratePosition: '1.0',
      rateArr: ['0.5', '1.0', '1.25', '1.5', '2.0'],
      wavesurfer: '',
      spk2regionId: {},
      spk2color: {},
      regions: {},
      rawRegions: {},
      texts: {}
    }
  },

  computed: {},
  watch: {},
  created () {
    this.initAudio()
  },
  beforeUpdate () {
  },
  updated () {
  },
  mounted () {
    this.spk2regionId = this.getSpk2RegionId(rtrans)
    this.regions = this.getRegionDataFromRtrans(rtrans)
    this.texts = this.getTexts(rtrans)
    this.colors = colors
    this.$bus.$on('toggleSpk', (data) => {
      if (data.flag === true) {
        this.addRegionsBySpkId(data.spkId)
      } else {
        this.removeRegionsBySpkId(data.spkId)
      }
    })
    this.$bus.$on('begin', (data) => {
      this.updateText(data.id, data.text)
    })
    this.$bus.$on('timeModified', (data) => {
      this.updateRegion(data.id, data.start, data.end)
    })
  },
  methods: {
    getSpk2RegionId (rtrans) {
      const spk2regionId = {}
      rtrans.forEach((item) => {
        var spkId = item.spk_id
        if (spkId in spk2regionId) {
          spk2regionId[spkId].push(item.id)
        } else {
          spk2regionId[spkId] = []
          spk2regionId[spkId].push(item.id)
        }
      })
      return spk2regionId
    },
    getRegionDataFromRtrans (rtrans) {
      const regions = {}
      rtrans.forEach((item) => {
        var ele = {
          id: item.id,
          start: item.start,
          end: item.end,
          spkId: item.spk_id
        }
        regions[item.id] = ele
      })
      return regions
    },
    getTexts (rtrans) {
      const texts = {}
      rtrans.forEach((item) => {
        var ele = {
          id: item.id,
          text: item.text
        }
        texts[item.id] = ele
      })
    },
    initLoading () {
      this.loading = false
    },
    initAudio (status = 0, url = '', data = []) {
      const _this = this
      if (_this.wavesurfer) {
        _this.wavesurfer.destroy()
        _this.wavesurfer = ''
      }
      _this.$nextTick(() => {
        _this.loading = true
        _this.wavesurfer = WaveSurfer.create({
          container: _this.$refs.waveform,
          // container: document.querySelector('#waveform'),
          // container: '#waveform',
          interact: false,
          audioRate: 1,
          audioContext: 'Loading...',
          forceDecode: true,
          minPxPerSec: 10,
          barGap: 3,
          waveColor: '#00ffff',
          progressColor: '#55ffff',
          backend: 'MediaElement',
          plugins: [
            Region.create({
              dragSelection: {
                slop: 0
              }
            }),
            Timeline.create({
              container: _this.$refs.timeline,
              labelPadding: 2
            }),
            Cursor.create({
              showTime: true,
              height: '50px',
              opacity: 1,
              customShowTimeStyle: {
                'background-color': '#000',
                color: '#fff',
                padding: '2px',
                'font-size': '10px'
              }
            }),
            Minimap.create({
              waveColor: 'red',
              progressColor: 'yellow',
              height: 100
            })
          ]
        })
        /** 加载音频 */
        _this.wavesurfer.load(_this.url)
        // _this.wavesurfer.load(url)
        _this.wavesurfer.on('waveform-ready', () => {
          _this.wavesurfer.zoom(50)
          _this.addRegions(this.regions)
          _this.loading = false
        })

        /** audioprocess，获取当前时间 */
        _this.wavesurfer.on('audioprocess', function (e) {
          _this.currentTime = _this.changeTime(_this.wavesurfer.getCurrentTime())
        })

        /** 点击区域 */
        _this.wavesurfer.on('region-click', function (region, mouseEvent) {
          region.play() // 播放当前区域，另一种播放方式： _this.wavesurfer.play(start, end)
        })
        _this.wavesurfer.on('region-update-end', function (region) {
          if (region.id in _this.regions) {
            _this.updateRegion(region.id, region.start, region.end)
            // 发送事件通知speakList 并调用updateRecordByStartEnd
          } else {
            _this.addNewRegion(region)
            // 发送事件通知speakList 并调用 addNewRecordToDatalist
          }
        })
        _this.wavesurfer.on('region-mouseenter', () => {
          this.$refs.waveform.firstElementChild
            .childNodes[3].textContent = DataLists[0].texts[0].text
        })
        /** 新增后 */
        _this.wavesurfer.on('region-update-end', (region) => {
        })
      })
    },
    // 加载已标注的区域
    addRegions (datas) {
      if (datas) {
        Object.keys(datas).forEach(id => {
          var spkId = datas[id].spkId
          var color = this.getColorBySpkId(spkId)
          const region = {
            id: id,
            start: datas[id].start,
            end: datas[id].end,
            loop: true,
            color: color,
            drag: true
          }
          this.wavesurfer.addRegion(region)
        })
      }
    },
    updateText (id, text) {
      this.texts[id] = text
    },
    updateRegion (id, start, end) {
      const region = this.wavesurfer.regions.list[id]
      region.update({
        start: start,
        end: end
      })
    },
    removeOneRegionFromSpk (regionId, speakerId) {
      const index = this.spk2regionId[speakerId].indexOf(regionId)
      if (index > -1) {
        this.spk2regionId[speakerId].splice(index, 1)
        this.wavesurfer.regions.list[regionId].remove()
      }
    },
    addOneRegionToSpk (regionId, speakerId) {
      const index = this.spk2regionId[speakerId].indexOf(regionId)
      if (index < 0) {
        this.spk2regionId[speakerId].push(regionId)
        this.regions[regionId].spkId = speakerId
        if (regionId in this.wavesurfer.regions.list) {
          const region = this.wavesurfer.regions.list[regionId]
          const color = this.getColorBySpkId(speakerId)
          region.update({
            color: color
          })
        } else {
          const data = [this.regions[regionId]]
          this.addRegions(data)
        }
      }
    },
    addNewRegion (region) {
      var ele = {
        id: region.id,
        start: region.start,
        end: region.end,
        spkId: -1
      }
      this.regions[region.id] = ele
      this.rawRegions[region.id] = ele
    },
    removeRegionsBySpkId (spkId) {
      var ids = this.spk2regionId[spkId]
      ids.forEach(id => {
        if (id in this.wavesurfer.regions.list) {
          this.wavesurfer.regions.list[id].remove()
        }
      })
    },
    addRegionsBySpkId (spkId) {
      const _this = this
      var ids = this.spk2regionId[spkId]
      const data = {}
      ids.forEach(id => {
        if (!(id in _this.wavesurfer.regions.list)) {
          data[id] = this.regions[id]
        }
      })
      this.addRegions(data)
    },
    getColorBySpkId (spkId) {
      if (spkId in this.spk2color) {
        return this.spk2color[spkId]
      } else {
        var nextColor = this.colors.pop()
        this.spk2color[spkId] = nextColor
        return this.spk2color[spkId]
      }
    },
    /** 格式化时间格式 */
    changeTime (seconds) {
      seconds = Number(seconds)
      const minutes = Math.floor(seconds / 60)
      seconds = seconds % 60

      // fill up seconds with zeroes
      let secondsStr = Math.round(seconds).toString()
      secondsStr = seconds.toFixed(2)

      if (minutes > 0) {
        return `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + secondsStr : secondsStr}`
      }
      return `00:${seconds < 10 ? '0' + secondsStr : secondsStr}`
    },
    /** 改变播放速度 */
    changeAudioRate (value) {
      this.wavesurfer.setPlaybackRate(Number(value))
    },
    play () {
      this.wavesurfer.play()
      // console.log('tag', this.wavesurfer.getCurrentTime())
    },
    rePlay () {
      this.wavesurfer.play(0)
    },
    pause () {
      this.wavesurfer.pause()
    },
    stop () {
      this.wavesurfer.stop()
    },
    /** 改变音量 */
    changeRound () {
      this.wavesurfer.setVolume(Number(this.sliderArr[1].model * 0.01))
    },
    /** 改变声波大小 */
    changeZoom () {
      this.wavesurfer.zoom(Number(this.sliderArr[0].model))
    },
    plays () {
      console.log('播放选中区域', this)
    },
    player () {
      if (this.plag) {
        this.plag = false
        this.play()
      } else {
        this.plag = true
        this.pause()
      }
    }
  }
}
</script>

<style  scoped>
.audio{
  background-color:rgba(215, 243, 243, 0.2);
  padding: 0 10px;
  height:230px;
  border:1px solid lightgray;
}
.no-data{
  margin:100px auto;
  width:50%;
  text-align: center;

}
#timeline{
  height:20px;
  background-color: #fff;
}
#waveform{
  position: relative;
  height:128px;
  background-color: #d8d8d8;
}

.button{
  border:1px solid lightgray;
  display:flex;
  margin-top:100px;
}
.audio-warp{
  width:90%;
  margin:0 auto;
}

  p{
      font-size: 1.4em;
      line-height: 30px;
      margin:0;
    }
    img{
      width:15px;
      height:15px;
      position: absolute;
      top:10px;
    }
    .svg-icon{
      position: absolute;
      top:12px;
    }
    span{
      background-color: white;
      padding: 5px 10px;
      border: 1px solid blue;
    }
.button-warp{
    text-align:center;
    margin: 20px 0 20px 0;
    width:20%;
    float:left;
    position: relative;
    right:0;
    display:flex;
    justify-content:space-between;
    align-items:center;
    }
    .btnbox{
      width:80%;
      display:flex;
      align-items:center;
      justify-content:right;
    }
    .el-slider{
      width:100px;
    }
  /deep/cursor{
      width: 500px !important;
      text-align: left;
      color: red;
    }
</style>
