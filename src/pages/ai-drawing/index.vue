<template>
  <view class="container">
    <!-- 顶部标题区 -->
    <view class="header">
      <text class="title">AI绘画</text>
      <text class="subtitle">让AI为你创造独特艺术</text>
    </view>

    <!-- 风格预设卡片 -->
    <view class="card style-card">
      <text class="card-title">选择风格</text>
      <view class="style-presets">
        <view 
          v-for="style in styles" 
          :key="style.name"
          class="style-item"
          :class="{ active: currentStyle === style.name }"
          @tap="selectStyle(style)"
        >
          <view class="style-icon" :style="style.iconStyle">
            <text class="style-icon-text">{{ style.name[0] }}</text>
          </view>
          <text class="style-name">{{ style.name }}</text>
        </view>
      </view>
    </view>

    <!-- 输入区域卡片 -->
    <view class="card prompt-card">
      <text class="card-title">描述你的想象</text>
      <textarea
        class="prompt-input"
        v-model="prompt"
        placeholder="例如：一只戴着墨镜的猫咪，坐在海滩上..."
        :disabled="isGenerating"
      />
      <button 
        class="generate-btn"
        :disabled="isGenerating"
        :class="{ 'generating': isGenerating }"
        @tap="handleGenerate"
      >
        <text class="btn-text">{{ isGenerating ? '绘制中...' : '开始创作' }}</text>
      </button>
    </view>

    <!-- 生成结果区域 -->
    <block v-if="generatedImage">
      <view class="card result-card">
        <text class="card-title">创作结果</text>
        <image 
          class="generated-image" 
          :src="generatedImage" 
          mode="widthFix"
        />
        
        <!-- 滤镜选择器 -->
        <scroll-view scroll-x class="filter-list">
          <view 
            v-for="filter in filters" 
            :key="filter.name"
            class="filter-item"
            :class="{ active: currentFilter === filter.name }"
            @tap="applyFilter(filter.name)"
          >
            <image 
              :src="generatedImage" 
              :style="{ filter: filter.css }"
              mode="aspectFill"
            />
            <text>{{ filter.name }}</text>
          </view>
        </scroll-view>

        <button 
          class="share-btn"
          @tap="handleGeneratePoster"
        >
          <text class="btn-icon">🎨</text>
          <text>生成分享海报</text>
        </button>
      </view>
    </block>

    <!-- 生成加载动画 -->
    <view class="loading-container" v-if="isGenerating">
      <view class="ai-thinking">
        <view class="dot-flow"></view>
        <text>AI正在绘制中</text>
      </view>
    </view>

    <canvas 
      canvas-id="posterCanvas"
      style="width: 750px; height: 1000px; position: fixed; left: -9999px;"
    />

    <!-- 海报预览 -->
    <view 
      class="poster-preview" 
      v-if="posterUrl"
      :class="{ 'slide-in': posterUrl }"
    >
      <image 
        :src="posterUrl" 
        mode="widthFix"
        @longpress="handleSavePoster"
      />
      <view class="tip">长按保存图片</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { zhipuAIService } from '../../services/zhipuai'
import { posterService } from '@/services/poster'
import Taro from '@tarojs/taro'

const prompt = ref('')
const isGenerating = ref(false)
const generatedImage = ref('')
const posterUrl = ref('')
const currentStyle = ref('')
const currentFilter = ref('暖色')

// 风格预设
const styles = [
  { name: '写实', prompt: '写实风格', iconStyle: { background: '#FFD700' } },
  { name: '动漫', prompt: '动漫风格', iconStyle: { background: '#FF69B4' } },
  { name: '水彩', prompt: '水彩风格', iconStyle: { background: '#87CEEB' } },
  { name: '油画', prompt: '油画风格', iconStyle: { background: '#DEB887' } }
]

// 滤镜选项
const filters = [
  { name: '暖色', css: 'saturate(1.5) contrast(1.1) brightness(1.1)' },
  { name: '冷色', css: 'saturate(0.8) brightness(1.1) contrast(1.2)' },
  { name: '复古', css: 'sepia(0.5) contrast(1.1)' },
  { name: '黑白', css: 'grayscale(1)' }
]

const selectStyle = (style) => {
  currentStyle.value = style.name
  prompt.value += `, ${style.prompt}`
}

const applyFilter = (filterName: string) => {
  currentFilter.value = filterName
}

const handleGenerate = async () => {
  if (!prompt.value.trim()) {
    (Taro as any).showToast({ title: '请输入描述文字', icon: 'none' })
    return
  }

  try {
    isGenerating.value = true
    const imageUrl = await zhipuAIService.generateImage(prompt.value)
    generatedImage.value = imageUrl
  } catch (error) {
    (Taro as any).showToast({ title: '生成失败', icon: 'error' })
  } finally {
    isGenerating.value = false
  }
}

const handleGeneratePoster = async () => {
  if (!generatedImage.value) {
    (Taro as any).showToast({ title: '请先生成图片', icon: 'none' })
    return
  }

  try {
    (Taro as any).showLoading({ title: '生成海报中...' })
    const url = await posterService.generatePoster(
      generatedImage.value,
      prompt.value
    )
    posterUrl.value = url
    
    (Taro as any).hideLoading()
    (Taro as any).showToast({ title: '生成成功', icon: 'success' })
  } catch (error) {
    (Taro as any).showToast({ title: '生成失败', icon: 'error' })
  }
}

const handleSavePoster = async () => {
  try {
    await (Taro as any).saveImageToPhotosAlbum({
      filePath: posterUrl.value
    })
    (Taro as any).showToast({ title: '保存成功', icon: 'success' })
  } catch (error) {
    (Taro as any).showToast({ title: '保存失败', icon: 'error' })
  }
}
</script>

<style lang="less" scoped>
.container {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 30px 20px;
}

.header {
  margin-bottom: 30px;
  
  .title {
    font-size: 36px;
    font-weight: bold;
    color: #333;
    display: block;
  }
  
  .subtitle {
    font-size: 24px;
    color: #666;
    margin-top: 8px;
    display: block;
  }
}

.card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  
  .card-title {
    font-size: 28px;
    font-weight: 500;
    color: #333;
    margin-bottom: 15px;
    display: block;
  }
}

.style-presets {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  
  .style-item {
    text-align: center;
    
    .style-icon {
      width: 80px;
      height: 80px;
      border-radius: 20px;
      margin: 0 auto;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .style-icon-text {
        color: #fff;
        font-size: 32px;
        font-weight: bold;
      }
    }
    
    .style-name {
      display: block;
      margin-top: 10px;
      font-size: 24px;
      color: #666;
    }
    
    &.active {
      .style-icon {
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      .style-name {
        color: #333;
        font-weight: 500;
      }
    }
  }
}

.prompt-input {
  width: 100%;
  height: 160px;
  padding: 15px;
  border-radius: 12px;
  background: #f8f9fa;
  font-size: 28px;
  color: #333;
  margin-bottom: 20px;
}

.generate-btn {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 12px;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .btn-text {
    color: #fff;
    font-size: 32px;
    font-weight: 500;
  }
  
  &.generating {
    opacity: 0.8;
    background: #a5b4fc;
  }
}

.filter-list {
  margin: 20px 0;
  
  .filter-item {
    display: inline-block;
    margin-right: 15px;
    
    image {
      width: 140px;
      height: 140px;
      border-radius: 12px;
      transition: all 0.3s;
    }
    
    text {
      display: block;
      text-align: center;
      margin-top: 8px;
      font-size: 24px;
      color: #666;
    }
    
    &.active {
      image {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
      text {
        color: #333;
        font-weight: 500;
      }
    }
  }
}

.share-btn {
  background: #10b981;
  border-radius: 12px;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  
  text {
    color: #fff;
    font-size: 28px;
  }
  
  .btn-icon {
    font-size: 32px;
  }
}

// 加载动画优化
.loading-container {
  .ai-thinking {
    background: rgba(255,255,255,0.95);
    padding: 30px;
    border-radius: 20px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    
    .dot-flow {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
    }
    
    text {
      color: #333;
      font-weight: 500;
    }
  }
}

// 海报预览优化
.poster-preview {
  background: rgba(0,0,0,0.85);
  
  image {
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  }
  
  .tip {
    background: rgba(255,255,255,0.1);
    padding: 10px 20px;
    border-radius: 20px;
    margin-top: 30px;
  }
}
</style>