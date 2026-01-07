
document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const fileInput = document.getElementById('jsonInput');
    const fileInfo = document.getElementById('fileInfo');
    const uploadText = document.getElementById('uploadText');
    const renderBtn = document.getElementById('renderBtn');

    // Containers
    const waMessages = document.getElementById('waMessages');
    const igMessages = document.getElementById('igMessages');

    const chatNameInput = document.getElementById('chatName');
    const headerNameDisplay = document.querySelectorAll('.header-name-display');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const pfpInput = document.getElementById('pfpInput');
    const keyboardToggle = document.getElementById('keyboardToggle');

    // Tabs & Text Input
    const tabUpload = document.getElementById('tabUpload');
    const tabPaste = document.getElementById('tabPaste');
    const viewUpload = document.getElementById('viewUpload');
    const viewPaste = document.getElementById('viewPaste');
    const jsonText = document.getElementById('jsonText');

    let currentData = null;
    let inputMode = 'upload';

    // Tab Switching
    function switchTab(mode) {
        inputMode = mode;
        if (mode === 'upload') {
            tabUpload.classList.add('active');
            tabPaste.classList.remove('active');
            viewUpload.style.display = 'block';
            viewPaste.style.display = 'none';
        } else {
            tabUpload.classList.remove('active');
            tabPaste.classList.add('active');
            viewUpload.style.display = 'none';
            viewPaste.style.display = 'block';
        }
    }

    tabUpload.addEventListener('click', () => switchTab('upload'));
    tabPaste.addEventListener('click', () => switchTab('paste'));

    // Dark Mode Toggle
    darkModeToggle.addEventListener('change', (e) => {
        document.body.classList.toggle('dark-mode', e.target.checked);
    });

    // Keyboard Toggle
    keyboardToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            whatsappChat.classList.add('show-keyboard');
            document.getElementById('instagramChat').classList.add('show-keyboard');
        } else {
            whatsappChat.classList.remove('show-keyboard');
            document.getElementById('instagramChat').classList.remove('show-keyboard');
        }

        // Scroll to bottom whenever view changes
        setTimeout(() => {
            waMessages.scrollTop = waMessages.scrollHeight;
            igMessages.scrollTop = igMessages.scrollHeight;
        }, 50);
    });

    // Default chat name update
    chatNameInput.addEventListener('input', (e) => {
        headerNameDisplay.forEach(el => el.textContent = e.target.value);
    });

    // Profile Picture Update
    pfpInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const avatarDivs = document.querySelectorAll('.avatar-placeholder, .ig-avatar-header');
            avatarDivs.forEach(div => {
                div.innerHTML = `<img src="${event.target.result}" alt="Profile">`;
                div.style.background = 'transparent';
            });

            // Update existing message avatars immediately
            const msgAvatars = document.querySelectorAll('.ig-avatar-msg');
            msgAvatars.forEach(div => {
                div.innerHTML = `<img src="${event.target.result}" alt="Profile">`;
            });

            window.currentPfpSrc = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    // Handle File Selection
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) {
            fileInfo.textContent = "No file selected";
            return;
        }

        fileInfo.textContent = file.name;
        uploadText.textContent = "Change File";

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                currentData = JSON.parse(event.target.result);
            } catch (error) {
                alert('Invalid JSON file');
                console.error(error);
            }
        };
        reader.readAsText(file);
    });

    // Render Button Click
    renderBtn.addEventListener('click', () => {
        if (inputMode === 'paste') {
            try {
                const text = jsonText.value.trim();
                if (!text) {
                    alert('Please paste some JSON code');
                    return;
                }
                const data = JSON.parse(text);
                renderBoth(data);
            } catch (e) {
                alert('Invalid JSON Code: ' + e.message);
            }
        } else {
            if (currentData) {
                renderBoth(currentData);
            } else {
                alert('Please select a JSON file first');
            }
        }
    });

    function renderBoth(data) {
        if (!Array.isArray(data)) {
            alert('JSON must be an array of messages');
            return;
        }
        window.FULL_CHAT_DATA = data; // Store globally for recording
        renderWhatsApp(data);
        renderInstagram(data);
    }

    // Generic Renderers
    function createWAMessage(msg) {
        const messageDiv = document.createElement('div');
        const isMe = msg.isMe || msg.sender === 'Me';
        messageDiv.className = `message ${isMe ? 'outgoing' : 'incoming'}`;
        messageDiv.innerHTML = `
            <div class="bubble">
                <span class="text">${escapeHtml(msg.message)}</span>
                <span class="meta">
                    ${msg.timestamp}
                    ${isMe ? '<i class="ph ph-checks" style="color: #34B7F1; font-weight: bold;"></i>' : ''}
                </span>
            </div>
        `;
        return messageDiv;
    }

    function createIGMessage(msg) {
        const pfpSrc = window.currentPfpSrc || null;
        const messageDiv = document.createElement('div');
        const isMe = msg.isMe || msg.sender === 'Me';
        messageDiv.className = `message ${isMe ? 'outgoing' : 'incoming'}`;

        let avatarHtml = '';
        if (!isMe) {
            if (pfpSrc) {
                avatarHtml = `<div class="ig-avatar-msg"><img src="${pfpSrc}"></div>`;
            } else {
                avatarHtml = `<div class="ig-avatar-msg" style="display:flex;align-items:center;justify-content:center;font-size:10px;color:white;font-weight:bold;">A</div>`;
            }
        }

        messageDiv.innerHTML = `
            ${avatarHtml}
            <div class="bubble">
                <span class="text">${escapeHtml(msg.message)}</span>
            </div>
        `;
        return messageDiv;
    }

    function renderWhatsApp(data) {
        waMessages.innerHTML = '<div class="date-divider"><span>Today</span></div>';
        data.forEach(msg => {
            waMessages.appendChild(createWAMessage(msg));
        });
        waMessages.scrollTop = waMessages.scrollHeight;
    }

    function renderInstagram(data) {
        igMessages.innerHTML = '<div class="date-divider"><span>Today</span></div>';
        data.forEach(msg => {
            igMessages.appendChild(createIGMessage(msg));
        });
        igMessages.scrollTop = igMessages.scrollHeight;
    }

    // Utility: Escape HTML to prevent XSS
    function escapeHtml(unsafe) {
        return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    // Download Screenshot
    document.querySelectorAll('.download-action').forEach(btn => {
        btn.addEventListener('click', async () => {
            const targetId = btn.getAttribute('data-target');
            const element = document.getElementById(targetId);
            const originalText = btn.innerHTML;
            try {
                btn.disabled = true;
                btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Generating...';
                const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: null });
                const link = document.createElement('a');
                link.download = `${targetId}-${Date.now()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (err) {
                console.error('Screenshot failed:', err);
                alert('Failed to generate screenshot');
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        });
    });

    // --- VIDEO RECORDING & SIMULATION ---

    document.querySelectorAll('.record-action').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!window.FULL_CHAT_DATA) {
                alert('Please render a chat first!');
                return;
            }

            // Audio Objects
            const typingAudio = new Audio('typing.mp3');
            const msgAudio = new Audio('msg.mp3');
            typingAudio.loop = true;

            // Helper to play sounds safely
            const playSound = async (audio) => {
                try {
                    audio.currentTime = 0;
                    await audio.play();
                } catch (e) { console.warn("Audio play failed", e); }
            };
            const stopSound = (audio) => {
                try {
                    audio.pause();
                    audio.currentTime = 0;
                } catch (e) { }
            };

            const targetId = btn.getAttribute('data-target');
            const type = btn.getAttribute('data-type'); // 'whatsapp' or 'instagram'
            const container = document.getElementById(targetId);
            const messagesContainer = targetId === 'whatsappChat' ? waMessages : igMessages;
            const inputField = container.querySelector(type === 'whatsapp' ? '.input-field' : '.ig-field .placeholder-text'); // Simple selector logic

            // 1. SELECT SCREEN
            let stream;
            try {
                stream = await navigator.mediaDevices.getDisplayMedia({
                    video: { cursor: "always" },
                    audio: false
                });
            } catch (err) {
                console.error("Error selecting stream:", err);
                return;
            }

            // 2. START RECORDER
            const mimeType = MediaRecorder.isTypeSupported("video/webm; codecs=vp9")
                ? "video/webm; codecs=vp9"
                : "video/webm";
            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            const chunks = [];
            mediaRecorder.ondataavailable = e => chunks.push(e.data);
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: mimeType });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `chat-simulation-${Date.now()}.webm`;
                a.click();

                // Restore state
                // renderBoth(window.FULL_CHAT_DATA); 
                alert('Recording finished! Download started.');
            };

            mediaRecorder.start();

            // 3. START SIMULATION
            // Clear current messages
            messagesContainer.innerHTML = '<div class="date-divider"><span>Today</span></div>';

            // Helper to wait
            const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

            // Run Sequence
            for (const msg of window.FULL_CHAT_DATA) {
                const isMe = msg.isMe || msg.sender === 'Me';
                const text = msg.message;

                if (isMe) {
                    // Simulate Typing in Input
                    // Note: Implementation differs slightly per UI structure
                    // For now, simpler simulation:

                    // A. Typing Simulation (Char by Char)
                    const typingSpeed = 50; // ms per char

                    playSound(typingAudio); // START TYPING SOUND

                    if (type === 'whatsapp') {
                        // WhatsApp - Full Screen Mode Logic
                        const originalContent = inputField.innerHTML;
                        const inputBar = container.querySelector('.chat-input-bar');
                        const micIcon = inputBar.querySelector('.ph-microphone');
                        const cameraIcon = inputBar.querySelector('.ph-camera');

                        // 1. Hide external icons to expand space
                        if (micIcon) micIcon.style.display = 'none';
                        if (cameraIcon) cameraIcon.style.display = 'none';

                        // Setup Typing DOM - Remove Sticker, Use simple span
                        inputField.innerHTML = '';
                        // Reset any weird styles
                        inputField.removeAttribute('style');

                        const textSpan = document.createElement('span');
                        // Allow full width
                        textSpan.style.cssText = "display: block; width: 100%; padding-left: 12px; padding-right: 12px; font-size: 15px; color: black; white-space: nowrap; overflow: hidden;";
                        inputField.appendChild(textSpan);

                        let currentTyped = "";

                        for (let char of text) {
                            currentTyped += char;
                            const maxChars = 34; // Wider limit for full screen mode
                            const visualText = currentTyped.length > maxChars ? currentTyped.slice(-maxChars) : currentTyped;
                            textSpan.textContent = visualText;
                            await wait(typingSpeed + (Math.random() * 50));
                        }

                        await wait(300);

                        // Restore Everything
                        inputField.innerHTML = originalContent;
                        inputField.removeAttribute('style');
                        if (micIcon) micIcon.style.display = '';
                        if (cameraIcon) cameraIcon.style.display = '';

                    } else {
                        // Instagram
                        const oldText = inputField.textContent; // This might be just text or text node
                        const originalContent = inputField.innerHTML; // Capture full HTML just in case (though IG field only has text and icons are separate?)
                        // Wait, looking at HTML structure:
                        // .ig-field contains span.placeholder-text AND icons i.ph-image, i.ph-sticker etc.
                        // "const inputField" in my code selects ".ig-field .placeholder-text" specifically?
                        // Let's check selection logic in lines 259: 
                        // const inputField = container.querySelector(type === 'whatsapp' ? '.input-field' : '.ig-field .placeholder-text');

                        // If I replace textContent of .placeholder-text, it shouldn't shift icons if it's flex: 1.
                        // But I should ensure min-width: 0 on it.

                        inputField.style.color = 'black';
                        inputField.style.minWidth = '0'; // Prevent overflow expansion

                        let currentTyped = "";

                        for (let char of text) {
                            currentTyped += char;
                            const maxChars = 28;
                            const visualText = currentTyped.length > maxChars ? currentTyped.slice(-maxChars) : currentTyped;
                            inputField.textContent = visualText;
                            await wait(typingSpeed + (Math.random() * 50));
                        }

                        await wait(300);
                        inputField.textContent = oldText;
                        inputField.style.color = '';
                    }

                    stopSound(typingAudio); // STOP TYPING SOUND

                    // B. Send Message
                    const el = type === 'whatsapp' ? createWAMessage(msg) : createIGMessage(msg);
                    messagesContainer.appendChild(el);
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;

                    await wait(800); // Wait bit after sending before next

                } else {
                    // Incoming

                    // A. Typing Simulation: Header Status + Bubble

                    // 1. Header Status (Typing...)
                    let statusEl = null;
                    let originalStatusText = "";

                    if (type === 'whatsapp') {
                        // WhatsApp Header Selection - Target .header-info explicitly
                        const headerInfo = container.querySelector('.header-info');
                        if (headerInfo) {
                            // WA Name is H2. We need to create/find 'p' for status
                            // Check if p exists
                            let statusP = headerInfo.querySelector('p');
                            if (!statusP) {
                                statusP = document.createElement('p');
                                statusP.style.margin = '0';
                                statusP.style.fontSize = '12px';
                                statusP.style.marginTop = '2px';
                                headerInfo.appendChild(statusP);
                            }

                            statusEl = statusP;
                            originalStatusText = statusEl.textContent; // Capture existing "Online" etc
                            statusEl.textContent = "typing...";
                            statusEl.style.color = '#007AFF'; // Active color
                        }
                    } else {
                        // Instagram Header Logic
                        statusEl = container.querySelector('.header-info .sub-text');
                        if (statusEl) {
                            originalStatusText = statusEl.textContent;
                            statusEl.textContent = "Typing...";
                        }
                    }

                    // 2. Typing Bubble (Visual Indicator in Chat)
                    const bubble = document.createElement('div');
                    bubble.className = "message incoming";
                    const bubbleContent = document.createElement('div');
                    bubbleContent.className = "bubble typing-bubble";
                    bubbleContent.innerHTML = `
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    `;

                    if (type === 'instagram') {
                        const avatar = document.createElement('div');
                        avatar.className = 'avatar-small';
                        avatar.textContent = (msg.sender || "A")[0];
                        bubble.appendChild(avatar);
                        bubble.appendChild(bubbleContent);
                    } else {
                        // WA
                        bubble.appendChild(bubbleContent);
                    }

                    messagesContainer.appendChild(bubble);
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;

                    // B. Wait 1 second (as requested)
                    await wait(1000);

                    // C. Cleanup: Remove Bubble & Restore Status
                    bubble.remove();
                    if (statusEl) {
                        statusEl.textContent = originalStatusText;
                        if (type === 'whatsapp' && originalStatusText === "") statusEl.textContent = "";
                    }

                    const el = type === 'whatsapp' ? createWAMessage(msg) : createIGMessage(msg);
                    messagesContainer.appendChild(el);
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    playSound(msgAudio); // PLAY RECEIVE SOUND

                    await wait(800);
                }
            }

            // 4. STOP RECORDER (After slight buffer)
            await wait(2000);
            mediaRecorder.stop();
            stream.getTracks().forEach(track => track.stop()); // Stop sharing
        });
    });

});
