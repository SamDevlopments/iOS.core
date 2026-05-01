document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const uploadCard = document.querySelector('.upload-card');
    const quickActionsMenu = document.getElementById('quickActionsMenu');
    const subjectActionsMenu = document.getElementById('subjectActionsMenu');
    const selectionActionsMenu = document.getElementById('selectionActionsMenu');
    const errorAlert = document.getElementById('errorAlert');
    const backgroundInput = document.getElementById('backgroundInput');
    const subjectInput = document.getElementById('subjectInput');
    const aiModeInput = document.getElementById('aiModeInput');
    const subjectLayer = document.getElementById('subjectLayer');
    const optionsMenu = document.getElementById('optionsMenu');
    const optionsBtn = document.querySelector('.options-btn');
    const closeOptionsMenu = document.getElementById('closeOptionsMenu');
    const reloadBtn = document.getElementById('reloadBtn');
    const borderTypeSelect = document.getElementById('borderTypeSelect');
    const handleTypeSelect = document.getElementById('handleTypeSelect');
    const accentPreview = document.getElementById('accentPreview');
    const colorPalette = document.getElementById('colorPalette');
    const customColorPicker = document.getElementById('customColorPicker');
    
    // Menu elements
    const backgroundOption = document.getElementById('backgroundOption');
    const subjectOption = document.getElementById('subjectOption');
    const closeMenu = document.getElementById('closeMenu');
    const closeSubjectMenu = document.getElementById('closeSubjectMenu');
    const duplicateSelectionOption = document.getElementById('duplicateSelectionOption');
    const deleteSelectionOption = document.getElementById('deleteSelectionOption');
    const closeSelectionMenu = document.getElementById('closeSelectionMenu');
    const errorOkButton = document.getElementById('errorOkButton');
    
    // State
    let backgroundImage = null;
    let subjectImage = null;
    let isTransforming = false;
    let currentSubject = null;
    let transformOverlay = null;
    let selectedPhotos = new Set();
    let aiModeEnabled = true;
    
    // Selection settings
    let borderType = 'dashed';
    let handleType = 'rectangle';
    
    // Accent color settings
    let accentColor = '#007AFF';
    
    // Track cutouts and selections
    let cutouts = [];
    let activeSelection = null;
    let isSelecting = false;
    let selectionStart = { x: 0, y: 0 };
    let uploadedImage = null;
    let uploadedImageData = null;
    
    // Initialize upload card click - simple single image upload
    uploadCard.addEventListener('click', function(e) {
        aiModeInput.click();
    });
    
    // Options button handler
    optionsBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        showOptionsMenu();
    });
    
    // Close options menu handler
    closeOptionsMenu.addEventListener('click', hideOptionsMenu);
    optionsMenu.querySelector('.menu-backdrop').addEventListener('click', hideOptionsMenu);
    
    // Reload button handler - reset everything
    reloadBtn.addEventListener('click', function() {
        reloadSection();
    });
    
    // Quick Actions Menu handlers
    backgroundOption.addEventListener('click', function() {
        backgroundInput.click();
        hideQuickActionsMenu();
    });
    
    subjectOption.addEventListener('click', function() {
        if (backgroundImage) {
            subjectInput.click();
            hideQuickActionsMenu();
        } else {
            showErrorAlert();
        }
    });
    
    closeMenu.addEventListener('click', hideQuickActionsMenu);
    errorOkButton.addEventListener('click', hideErrorAlert);
    
    // Subject Actions Menu handlers
    closeSubjectMenu.addEventListener('click', hideSubjectActionsMenu);
    
    // Selection Actions Menu handlers
    duplicateSelectionOption.addEventListener('click', duplicateSelection);
    deleteSelectionOption.addEventListener('click', deleteSelection);
    closeSelectionMenu.addEventListener('click', hideSelectionActionsMenu);
    
    // Selection settings handlers
    borderTypeSelect.addEventListener('change', function(e) {
        borderType = e.target.value;
        updateSelectionStyles();
    });
    
    handleTypeSelect.addEventListener('change', function(e) {
        handleType = e.target.value;
        updateSelectionStyles();
    });
    
    function getBorderStyle(type) {
        switch(type) {
            case 'none': return 'none';
            case 'dashed': return '2px dashed';
            case 'broken': return '3px dotted';
            case 'phantom': return '1px solid rgba(255, 255, 255, 0.3)';
            case 'dash-dot': return '2px dashed';
            default: return '2px dashed';
        }
    }
    
    function getBorderAnimation(type) {
        switch(type) {
            case 'none': return 'none';
            case 'dashed': return 'marchingAnts 1s linear infinite';
            case 'broken': return 'marchingAnts 0.5s linear infinite';
            case 'phantom': return 'phantomPulse 2s ease-in-out infinite';
            case 'dash-dot': return 'dashDotMove 1.5s linear infinite';
            default: return 'marchingAnts 1s linear infinite';
        }
    }
    
    function getHandleStyle(type) {
        switch(type) {
            case 'none': return 'none';
            case 'rectangle': return 'rectangle';
            case 'circle': return 'circle';
            default: return 'rectangle';
        }
    }
    
    function updateSelectionStyles() {
        // Update cutouts
        cutouts.forEach(cutout => {
            if (cutout.overlay) {
                const borderStyle = getBorderStyle(borderType);
                const animationStyle = getBorderAnimation(borderType);
                cutout.overlay.style.border = borderStyle !== 'none' ? `${borderStyle} ${accentColor}` : 'none';
                cutout.overlay.style.animation = animationStyle;
            }
            
            // Update handles
            if (cutout.overlay) {
                const handles = cutout.overlay.querySelectorAll('.transform-handle');
                handles.forEach(handle => {
                    // Remove existing handle type classes
                    handle.classList.remove('none', 'rectangle', 'circle');
                    // Add new handle type class
                    handle.classList.add(getHandleStyle(handleType));
                    // Update color
                    handle.style.background = accentColor;
                });
            }
        });
        
        // Update active selection if exists
        if (activeSelection) {
            const borderStyle = getBorderStyle(borderType);
            const animationStyle = getBorderAnimation(borderType);
            activeSelection.style.border = borderStyle !== 'none' ? `${borderStyle} ${accentColor}` : 'none';
            activeSelection.style.animation = animationStyle;
            
            // Update selection handles
            const handles = activeSelection.querySelectorAll('.transform-handle');
            handles.forEach(handle => {
                // Remove existing handle type classes
                handle.classList.remove('none', 'rectangle', 'circle');
                // Add new handle type class
                handle.classList.add(getHandleStyle(handleType));
                // Update color
                handle.style.background = accentColor;
            });
        }
    }
    
    function updateAccentColor(color) {
        accentColor = color;
        accentPreview.style.background = color;
        
        // Update CSS variables
        document.documentElement.style.setProperty('--system-blue', color);
        
        // Update selection styles
        updateSelectionStyles();
    }
    
    // Accent color palette handlers
    colorPalette.addEventListener('click', function(e) {
        if (e.target.classList.contains('color-option')) {
            const color = e.target.dataset.color;
            
            // Update selected state
            document.querySelectorAll('.color-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            e.target.classList.add('selected');
            
            updateAccentColor(color);
        }
    });
    
    // Custom color picker handler
    customColorPicker.addEventListener('change', function(e) {
        const color = e.target.value;
        
        // Remove selected state from palette options
        document.querySelectorAll('.color-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        updateAccentColor(color);
    });
    
    // Initialize accent color preview
    accentPreview.style.background = accentColor;
    
    // Set initial selected palette option
    document.querySelector('.color-option[data-color="#007AFF"]').classList.add('selected');
    
    // Collapsible sections functionality
    function toggleSection(sectionId) {
        const section = document.getElementById(sectionId);
        const header = section.querySelector('.section-header');
        const content = section.querySelector('.section-content');
        
        if (content.style.display === 'none') {
            // Expand section
            content.style.display = 'block';
            header.classList.add('expanded');
            content.classList.add('expanded');
            
            // Smooth expand animation
            setTimeout(() => {
                content.style.maxHeight = content.scrollHeight + 'px';
            }, 10);
        } else {
            // Collapse section
            content.style.maxHeight = '0';
            header.classList.remove('expanded');
            content.classList.remove('expanded');
            
            // Hide after animation
            setTimeout(() => {
                content.style.display = 'none';
            }, 300);
        }
    }
    
    // Add click handlers to section headers
    document.querySelectorAll('.section-header').forEach(header => {
        header.addEventListener('click', function() {
            const sectionId = this.dataset.section;
            toggleSection(sectionId);
        });
    });
    
    // File input handlers
    backgroundInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            processBackgroundImage(file);
        }
    });
    
    subjectInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            processSubjectImage(file);
        }
    });
    
    // Image upload handler - load image and enable selection mode
    aiModeInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            loadImageForSelection(file);
        }
    });
    
    // Menu backdrop clicks
    quickActionsMenu.querySelector('.menu-backdrop').addEventListener('click', hideQuickActionsMenu);
    subjectActionsMenu.querySelector('.menu-backdrop').addEventListener('click', hideSubjectActionsMenu);
    selectionActionsMenu.querySelector('.menu-backdrop').addEventListener('click', hideSelectionActionsMenu);
    
    function showQuickActionsMenu(x, y) {
        const menuContainer = quickActionsMenu.querySelector('.menu-container');
        quickActionsMenu.classList.add('show');
        
        // Position menu exactly at click location
        const menuWidth = 200;
        const menuHeight = 180;
        let left = x;
        let top = y;
        
        // Adjust to keep menu within viewport
        if (left + menuWidth > window.innerWidth) {
            left = window.innerWidth - menuWidth - 10;
        }
        if (top + menuHeight > window.innerHeight) {
            top = window.innerHeight - menuHeight - 10;
        }
        if (left < 10) left = 10;
        if (top < 10) top = 10;
        
        menuContainer.style.left = left + 'px';
        menuContainer.style.top = top + 'px';
        
        // Enable/disable subject option based on background
        subjectOption.disabled = !backgroundImage;
    }
    
    function hideQuickActionsMenu() {
        quickActionsMenu.classList.remove('show');
    }
    
    function showSubjectActionsMenu(x, y) {
        const menuContainer = subjectActionsMenu.querySelector('.menu-container');
        subjectActionsMenu.classList.add('show');
        
        // Position menu exactly at click location
        const menuWidth = 200;
        const menuHeight = 120;
        let left = x;
        let top = y;
        
        // Adjust to keep menu within viewport
        if (left + menuWidth > window.innerWidth) {
            left = window.innerWidth - menuWidth - 10;
        }
        if (top + menuHeight > window.innerHeight) {
            top = window.innerHeight - menuHeight - 10;
        }
        if (left < 10) left = 10;
        if (top < 10) top = 10;
        
        menuContainer.style.left = left + 'px';
        menuContainer.style.top = top + 'px';
    }
    
    function hideSubjectActionsMenu() {
        subjectActionsMenu.classList.remove('show');
    }
    
    function showSelectionActionsMenu(x, y) {
        const menuContainer = selectionActionsMenu.querySelector('.menu-container');
        selectionActionsMenu.classList.add('show');
        
        // Position menu exactly at touch/click location
        const menuWidth = 200;
        const menuHeight = 120;
        let left = x;
        let top = y;
        
        // Adjust to keep menu within viewport
        if (left + menuWidth > window.innerWidth) {
            left = window.innerWidth - menuWidth - 10;
        }
        if (top + menuHeight > window.innerHeight) {
            top = window.innerHeight - menuHeight - 10;
        }
        if (left < 10) left = 10;
        if (top < 10) top = 10;
        
        menuContainer.style.left = left + 'px';
        menuContainer.style.top = top + 'px';
    }
    
    function hideSelectionActionsMenu() {
        selectionActionsMenu.classList.remove('show');
    }
    
    function duplicateSelection() {
        // Handle cutout duplication (stored in menu data)
        const menuContainer = selectionActionsMenu.querySelector('.menu-container');
        const cutoutId = menuContainer.dataset.cutoutId;
        
        if (cutoutId) {
            // Find original cutout
            const originalCutout = cutouts.find(cutout => cutout.id === cutoutId);
            
            if (originalCutout) {
                // Create duplicate cutout with offset position
                const originalRect = originalCutout.container.getBoundingClientRect();
                const offsetX = 20; // Offset to show it's a duplicate
                const offsetY = 20;
                
                // Create new cutout container
                const newCutoutId = 'cutout-' + Date.now();
                const newCutoutContainer = document.createElement('div');
                newCutoutContainer.id = newCutoutId;
                newCutoutContainer.className = 'cutout-container';
                newCutoutContainer.style.cssText = `
                    position: fixed;
                    left: ${originalRect.left + offsetX}px;
                    top: ${originalRect.top + offsetY}px;
                    width: ${originalRect.width}px;
                    height: ${originalRect.height}px;
                    z-index: 1000;
                    user-select: none;
                    -webkit-user-select: none;
                    touch-action: none;
                    pointer-events: auto;
                `;
                
                // Add duplicate image
                const newCutoutImg = document.createElement('img');
                newCutoutImg.src = originalCutout.dataUrl;
                newCutoutImg.className = 'cutout-image';
                newCutoutImg.style.cssText = `
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 8px;
                `;
                
                // Add transform overlay
                const newTransformOverlay = document.createElement('div');
                newTransformOverlay.className = 'image-transform-overlay';
                const borderStyle = getBorderStyle(borderType);
                const animationStyle = getBorderAnimation(borderType);
                newTransformOverlay.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border: ${borderStyle !== 'none' ? `${borderStyle} ${accentColor}` : 'none'};
                    border-radius: 8px;
                    cursor: move;
                    pointer-events: auto;
                    animation: ${animationStyle};
                `;
                
                // Add corner handles
                const handles = ['nw', 'ne', 'sw', 'se'];
                handles.forEach(pos => {
                    const handle = document.createElement('div');
                    handle.className = `transform-handle ${pos} ${getHandleStyle(handleType)}`;
                    handle.style.background = accentColor;
                    
                    newTransformOverlay.appendChild(handle);
                });
                
                // Assemble duplicate cutout
                newCutoutContainer.appendChild(newCutoutImg);
                newCutoutContainer.appendChild(newTransformOverlay);
                
                // Add to subject layer
                subjectLayer.appendChild(newCutoutContainer);
                
                // Track duplicate cutout
                cutouts.push({
                    id: newCutoutId,
                    container: newCutoutContainer,
                    image: newCutoutImg,
                    overlay: newTransformOverlay,
                    dataUrl: originalCutout.dataUrl
                });
                
                // Make duplicate draggable and resizable
                makeCutoutDraggable(newCutoutContainer, newTransformOverlay);
                makeCutoutResizable(newTransformOverlay, newCutoutContainer, newCutoutImg);
                
                // Add long press detection to duplicate
                let longPressTimer;
                let longPressX, longPressY;
                
                function startDuplicateLongPress(e) {
                    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
                    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
                    
                    longPressX = clientX;
                    longPressY = clientY;
                    
                    longPressTimer = setTimeout(() => {
                        const menuContainer = selectionActionsMenu.querySelector('.menu-container');
                        menuContainer.dataset.cutoutId = newCutoutId;
                        showSelectionActionsMenu(clientX, clientY);
                    }, 500);
                }
                
                function cancelDuplicateLongPress() {
                    if (longPressTimer) {
                        clearTimeout(longPressTimer);
                        longPressTimer = null;
                    }
                }
                
                // Add long press events to duplicate overlay
                newTransformOverlay.addEventListener('mousedown', startDuplicateLongPress);
                newTransformOverlay.addEventListener('touchstart', startDuplicateLongPress, { passive: false });
                newTransformOverlay.addEventListener('mouseup', cancelDuplicateLongPress);
                newTransformOverlay.addEventListener('mouseleave', cancelDuplicateLongPress);
                newTransformOverlay.addEventListener('touchend', cancelDuplicateLongPress);
                newTransformOverlay.addEventListener('touchmove', cancelDuplicateLongPress, { passive: false });
                
                console.log('Cutout duplicated:', newCutoutId);
            }
        }
        
        hideSelectionActionsMenu();
    }
    
    function deleteSelection() {
        // Handle active selection deletion
        if (activeSelection) {
            activeSelection.remove();
            activeSelection = null;
        }
        
        // Handle cutout deletion (stored in menu data)
        const menuContainer = selectionActionsMenu.querySelector('.menu-container');
        const cutoutId = menuContainer.dataset.cutoutId;
        
        if (cutoutId) {
            // Remove cutout from DOM
            const cutoutElement = document.getElementById(cutoutId);
            if (cutoutElement) {
                cutoutElement.remove();
            }
            
            // Remove from cutouts array
            cutouts = cutouts.filter(cutout => cutout.id !== cutoutId);
            
            // Clear menu data
            delete menuContainer.dataset.cutoutId;
        }
        
        hideSelectionActionsMenu();
    }
    
    function showOptionsMenu() {
        optionsMenu.classList.add('show');
    }
    
    function hideOptionsMenu() {
        optionsMenu.classList.remove('show');
    }
    
    function loadImageForSelection(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImageData = e.target.result;
            
            // Convert upload card to photo card with uploaded image
            uploadCard.classList.remove('upload-card');
            uploadCard.classList.add('photo-card', 'with-background');
            uploadCard.innerHTML = `
                <div class="photo-image" id="photoImageContainer">
                    <img id="uploadedPhoto" src="${uploadedImageData}" alt="Uploaded" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div class="check-ring">
                    <svg class="checkmark" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                </div>
            `;
            
            // Auto-select the card
            uploadCard.classList.add('selected');
            selectedPhotos.add(0);
            updateSelectionCount();
            
            // Enable selection mode on the image
            setTimeout(() => {
                enableSelectionMode();
            }, 100);
        };
        reader.readAsDataURL(file);
    }
    
    function enableSelectionMode() {
        const photoImg = document.getElementById('uploadedPhoto');
        const container = document.getElementById('photoImageContainer');
        
        if (!photoImg || !container) return;
        
        // Create selection overlay layer
        const selectionLayer = document.createElement('div');
        selectionLayer.id = 'selectionLayer';
        selectionLayer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            cursor: crosshair;
            z-index: 10;
        `;
        container.appendChild(selectionLayer);
        
        // Selection handling
        selectionLayer.addEventListener('mousedown', startSelection);
        selectionLayer.addEventListener('touchstart', startSelection, { passive: false });
        
        function startSelection(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (isSelecting) return;
            
            isSelecting = true;
            const rect = selectionLayer.getBoundingClientRect();
            const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            
            selectionStart = {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
            
            // Create selection overlay with current styles
            activeSelection = document.createElement('div');
            activeSelection.className = 'image-transform-overlay';
            const borderStyle = getBorderStyle(borderType);
            const animationStyle = getBorderAnimation(borderType);
            activeSelection.style.cssText = `
                position: absolute;
                left: ${selectionStart.x}px;
                top: ${selectionStart.y}px;
                width: 0;
                height: 0;
                border: ${borderStyle !== 'none' ? `${borderStyle} ${accentColor}` : 'none'};
                border-radius: 8px;
                cursor: move;
                pointer-events: none;
                animation: ${animationStyle};
            `;
            
            // Add corner handles with selected style
            const handles = ['nw', 'ne', 'sw', 'se'];
            handles.forEach(pos => {
                const handle = document.createElement('div');
                handle.className = `transform-handle ${pos} ${getHandleStyle(handleType)}`;
                handle.style.background = accentColor;
                
                activeSelection.appendChild(handle);
            });
            
            selectionLayer.appendChild(activeSelection);
            
            // Add long press detection for context menu
            let longPressTimer;
            let longPressX, longPressY;
            
            function startLongPress(e) {
                const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
                const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
                
                longPressX = clientX;
                longPressY = clientY;
                
                longPressTimer = setTimeout(() => {
                    showSelectionActionsMenu(clientX, clientY);
                }, 500); // 500ms for long press
            }
            
            function cancelLongPress() {
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
            }
            
            // Add long press events to selection
            activeSelection.addEventListener('mousedown', startLongPress);
            activeSelection.addEventListener('touchstart', startLongPress, { passive: false });
            activeSelection.addEventListener('mouseup', cancelLongPress);
            activeSelection.addEventListener('mouseleave', cancelLongPress);
            activeSelection.addEventListener('touchend', cancelLongPress);
            activeSelection.addEventListener('touchmove', cancelLongPress, { passive: false });
            
            // Add move events
            document.addEventListener('mousemove', updateSelection);
            document.addEventListener('touchmove', updateSelection, { passive: false });
            document.addEventListener('mouseup', endSelection);
            document.addEventListener('touchend', endSelection);
        }
        
        function updateSelection(e) {
            if (!isSelecting || !activeSelection) return;
            e.preventDefault();
            
            const rect = selectionLayer.getBoundingClientRect();
            const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            
            const currentX = clientX - rect.left;
            const currentY = clientY - rect.top;
            
            const width = Math.abs(currentX - selectionStart.x);
            const height = Math.abs(currentY - selectionStart.y);
            const left = Math.min(currentX, selectionStart.x);
            const top = Math.min(currentY, selectionStart.y);
            
            activeSelection.style.left = left + 'px';
            activeSelection.style.top = top + 'px';
            activeSelection.style.width = width + 'px';
            activeSelection.style.height = height + 'px';
        }
        
        function endSelection(e) {
            if (!isSelecting || !activeSelection) return;
            
            isSelecting = false;
            document.removeEventListener('mousemove', updateSelection);
            document.removeEventListener('touchmove', updateSelection);
            document.removeEventListener('mouseup', endSelection);
            document.removeEventListener('touchend', endSelection);
            
            // Get final selection dimensions
            const rect = activeSelection.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            // Only create cutout if selection is large enough
            if (rect.width > 20 && rect.height > 20) {
                createCutoutFromSelection(activeSelection, container);
            }
            
            // Remove selection overlay
            activeSelection.remove();
            activeSelection = null;
        }
    }
    
    function createCutoutFromSelection(selectionElement, container) {
        const selectionRect = selectionElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const photoImg = document.getElementById('uploadedPhoto');
        
        // Calculate relative position within the container
        const relLeft = selectionRect.left - containerRect.left;
        const relTop = selectionRect.top - containerRect.top;
        const relWidth = selectionRect.width;
        const relHeight = selectionRect.height;
        
        // Get actual image display size vs natural size ratio
        const displayWidth = photoImg.offsetWidth;
        const displayHeight = photoImg.offsetHeight;
        const naturalWidth = photoImg.naturalWidth;
        const naturalHeight = photoImg.naturalHeight;
        
        // Calculate scale factors
        const scaleX = naturalWidth / displayWidth;
        const scaleY = naturalHeight / displayHeight;
        
        // Calculate precise crop coordinates in original image (no rounding)
        const cropX = relLeft * scaleX;
        const cropY = relTop * scaleY;
        const cropW = relWidth * scaleX;
        const cropH = relHeight * scaleY;
        
        // Create canvas to extract the cutout with precise dimensions
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(cropW);
        canvas.height = Math.round(cropH);
        const ctx = canvas.getContext('2d');
        
        // Draw the cropped portion with precise coordinates
        ctx.drawImage(photoImg, 
            Math.round(cropX), Math.round(cropY), 
            Math.round(cropW), Math.round(cropH), 
            0, 0, 
            Math.round(cropW), Math.round(cropH)
        );
        
        // Convert to image
        const cutoutDataUrl = canvas.toDataURL('image/png');
        
        // Create cutout container with transform overlay structure
        const cutoutId = 'cutout-' + Date.now();
        const cutoutContainer = document.createElement('div');
        cutoutContainer.id = cutoutId;
        cutoutContainer.className = 'cutout-container';
        cutoutContainer.style.cssText = `
            position: fixed;
            left: ${selectionRect.left}px;
            top: ${selectionRect.top}px;
            width: ${relWidth}px;
            height: ${relHeight}px;
            z-index: 1000;
            user-select: none;
            -webkit-user-select: none;
            touch-action: none;
            pointer-events: auto;
        `;
        
        // Add cutout image inside container
        const cutoutImg = document.createElement('img');
        cutoutImg.src = cutoutDataUrl;
        cutoutImg.className = 'cutout-image';
        cutoutImg.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 8px;
        `;
        
        // Add transform overlay (same as selection)
        const transformOverlay = document.createElement('div');
        transformOverlay.className = 'image-transform-overlay';
        const borderStyle = getBorderStyle(borderType);
        const animationStyle = getBorderAnimation(borderType);
        transformOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: ${borderStyle !== 'none' ? `${borderStyle} ${accentColor}` : 'none'};
            border-radius: 8px;
            cursor: move;
            pointer-events: auto;
            animation: ${animationStyle};
        `;
        
        // Add corner handles to transform overlay
        const handles = ['nw', 'ne', 'sw', 'se'];
        handles.forEach(pos => {
            const handle = document.createElement('div');
            handle.className = `transform-handle ${pos} ${getHandleStyle(handleType)}`;
            
            transformOverlay.appendChild(handle);
        });
        
        // Assemble cutout
        cutoutContainer.appendChild(cutoutImg);
        cutoutContainer.appendChild(transformOverlay);
        
        // Add to subject layer
        subjectLayer.appendChild(cutoutContainer);
        
        // Track cutout
        cutouts.push({
            id: cutoutId,
            container: cutoutContainer,
            image: cutoutImg,
            overlay: transformOverlay,
            dataUrl: cutoutDataUrl
        });
        
        // Make cutout draggable and resizable
        makeCutoutDraggable(cutoutContainer, transformOverlay);
        makeCutoutResizable(transformOverlay, cutoutContainer, cutoutImg);
        
        // Add long press detection for cutout context menu
        let longPressTimer;
        let longPressX, longPressY;
        
        function startCutoutLongPress(e) {
            const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            
            longPressX = clientX;
            longPressY = clientY;
            
            longPressTimer = setTimeout(() => {
                // Store cutout ID in menu for deletion
                const menuContainer = selectionActionsMenu.querySelector('.menu-container');
                menuContainer.dataset.cutoutId = cutoutId;
                showSelectionActionsMenu(clientX, clientY);
            }, 500); // 500ms for long press
        }
        
        function cancelCutoutLongPress() {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        }
        
        // Add long press events to cutout overlay
        transformOverlay.addEventListener('mousedown', startCutoutLongPress);
        transformOverlay.addEventListener('touchstart', startCutoutLongPress, { passive: false });
        transformOverlay.addEventListener('mouseup', cancelCutoutLongPress);
        transformOverlay.addEventListener('mouseleave', cancelCutoutLongPress);
        transformOverlay.addEventListener('touchend', cancelCutoutLongPress);
        transformOverlay.addEventListener('touchmove', cancelCutoutLongPress, { passive: false });
        
        console.log('Cutout created:', cutoutId);
    }
    
    function makeCutoutDraggable(container, overlay) {
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;
        
        function startDrag(e) {
            // Only start drag if clicking on overlay (not handles)
            if (e.target === overlay) {
                isDragging = true;
                const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
                const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
                
                startX = clientX;
                startY = clientY;
                initialLeft = parseFloat(container.style.left);
                initialTop = parseFloat(container.style.top);
                
                overlay.style.cursor = 'grabbing';
                container.style.zIndex = '1001';
                e.preventDefault();
            }
        }
        
        function drag(e) {
            if (!isDragging) return;
            
            const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            
            const deltaX = clientX - startX;
            const deltaY = clientY - startY;
            
            container.style.left = (initialLeft + deltaX) + 'px';
            container.style.top = (initialTop + deltaY) + 'px';
            
            e.preventDefault();
        }
        
        function endDrag() {
            isDragging = false;
            overlay.style.cursor = 'move';
            container.style.zIndex = '1000';
        }
        
        overlay.addEventListener('mousedown', startDrag);
        overlay.addEventListener('touchstart', startDrag, { passive: false });
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
    }
    
    function makeCutoutResizable(overlay, container, image) {
        let isResizing = false;
        let currentHandle = null;
        let startX, startY, startWidth, startHeight, startLeft, startTop;
        
        function startResize(e) {
            if (e.target.classList.contains('transform-handle')) {
                isResizing = true;
                currentHandle = e.target;
                startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
                startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
                
                startWidth = parseFloat(container.style.width);
                startHeight = parseFloat(container.style.height);
                startLeft = parseFloat(container.style.left);
                startTop = parseFloat(container.style.top);
                
                e.preventDefault();
            }
        }
        
        function resize(e) {
            if (!isResizing) return;
            
            const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const currentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            
            const deltaX = currentX - startX;
            const deltaY = currentY - startY;
            
            let newWidth = startWidth;
            let newHeight = startHeight;
            let newLeft = startLeft;
            let newTop = startTop;
            
            // Handle different resize directions
            if (currentHandle.classList.contains('nw')) {
                newWidth = startWidth - deltaX;
                newHeight = startHeight - deltaY;
                newLeft = startLeft + deltaX;
                newTop = startTop + deltaY;
            } else if (currentHandle.classList.contains('ne')) {
                newWidth = startWidth + deltaX;
                newHeight = startHeight - deltaY;
                newTop = startTop + deltaY;
            } else if (currentHandle.classList.contains('sw')) {
                newWidth = startWidth - deltaX;
                newHeight = startHeight + deltaY;
                newLeft = startLeft + deltaX;
            } else if (currentHandle.classList.contains('se')) {
                newWidth = startWidth + deltaX;
                newHeight = startHeight + deltaY;
            }
            
            // Minimum size constraint
            if (newWidth > 20 && newHeight > 20) {
                container.style.width = newWidth + 'px';
                container.style.height = newHeight + 'px';
                container.style.left = newLeft + 'px';
                container.style.top = newTop + 'px';
            }
            
            e.preventDefault();
        }
        
        function endResize() {
            isResizing = false;
            currentHandle = null;
        }
        
        overlay.addEventListener('mousedown', startResize);
        overlay.addEventListener('touchstart', startResize, { passive: false });
        document.addEventListener('mousemove', resize);
        document.addEventListener('touchmove', resize, { passive: false });
        document.addEventListener('mouseup', endResize);
        document.addEventListener('touchend', endResize);
    }
    
    // Cleanup function for transform mode (no longer used but kept for compatibility)
    function stopTransformMode() {
        // No-op - transform mode replaced by manual selection
    }
    
    function makeDraggable(element) {
        let isDragging = false;
        let startX, startY, initialX, initialY;
        
        function startDrag(e) {
            if (e.target === element || (isTransforming && e.target === element)) {
                isDragging = true;
                startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
                startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
                
                const rect = element.getBoundingClientRect();
                initialX = rect.left;
                initialY = rect.top;
                
                element.classList.add('dragging');
                e.preventDefault();
            }
        }
        
        function drag(e) {
            if (!isDragging) return;
            
            const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const currentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            
            const deltaX = currentX - startX;
            const deltaY = currentY - startY;
            
            const newX = initialX + deltaX;
            const newY = initialY + deltaY;
            
            element.style.left = newX + 'px';
            element.style.top = newY + 'px';
            
            // Update overlay position if transforming
            if (transformOverlay && isTransforming) {
                transformOverlay.style.left = newX + 'px';
                transformOverlay.style.top = newY + 'px';
            }
        }
        
        function endDrag() {
            isDragging = false;
            element.classList.remove('dragging');
        }
        
        // Mouse events
        element.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);
        
        // Touch events - passive: false to allow preventDefault
        element.addEventListener('touchstart', startDrag, { passive: false });
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('touchend', endDrag);
    }
    
    function makeResizable(overlay, element) {
        let isResizing = false;
        let isDragging = false;
        let currentHandle = null;
        let startX, startY, startWidth, startHeight, startLeft, startTop;
        let dragStartX, dragStartY, dragInitialLeft, dragInitialTop;
        
        function startResize(e) {
            if (e.target.classList.contains('transform-handle')) {
                isResizing = true;
                currentHandle = e.target;
                startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
                startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
                
                const rect = element.getBoundingClientRect();
                startWidth = rect.width;
                startHeight = rect.height;
                startLeft = rect.left;
                startTop = rect.top;
                
                e.preventDefault();
                e.stopPropagation();
            } else if (e.target === overlay || e.target === element) {
                // Start dragging when clicking on the overlay or element
                isDragging = true;
                dragStartX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
                dragStartY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
                
                const rect = element.getBoundingClientRect();
                dragInitialLeft = rect.left;
                dragInitialTop = rect.top;
                
                element.classList.add('dragging');
                e.preventDefault();
                e.stopPropagation();
            }
        }
        
        function resize(e) {
            const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const currentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            
            // Handle resizing
            if (isResizing) {
                const deltaX = currentX - startX;
                const deltaY = currentY - startY;
                
                let newWidth = startWidth;
                let newHeight = startHeight;
                let newLeft = startLeft;
                let newTop = startTop;
                
                if (currentHandle.classList.contains('se')) {
                    newWidth = startWidth + deltaX;
                    newHeight = startHeight + deltaY;
                } else if (currentHandle.classList.contains('sw')) {
                    newWidth = startWidth - deltaX;
                    newHeight = startHeight + deltaY;
                    newLeft = startLeft + deltaX;
                } else if (currentHandle.classList.contains('ne')) {
                    newWidth = startWidth + deltaX;
                    newHeight = startHeight - deltaY;
                    newTop = startTop + deltaY;
                } else if (currentHandle.classList.contains('nw')) {
                    newWidth = startWidth - deltaX;
                    newHeight = startHeight - deltaY;
                    newLeft = startLeft + deltaX;
                    newTop = startTop + deltaY;
                }
                
                // Minimum size
                newWidth = Math.max(50, newWidth);
                newHeight = Math.max(50, newHeight);
                
                element.style.width = newWidth + 'px';
                element.style.height = newHeight + 'px';
                element.style.left = newLeft + 'px';
                element.style.top = newTop + 'px';
                
                // Update overlay
                overlay.style.width = newWidth + 'px';
                overlay.style.height = newHeight + 'px';
                overlay.style.left = newLeft + 'px';
                overlay.style.top = newTop + 'px';
            }
            
            // Handle dragging (can happen simultaneously with resizing)
            if (isDragging) {
                const deltaX = currentX - dragStartX;
                const deltaY = currentY - dragStartY;
                
                const newX = dragInitialLeft + deltaX;
                const newY = dragInitialTop + deltaY;
                
                element.style.left = newX + 'px';
                element.style.top = newY + 'px';
                
                // Update overlay position
                overlay.style.left = newX + 'px';
                overlay.style.top = newY + 'px';
                
                // Update resize start positions if currently resizing
                if (isResizing) {
                    startLeft = newX;
                    startTop = newY;
                }
            }
        }
        
        function endResize() {
            isResizing = false;
            isDragging = false;
            currentHandle = null;
            element.classList.remove('dragging');
        }
        
        // Mouse events
        overlay.addEventListener('mousedown', startResize);
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', endResize);
        
        // Touch events - passive: false to allow preventDefault
        overlay.addEventListener('touchstart', startResize, { passive: false });
        document.addEventListener('touchmove', resize, { passive: false });
        document.addEventListener('touchend', endResize);
    }

    function endResize() {
        isResizing = false;
        isDragging = false;
        currentHandle = null;
        element.classList.remove('dragging');
    }

    function hideErrorAlert() {
        errorAlert.classList.remove('show');
    }
    
    function showErrorAlert() {
        errorAlert.classList.add('show');
    }
    
    function updateSelectionCount() {
        const count = selectedPhotos.size;
        document.querySelector('.selection-count').textContent = `${count} Photo${count !== 1 ? 's' : ''} Selected`;
    }
    
    function reloadSection() {
        // Reset selection state
        isSelecting = false;
        activeSelection = null;
        selectionStart = { x: 0, y: 0 };
        
        // Clear all cutouts
        cutouts.forEach(cutout => {
            if (cutout.container) {
                cutout.container.remove();
            }
        });
        cutouts = [];
        uploadedImage = null;
        uploadedImageData = null;
        
        // Reset all state
        backgroundImage = null;
        subjectImage = null;
        isTransforming = false;
        currentSubject = null;
        transformOverlay = null;
        selectedPhotos.clear();
        
        // Clear the subject layer (removes all cutouts)
        subjectLayer.innerHTML = '';
        
        // Reset upload card to original state (removes selection)
        uploadCard.className = 'photo-card upload-card';
        uploadCard.dataset.index = '0';
        uploadCard.innerHTML = `
            <div class="upload-content">
                <svg class="upload-icon" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span class="upload-text">Upload</span>
            </div>
        `;
        
        // Reset file inputs
        backgroundInput.value = '';
        subjectInput.value = '';
        aiModeInput.value = '';
        
        // Close any open menus
        hideQuickActionsMenu();
        hideSubjectActionsMenu();
        hideOptionsMenu();
        hideErrorAlert();
        
        // Update selection count (will show "0 Photos Selected")
        updateSelectionCount();
        
        console.log('Section reloaded - all images, cutouts, and selections cleared');
    }
});