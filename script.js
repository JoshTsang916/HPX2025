// ========================================
// HPX 2025 活動報名表單處理
// ========================================

// 表單提交處理
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registration-form');
    const submitBtn = document.getElementById('submit-btn');
    const submitMessage = document.getElementById('submit-message');
    let isSubmitting = false;

    // 表單送出事件監聽
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // 防止重複送出
        if (isSubmitting) {
            console.warn('表單正在送出中，請勿重複提交');
            return;
        }

        // 設定送出狀態
        setSubmittingState(true);

        // 收集表單資料
        const formData = collectFormData();

        try {
            // 發送到 webhook
            await sendToWebhook(formData);

            // 顯示成功訊息
            showSuccessMessage();

            // 清空表單
            form.reset();

            // 5 秒後恢復按鈕狀態
            setTimeout(() => {
                hideMessage();
                setSubmittingState(false);
            }, 5000);

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
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
            submitBtn.textContent = '確認送出報名';
        }
    }

    /**
     * 顯示成功訊息
     */
    function showSuccessMessage() {
        submitMessage.style.display = 'block';
        submitMessage.style.color = '#4ecdc4';
        submitMessage.innerHTML = '✓ 報名成功！我們將在 2-3 個工作天內寄送確認信至您的 Email。';
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
});

// ========================================
// tsParticles 粒子背景初始化
// ========================================

window.addEventListener('DOMContentLoaded', function() {
    // 初始化 tsParticles - AI 電路板風格
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
        fpsLimit: 60,
        particles: {
            number: {
                value: 80,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: ["#4ecdc4", "#f5a623", "#e91e8c"]
            },
            shape: {
                type: ["circle", "triangle"],
            },
            opacity: {
                value: 0.5,
                random: true,
                anim: {
                    enable: true,
                    speed: 0.5,
                    opacity_min: 0.1,
                    sync: false
                }
            },
            size: {
                value: 3,
                random: true,
                anim: {
                    enable: true,
                    speed: 2,
                    size_min: 0.5,
                    sync: false
                }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: "#4ecdc4",
                opacity: 0.3,
                width: 1
            },
            move: {
                enable: true,
                speed: 1.5,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out",
                bounce: false,
                attract: {
                    enable: true,
                    rotateX: 600,
                    rotateY: 1200
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
                    distance: 200,
                    line_linked: {
                        opacity: 0.6
                    }
                },
                push: {
                    particles_nb: 4
                }
            }
        },
        retina_detect: true
    });
});
