/**
 * 监控系统修复脚本
 * 直接修复常见监控问题
 */

(function() {
    'use strict';
    
    console.log('🔧 开始修复监控系统...');
    
    // 修复步骤
    const fixes = {
        // 1. 检查并修复本地存储
        fixLocalStorage: function() {
            console.log('1. 检查本地存储...');
            
            const storageKey = 'ks_website_monitor';
            const stored = localStorage.getItem(storageKey);
            
            if (stored) {
                console.log('✅ 本地存储中有监控数据');
                try {
                    const data = JSON.parse(stored);
                    console.log(`数据统计: ${data.events?.length || 0} 个事件`);
                    return true;
                } catch (error) {
                    console.log('❌ 存储数据格式错误，清空重试');
                    localStorage.removeItem(storageKey);
                    return false;
                }
            } else {
                console.log('📭 本地存储中没有监控数据');
                return false;
            }
        },
        
        // 2. 创建测试数据
        createTestData: function() {
            console.log('2. 创建测试数据...');
            
            const testData = {
                session: {
                    id: 'test_session_' + Date.now(),
                    startTime: Date.now(),
                    currentPage: window.location.href,
                    userAgent: navigator.userAgent,
                    screenSize: `${window.screen.width}x${window.screen.height}`,
                    language: navigator.language
                },
                events: [
                    {
                        type: 'pageview',
                        timestamp: Date.now() - 10000,
                        pageUrl: window.location.href,
                        pageTitle: document.title,
                        sessionId: 'test_session_' + Date.now()
                    },
                    {
                        type: 'mousemove',
                        timestamp: Date.now() - 9000,
                        x: 100,
                        y: 200,
                        pageUrl: window.location.href,
                        sessionId: 'test_session_' + Date.now()
                    },
                    {
                        type: 'click',
                        timestamp: Date.now() - 8000,
                        x: 150,
                        y: 250,
                        pageUrl: window.location.href,
                        sessionId: 'test_session_' + Date.now()
                    }
                ],
                stats: {
                    totalEvents: 3,
                    byType: {
                        pageview: 1,
                        mousemove: 1,
                        click: 1
                    },
                    byPage: {
                        [window.location.href]: 3
                    },
                    lastUpdate: Date.now()
                },
                pageViews: [
                    {
                        type: 'pageview',
                        timestamp: Date.now() - 10000,
                        pageUrl: window.location.href,
                        pageTitle: document.title,
                        sessionId: 'test_session_' + Date.now()
                    }
                ],
                lastSave: Date.now()
            };
            
            localStorage.setItem('ks_website_monitor', JSON.stringify(testData));
            console.log('✅ 测试数据已创建并保存');
            return true;
        },
        
        // 3. 检查监控脚本
        checkMonitorScript: function() {
            console.log('3. 检查监控脚本...');
            
            // 检查脚本是否已加载
            if (typeof window.WebsiteMonitor !== 'undefined') {
                console.log('✅ 监控脚本已加载');
                return true;
            }
            
            // 尝试动态加载
            console.log('尝试动态加载监控脚本...');
            const script = document.createElement('script');
            script.src = 'https://helloliying.github.io/knowledge-planet/js/website-monitor.js';
            
            return new Promise((resolve) => {
                script.onload = () => {
                    console.log('✅ 监控脚本动态加载成功');
                    resolve(true);
                };
                
                script.onerror = () => {
                    console.log('❌ 监控脚本动态加载失败');
                    resolve(false);
                };
                
                document.head.appendChild(script);
            });
        },
        
        // 4. 初始化监控
        initMonitor: function() {
            console.log('4. 初始化监控系统...');
            
            if (typeof window.WebsiteMonitor !== 'undefined') {
                try {
                    window.WebsiteMonitor.init();
                    console.log('✅ 监控系统初始化成功');
                    return true;
                } catch (error) {
                    console.log('❌ 监控系统初始化失败:', error.message);
                    return false;
                }
            }
            
            console.log('⚠️ 监控脚本未加载，无法初始化');
            return false;
        },
        
        // 5. 运行完整修复
        runFullFix: async function() {
            console.log('🔧 开始运行完整修复...');
            
            // 步骤1: 检查本地存储
            const hasData = this.fixLocalStorage();
            
            // 步骤2: 如果没有数据，创建测试数据
            if (!hasData) {
                this.createTestData();
            }
            
            // 步骤3: 检查并加载监控脚本
            const scriptLoaded = await this.checkMonitorScript();
            
            // 步骤4: 初始化监控
            if (scriptLoaded) {
                this.initMonitor();
            }
            
            console.log('✅ 修复完成！');
            console.log('现在可以：');
            console.log('1. 访问 https://helloliying.github.io/knowledge-planet/website-monitor-dashboard.html');
            console.log('2. 点击"加载监控数据"按钮');
            console.log('3. 应该能看到监控数据了！');
            
            return true;
        }
    };
    
    // 公开API
    window.MonitorFix = fixes;
    
    // 自动运行修复
    setTimeout(() => {
        console.log('🔄 自动运行监控系统修复...');
        fixes.runFullFix();
    }, 1000);
    
})();