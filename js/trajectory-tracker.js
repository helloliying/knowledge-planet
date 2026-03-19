/**
 * 用户行为轨迹跟踪器
 * 专门记录 mousemove, mousedown, scroll 事件
 * 数据结构: [{t: timestamp, x: x, y: y}, ...]
 */

(function() {
    'use strict';
    
    // 配置（试验环境 - 完整记录）
    const TRACKER_CONFIG = {
        // 是否启用跟踪
        enabled: true,
        
        // 采样间隔（毫秒）（试验环境：更密集采样）
        sampleInterval: 20,
        
        // 最大记录数（试验环境可增加）
        maxRecords: 10000,
        
        // 存储键名
        storageKey: 'ks_full_trajectory_data',
        
        // 自动保存间隔（毫秒）
        saveInterval: 5000,
        
        // 是否记录滚动事件
        trackScroll: true,
        
        // 是否记录点击事件
        trackClicks: true,
        
        // 是否记录移动事件
        trackMovement: true,
        
        // 记录更多事件类型（试验环境）
        trackKeyEvents: true,
        trackFocusEvents: true,
        trackFormEvents: true,
        
        // 详细日志
        verbose: true,
        
        // 数据导出格式
        exportFormat: 'detailed' // 'simple' | 'detailed' | 'raw'
    };
    
    // 轨迹数据存储
    let trajectoryData = [];
    let lastSampleTime = 0;
    let saveTimer = null;
    
    /**
     * 初始化轨迹跟踪器
     */
    function initTracker() {
        if (!TRACKER_CONFIG.enabled) {
            console.log('轨迹跟踪器已禁用');
            return;
        }
        
        // 从本地存储加载已有数据
        loadFromStorage();
        
        // 绑定事件监听器（试验环境 - 完整事件监听）
        if (TRACKER_CONFIG.trackMovement) {
            document.addEventListener('mousemove', handleMouseMove, { passive: true });
            document.addEventListener('mouseenter', handleMouseEvent, { passive: true });
            document.addEventListener('mouseleave', handleMouseEvent, { passive: true });
        }
        
        if (TRACKER_CONFIG.trackClicks) {
            document.addEventListener('mousedown', handleMouseDown, { passive: true });
            document.addEventListener('mouseup', handleMouseEvent, { passive: true });
            document.addEventListener('click', handleMouseEvent, { passive: true });
            document.addEventListener('dblclick', handleMouseEvent, { passive: true });
            document.addEventListener('contextmenu', handleMouseEvent, { passive: true });
        }
        
        if (TRACKER_CONFIG.trackScroll) {
            document.addEventListener('scroll', handleScroll, { passive: true });
            window.addEventListener('resize', handleWindowEvent, { passive: true });
        }
        
        if (TRACKER_CONFIG.trackKeyEvents) {
            document.addEventListener('keydown', handleKeyEvent, { passive: true });
            document.addEventListener('keyup', handleKeyEvent, { passive: true });
            document.addEventListener('keypress', handleKeyEvent, { passive: true });
        }
        
        if (TRACKER_CONFIG.trackFocusEvents) {
            document.addEventListener('focus', handleFocusEvent, { passive: true, capture: true });
            document.addEventListener('blur', handleFocusEvent, { passive: true, capture: true });
        }
        
        if (TRACKER_CONFIG.trackFormEvents) {
            document.addEventListener('input', handleFormEvent, { passive: true, capture: true });
            document.addEventListener('change', handleFormEvent, { passive: true, capture: true });
            document.addEventListener('submit', handleFormEvent, { passive: true, capture: true });
        }
        
        // 页面生命周期事件
        window.addEventListener('load', handlePageEvent);
        window.addEventListener('beforeunload', handlePageEvent);
        window.addEventListener('pageshow', handlePageEvent);
        window.addEventListener('pagehide', handlePageEvent);
        
        // 定期保存数据
        saveTimer = setInterval(saveToStorage, TRACKER_CONFIG.saveInterval);
        
        // 页面卸载时保存数据
        window.addEventListener('beforeunload', saveToStorage);
        
        console.log('轨迹跟踪器已初始化，采样间隔:', TRACKER_CONFIG.sampleInterval + 'ms');
    }
    
    /**
     * 处理鼠标移动事件
     */
    function handleMouseMove(event) {
        const now = Date.now();
        
        // 采样控制
        if (now - lastSampleTime < TRACKER_CONFIG.sampleInterval) {
            return;
        }
        
        lastSampleTime = now;
        
        const record = {
            t: now - performance.timing.navigationStart, // 相对时间戳
            x: event.clientX,
            y: event.clientY,
            type: 'mousemove',
            pageX: event.pageX,
            pageY: event.pageY,
            screenX: event.screenX,
            screenY: event.screenY
        };
        
        addRecord(record);
    }
    
    /**
     * 处理鼠标点击事件
     */
    function handleMouseDown(event) {
        const now = Date.now();
        
        const record = {
            t: now - performance.timing.navigationStart,
            x: event.clientX,
            y: event.clientY,
            type: 'mousedown',
            button: event.button,
            target: getTargetInfo(event.target)
        };
        
        addRecord(record);
    }
    
    /**
     * 处理滚动事件
     */
    function handleScroll() {
        const now = Date.now();
        
        // 采样控制
        if (now - lastSampleTime < TRACKER_CONFIG.sampleInterval) {
            return;
        }
        
        lastSampleTime = now;
        
        const record = {
            t: now - performance.timing.navigationStart,
            type: 'scroll',
            scrollX: window.scrollX,
            scrollY: window.scrollY,
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight
        };
        
        addRecord(record);
    }
    
    /**
     * 添加记录到数据存储
     */
    function addRecord(record) {
        // 添加页面信息
        record.page = window.location.pathname;
        record.timestamp = new Date().toISOString();
        
        trajectoryData.push(record);
        
        // 限制数据大小
        if (trajectoryData.length > TRACKER_CONFIG.maxRecords) {
            trajectoryData = trajectoryData.slice(-TRACKER_CONFIG.maxRecords);
        }
        
        // 实时分析可疑行为
        analyzeSuspiciousBehavior(record);
    }
    
    /**
     * 获取目标元素信息
     */
    function getTargetInfo(element) {
        if (!element) return null;
        
        return {
            tagName: element.tagName,
            id: element.id || null,
            className: element.className || null,
            href: element.href || null
        };
    }
    
    /**
     * 处理通用鼠标事件
     */
    function handleMouseEvent(event) {
        const now = Date.now();
        
        const record = {
            t: now - performance.timing.navigationStart,
            type: event.type,
            x: event.clientX,
            y: event.clientY,
            pageX: event.pageX,
            pageY: event.pageY,
            screenX: event.screenX,
            screenY: event.screenY,
            button: event.button,
            target: getTargetInfo(event.target),
            relatedTarget: getTargetInfo(event.relatedTarget)
        };
        
        addRecord(record);
    }
    
    /**
     * 处理键盘事件
     */
    function handleKeyEvent(event) {
        const now = Date.now();
        
        const record = {
            t: now - performance.timing.navigationStart,
            type: event.type,
            key: event.key,
            code: event.code,
            altKey: event.altKey,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            metaKey: event.metaKey,
            target: getTargetInfo(event.target)
        };
        
        // 安全处理：不记录密码输入等敏感信息
        const isSensitive = event.target.type === 'password' || 
                           event.target.type === 'tel' ||
                           event.target.type === 'email';
        
        if (isSensitive) {
            record.key = '***';
            record.code = '***';
        }
        
        addRecord(record);
    }
    
    /**
     * 处理焦点事件
     */
    function handleFocusEvent(event) {
        const now = Date.now();
        
        const record = {
            t: now - performance.timing.navigationStart,
            type: event.type,
            target: getTargetInfo(event.target),
            relatedTarget: getTargetInfo(event.relatedTarget)
        };
        
        addRecord(record);
    }
    
    /**
     * 处理表单事件
     */
    function handleFormEvent(event) {
        const now = Date.now();
        
        const record = {
            t: now - performance.timing.navigationStart,
            type: event.type,
            target: getTargetInfo(event.target),
            value: event.target.value ? '***' : null, // 模糊化处理
            formId: event.target.form ? event.target.form.id || event.target.form.name || 'unknown' : null
        };
        
        addRecord(record);
    }
    
    /**
     * 处理窗口事件
     */
    function handleWindowEvent(event) {
        const now = Date.now();
        
        const record = {
            t: now - performance.timing.navigationStart,
            type: event.type,
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight,
            outerWidth: window.outerWidth,
            outerHeight: window.outerHeight
        };
        
        addRecord(record);
    }
    
    /**
     * 处理页面事件
     */
    function handlePageEvent(event) {
        const now = Date.now();
        
        const record = {
            t: now - performance.timing.navigationStart,
            type: event.type,
            page: window.location.pathname,
            timestamp: new Date().toISOString()
        };
        
        addRecord(record);
    }
    
    /**
     * 分析可疑行为
     */
    function analyzeSuspiciousBehavior(record) {
        // 检查快速连续点击（机器人特征）
        if (record.type === 'mousedown') {
            const recentClicks = trajectoryData.filter(r => 
                r.type === 'mousedown' && 
                (record.t - r.t) < 1000 // 1秒内
            );
            
            if (recentClicks.length > 8) {
                console.warn('检测到可疑行为：快速连续点击', recentClicks.length);
                addSuspiciousRecord('rapid_clicks', recentClicks.length);
            }
        }
        
        // 检查直线移动（机器人特征）
        if (record.type === 'mousemove' && trajectoryData.length > 10) {
            const recentMoves = trajectoryData
                .filter(r => r.type === 'mousemove')
                .slice(-10);
            
            if (recentMoves.length >= 10) {
                const isLinear = checkLinearMovement(recentMoves);
                if (isLinear) {
                    console.warn('检测到可疑行为：直线移动');
                    addSuspiciousRecord('linear_movement', recentMoves.length);
                }
            }
        }
    }
    
    /**
     * 检查是否为直线移动
     */
    function checkLinearMovement(moves) {
        if (moves.length < 3) return false;
        
        // 计算移动方向的一致性
        let directionChanges = 0;
        for (let i = 2; i < moves.length; i++) {
            const dx1 = moves[i].x - moves[i-1].x;
            const dy1 = moves[i].y - moves[i-1].y;
            const dx2 = moves[i-1].x - moves[i-2].x;
            const dy2 = moves[i-1].y - moves[i-2].y;
            
            // 计算方向角度变化
            const angle1 = Math.atan2(dy1, dx1);
            const angle2 = Math.atan2(dy2, dx2);
            const angleDiff = Math.abs(angle1 - angle2);
            
            if (angleDiff > 0.2) { // 角度变化阈值
                directionChanges++;
            }
        }
        
        // 如果方向变化很少，可能是直线移动
        return directionChanges < 2;
    }
    
    /**
     * 添加可疑行为记录
     */
    function addSuspiciousRecord(type, count) {
        const suspiciousRecord = {
            t: Date.now() - performance.timing.navigationStart,
            type: 'suspicious',
            subtype: type,
            count: count,
            page: window.location.pathname,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent.substring(0, 50) // 截断处理
        };
        
        trajectoryData.push(suspiciousRecord);
    }
    
    /**
     * 保存数据到本地存储
     */
    function saveToStorage() {
        try {
            // 只保存最近的数据
            const dataToSave = trajectoryData.slice(-200);
            localStorage.setItem(TRACKER_CONFIG.storageKey, JSON.stringify(dataToSave));
            
            // 可选：发送到服务器
            // sendToServer(dataToSave);
            
        } catch (error) {
            console.error('保存轨迹数据失败:', error);
        }
    }
    
    /**
     * 从本地存储加载数据
     */
    function loadFromStorage() {
        try {
            const stored = localStorage.getItem(TRACKER_CONFIG.storageKey);
            if (stored) {
                trajectoryData = JSON.parse(stored);
                console.log('从存储加载了', trajectoryData.length, '条轨迹记录');
            }
        } catch (error) {
            console.error('加载轨迹数据失败:', error);
            trajectoryData = [];
        }
    }
    
    /**
     * 发送数据到服务器
     */
    function sendToServer(data) {
        // 这里需要你的后端API端点
        const endpoint = '/api/trajectory/logs';
        
        if (!endpoint || data.length === 0) {
            return;
        }
        
        const payload = {
            logs: data,
            page: window.location.href,
            collectedAt: new Date().toISOString(),
            sessionId: getSessionId()
        };
        
        // 使用sendBeacon确保数据发送
        if (navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
            navigator.sendBeacon(endpoint, blob);
        }
    }
    
    /**
     * 生成会话ID
     */
    function getSessionId() {
        let sessionId = sessionStorage.getItem('ks_session_id');
        if (!sessionId) {
            sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('ks_session_id', sessionId);
        }
        return sessionId;
    }
    
    /**
     * 获取轨迹数据
     * @returns {Array} 轨迹流数据
     */
    function getTrajectoryStream() {
        // 调试：显示所有数据
        if (TRACKER_CONFIG.verbose) {
            console.log('📊 轨迹数据统计:', {
                totalRecords: trajectoryData.length,
                moveEvents: trajectoryData.filter(r => r.type === 'mousemove').length,
                clickEvents: trajectoryData.filter(r => r.type === 'mousedown').length,
                allTypes: [...new Set(trajectoryData.map(r => r.type))]
            });
        }
        
        // 返回所有包含坐标的数据
        const stream = trajectoryData
            .filter(record => record.x !== undefined && record.y !== undefined)
            .map(record => ({
                t: record.t,
                x: record.x,
                y: record.y,
                type: record.type
            }));
            
        if (TRACKER_CONFIG.verbose && stream.length === 0 && trajectoryData.length > 0) {
            console.warn('⚠️ 有数据但无坐标信息:', trajectoryData.slice(0, 3));
        }
        
        return stream;
    }
    
    /**
     * 获取统计数据
     */
    function getStats() {
        const now = Date.now();
        const sessionStart = performance.timing.navigationStart;
        const sessionDuration = now - sessionStart;
        
        const moves = trajectoryData.filter(r => r.type === 'mousemove');
        const clicks = trajectoryData.filter(r => r.type === 'mousedown' || r.type === 'click');
        const scrolls = trajectoryData.filter(r => r.type === 'scroll');
        const suspicious = trajectoryData.filter(r => r.type === 'suspicious');
        
        const stats = {
            totalRecords: trajectoryData.length,
            moves: moves.length,
            clicks: clicks.length,
            scrolls: scrolls.length,
            suspicious: suspicious.length,
            sessionDuration: Math.round(sessionDuration / 1000) + 's',
            currentPage: window.location.pathname,
            windowSize: `${window.innerWidth}×${window.innerHeight}`,
            hasData: trajectoryData.length > 0
        };
        
        if (TRACKER_CONFIG.verbose) {
            console.log('📈 统计数据:', stats);
        }
        
        return stats;
    }
    
    /**
     * 清空数据
     */
    function clearData() {
        trajectoryData = [];
        localStorage.removeItem(TRACKER_CONFIG.storageKey);
        console.log('轨迹数据已清空');
    }
    
    /**
     * 导出数据为JSON
     */
    function exportData() {
        return JSON.stringify({
            metadata: {
                exportedAt: new Date().toISOString(),
                page: window.location.href,
                stats: getStats()
            },
            trajectory: getTrajectoryStream()
        }, null, 2);
    }
    
    // 导出公共API
    window.TrajectoryTracker = {
        init: initTracker,
        getStream: getTrajectoryStream,
        getStats: getStats,
        exportData: exportData,
        clearData: clearData,
        config: TRACKER_CONFIG
    };
    
    // 自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTracker);
    } else {
        initTracker();
    }
    
})();