<template>
  <div class="home">
  <div class="hed">
    <FileMenu></FileMenu>
    <SpeakerList></SpeakerList>
  </div>
  <WaveformDisplay :url="url" class="video"></WaveformDisplay>
  <Keep-alive><SentList class="sents"></SentList></Keep-alive>
  </div>
</template>

<script>
import FileMenu from '../components/FileMenu.vue'
import SpeakerList from '../components/SpeakerList.vue'
import WaveformDisplay from '../components/WaveformDisplay.vue'
import SentList from '../components/SentList.vue'
export default {
  name: 'HomeView',
  data () {
    return {
      url: require('../assets/afjiv.wav')
    }
  },
  components: {
    WaveformDisplay,
    SpeakerList,
    FileMenu,
    SentList
  }
}
</script>
<style scoped>
.hed{
  display: flex;
  justify-content: space-around;
  height: 300px;
}
.video{
  height: 300px;
}
.sents{
  height: 400px;
}
</style>
