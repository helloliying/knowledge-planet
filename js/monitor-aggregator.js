/**
 * 监控数据聚合器
 * 收集所有页面的监控数据并汇总
 * 版本: 1.0.0
 */

(function() {
    'use strict';
    
    console.log('📊 监控数据聚合器启动...');
    
    const CONFIG = {
        // 存储配置
        storageKey: 'ks_website_monitor',
        aggregatedKey: 'ks_website_monitor_aggregated',
        
        // 监控的页面列表
        monitoredPages: [
            'https://helloliying.github.io/knowledge-planet/',
            'https://helloliying.github.io/knowledge-planet/index.html',
            'https://helloliying.github.io/knowledge-planet/posts/',
            'https://helloliying.github.io/knowledge-planet/categories/',
            'https://helloliying.github.io/knowledge-planet/tags/',
            'https://helloliying.github.io/knowledge-planet/about/',
            'https://helloliying.github.io/knowledge-planet/website-monitor-dashboard.html',
            'https://helloliying.github.io/knowledge-planet/fix-monitor.html',
            'https://helloliying.github.io/knowledge-planet/diagnose-monitor.html',
            'https://helloliying.github.io/knowledge-planet/quick-test.html',
            'https://helloliying.github.io/knowledge-planet/realtime-test.html',
            'https://helloliying.github.io/knowledge-planet/security-dashboard-*.html'
        ],
        
        // 聚合间隔（毫秒）
        aggregationInterval: 10000,
        
        // 调试
        debug: true,
        logPrefix: '[聚合器]'
    };
    
    // 聚合数据存储
    let aggregatedData = {
        // 所有页面的数据
        pages: {},
        
        // 汇总统计
        summary: {
            totalEvents: 0,
            totalPageViews: 0,
            uniqueSessions: new Set(),
            pagesCount: 0,
            lastAggregation: null
        },
        
        // 元数据
        meta: {
            version: '1.0.0',
            lastUpdate: Date.now()
        }
    };
    
    // 工具函数
    function log(message, data = null) {
        if (CONFIG.debug) {
            console.log(CONFIG.logPrefix, message, data || '');
        }
    }
    
    // 获取当前页面的监控数据
    function getCurrentPageData() {
        try {
            // 尝试从本地存储获取当前页面的数据
            const stored = localStorage.getItem(CONFIG.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                return {
                    pageUrl: window.location.href,
                    data: data,
                    timestamp: Date.now()
                };
            }
        } catch (error) {
            log('获取当前页面数据失败:', error);
        }
        return null;
    }
    
    // 获取所有可能页面的数据（模拟）
    function getAllPagesData() {
        const allData = {};
        
        // 1. 当前页面的数据
        const currentData = getCurrentPageData();
        if (currentData) {
            allData[currentData.pageUrl] = currentData;
        }
        
        // 2. 尝试从聚合存储中获取其他页面的数据
        try {
            const aggregated = localStorage.getItem(CONFIG.aggregatedKey);
            if (aggregated) {
                const parsed = JSON.parse(aggregated);
                // 合并已有的聚合数据
                Object.assign(allData, parsed.pages || {});
            }
        } catch (error) {
            log('读取聚合数据失败:', error);
        }
        
        return allData;
    }
    
    // 聚合数据
    function aggregateData() {
        log('开始聚合数据...');
        
        // 获取所有页面数据
        const allPagesData = getAllPagesData();
        
        // 重置聚合数据
        aggregatedData = {
            pages: allPagesData,
            summary: {
                totalEvents: 0,
                totalPageViews: 0,
                uniqueSessions: new Set(),
                pagesCount: Object.keys(allPagesData).length,
                lastAggregation: Date.now()
            },
            meta: {
                version: CONFIG.meta.version,
                lastUpdate: Date.now()
            }
        };
        
        // 计算汇总统计
        Object.values(allPagesData).forEach(pageData => {
            if (pageData.data) {
                // 事件总数
                const eventCount = pageData.data.events?.length || 0;
                aggregatedData.summary.totalEvents += eventCount;
                
                // 页面访问数
                const pageViewCount = pageData.data.pageViews?.length || 0;
                aggregatedData.summary.totalPageViews += pageViewCount;
                
                // 唯一会话
                const sessionId = pageData.data.session?.id;
                if (sessionId) {
                    aggregatedData.summary.uniqueSessions.add(sessionId);
                }
            }
        });
        
        // 转换Set为数组用于存储
        aggregatedData.summary.uniqueSessions = Array.from(aggregatedData.summary.uniqueSessions);
        
        log('数据聚合完成', {
            页面数量: aggregatedData.summary.pagesCount,
            事件总数: aggregatedData.summary.totalEvents,
            页面访问总数: aggregatedData.summary.totalPageViews,
            唯一会话数: aggregatedData.summary.uniqueSessions.length
        });
        
        // 保存聚合数据
        saveAggregatedData();
        
        return aggregatedData;
    }
    
    // 保存聚合数据
    function saveAggregatedData() {
        try {
            // 转换为可存储的格式
            const dataToSave = {
                pages: aggregatedData.pages,
                summary: {
                    ...aggregatedData.summary,
                    uniqueSessions: aggregatedData.summary.uniqueSessions // 已经是数组
                },
                meta: aggregatedData.meta
            };
            
            localStorage.setItem(CONFIG.aggregatedKey, JSON.stringify(dataToSave));
            log('聚合数据已保存');
            
            // 触发事件
            document.dispatchEvent(new CustomEvent('monitor-aggregated', {
                detail: aggregatedData
            }));
            
            return true;
        } catch (error) {
            log('保存聚合数据失败:', error);
            return false;
        }
    }
    
    // 加载聚合数据
    function loadAggregatedData() {
        try {
            const stored = localStorage.getItem(CONFIG.aggregatedKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                aggregatedData = parsed;
                
                // 确保uniqueSessions是Set
                if (Array.isArray(aggregatedData.summary.uniqueSessions)) {
                    aggregatedData.summary.uniqueSessions = new Set(aggregatedData.summary.uniqueSessions);
                } else {
                    aggregatedData.summary.uniqueSessions = new Set();
                }
                
                log('聚合数据已加载', {
                    页面数量: aggregatedData.summary.pagesCount,
                    事件总数: aggregatedData.summary.totalEvents
                });
                
                return aggregatedData;
            }
        } catch (error) {
            log('加载聚合数据失败:', error);
        }
        
        // 如果没有数据，进行初始聚合
        return aggregateData();
    }
    
    // 获取聚合数据
    function getAggregatedData() {
        return {
            ...aggregatedData,
            summary: {
                ...aggregatedData.summary,
                uniqueSessions: Array.from(aggregatedData.summary.uniqueSessions)
            }
        };
    }
    
    // 导出聚合数据
    function exportAggregatedData() {
        return JSON.stringify(getAggregatedData(), null, 2);
    }
    
    // 清空聚合数据
    function clearAggregatedData() {
        aggregatedData = {
            pages: {},
            summary: {
                totalEvents: 0,
                totalPageViews: 0,
                uniqueSessions: new Set(),
                pagesCount: 0,
                lastAggregation: null
            },
            meta: {
                version: CONFIG.meta.version,
                lastUpdate: Date.now()
            }
        };
        
        localStorage.removeItem(CONFIG.aggregatedKey);
        log('聚合数据已清空');
    }
    
    // 手动触发聚合
    function triggerAggregation() {
        return aggregateData();
    }
    
    // 获取页面列表
    function getPageList() {
        const pages = Object.keys(aggregatedData.pages);
        return pages.map(url => ({
            url,
            eventCount: aggregatedData.pages[url]?.data?.events?.length || 0,
            lastUpdate: aggregatedData.pages[url]?.timestamp || null
        })).sort((a, b) => b.eventCount - a.eventCount);
    }
    
    // 获取页面详情
    function getPageDetails(pageUrl) {
        return aggregatedData.pages[pageUrl] || null;
    }
    
    // 初始化
    function init() {
        log('初始化监控数据聚合器...');
        
        // 加载现有数据
        loadAggregatedData();
        
        // 启动定期聚合
        if (CONFIG.aggregationInterval > 0) {
            setInterval(() => {
                aggregateData();
            }, CONFIG.aggregationInterval);
            
            log(`定期聚合已启动，间隔: ${CONFIG.aggregationInterval}ms`);
        }
        
        // 页面卸载前保存数据
        window.addEventListener('beforeunload', () => {
            aggregateData();
        });
        
        log('监控数据聚合器初始化完成');
    }
    
    // 公开API
    window.MonitorAggregator = {
        init,
        getAggregatedData,
        exportAggregatedData,
        clearAggregatedData,
        triggerAggregation,
        getPageList,
        getPageDetails,
        config: CONFIG
    };
    
    // 自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();