<template>
  <view class="modal" v-if="show" @tap="handleClose">
    <view class="modal-content" @tap.stop>
      <image 
        class="banner" 
        src="/assets/ai-drawing-banner.png" 
        mode="widthFix"
      />
      <view class="content">
        <text class="title">AI绘画上线啦！</text>
        <text class="desc">用文字描述，让AI为你创造独特艺术</text>
        <button class="try-btn" @tap="handleTry">立即体验</button>
      </view>
      <view class="close-btn" @tap="handleClose">×</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import Taro from '@tarojs/taro'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits(['close', 'try'])

const handleClose = () => {
  emit('close')
}

const handleTry = () => {
  emit('try')
  ;(Taro as any).navigateTo({
    url: '/pages/ai-drawing/index'
  })
}
</script>

<script lang="ts">
export default {
  name: 'AIDrawingModal'
}
</script>

<style lang="less" scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  width: 600px;
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  animation: slideUp 0.3s ease-out;
}

.banner {
  width: 100%;
  height: 300px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
}

.content {
  padding: 30px;
  text-align: center;
  
  .title {
    font-size: 36px;
    font-weight: bold;
    color: #333;
    display: block;
    margin-bottom: 16px;
  }
  
  .desc {
    font-size: 28px;
    color: #666;
    display: block;
    margin-bottom: 30px;
  }
}

.try-btn {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-size: 32px;
  font-weight: 500;
  height: 88px;
  border-radius: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
  font-size: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style> 