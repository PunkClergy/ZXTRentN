// langs.js - 多语言模块优化版
export const langs = {
	'zh-CN': {
		language: '中文',
		signedin: '已登录',
		signin: '去登录'
	},
	'en-US': {
		language: 'English',
		signedin: 'Signed in',
		signin: 'Sign in'
	}
};

// 初始化时优先读取存储中的语言设置
let currentLang = uni.getStorageSync('lang') || 'zh-CN';

// 验证存储的语言是否有效
if (!langs[currentLang]) {
	currentLang = 'zh-CN';
	uni.setStorageSync('lang', currentLang);
}

export const setLang = (lang) => {
	if (langs[lang]) {
		currentLang = lang;
		uni.setStorageSync('lang', lang);
		// 实际项目中这里可添加语言切换事件通知
	}
};

// 获取当前语言文本内容
export const getLang = () => langs[currentLang];

// 获取当前语言代码
export const getCurrentLangCode = () => currentLang;

// 获取所有支持的语言列表
export const getSupportedLangs = () => Object.keys(langs);