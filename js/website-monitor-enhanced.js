/**
 * 知识星球网站监控脚本 - 增强版
 * 确保在主网站页面正确工作
 * 版本: 2.0.0
 */

(function() {
    'use strict';
    
    console.log('🔧 网站监控脚本开始加载...');
    
    // 配置
    const CONFIG = {
        // 基础配置
        enabled: true,
        sampleInterval: 50, // 采样间隔(ms)
        maxRecords: 10000,  // 最大记录数
        
        // 存储配置
        storageKey: 'ks_website_monitor',
        autoSave: true,
        saveInterval: 5000, // 自动保存间隔(ms)
        
        // 监控范围
        monitorPages: [
            'https://helloliying.github.io/knowledge-planet/',
            'https://helloliying.github.io/knowledge-planet/index.html',
            'https://helloliying.github.io/knowledge-planet/*' // 所有下级页面
        ],
        
        // 事件类型
        eventTypes: {
            MOUSE_MOVE: 'mousemove',
            MOUSE_CLICK: 'click',
            SCROLL: 'scroll',
            KEYPRESS: 'keypress',
            PAGE_VIEW: 'pageview',
            PAGE_LEAVE: 'pageleave',
            FORM_INTERACTION: 'form',
            LINK_CLICK: 'link'
        },
        
        // 调试
        debug: true, // 开启调试模式
        logPrefix: '[网站监控]',
        
        // 版本
        version: '2.0.0'
    };
    
    // 数据存储
    let monitorData = {
        // 会话信息
        session: {
            id: generateSessionId(),
            startTime: Date.now(),
            currentPage: window.location.href,
            userAgent: navigator.userAgent,
            screenSize: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
            scriptVersion: CONFIG.version
        },
        
        // 事件数据
        events: [],
        
        // 页面访问记录
        pageViews: [],
        
        // 统计信息
        stats: {
            totalEvents: 0,
            byType: {},
            byPage: {},
            lastUpdate: Date.now()
        }
    };
    
    // 工具函数
    function log(message, data = null) {
        if (CONFIG.debug) {
            console.log(CONFIG.logPrefix, message, data || '');
        }
    }
    
    function generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // 初始化
    function init() {
        log('开始初始化网站监控...');
        
        // 检查是否在监控范围内
        const currentUrl = window.location.href;
        const isInScope = CONFIG.monitorPages.some(pattern => {
            if (pattern.includes('*')) {
                const regex = new RegExp(pattern.replace('*', '.*'));
                return regex.test(currentUrl);
            }
            return currentUrl.startsWith(pattern);
        });
        
        if (!isInScope) {
            log('当前页面不在监控范围内，跳过初始化', currentUrl);
            return;
        }
        
        log('当前页面在监控范围内，继续初始化', currentUrl);
        
        // 加载已有数据
        loadFromStorage();
        
        // 记录页面访问
        recordPageView();
        
        // 设置事件监听器
        setupEventListeners();
        
        // 设置页面离开监听
        setupPageLeaveListener();
        
        // 启动自动保存
        if (CONFIG.autoSave) {
            setInterval(saveToStorage, CONFIG.saveInterval);
            log('自动保存已启动，间隔: ' + CONFIG.saveInterval + 'ms');
        }
        
        log('网站监控初始化完成', {
            sessionId: monitorData.session.id,
            currentPage: monitorData.session.currentPage,
            eventCount: monitorData.events.length
        });
        
        // 触发初始化完成事件
        document.dispatchEvent(new CustomEvent('website-monitor:initialized', {
            detail: monitorData.session
        }));
    }
    
    // 记录页面访问
    function recordPageView() {
        const pageView = {
            type: CONFIG.eventTypes.PAGE_VIEW,
            timestamp: Date.now(),
            pageUrl: window.location.href,
            pageTitle: document.title,
            referrer: document.referrer || 'direct',
            sessionId: monitorData.session.id
        };
        
        monitorData.events.push(pageView);
        monitorData.pageViews.push(pageView);
        updateStats(CONFIG.eventTypes.PAGE_VIEW, window.location.href);
        
        log('页面访问记录', pageView);
    }
    
    // 设置事件监听器
    function setupEventListeners() {
        let lastMouseMoveTime = 0;
        
        // 鼠标移动
        document.addEventListener('mousemove', (event) => {
            const now = Date.now();
            if (now - lastMouseMoveTime > CONFIG.sampleInterval) {
                recordMouseMove(event);
                lastMouseMoveTime = now;
            }
        });
        
        // 鼠标点击
        document.addEventListener('click', (event) => {
            recordClick(event);
        });
        
        // 滚动
        document.addEventListener('scroll', (event) => {
            recordScroll();
        });
        
        // 键盘输入
        document.addEventListener('keypress', (event) => {
            recordKeyPress(event);
        });
        
        // 表单交互
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (event) => {
                recordFormInteraction(event);
            });
        });
        
        // 链接点击
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a');
            if (link && link.href) {
                recordLinkClick(event, link);
            }
        });
        
        log('事件监听器已设置');
    }
    
    // 设置页面离开监听
    function setupPageLeaveListener() {
        window.addEventListener('beforeunload', () => {
            recordPageLeave();
            saveToStorage(); // 离开前强制保存
        });
        
        // 页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                log('页面切换到后台');
            } else {
                log('页面切换到前台');
            }
        });
        
        log('页面离开监听器已设置');
    }
    
    // 记录鼠标移动
    function recordMouseMove(event) {
        const mouseEvent = {
            type: CONFIG.eventTypes.MOUSE_MOVE,
            timestamp: Date.now(),
            x: event.clientX,
            y: event.clientY,
            pageX: event.pageX,
            pageY: event.pageY,
            screenX: event.screenX,
            screenY: event.screenY,
            pageUrl: window.location.href,
            sessionId: monitorData.session.id
        };
        
        monitorData.events.push(mouseEvent);
        updateStats(CONFIG.eventTypes.MOUSE_MOVE, window.location.href);
    }
    
    // 记录点击事件
    function recordClick(event) {
        const targetInfo = getElementInfo(event.target);
        
        const clickEvent = {
            type: CONFIG.eventTypes.MOUSE_CLICK,
            timestamp: Date.now(),
            x: event.clientX,
            y: event.clientY,
            button: event.button,
            target: targetInfo,
            pageUrl: window.location.href,
            sessionId: monitorData.session.id
        };
        
        monitorData.events.push(clickEvent);
        updateStats(CONFIG.eventTypes.MOUSE_CLICK, window.location.href);
        
        log('点击事件', clickEvent);
    }
    
    // 记录滚动事件
    function recordScroll() {
        const scrollEvent = {
            type: CONFIG.eventTypes.SCROLL,
            timestamp: Date.now(),
            scrollX: window.scrollX,
            scrollY: window.scrollY,
            pageHeight: document.documentElement.scrollHeight,
            viewportHeight: window.innerHeight,
            pageUrl: window.location.href,
            sessionId: monitorData.session.id
        };
        
        monitorData.events.push(scrollEvent);
        updateStats(CONFIG.eventTypes.SCROLL, window.location.href);
    }
    
    // 记录键盘输入
    function recordKeyPress(event) {
        // 不记录敏感信息（如密码）
        if (event.target.type === 'password') {
            return;
        }
        
        const keyEvent = {
            type: CONFIG.eventTypes.KEYPRESS,
            timestamp: Date.now(),
            key: event.key,
            keyCode: event.keyCode,
            target: getElementInfo(event.target),
            pageUrl: window.location.href,
            sessionId: monitorData.session.id
        };
        
        monitorData.events.push(keyEvent);
        updateStats(CONFIG.eventTypes.KEYPRESS, window.location.href);
    }
    
    // 记录表单交互
    function recordFormInteraction(event) {
        const formEvent = {
            type: CONFIG.eventTypes.FORM_INTERACTION,
            timestamp: Date.now(),
            formId: event.target.id || 'unnamed',
            formAction: event.target.action,
            formMethod: event.target.method,
            pageUrl: window.location.href,
            sessionId: monitorData.session.id
        };
        
        monitorData.events.push(formEvent);
        updateStats(CONFIG.eventTypes.FORM_INTERACTION, window.location.href);
        
        log('表单提交', formEvent);
    }
    
    // 记录链接点击
    function recordLinkClick(event, link) {
        const linkEvent = {
            type: CONFIG.eventTypes.LINK_CLICK,
            timestamp: Date.now(),
            href: link.href,
            text: link.textContent.trim().substring(0, 100),
            target: link.target,
            pageUrl: window.location.href,
            sessionId: monitorData.session.id
        };
        
        monitorData.events.push(linkEvent);
        updateStats(CONFIG.eventTypes.LINK_CLICK, window.location.href);
        
        log('链接点击', linkEvent);
    }
    
    // 记录页面离开
    function recordPageLeave() {
        const leaveEvent = {
            type: CONFIG.eventTypes.PAGE_LEAVE,
            timestamp: Date.now(),
            pageUrl: window.location.href,
            timeOnPage: Date.now() - (monitorData.pageViews[monitorData.pageViews.length - 1]?.timestamp || Date.now()),
            sessionId: monitorData.session.id
        };
        
        monitorData.events.push(leaveEvent);
        updateStats(CONFIG.eventTypes.PAGE_LEAVE, window.location.href);
        
        log('页面离开', leaveEvent);
    }
    
    // 获取元素信息
    function getElementInfo(element) {
        if (!element) return null;
        
        return {
            tagName: element.tagName.toLowerCase(),
            id: element.id || null,
            className: element.className || null,
            name: element.name || null,
            type: element.type || null,
            value: element.value ? element.value.substring(0, 50) : null,
            text: element.textContent ? element.textContent.trim().substring(0, 100) : null,
            href: element.href || null
        };
    }
    
    // 更新统计信息
    function updateStats(eventType, pageUrl) {
        monitorData.stats.totalEvents++;
        monitorData.stats.lastUpdate = Date.now();
        
        // 按类型统计
        if (!monitorData.stats.byType[eventType]) {
            monitorData.stats.byType[eventType] = 0;
        }
        monitorData.stats.byType[eventType]++;
        
        // 按页面统计
        if (!monitorData.stats.byPage[pageUrl]) {
            monitorData.stats.byPage[pageUrl] = 0;
        }
        monitorData.stats.byPage[pageUrl]++;
        
        // 限制数据量
        if (monitorData.events.length > CONFIG.maxRecords) {
            monitorData.events = monitorData.events.slice(-CONFIG.maxRecords);
        }
    }
    
    // 保存到本地存储
    function saveToStorage() {
        try {
            const dataToSave = {
                session: monitorData.session,
                events: monitorData.events.slice(-2000), // 只保存最近2000条
                stats: monitorData.stats,
                pageViews: monitorData.pageViews,
                lastSave: Date.now(),
                scriptVersion: CONFIG.version
            };
            
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(dataToSave));
            
            log('数据已保存到本地存储', {
                eventCount: monitorData.events.length,
                totalEvents: monitorData.stats.totalEvents
            });
            
            return true;
        } catch (error) {
            console.error(CONFIG.logPrefix, '保存失败:', error);
            return false;
        }
    }
    
    // 从本地存储加载
    function loadFromStorage() {
        try {
            const stored = localStorage.getItem(CONFIG.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                
                // 检查版本兼容性
                if (parsed.scriptVersion === CONFIG.version) {
                    // 相同版本，合并数据
                    monitorData.events = parsed.events || [];
                    monitorData.stats = parsed.stats || monitorData.stats;
                    monitorData.pageViews = parsed.pageViews || [];
                    
                    log('已加载存储数据', {
                        eventCount: monitorData.events.length,
                        sessionId: parsed.session?.id
                    });
                } else {
                    // 不同版本，只保留页面视图
                    monitorData.events = parsed.events?.filter(e => e.type === CONFIG.eventTypes.PAGE_VIEW) || [];
                    monitorData.pageViews = parsed.pageViews || [];
                    log('版本不同，只加载页面视图数据', {
                        oldVersion: parsed.scriptVersion,
                        newVersion: CONFIG.version
                    });
                }
            } else {
                log('本地存储中没有监控数据');
            }
        } catch (error) {
            console.error(CONFIG.logPrefix, '加载失败:', error);
        }
    }
    
    // 获取监控数据
    function getMonitorData() {
        return {
            session: monitorData.session,
            events: monitorData.events,
            stats: monitorData.stats,
            pageViews: monitorData.pageViews,
            currentPage: window.location.href,
            timestamp: Date.now(),
            scriptVersion: CONFIG.version
        };
    }
    
    // 导出数据
    function exportData() {
        return JSON.stringify(getMonitorData(), null, 2);
    }
    
    // 清空数据
    function clearData() {
        monitorData.events = [];
        monitorData.pageViews = [];
        monitorData.stats = {
            totalEvents: 0,
            byType: {},
            byPage: {},
            lastUpdate: Date.now()
        };
        
        localStorage.removeItem(CONFIG.storageKey);
        
        log('所有监控数据已清空');
        
        // 重新记录当前页面访问
        recordPageView();
    }
    
    // 强制保存
    function forceSave() {
        return saveToStorage();
    }
    
    // 检查状态
    function getStatus() {
        return {
            initialized: true,
            enabled: CONFIG.enabled,
            sessionId: monitorData.session.id,
            eventCount: monitorData.events.length,
            storageKey: CONFIG.storageKey,
            hasStorage: !!localStorage.getItem(CONFIG.storageKey),
            scriptVersion: CONFIG.version,
            currentPage: window.location.href
        };
    }
    
    // 公开API
    window.WebsiteMonitor = {
        init,
        getMonitorData,
        exportData,
        clearData,
        saveToStorage: forceSave,
        loadFromStorage,
        getStatus,
        config: CONFIG
    };
    
    // 自动初始化 - 确保在主网站页面工作
    function autoInit() {
        log('尝试自动初始化...');
        
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            log('DOM正在加载，等待...');
            document.addEventListener('DOMContentLoaded', () => {
                log('DOM加载完成，开始初始化');
                init();
            });
        } else {
            log('DOM已加载，立即初始化');
            init();
        }
        
        // 额外检查：如果3秒后还没有初始化事件，强制初始化
        setTimeout(() => {
            const hasEvents = monitorData.events.length > 0;
            if (!hasEvents) {
                log('3秒后未检测到事件，强制记录页面访问');
                recordPageView();
                saveToStorage();
            }
        }, 3000);
    }
    
    // 立即开始自动初始化
    log('脚本加载完成，开始自动初始化流程');
    autoInit();
    
})();