// utils/http.js

// 默认配置
const defaultConfig = {
  url: '',
  method: 'GET',
  timeout: 10000,
  loading: true
}

class Http {
  constructor(config) {
    this.baseURL = config.baseURL
    this.interceptor = {}
  }

  // 设置拦截器
  setInterceptor(interceptor) {
    this.interceptor = interceptor
  }

  // 核心请求方法
  async request(config) {
    // 合并配置
    let mergedConfig = { ...defaultConfig, ...config }
    
    // 请求拦截
    if (typeof this.interceptor.request === 'function') {
      mergedConfig = this.interceptor.request(mergedConfig)
    }

    // 处理URL
    let url = this.baseURL + mergedConfig.url
    if (mergedConfig.params) {
      const params = new URLSearchParams(mergedConfig.params).toString()
      url += `?${params}`
    }

    // 显示加载中
    if (mergedConfig.loading) {
      uni.showLoading({ title: '加载中...', mask: true })
    }

    try {
      const response = await uni.request({
        url,
        method: mergedConfig.method,
        data: mergedConfig.data,
        header: mergedConfig.header,
        timeout: mergedConfig.timeout
      })

      // 响应拦截
      let res = response
      if (typeof this.interceptor.response === 'function') {
        res = this.interceptor.response(response)
      }

      // 处理业务逻辑
      if (res.statusCode === 200) {
        return res.data
      } else {
        return Promise.reject(res.data)
      }
    } catch (error) {
      // 统一错误处理
      this.handleError(error)
      return Promise.reject(error)
    } finally {
      if (mergedConfig.loading) {
        uni.hideLoading()
      }
    }
  }

  // 错误处理
  handleError(error) {
    const errMsg = error.errMsg || ''
    
    if (errMsg.includes('timeout')) {
      uni.showToast({ title: '请求超时', icon: 'none' })
    } else if (errMsg.includes('abort')) {
      console.log('请求被取消')
    } else {
      uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
    }
  }

  // 快捷方法
  get(url, params, config) {
    return this.request({ ...config, url, method: 'GET', params })
  }

  post(url, data, config) {
    return this.request({ ...config, url, method: 'POST', data })
  }

  put(url, data, config) {
    return this.request({ ...config, url, method: 'PUT', data })
  }

  delete(url, params, config) {
    return this.request({ ...config, url, method: 'DELETE', params })
  }
}

// 创建实例
export const http = new Http({
  baseURL: 'https://k1sw.wiselink.net.cn' // 你的基础地址
})

// 设置拦截器示例
http.setInterceptor({
  request: (config) => {
    // 添加全局header（例如token）
    const token = uni.getStorageSync('token')
    if (token) {
      config.header = {
        ...config.header,
        'Authorization': `Bearer ${token}`
      }
    }
    return config
  },
  response: (response) => {
    // 处理响应状态码
    if (response.data.code === 401) {
      // token过期处理
      uni.navigateTo({ url: '/pages/login/login' })
    }
    return response
  }
})