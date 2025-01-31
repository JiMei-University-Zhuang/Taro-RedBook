/// <reference types="@tarojs/taro" />
import Taro from '@tarojs/taro'

const API_KEY = '16f982f504964a5bad1adbd4a93efb66.Nvz4GrUqAUKjN9Ns'
const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'

interface AIModelParams {
  messages?: Array<{
    role: string;
    content: string;
  }>;
  type?: 'chat' | 'image';
  prompt?: string;
  temperature?: number;
  model?: string;
}

interface AIResponse {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
  }>;
  usage: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  };
}

interface WxRequestResponse {
  data: any;
  statusCode: number;
  header: Record<string, string>;
}

declare const wx: any;

export const callAIModel = async (params: AIModelParams) => {
  try {
    const normalizedParams = {
      messages: JSON.parse(JSON.stringify(params.messages)),
      temperature: params.temperature,
      model: params.model
    };
    
    console.log('Normalized params:', normalizedParams);
    
    const response = await new Promise<WxRequestResponse>((resolve, reject) => {
      wx.request({
        url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        data: normalizedParams,
        success: (res) => resolve(res),
        fail: (err) => reject(err)
      });
    });
    
    console.log('Raw Response:', response);
    
    if (!response || !response.data) {
      throw new Error('Invalid response from API');
    }
    
    return response.data;
  } catch (error) {
    console.error('AI API Error:', error);
    throw error;
  }
}

// 流式响应需要使用 WebSocket
export const streamAIModel = async (params: AIModelParams, onData: (data: any) => void) => {
  try {
    const normalizedParams = {
      messages: JSON.parse(JSON.stringify(params.messages)),
      temperature: params.temperature || 0.7,
      model: params.model || 'glm-4-plus'
      // 不设置 stream: true，使用普通请求
    };

    console.log('Stream request params:', normalizedParams);

    const response = await new Promise<WxRequestResponse>((resolve, reject) => {
      wx.request({
        url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        data: normalizedParams,
        success: (res) => resolve(res),
        fail: (err) => reject(err)
      });
    });

    console.log('Response:', response);

    if (response.data?.choices?.[0]?.message?.content) {
      // 模拟流式输出
      const content = response.data.choices[0].message.content;
      const chunks = content.split('');
      for (const chunk of chunks) {
        onData({
          choices: [{
            delta: { content: chunk }
          }]
        });
        // 添加小延迟模拟打字效果
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    return response;
  } catch (error) {
    console.error('Stream AI Error:', error);
    throw error;
  }
}

// 添加一个工具方法来检查网络状态
export const checkNetworkStatus = async () => {
  try {
    const networkType = await wx.getNetworkType()
    if (networkType.networkType === 'none') {
      wx.showToast({
        title: '请检查网络连接',
        icon: 'none',
        duration: 2000
      })
      return false
    }
    return true
  } catch (error) {
    console.error('检查网络状态失败:', error)
    return false
  }
} 