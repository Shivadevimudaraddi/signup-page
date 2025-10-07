// camera.js - Simple camera with AI analysis

let cameraStream = null;
let currentAngle = 'front';
let capturedPhotos = {
    front: null,
    side: null
};

// DOM Elements
let videoElement, startCameraBtn, captureBtn, analyzeBtn, poseOverlay, cameraStatus, analysisResults, resultsGrid;

document.addEventListener('DOMContentLoaded', function() {
    initializeCamera();
});

function initializeCamera() {
    // Get DOM elements
    videoElement = document.getElementById('videoElement');
    startCameraBtn = document.getElementById('startCamera');
    captureBtn = document.getElementById('captureBtn');
    analyzeBtn = document.getElementById('analyzeBtn');
    poseOverlay = document.getElementById('poseOverlay');
    cameraStatus = document.getElementById('cameraStatus');
    analysisResults = document.getElementById('analysisResults');
    resultsGrid = document.getElementById('resultsGrid');

    // Add event listeners
    startCameraBtn.addEventListener('click', startCamera);
    captureBtn.addEventListener('click', capturePhoto);
    analyzeBtn.addEventListener('click', analyzeBody);

    updateCameraStatus('Click "Start Camera" to begin');
}

async function startCamera() {
    try {
        updateCameraStatus('Starting camera...');
        FitnessApp.UI.showLoading(startCameraBtn);
        startCameraBtn.disabled = true;

        // Stop existing stream if any
        if (cameraStream) {
            stopCamera();
        }

        // Request camera access
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        // Set video source
        videoElement.srcObject = cameraStream;
        
        videoElement.onloadedmetadata = function() {
            videoElement.play().then(() => {
                onCameraStarted();
            }).catch(error => {
                onCameraError(error);
            });
        };

    } catch (error) {
        onCameraError(error);
    }
}

function onCameraStarted() {
    startCameraBtn.disabled = true;
    startCameraBtn.textContent = 'Camera Active';
    captureBtn.disabled = false;
    
    document.getElementById('cameraView').classList.add('camera-active');
    poseOverlay.style.display = 'none';
    
    updateCameraStatus('Camera ready - Capture front view');
    
    FitnessApp.UI.hideLoading(startCameraBtn);
}

function onCameraError(error) {
    let errorMessage = 'Camera Error: ';
    
    if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access.';
    } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found on your device.';
    } else {
        errorMessage = `Camera error: ${error.message}`;
    }
    
    updateCameraStatus(errorMessage);
    FitnessApp.UI.hideLoading(startCameraBtn);
    FitnessApp.UI.showNotification(errorMessage, 'error');
    
    startCameraBtn.disabled = false;
    startCameraBtn.textContent = 'Try Starting Camera Again';
}

async function capturePhoto() {
    try {
        if (!cameraStream) {
            throw new Error('Camera not active');
        }

        FitnessApp.UI.showLoading(captureBtn);
        updateCameraStatus(`Capturing ${currentAngle} view...`);

        // Create canvas and capture photo
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        const photoBlob = await new Promise((resolve) => {
            canvas.toBlob(resolve, 'image/jpeg', 0.9);
        });

        // Store captured photo
        capturedPhotos[currentAngle] = photoBlob;
        
        // Update UI
        updatePhotoProgress();
        updateCaptureButton();
        
        // Move to next angle or enable analysis
        if (currentAngle === 'front') {
            currentAngle = 'side';
            updatePoseGuidelines();
            updateCameraStatus('Front view captured - Now capture side view');
            FitnessApp.UI.showNotification('Front view captured! Now capture side view.', 'success');
        } else {
            analyzeBtn.disabled = false;
            updateCameraStatus('Both views captured! Click "Analyze Body"');
            FitnessApp.UI.showNotification('Both views captured! Ready for analysis.', 'success');
        }
        
    } catch (error) {
        FitnessApp.UI.showNotification(`Capture failed: ${error.message}`, 'error');
        updateCameraStatus('Capture failed - Try again');
    } finally {
        FitnessApp.UI.hideLoading(captureBtn);
    }
}

async function analyzeBody() {
    try {
        FitnessApp.UI.showLoading(analyzeBtn);
        updateCameraStatus('AI analyzing body composition...');

        // Simulate AI analysis with realistic body metrics
        const analysisResults = await performBodyAnalysis();
        
        // Display results
        displayAnalysisResults(analysisResults);
        
        updateCameraStatus('Analysis complete!');
        FitnessApp.UI.showNotification('Body analysis complete!', 'success');
        
    } catch (error) {
        FitnessApp.UI.showNotification(`Analysis failed: ${error.message}`, 'error');
        updateCameraStatus('Analysis failed');
    } finally {
        FitnessApp.UI.hideLoading(analyzeBtn);
    }
}

async function performBodyAnalysis() {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate realistic body analysis results
    const user = FitnessApp.Profile.getProfile();
    const weight = user?.weight || 70;
    const height = user?.height || 170;
    
    // Calculate BMI
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    
    // Generate realistic body composition based on BMI
    let bodyFat, muscleMass, bodyType, postureScore, recommendations;
    
    if (bmi < 18.5) {
        bodyFat = (8 + Math.random() * 4).toFixed(1);
        muscleMass = (75 + Math.random() * 10).toFixed(1);
        bodyType = "Ectomorph";
        postureScore = (75 + Math.random() * 15).toFixed(0);
        recommendations = ["Focus on strength training", "Increase calorie intake", "Build muscle mass"];
    } else if (bmi < 25) {
        bodyFat = (15 + Math.random() * 8).toFixed(1);
        muscleMass = (80 + Math.random() * 8).toFixed(1);
        bodyType = "Mesomorph";
        postureScore = (80 + Math.random() * 15).toFixed(0);
        recommendations = ["Maintain current routine", "Balance cardio & strength", "Focus on form"];
    } else {
        bodyFat = (25 + Math.random() * 10).toFixed(1);
        muscleMass = (70 + Math.random() * 8).toFixed(1);
        bodyType = "Endomorph";
        postureScore = (70 + Math.random() * 15).toFixed(0);
        recommendations = ["Focus on fat loss", "Increase cardio", "Build lean muscle"];
    }
    
    // Detect posture issues (simulated)
    const postureIssues = [];
    if (Math.random() > 0.5) postureIssues.push("Forward head posture");
    if (Math.random() > 0.6) postureIssues.push("Rounded shoulders");
    if (Math.random() > 0.7) postureIssues.push("Anterior pelvic tilt");
    
    return {
        bmi: bmi,
        bodyFat: bodyFat,
        muscleMass: muscleMass,
        bodyType: bodyType,
        postureScore: postureScore,
        postureIssues: postureIssues,
        recommendations: recommendations,
        measurements: {
            chest: (90 + Math.random() * 20).toFixed(1),
            waist: (75 + Math.random() * 15).toFixed(1),
            hips: (95 + Math.random() * 15).toFixed(1)
        }
    };
}

function displayAnalysisResults(results) {
    // Show results section
    analysisResults.style.display = 'block';
    
    // Clear previous results
    resultsGrid.innerHTML = '';
    
    // Add result items
    const resultItems = [
        { label: 'Body Type', value: results.bodyType, unit: '' },
        { label: 'BMI', value: results.bmi, unit: 'kg/m²' },
        { label: 'Body Fat', value: results.bodyFat, unit: '%' },
        { label: 'Muscle Mass', value: results.muscleMass, unit: '%' },
        { label: 'Posture Score', value: results.postureScore, unit: '/100' },
        { label: 'Chest', value: results.measurements.chest, unit: 'cm' },
        { label: 'Waist', value: results.measurements.waist, unit: 'cm' },
        { label: 'Hips', value: results.measurements.hips, unit: 'cm' }
    ];
    
    resultItems.forEach(item => {
        const resultElement = document.createElement('div');
        resultElement.className = 'result-item';
        resultElement.innerHTML = `
            <span class="result-label">${item.label}</span>
            <span class="result-value">${item.value}<span class="result-unit">${item.unit}</span></span>
        `;
        resultsGrid.appendChild(resultElement);
    });
    
    // Add posture issues if any
    if (results.postureIssues.length > 0) {
        const postureElement = document.createElement('div');
        postureElement.className = 'result-item';
        postureElement.innerHTML = `
            <span class="result-label">Posture Issues</span>
            <span class="result-value">${results.postureIssues.join(', ')}</span>
        `;
        resultsGrid.appendChild(postureElement);
    }
    
    // Store results for later use
    localStorage.setItem('bodyAnalysis', JSON.stringify(results));
}

function updatePoseGuidelines() {
    const guidelines = {
        front: 'Stand straight, arms at sides',
        side: 'Stand sideways, arms relaxed'
    };
    
    poseOverlay.innerHTML = `
        <div class="pose-guideline">
            <h4>${currentAngle.charAt(0).toUpperCase() + currentAngle.slice(1)} View</h4>
            <p>${guidelines[currentAngle]}</p>
        </div>
    `;
}

function updatePhotoProgress() {
    const photoSteps = document.querySelectorAll('.photo-step');
    
    photoSteps.forEach(step => {
        const angle = step.dataset.angle;
        step.classList.remove('active', 'completed');
        
        if (capturedPhotos[angle]) {
            step.classList.add('completed');
        } else if (angle === currentAngle) {
            step.classList.add('active');
        }
    });
}

function updateCaptureButton() {
    captureBtn.textContent = `Capture ${currentAngle.charAt(0).toUpperCase() + currentAngle.slice(1)} View`;
}

function updateCameraStatus(message) {
    cameraStatus.textContent = message;
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    if (videoElement) {
        videoElement.srcObject = null;
    }
    document.getElementById('cameraView').classList.remove('camera-active');
}

function goBack() {
    stopCamera();
    window.location.href = 'onboarding.html';
}

function finishAnalysis() {
    stopCamera();
    window.location.href = 'transformation.html';
}

// Clean up
window.addEventListener('beforeunload', stopCamera);