<template>
  <view class="container">
    <!-- 顶部导航 -->
    <view class="header">
      <text class="title">发现</text>
      <view class="header-right">
        <text class="post-btn" @tap="goToAIDrawing">✏️ 发布</text>
      </view>
    </view>

    <scroll-view 
      class="content" 
      scroll-y
      @scrolltolower="onLoadMore"
    >
      <view class="waterfall">
        <view class="column">
          <view 
            v-for="(item, index) in leftList" 
            :key="index"
            class="note-card"
            :style="{ marginTop: index === 0 ? '0' : '12px' }"
          >
            <image 
              class="note-image" 
              :src="item.image" 
              mode="widthFix"
              lazy-load
            />
            <view class="note-content">
              <text class="note-desc">{{ item.description }}</text>
              <view class="note-footer">
                <text class="note-author">{{ item.username }}</text>
                <view class="note-likes">
                  <text class="like-icon">❤️</text>
                  <text class="like-count">{{ item.likes }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="column">
          <view 
            v-for="(item, index) in rightList" 
            :key="index"
            class="note-card"
            :style="{ marginTop: index === 0 ? '0' : '12px' }"
          >
            <image 
              class="note-image" 
              :src="item.image" 
              mode="widthFix"
              lazy-load
            />
            <view class="note-content">
              <text class="note-desc">{{ item.description }}</text>
              <view class="note-footer">
                <text class="note-author">{{ item.username }}</text>
                <view class="note-likes">
                  <text class="like-icon">❤️</text>
                  <text class="like-count">{{ item.likes }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- AI绘画弹窗 -->
    <AIDrawingModal
      :show="showAIModal"
      @close="handleModalClose"
      @try="goToAIDrawing"
    />

    <!-- AI创作助手浮动按钮 -->
    <view class="ai-assistant" @tap="showAIAssistant">
      <text class="ai-icon">🤖</text>
    </view>

    <!-- AI助手对话框 -->
    <view class="ai-dialog" v-if="showDialog">
      <view class="dialog-header">
        <text>AI创作助手</text>
        <text class="close-btn" @tap="closeDialog">×</text>
      </view>
      <scroll-view class="dialog-content" scroll-y>
        <view 
          v-for="(msg, index) in chatHistory" 
          :key="index"
          :class="['message', msg.role]"
        >
          <text>{{ msg.content }}</text>
        </view>
      </scroll-view>
      <view class="dialog-input">
        <input 
          v-model="userInput"
          placeholder="输入创作灵感，AI助你创作..."
          @confirm="sendMessage"
        />
        <text class="send-btn" @tap="sendMessage">发送</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Taro from '@tarojs/taro'
import AIDrawingModal from '../../components/AIDrawingModal.vue'
import { callAIModel, streamAIModel, checkNetworkStatus } from '../../utils/ai'

const showAIModal = ref(true)
// 使用本地图片路径
const logoUrl = '/assets/images/logo.png'

// 生成随机高度的图片数据
const generateRandomHeight = () => Math.floor(Math.random() * (400 - 200) + 200)

const leftList = ref([
  {
    image: logoUrl,
    height: generateRandomHeight(),
    description: 'AI绘制的梦幻场景，充满想象力的艺术创作',
    username: '创作者小A',
    likes: 128
  },
  {
    image: logoUrl,
    height: generateRandomHeight(),
    description: '用AI探索未来城市的样子，科技感十足',
    username: '未来主义者',
    likes: 345
  },
  {
    image: logoUrl,
    height: generateRandomHeight(),
    description: 'AI画笔下的童话世界，每一处细节都很梦幻',
    username: '童话创作家',
    likes: 567
  },
  {
    image: logoUrl,
    height: generateRandomHeight(),
    description: '让AI重新诠释经典艺术作品，别具一格',
    username: '艺术探索者',
    likes: 892
  }
])

const rightList = ref([
  {
    image: logoUrl,
    height: generateRandomHeight(),
    description: 'AI绘制的梦幻场景，充满想象力的艺术创作',
    username: '创作者小B',
    likes: 256
  },
  {
    image: logoUrl,
    height: generateRandomHeight(),
    description: '用AI创作的奇幻世界，突破想象的边界',
    username: '创作者小C',
    likes: 368
  },
  {
    image: logoUrl,
    height: generateRandomHeight(),
    description: 'AI画笔下的童话世界，每一处细节都很梦幻',
    username: '童话创作家',
    likes: 567
  },
  {
    image: logoUrl,
    height: generateRandomHeight(),
    description: '让AI重新诠释经典艺术作品，别具一格',
    username: '艺术探索者',
    likes: 892
  }
])

const handleModalClose = () => {
  showAIModal.value = false
}

const goToAIDrawing = () => {
  showAIModal.value = false
  ;(Taro as any).navigateTo({
    url: '/pages/ai-drawing/index'
  })
}

const onLoadMore = () => {
  console.log('加载更多')
  // 实现加载更多逻辑
}

// AI对话相关状态
const showDialog = ref(false)
const userInput = ref('')
const chatHistory = ref<Array<{role: string, content: string}>>([
  {
    role: 'assistant',
    content: '你好！我是AI创作助手，可以帮你优化创作内容、提供灵感建议。'
  }
])
const isProcessing = ref(false)

// 显示AI助手
const showAIAssistant = () => {
  showDialog.value = true
}

// 关闭对话框
const closeDialog = () => {
  showDialog.value = false
}

// 发送消息给AI
const sendMessage = async () => {
  if (!userInput.value.trim() || isProcessing.value) return
  
  const userMessage = userInput.value
  userInput.value = ''
  
  // 添加用户消息到历史
  chatHistory.value.push({
    role: 'user',
    content: userMessage
  })
  
  isProcessing.value = true
  
  // 创建一个临时的AI回复消息
  chatHistory.value.push({
    role: 'assistant',
    content: ''
  })
  
  try {
    // 检查网络状态
    if (!await checkNetworkStatus()) {
      return
    }
    
    await streamAIModel({
      messages: chatHistory.value,
      temperature: 0.7,
      model: 'glm-4-plus'
    }, (chunk) => {
      // 更新最后一条AI消息的内容
      const lastMessage = chatHistory.value[chatHistory.value.length - 1]
      if (chunk.choices?.[0]?.delta?.content) {
        lastMessage.content += chunk.choices[0].delta.content
      }
    })
    
  } catch (error) {
    console.error('AI响应错误:', error)
    // 更新错误消息
    chatHistory.value[chatHistory.value.length - 1].content = '抱歉，我遇到了一些问题，请稍后再试。'
  } finally {
    isProcessing.value = false
  }
}

// 处理AI创作建议
const handleAISuggestions = (suggestions: any) => {
  // 根据AI建议优化内容
  if (suggestions.description) {
    // 可以直接应用AI优化的描述
    // 或者显示建议供用户选择
  }
}

// 优化图片生成
const generateAIImage = async (prompt: string) => {
  try {
    // 调用智谱AI图像生成API
    const response = await callAIModel({
      type: 'image',
      prompt,
      model: 'cogview' // 使用智谱图像模型
    })
    
    return response.imageUrl
  } catch (error) {
    console.error('生成图片失败:', error)
    return null
  }
}
</script>

<style lang="less">
.container {
  min-height: 100vh;
  background: #f7f7f7;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 44px;
  padding: 0 16px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
  border-bottom: 1px solid #f0f0f0;
}

.content {
  height: calc(100vh - 44px);
  margin-top: 44px;
  box-sizing: border-box;
}

.waterfall {
  padding: 12px;
  display: flex;
  justify-content: space-between;
  box-sizing: border-box;
}

.column {
  width: calc(50% - 6px);
}

.note-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.note-image {
  width: 100%;
  height: auto;
  display: block;
  background: #f5f5f5;
}

.note-content {
  padding: 8px 12px 12px;
}

.note-desc {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.note-footer {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.note-author {
  font-size: 12px;
  color: #999;
}

.note-likes {
  display: flex;
  align-items: center;
  gap: 4px;
  
  .like-icon {
    font-size: 12px;
  }
  
  .like-count {
    font-size: 12px;
    color: #999;
  }
}

.ai-assistant {
  position: fixed;
  right: 16px;
  bottom: 32px;
  width: 48px;
  height: 48px;
  background: #007AFF;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  
  .ai-icon {
    font-size: 24px;
  }
}

.ai-dialog {
  position: fixed;
  left: 5%;
  right: 5%;
  bottom: 100px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  max-height: 60vh;
  
  .dialog-header {
    padding: 12px 16px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .close-btn {
      font-size: 24px;
      color: #999;
      padding: 0 8px;
    }
  }
  
  .dialog-content {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    
    .message {
      margin-bottom: 12px;
      padding: 8px 12px;
      border-radius: 8px;
      max-width: 80%;
      
      &.user {
        background: #007AFF;
        color: #fff;
        align-self: flex-end;
        margin-left: auto;
      }
      
      &.assistant {
        background: #f5f5f5;
        color: #333;
      }
    }
  }
  
  .dialog-input {
    padding: 12px 16px;
    border-top: 1px solid #eee;
    display: flex;
    align-items: center;
    gap: 12px;
    
    input {
      flex: 1;
      height: 36px;
      border: 1px solid #ddd;
      border-radius: 18px;
      padding: 0 16px;
      font-size: 14px;
    }
    
    .send-btn {
      color: #007AFF;
      font-size: 14px;
      padding: 8px;
    }
  }
}
</style>