// ========================================
// HPX 2025 活動報名表單處理
// ========================================

// 表單提交處理
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registration-form');
    const submitBtn = document.getElementById('submit-btn');
    const submitMessage = document.getElementById('submit-message');
    const modal = document.getElementById('confirmation-modal');
    const confirmBtn = document.getElementById('confirm-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const successModal = document.getElementById('success-modal');
    const successCloseBtn = document.getElementById('success-close-btn');
    const countdownTimer = document.getElementById('countdown-timer');
    const countdownStatus = document.getElementById('countdown-status');
    const countdownBanner = document.getElementById('countdown-banner');
    const registrationDeadline = new Date('2025-12-06T12:00:00+08:00');
    let countdownInterval = null;
    let registrationClosed = false;
    let isSubmitting = false;
    let formDataToSubmit = null;

    // 表單送出事件監聽 - 顯示確認對話框
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        if (registrationClosed) {
            closeRegistration();
            return;
        }

        // 防止重複送出
        if (isSubmitting) {
            console.warn('表單正在送出中，請勿重複提交');
            return;
        }

        // 收集表單資料
        formDataToSubmit = collectFormData();

        // 顯示確認對話框
        showConfirmationModal(formDataToSubmit);
    });

    // 確認按鈕事件監聽 - 真正送出表單
    confirmBtn.addEventListener('click', async function() {
        // 隱藏確認對話框
        hideConfirmationModal();

        // 設定送出狀態
        setSubmittingState(true);

        try {
            // 發送到 webhook
            await sendToWebhook(formDataToSubmit);

            // 顯示成功對話框
            showSuccessModal();

            // 清空表單
            form.reset();
            formDataToSubmit = null;

            // 恢復按鈕狀態
            setSubmittingState(false);

        } catch (error) {
            // 顯示錯誤訊息
            showErrorMessage(error.message);

            // 恢復按鈕狀態
            setSubmittingState(false);

            // 5 秒後隱藏錯誤訊息
            setTimeout(() => {
                hideMessage();
            }, 5000);

            console.error('表單送出錯誤:', error);
        }
    });

    // 取消按鈕事件監聽 - 關閉對話框
    cancelBtn.addEventListener('click', function() {
        hideConfirmationModal();
    });

    // 點擊對話框外部關閉對話框
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            hideConfirmationModal();
        }
    });

    // 成功對話框關閉按鈕事件監聽
    successCloseBtn.addEventListener('click', function() {
        hideSuccessModal();
    });

    // 點擊成功對話框外部關閉對話框
    successModal.addEventListener('click', function(e) {
        if (e.target === successModal) {
            hideSuccessModal();
        }
    });

    // ========================================
    // 輔助函式
    // ========================================

    /**
     * 收集表單資料
     */
    function collectFormData() {
        return {
            name: document.getElementById('name').value.trim(),
            facebook: document.getElementById('facebook').value.trim(),
            email: document.getElementById('email').value.trim(),
            bank: document.getElementById('bank').value.trim(),
            account: document.getElementById('account').value.trim(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 發送資料到 webhook
     */
    async function sendToWebhook(formData) {
        console.log('發送資料:', formData);

        const url = 'https://joshtsang0916.zeabur.app/webhook/HPX2025';

        // 發送 POST 請求（使用 JSON 格式）
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        console.log('Response status:', response.status);

        const responseText = await response.text();
        console.log('Response body:', responseText);

        // 檢查回應是否成功
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${responseText}`);
        }

        return responseText;
    }

    /**
     * 設定送出狀態
     */
    function setSubmittingState(submitting) {
        isSubmitting = submitting;

        if (submitting) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.6';
            submitBtn.style.cursor = 'not-allowed';
            submitBtn.textContent = '送出中...';
        } else {
            submitBtn.disabled = registrationClosed;
            submitBtn.style.opacity = registrationClosed ? '0.7' : '1';
            submitBtn.style.cursor = registrationClosed ? 'not-allowed' : 'pointer';
            submitBtn.textContent = registrationClosed ? '報名已截止' : '確認送出報名';
        }
    }

    /**
     * 倒數更新
     */
    function updateCountdown() {
        const now = new Date();
        const diff = registrationDeadline.getTime() - now.getTime();

        if (diff <= 0) {
            closeRegistration();
            return;
        }

        const totalSeconds = Math.floor(diff / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (countdownTimer) {
            countdownTimer.textContent = `${padNumber(hours)}:${padNumber(minutes)}:${padNumber(seconds)}`;
        }

        if (countdownStatus) {
            countdownStatus.textContent = '';
        }
    }

    /**
     * 補零
     */
    function padNumber(value) {
        return String(value).padStart(2, '0');
    }

    /**
     * 關閉報名
     */
    function closeRegistration() {
        if (registrationClosed) {
            return;
        }

        registrationClosed = true;
        isSubmitting = false;

        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }

        if (countdownTimer) {
            countdownTimer.textContent = '00:00:00';
        }

        if (countdownStatus) {
            countdownStatus.textContent = '報名已截止';
            countdownStatus.classList.add('is-closed');
        }

        if (countdownBanner) {
            countdownBanner.classList.add('is-closed');
        }

        if (form) {
            form.classList.add('is-closed');
            const formElements = form.querySelectorAll('input, button, textarea, select');
            formElements.forEach((element) => {
                element.disabled = true;
            });
        }

        setSubmittingState(false);
        hideConfirmationModal();
        hideSuccessModal();
    }

    /**
     * 顯示成功訊息
     */
    function showSuccessMessage() {
        submitMessage.style.display = 'block';
        submitMessage.style.color = '#4ecdc4';
        submitMessage.innerHTML = '✓ 報名完成！請加入HPX2025大聚line官方帳號完成認證程序。';
    }

    /**
     * 顯示錯誤訊息
     */
    function showErrorMessage(errorMsg) {
        submitMessage.style.display = 'block';
        submitMessage.style.color = '#e91e8c';
        submitMessage.innerHTML = `✗ 送出失敗：${errorMsg}<br>請稍後再試或聯繫活動負責人。`;
    }

    /**
     * 隱藏訊息
     */
    function hideMessage() {
        submitMessage.style.display = 'none';
    }

    /**
     * 顯示確認對話框
     */
    function showConfirmationModal(formData) {
        // 填入資料到對話框
        document.getElementById('confirm-name').textContent = formData.name;
        document.getElementById('confirm-email').textContent = formData.email;
        document.getElementById('confirm-bank').textContent = formData.bank;
        document.getElementById('confirm-account').textContent = formData.account;

        // 顯示對話框
        modal.style.display = 'flex';

        // 防止背景滾動
        document.body.style.overflow = 'hidden';
    }

    /**
     * 隱藏確認對話框
     */
    function hideConfirmationModal() {
        modal.style.display = 'none';

        // 恢復背景滾動
        document.body.style.overflow = '';
    }

    /**
     * 顯示成功對話框
     */
    function showSuccessModal() {
        // 顯示成功對話框
        successModal.style.display = 'flex';

        // 防止背景滾動
        document.body.style.overflow = 'hidden';
    }

    /**
     * 隱藏成功對話框
     */
    function hideSuccessModal() {
        successModal.style.display = 'none';

        // 恢復背景滾動
        document.body.style.overflow = '';
    }

    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);

    // Header 快速導覽
    const quickNavToggle = document.querySelector('.quick-nav-toggle');
    const quickNavOverlay = document.getElementById('quick-nav-overlay');
    const quickNavCard = quickNavOverlay ? quickNavOverlay.querySelector('.quick-nav-card') : null;

    if (quickNavToggle && quickNavOverlay && quickNavCard) {
        if (quickNavOverlay.parentElement !== document.body) {
            document.body.appendChild(quickNavOverlay);
        }

        const quickNavLinks = quickNavOverlay.querySelectorAll('[data-quick-nav-link]');
        let lastFocusedElement = null;
        let flashTimeout = null;
        let hideOverlayTimer = null;
        const handleWindowChange = () => {
            positionQuickNav();
        };
        const handleScrollClose = () => {
            if (quickNavOverlay.classList.contains('is-visible')) {
                closeQuickNav();
            }
        };

        const positionQuickNav = () => {
            if (
                !quickNavOverlay.classList.contains('is-visible') &&
                quickNavOverlay.hasAttribute('hidden')
            ) {
                return;
            }

            if (
                !quickNavCard ||
                quickNavCard.offsetWidth === 0
            ) {
                return;
            }

            const toggleRect = quickNavToggle.getBoundingClientRect();
            const cardWidth = quickNavCard.offsetWidth;
            const cardHeight = quickNavCard.offsetHeight;
            const offset = 14;
            const viewportMargin = 16;

            const triggerTop = toggleRect.top + window.scrollY;
            const triggerBottom = toggleRect.bottom + window.scrollY;

            let top = triggerBottom + offset;
            let left = toggleRect.right - cardWidth + window.scrollX;

            const viewportLeft = window.scrollX + viewportMargin;
            const viewportRight = window.scrollX + window.innerWidth - viewportMargin;
            const viewportBottom = window.scrollY + window.innerHeight - viewportMargin;
            const viewportTop = window.scrollY + viewportMargin;
            const availableBelow = viewportBottom - (triggerBottom + offset);
            const availableAbove = triggerTop - offset - viewportTop;

            if (left + cardWidth > viewportRight) {
                left = viewportRight - cardWidth;
            }
            if (left < viewportLeft) {
                left = viewportLeft;
            }

            let dropDirection = 'down';
            if (availableBelow < cardHeight && availableAbove > availableBelow) {
                dropDirection = 'up';
            }

            if (dropDirection === 'down') {
                top = triggerBottom + offset;
                const maxTop = viewportBottom - cardHeight;
                top = Math.min(top, maxTop);
            } else {
                top = triggerTop - offset - cardHeight;
                const minTop = viewportTop;
                top = Math.max(top, minTop);
            }

            const maxTop = viewportBottom - cardHeight;
            const minTop = viewportTop;
            if (maxTop < minTop) {
                top = minTop;
            } else {
                top = Math.max(minTop, Math.min(top, maxTop));
            }

            quickNavOverlay.dataset.dropDirection = dropDirection;
            quickNavOverlay.style.top = `${top}px`;
            quickNavOverlay.style.left = `${left}px`;
        };

        const handleDocumentClick = (event) => {
            if (!quickNavOverlay.classList.contains('is-visible')) {
                return;
            }

            if (
                !quickNavOverlay.contains(event.target) &&
                event.target !== quickNavToggle
            ) {
                closeQuickNav();
            }
        };

        const openQuickNav = () => {
            if (quickNavOverlay.classList.contains('is-visible')) {
                return;
            }

            if (hideOverlayTimer) {
                clearTimeout(hideOverlayTimer);
                hideOverlayTimer = null;
            }

            lastFocusedElement = document.activeElement;
            quickNavOverlay.hidden = false;
            quickNavOverlay.style.visibility = 'hidden';
            quickNavOverlay.classList.remove('is-visible');
            quickNavOverlay.dataset.dropDirection = 'down';
            positionQuickNav();
            quickNavOverlay.style.visibility = '';

            requestAnimationFrame(() => {
                quickNavOverlay.classList.add('is-visible');
                quickNavToggle.setAttribute('aria-expanded', 'true');
                quickNavToggle.classList.add('is-open');
                positionQuickNav();
                const focusTarget = quickNavLinks.length ? quickNavLinks[0] : quickNavToggle;
                if (focusTarget && typeof focusTarget.focus === 'function') {
                    focusTarget.focus();
                }
            });

            document.addEventListener('click', handleDocumentClick);
            window.addEventListener('resize', handleWindowChange);
            window.addEventListener('scroll', handleScrollClose, { passive: true });
        };

        const closeQuickNav = () => {
            if (!quickNavOverlay.classList.contains('is-visible')) {
                return;
            }

            quickNavOverlay.classList.remove('is-visible');
            quickNavToggle.setAttribute('aria-expanded', 'false');
            quickNavToggle.classList.remove('is-open');

            document.removeEventListener('click', handleDocumentClick);
            window.removeEventListener('resize', handleWindowChange);
            window.removeEventListener('scroll', handleScrollClose);

            if (hideOverlayTimer) {
                clearTimeout(hideOverlayTimer);
                hideOverlayTimer = null;
            }

            hideOverlayTimer = setTimeout(() => {
                quickNavOverlay.hidden = true;
                quickNavOverlay.style.top = '';
                quickNavOverlay.style.left = '';
                delete quickNavOverlay.dataset.dropDirection;
                hideOverlayTimer = null;
            }, 200);

            if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
                lastFocusedElement.focus();
            }

            lastFocusedElement = null;
        };

        const toggleQuickNav = () => {
            if (hideOverlayTimer) {
                clearTimeout(hideOverlayTimer);
                hideOverlayTimer = null;
            }

            if (!quickNavOverlay.classList.contains('is-visible')) {
                openQuickNav();
            } else {
                closeQuickNav();
            }
        };

        const handleLinkClick = (event) => {
            const targetId = event.currentTarget.getAttribute('href');
            closeQuickNav();

            if (flashTimeout) {
                clearTimeout(flashTimeout);
            }

            if (targetId && targetId.startsWith('#')) {
                const section = document.querySelector(targetId);
                if (section) {
                    document.querySelectorAll('.quick-nav-flash').forEach((el) => {
                        if (el !== section) {
                            el.classList.remove('quick-nav-flash');
                        }
                    });
                    section.classList.add('quick-nav-flash');
                    flashTimeout = setTimeout(() => {
                        section.classList.remove('quick-nav-flash');
                        flashTimeout = null;
                    }, 1200);
                }
            }
        };

        quickNavToggle.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleQuickNav();
        });

        quickNavLinks.forEach((link) => {
            link.addEventListener('click', handleLinkClick);
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && quickNavOverlay.classList.contains('is-visible')) {
                closeQuickNav();
            }
        });
    }
});

// ========================================
// tsParticles 粒子背景初始化
// ========================================

window.addEventListener('DOMContentLoaded', function() {
    // 初始化 tsParticles - 閱讀與知識相遇風格
    tsParticles.load("tsparticles", {
        fullScreen: {
            enable: false,
            zIndex: 0
        },
        background: {
            color: {
                value: "#1a1a1a"
            }
        },
        fpsLimit: 30,
        particles: {
            number: {
                value: 40,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: ["#4ecdc4", "#f5a623", "#e91e8c"]
            },
            shape: {
                type: ["char", "char", "char", "char"],
                options: {
                    char: [
                        {
                            value: ["遇", "讀", "人"],
                            font: "Noto Sans TC",
                            weight: "500",
                            fill: true
                        },
                        {
                            value: ["📖", "✨", "💡"],
                            font: "Arial",
                            fill: true
                        }
                    ]
                }
            },
            opacity: {
                value: 0.6,
                random: true,
                anim: {
                    enable: true,
                    speed: 0.3,
                    opacity_min: 0.2,
                    sync: false
                }
            },
            size: {
                value: 12,
                random: {
                    enable: true,
                    minimumValue: 3
                },
                anim: {
                    enable: true,
                    speed: 1,
                    size_min: 3,
                    sync: false
                }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: "#4ecdc4",
                opacity: 0.25,
                width: 1
            },
            move: {
                enable: true,
                speed: 0.8,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out",
                bounce: false,
                attract: {
                    enable: true,
                    rotateX: 800,
                    rotateY: 1600
                }
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: {
                    enable: true,
                    mode: "grab"
                },
                onclick: {
                    enable: true,
                    mode: "push"
                },
                resize: true
            },
            modes: {
                grab: {
                    distance: 150,
                    line_linked: {
                        opacity: 0.4
                    }
                },
                push: {
                    particles_nb: 1,
                    quantity: 1
                }
            }
        },
        retina_detect: true
    });
});

// ========================================
// Header Stickers 碰撞效果 (Matter.js)
// ========================================

window.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('header-stickers-canvas');
    const header = document.querySelector('header');

    if (!canvas || !header) return;

    // Matter.js 模組
    const Engine = Matter.Engine;
    const Render = Matter.Render;
    const World = Matter.World;
    const Bodies = Matter.Bodies;
    const Runner = Matter.Runner;
    const Events = Matter.Events;

    // 建立引擎 - 無重力
    const engine = Engine.create({
        gravity: { x: 0, y: 0 } // 無重力
    });

    // 取得 header 尺寸
    const headerRect = header.getBoundingClientRect();

    // 建立渲染器
    const render = Render.create({
        canvas: canvas,
        engine: engine,
        options: {
            width: headerRect.width,
            height: headerRect.height,
            wireframes: false,
            background: 'transparent',
            pixelRatio: 1  // 固定為 1，避免縮放時大小變動
        }
    });

    // Stickers 圖片路徑
    const stickerPaths = [
        'stickers/sticker1.png',
        'stickers/sticker2.png',
        'stickers/sticker3.png',
        'stickers/sticker4.png',
        'stickers/sticker5.png',
        'stickers/sticker6.png',
        'stickers/s1.png',
        'stickers/s2.png',
        'stickers/s3.png',
    ];

    // 預載入圖片
    const stickerImages = [];
    let loadedCount = 0;

    stickerPaths.forEach((path, index) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            loadedCount++;
            if (loadedCount === stickerPaths.length) {
                initStickers();
            }
        };
        stickerImages.push(img);
    });

    function initStickers() {
        const stickers = [];
        const stickerSize = 60; // 貼紙大小 (固定像素)
        const stickerData = []; // 儲存貼紙資料以便 resize 使用

        // 創建邊界牆壁 (不可見)
        const wallThickness = 50;
        const headerWidth = headerRect.width;
        const headerHeight = headerRect.height;

        const walls = [
            // 上
            Bodies.rectangle(
                headerWidth / 2,
                -wallThickness / 2,
                headerWidth,
                wallThickness,
                { isStatic: true, render: { visible: false } }
            ),
            // 下
            Bodies.rectangle(
                headerWidth / 2,
                headerHeight + wallThickness / 2,
                headerWidth,
                wallThickness,
                { isStatic: true, render: { visible: false } }
            ),
            // 左
            Bodies.rectangle(
                -wallThickness / 2,
                headerHeight / 2,
                wallThickness,
                headerHeight,
                { isStatic: true, render: { visible: false } }
            ),
            // 右
            Bodies.rectangle(
                headerWidth + wallThickness / 2,
                headerHeight / 2,
                wallThickness,
                headerHeight,
                { isStatic: true, render: { visible: false } }
            )
        ];

        // 創建 sticker 物體
        stickerImages.forEach((img, index) => {
            // 隨機位置 (避開中央文字區域)
            let x, y;

            // 避開中央區域
            const centerX = headerWidth / 2;
            const centerY = headerHeight / 2;
            const avoidWidth = headerWidth * 0.5;
            const avoidHeight = headerHeight * 0.4;

            do {
                x = Math.random() * (headerWidth - 160) + 80;
                y = Math.random() * (headerHeight - 160) + 80;
            } while (
                x > centerX - avoidWidth / 2 &&
                x < centerX + avoidWidth / 2 &&
                y > centerY - avoidHeight / 2 &&
                y < centerY + avoidHeight / 2
            );

            // 隨機初始速度 (較快速度確保持續運動)
            const velocityX = (Math.random() - 0.5) * 4;
            const velocityY = (Math.random() - 0.5) * 4;

            const sticker = Bodies.circle(x, y, stickerSize / 2, {
                restitution: 1.0,    // 完全彈性 - 不損失能量
                friction: 0,         // 無摩擦力
                frictionAir: 0,      // 無空氣阻力
                density: 0.001,      // 密度
                render: {
                    sprite: {
                        texture: img.src,
                        xScale: stickerSize / img.width,
                        yScale: stickerSize / img.height
                    }
                }
            });

            // 設定初始速度
            Matter.Body.setVelocity(sticker, { x: velocityX, y: velocityY });

            // 添加旋轉
            Matter.Body.setAngularVelocity(sticker, (Math.random() - 0.5) * 0.03);

            // 儲存原始圖片尺寸和貼紙物件的對應關係
            stickerData.push({
                body: sticker,
                imgWidth: img.width,
                imgHeight: img.height
            });

            stickers.push(sticker);
        });

        // 將所有物體加入世界
        World.add(engine.world, [...walls, ...stickers]);

        // 維持速度恆定 (補償能量損失)
        Events.on(engine, 'beforeUpdate', () => {
            stickers.forEach(sticker => {
                const minSpeed = 2;
                const maxSpeed = 5;
                const velocity = sticker.velocity;
                const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);

                // 如果速度太慢，補充能量
                if (speed < minSpeed) {
                    const angle = Math.random() * Math.PI * 2;
                    Matter.Body.setVelocity(sticker, {
                        x: Math.cos(angle) * minSpeed,
                        y: Math.sin(angle) * minSpeed
                    });
                }

                // 限制最大速度
                if (speed > maxSpeed) {
                    Matter.Body.setVelocity(sticker, {
                        x: (velocity.x / speed) * maxSpeed,
                        y: (velocity.y / speed) * maxSpeed
                    });
                }

                // 限制旋轉速度
                const maxAngularSpeed = 0.05;
                if (Math.abs(sticker.angularVelocity) > maxAngularSpeed) {
                    Matter.Body.setAngularVelocity(
                        sticker,
                        Math.sign(sticker.angularVelocity) * maxAngularSpeed
                    );
                }
            });
        });

        // 啟動渲染器和引擎
        Render.run(render);
        const runner = Runner.create();
        Runner.run(runner, engine);

        // 視窗大小改變時重新調整
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const newRect = header.getBoundingClientRect();

                // 更新 canvas 尺寸
                render.canvas.width = newRect.width;
                render.canvas.height = newRect.height;
                render.options.width = newRect.width;
                render.options.height = newRect.height;

                // 移除舊牆壁
                World.remove(engine.world, walls);

                // 創建新牆壁（使用新尺寸）
                const newWalls = [
                    // 上
                    Bodies.rectangle(
                        newRect.width / 2,
                        -wallThickness / 2,
                        newRect.width,
                        wallThickness,
                        { isStatic: true, render: { visible: false } }
                    ),
                    // 下
                    Bodies.rectangle(
                        newRect.width / 2,
                        newRect.height + wallThickness / 2,
                        newRect.width,
                        wallThickness,
                        { isStatic: true, render: { visible: false } }
                    ),
                    // 左
                    Bodies.rectangle(
                        -wallThickness / 2,
                        newRect.height / 2,
                        wallThickness,
                        newRect.height,
                        { isStatic: true, render: { visible: false } }
                    ),
                    // 右
                    Bodies.rectangle(
                        newRect.width + wallThickness / 2,
                        newRect.height / 2,
                        wallThickness,
                        newRect.height,
                        { isStatic: true, render: { visible: false } }
                    )
                ];

                // 更新牆壁陣列引用
                walls.length = 0;
                walls.push(...newWalls);

                // 加入新牆壁到世界
                World.add(engine.world, newWalls);

                // 約束貼紙位置，確保它們在新邊界內
                const margin = stickerSize;
                stickerData.forEach(data => {
                    const pos = data.body.position;
                    let newX = pos.x;
                    let newY = pos.y;

                    // 檢查並調整 X 座標
                    if (newX < margin) {
                        newX = margin;
                    } else if (newX > newRect.width - margin) {
                        newX = newRect.width - margin;
                    }

                    // 檢查並調整 Y 座標
                    if (newY < margin) {
                        newY = margin;
                    } else if (newY > newRect.height - margin) {
                        newY = newRect.height - margin;
                    }

                    // 如果位置需要調整，更新貼紙位置
                    if (newX !== pos.x || newY !== pos.y) {
                        Matter.Body.setPosition(data.body, { x: newX, y: newY });
                    }

                    // 重新設定貼紙的縮放比例（保持固定大小）
                    data.body.render.sprite.xScale = stickerSize / data.imgWidth;
                    data.body.render.sprite.yScale = stickerSize / data.imgHeight;
                });
            }, 250);
        });
    }
});
