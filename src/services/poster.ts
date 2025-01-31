import Taro from '@tarojs/taro'

export class PosterService {
  async generatePoster(imageUrl: string, prompt: string) {
    try {
      // 1. 创建画布上下文
      const ctx = (Taro as any).createCanvasContext('posterCanvas')
      const systemInfo = await (Taro as any).getSystemInfo()
      const canvasWidth = 750  // 设计稿宽度
      const scale = systemInfo.windowWidth / 750
      const canvasHeight = 1000  // 设计稿高度

      // 2. 绘制背景
      ctx.setFillStyle('#ffffff')
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      // 3. 绘制生成的图片
      const image = await this.getImageInfo(imageUrl)
      const imageSize = 600
      const imageX = (canvasWidth - imageSize) / 2
      ctx.drawImage((image as any).path, imageX, 50, imageSize, imageSize)

      // 4. 绘制提示文字
      ctx.setFillStyle('#333333')
      ctx.setFontSize(28)
      ctx.setTextAlign('center')
      const promptLines = this.splitText(prompt, 20)
      promptLines.forEach((line, index) => {
        ctx.fillText(line, canvasWidth / 2, 700 + index * 40)
      })

      // 5. 绘制小程序码或其他元素
      ctx.setFontSize(24)
      ctx.setFillStyle('#999999')
      ctx.fillText('长按识别查看详情', canvasWidth / 2, 900)

      // 6. 绘制完成
      await new Promise(resolve => ctx.draw(false, resolve))

      // 7. 导出图片
      const result = await (Taro as any).canvasToTempFilePath({
        canvasId: 'posterCanvas',
        fileType: 'jpg',
        quality: 1
      })

      return result.tempFilePath
    } catch (error) {
      console.error('生成海报失败:', error)
      throw error
    }
  }

  private async getImageInfo(url: string) {
    return new Promise((resolve, reject) => {
      (Taro as any).getImageInfo({
        src: url,
        success: resolve,
        fail: reject
      })
    })
  }

  private splitText(text: string, maxLength: number): string[] {
    const lines: string[] = []
    let line = ''
    
    for (const char of text) {
      if (line.length >= maxLength) {
        lines.push(line)
        line = ''
      }
      line += char
    }
    if (line) lines.push(line)
    
    return lines
  }
}

export const posterService = new PosterService()

// 海报相关服务
export const generatePoster = async (params: any) => {
  // 实现海报生成逻辑
}

export const savePoster = async (posterData: any) => {
  // 实现海报保存逻辑
} 