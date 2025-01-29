<template>
  <view class="index">
    <view class="header">
      <text class="title">推荐笔记</text>
    </view>
    
    <view class="note-list">
      <view class="note-item" v-for="note in notes" :key="note.id">
        <image class="note-image" :src="note.image" mode="aspectFill" />
        <view class="note-content">
          <text class="note-title">{{ note.title }}</text>
          <view class="note-footer">
            <text class="note-author">{{ note.author }}</text>
            <view class="note-likes">
              <text class="like-count">{{ note.likes }}</text>
              <text class="like-text">赞</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import './index.less'

const notes = ref([
  {
    id: 1,
    title: '测试笔记1：这是一个新的笔记',
    author: '测试作者',
    likes: 888,
    image: 'data:image/png;base64,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'
  },
  {
    id: 2,
    title: '测试笔记2：又一个新笔记',
    author: '测试作者2',
    likes: 666,
    image: 'data:image/png;base64,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'
  }
])
</script>

<style lang="less">
.index {
  padding: 20px;
  background: #f4f4f4;
  min-height: 100vh;
}

.header {
  margin-bottom: 20px;
  
  .title {
    font-size: 36px;
    font-weight: bold;
    color: #333;
  }
}

.note-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.note-item {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  
  .note-image {
    width: 100%;
    height: 400px;
  }
  
  .note-content {
    padding: 16px;
    
    .note-title {
      font-size: 28px;
      color: #333;
      line-height: 1.4;
      margin-bottom: 12px;
    }
    
    .note-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .note-author {
        font-size: 24px;
        color: #666;
      }
      
      .note-likes {
        display: flex;
        align-items: center;
        gap: 4px;
        
        .like-count {
          font-size: 24px;
          color: #ff2442;
        }
        
        .like-text {
          font-size: 24px;
          color: #999;
        }
      }
    }
  }
}
</style> 