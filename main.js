function switchTab(n) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  document.querySelectorAll('.screen')[n].classList.add('active');
  document.querySelectorAll('.nav-item')[n].classList.add('active');
}

function openLink(url) { Telegram.WebApp.openLink(url); }
function closeModal() { document.getElementById('modal').style.display = 'none'; }
