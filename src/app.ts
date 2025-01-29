import { createApp } from 'vue'
import './app.less'

const App = createApp({
  onShow (options) {
    console.log('App onShow.')
  },
})

export default App