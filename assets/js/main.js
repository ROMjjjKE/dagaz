/* ООО «Дагаз»: меню, схема этапов, конструктор сметы, форма */

document.addEventListener('DOMContentLoaded', function () {
  initMenu();
  initCharts();
  initCalc();
  initForm();
  initYear();
});

function initMenu() {
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  if (!burger || !menu) return;

  function close() {
    menu.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', function () {
    var open = menu.hidden;
    menu.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) menu.querySelector('a').focus();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hidden) { close(); burger.focus(); }
  });

  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') close();
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 1120 && !menu.hidden) close();
  });
}

function initCharts() {
  var charts = document.querySelectorAll('[data-chart]');
  if (!charts.length) return;

  if (!('IntersectionObserver' in window)) {
    charts.forEach(function (c) { c.classList.add('is-in'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  charts.forEach(function (c) { io.observe(c); });
}

function initCalc() {
  var form = document.getElementById('calc-form');
  if (!form) return;

  var count = document.getElementById('calc-count');
  var hint = document.getElementById('calc-hint');
  var result = document.getElementById('calc-result');
  var text = document.getElementById('calc-text');
  var wa = document.getElementById('calc-wa');
  var edit = document.getElementById('calc-edit');
  var boxes = form.querySelectorAll('input[name="work"]');

  function groups() {
    var map = {};
    boxes.forEach(function (b) {
      if (!b.checked) return;
      var g = b.getAttribute('data-group');
      if (!map[g]) map[g] = [];
      map[g].push(b.value);
    });
    return map;
  }

  function refresh() {
    var map = groups();
    var n = 0;
    Object.keys(map).forEach(function (k) { n += map[k].length; });
    count.textContent = 'выбрано: ' + n;
    hint.textContent = n === 0
      ? 'Можно ничего не отмечать: тогда посчитаем по описанию в комментарии.'
      : 'Отмечено работ: ' + n + '. Нажмите кнопку, чтобы собрать сообщение.';
  }

  boxes.forEach(function (b) { b.addEventListener('change', refresh); });
  refresh();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var area = form.querySelector('[name="area"]').value.trim();
    var type = form.querySelector('[name="type"]').value;
    var scope = form.querySelector('[name="scope"]').value;
    var note = form.querySelector('[name="note"]').value.trim();
    var map = groups();

    var lines = ['Заявка на расчёт с сайта Дагаз', ''];
    lines.push('Площадь: ' + (area ? area + ' м²' : 'не указана'));
    lines.push('Тип жилья: ' + type);
    lines.push('Формат: ' + scope);

    var keys = Object.keys(map);
    if (keys.length) {
      lines.push('', 'Работы:');
      keys.forEach(function (g) {
        lines.push(g + ':');
        map[g].forEach(function (w) { lines.push('- ' + w); });
      });
    } else {
      lines.push('', 'Работы: посчитать по описанию');
    }

    if (note) lines.push('', 'Комментарий: ' + note);

    var message = lines.join('\n');
    text.textContent = message;
    wa.href = 'https://wa.me/375298556666?text=' + encodeURIComponent(message);
    form.hidden = true;
    result.hidden = false;
    result.scrollIntoView({ block: 'start', behavior: 'smooth' });
  });

  if (edit) {
    edit.addEventListener('click', function () {
      result.hidden = true;
      form.hidden = false;
      form.querySelector('[name="area"]').focus();
    });
  }
}

function initForm() {
  var form = document.getElementById('lead-form');
  if (!form) return;

  var success = document.getElementById('form-success');
  var waLink = document.getElementById('wa-link');
  var again = document.getElementById('again-btn');
  var nameInput = form.querySelector('[name="name"]');
  var phoneInput = form.querySelector('[name="phone"]');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;

    [nameInput, phoneInput].forEach(function (el) {
      var err = document.getElementById('e-' + el.name);
      var valid = el === nameInput ? el.value.trim().length > 1 : digits(el.value).length >= 9;
      el.setAttribute('aria-invalid', valid ? 'false' : 'true');
      if (err) err.textContent = valid ? '' : (el === nameInput ? 'Как к вам обращаться?' : 'Нужен номер для связи');
      if (!valid) ok = false;
    });

    if (!ok) {
      var bad = form.querySelector('[aria-invalid="true"]');
      if (bad) bad.focus();
      return;
    }

    var d = new FormData(form);
    var lines = ['Заявка с сайта Дагаз', 'Имя: ' + (d.get('name') || '').trim(), 'Телефон: ' + (d.get('phone') || '').trim()];
    if (d.get('area')) lines.push('Площадь: ' + d.get('area') + ' м²');
    if (d.get('type')) lines.push('Тип жилья: ' + d.get('type'));
    if (d.get('note')) lines.push('Что планируется: ' + d.get('note').trim());

    waLink.href = 'https://wa.me/375298556666?text=' + encodeURIComponent(lines.join('\n'));
    form.hidden = true;
    success.hidden = false;
    success.scrollIntoView({ block: 'center', behavior: 'smooth' });
  });

  if (again) {
    again.addEventListener('click', function () {
      success.hidden = true;
      form.hidden = false;
      nameInput.focus();
    });
  }

  function digits(v) { return (v || '').replace(/\D/g, ''); }
}

function initYear() {
  var y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());
}
