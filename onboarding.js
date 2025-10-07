document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        fullName: document.getElementById('fullName').value,
        weight: document.getElementById('weight').value,
        age: document.getElementById('age').value,
        activityLevel: document.getElementById('activityLevel').value,
        height: document.getElementById('height').value,
        experience: document.getElementById('experience').value
    };
    
    // Validate form
    if (!formData.fullName || !formData.weight || !formData.age || 
        !formData.activityLevel || !formData.height || !formData.experience) {
        alert('Please fill in all fields');
        return;
    }
    
    // Save to localStorage
    localStorage.setItem('userProfile', JSON.stringify(formData));
    
    // Redirect to camera page
    window.location.href = 'camera.html';
});