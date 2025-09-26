document.addEventListener('DOMContentLoaded', function () {
    // Set current date
    const currentDateEl = document.getElementById('current-date');
    if (currentDateEl) {
        currentDateEl.textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Settings Tabs
    const tabs = document.querySelectorAll('.settings-tab');
    const contents = document.querySelectorAll('.settings-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Deactivate all
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            // Activate clicked tab and content
            tab.classList.add('active');
            const contentId = `${tab.dataset.tab}-settings`;
            const content = document.getElementById(contentId);
            if (content) {
                content.classList.add('active');
            }
        });
    });

    // Image upload previews
    function setupImageUpload(inputId, previewId) {
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        if (input && preview) {
            input.addEventListener('change', function() {
                const file = this.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        preview.src = e.target.result;
                    }
                    reader.readAsDataURL(file);
                }
            });
        }
    }
    setupImageUpload('logo-upload', 'logo-preview');
    setupImageUpload('favicon-upload', 'favicon-preview');

    // Color picker sync
    function setupColorPicker(colorInputId, textInputSelector) {
        const colorInput = document.getElementById(colorInputId);
        if (colorInput) {
            const textInput = colorInput.nextElementSibling;
            colorInput.addEventListener('input', (e) => {
                textInput.value = e.target.value;
            });
            textInput.addEventListener('input', (e) => {
                colorInput.value = e.target.value;
            });
        }
    }
    setupColorPicker('primary-color');
    setupColorPicker('secondary-color');

    // Dummy functions for buttons
    window.addShippingZone = function() { alert('Add shipping zone form would appear here.'); }
    window.editShippingZone = function(zoneId) { alert(`Editing shipping zone ${zoneId}`); }
    window.deleteShippingZone = function(zoneId) { alert(`Deleting shipping zone ${zoneId}`); }
    window.editEmailTemplate = function(template) { alert(`Editing email template: ${template}`); }
    window.previewEmailTemplate = function(template) { alert(`Previewing email template: ${template}`); }
});