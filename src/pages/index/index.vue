<template>
  <view class="container">
    <textarea
      class="prompt-input"
      v-model="prompt"
      placeholder="请输入你想要生成的图片描述..."
      :disabled="isGenerating"
    />
    <button 
      class="generate-btn"
      :disabled="isGenerating"
      @tap="handleGenerate"
    >
      {{ isGenerating ? '生成中...' : '1生成图片' }}
    </button>
    
    <image 
      v-if="generatedImage"
      class="generated-image" 
      :src="generatedImage" 
      mode="widthFix"
    />

    <button 
      class="share-btn"
      @tap="handleGeneratePoster"
    >
      生成分享海报
    </button>

    <canvas 
      canvas-id="posterCanvas"
      style="width: 750px; height: 1000px; position: fixed; left: -9999px;"
    />

    <view class="poster-preview" v-if="posterUrl">
      <image 
        :src="posterUrl" 
        mode="widthFix"
        @longpress="handleSavePoster"
      />
      <view class="tip">长按保存图片</view>
    </view>
  </view>
</template>

<script>
import { ref } from 'vue'
import { zhipuAIService } from '../../services/zhipuai'
import { posterService } from '@/services/poster'
import Taro from '@tarojs/taro'

export default {
  setup() {
    const prompt = ref('')
    const isGenerating = ref(false)
    const generatedImage = ref('')
    const posterUrl = ref('')

    const handleGenerate = async () => {
      if (!prompt.value.trim()) {
        Taro.showToast({ title: '请输入描述文字', icon: 'none' })
        return
      }

      try {
        isGenerating.value = true
        const imageUrl = await zhipuAIService.generateImage(prompt.value)
        generatedImage.value = imageUrl
      } catch (error) {
        console.error(error)
        Taro.showToast({ title: '生成失败', icon: 'error' })
      } finally {
        isGenerating.value = false
      }
    }

    const handleGeneratePoster = async () => {
      if (!generatedImage.value) {
        Taro.showToast({ title: '请先生成图片', icon: 'none' })
        return
      }

      try {
        Taro.showLoading({ title: '生成海报中...' })
        const url = await posterService.generatePoster(
          generatedImage.value,
          prompt.value
        )
        posterUrl.value = url
        
        Taro.hideLoading()
        Taro.showToast({ title: '生成成功', icon: 'success' })
      } catch (error) {
        console.error('生成海报失败:', error)
        Taro.showToast({ title: '生成失败', icon: 'error' })
      }
    }

    const handleSavePoster = async () => {
      try {
        await Taro.saveImageToPhotosAlbum({
          filePath: posterUrl.value
        })
        Taro.showToast({ title: '保存成功', icon: 'success' })
      } catch (error) {
        console.error('保存失败:', error)
        Taro.showToast({ title: '保存失败', icon: 'error' })
      }
    }

    return {
      prompt,
      isGenerating,
      generatedImage,
      posterUrl,
      handleGenerate,
      handleGeneratePoster,
      handleSavePoster
    }
  }
}
</script>

<style lang="less" scoped>
.container {
  padding: 20px;
}
.prompt-input {
  width: 100%;
  height: 100px;
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ddd;
}
.generate-btn {
  margin-bottom: 20px;
}
.generated-image {
  width: 100%;
}

.share-btn {
  margin-top: 20px;
  background: #07c160;
  color: #fff;
}

.poster-preview {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;

  image {
    width: 80%;
    border-radius: 12px;
  }

  .tip {
    color: #fff;
    font-size: 28px;
    margin-top: 20px;
  }
}
</style>