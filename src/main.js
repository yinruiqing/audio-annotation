import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import { MessageBox, Message } from 'element-ui'

Vue.prototype.$prompt = MessageBox.prompt
Vue.prototype.$message = Message
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
  beforeCreate () {
    Vue.prototype.$bus = this
  }
}).$mount('#app')
