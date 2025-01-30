import CryptoJS from 'crypto-js'
import Taro from '@tarojs/taro'

class ZhipuAIService {
  private apiKey: string
  private secretKey: string

  constructor() {
    // 拆分 API Key 获取 id 和 secret
    const [id, secret] = '16f982f504964a5bad1adbd4a93efb66.Nvz4GrUqAUKjN9Ns'.split('.')
    this.apiKey = id
    this.secretKey = secret
  }

  private generateToken(): string {
    const header = {
      "alg": "HS256",
      "sign_type": "SIGN"
    }

    const timestamp = Math.floor(Date.now() / 1000)
    const payload = {
      "api_key": this.apiKey,
      "exp": timestamp + 3600,  // 1小时后过期
      "timestamp": timestamp
    }

    // 生成 JWT token
    const base64Header = this.base64UrlEncode(JSON.stringify(header))
    const base64Payload = this.base64UrlEncode(JSON.stringify(payload))
    
    const signContent = `${base64Header}.${base64Payload}`
    const signature = CryptoJS.HmacSHA256(signContent, this.secretKey)
    const base64Signature = CryptoJS.enc.Base64.stringify(signature)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')

    return `${base64Header}.${base64Payload}.${base64Signature}`
  }

  private base64UrlEncode(str: string): string {
    const base64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(str))
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  async generateImage(prompt: string) {
    try {
      const token = this.generateToken()
      
      const res = await (Taro as any).request({
        url: 'https://open.bigmodel.cn/api/paas/v4/images/generations',
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        data: {
          model: 'cogview-4',
          prompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
          style: 'vivid'
        }
      })

      if (res.statusCode === 200 && res.data.data) {
        return res.data.data[0].url
      } else {
        throw new Error(res.data.message || '生成失败')
      }
    } catch (error) {
      console.error('智谱AI生成失败:', error)
      throw error
    }
  }
}

export const zhipuAIService = new ZhipuAIService() 