// Placeholder dynamic behavior for QR generator UI
function showTab(tabId) {
  document.querySelectorAll('#tabs button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-content').forEach(section => {
    section.style.display = section.id === tabId ? 'block' : 'none';
  });
}

function generate() {
  // TODO: implement QR code generation
  const preview = document.getElementById('qr-preview');
  preview.innerHTML = '<img src="placeholder.png" alt="QR preview">';
  document.getElementById('customization').style.display = 'block';
}

function applyCustomization() {
  // TODO: update preview based on color/logo/style choices
}

function download(type) {
  // TODO: download generated code
  alert('Download ' + type);
}

document.addEventListener('DOMContentLoaded', () => {
  showTab('url');
});
