/**
 * Colapso: barra entorno/versión + parámetros (v1 legacy / v2 form-frame).
 */
(function () {
	var STORAGE_ENV = 'gallery-test-env-bar-collapsed';
	var STORAGE_PARAMS = 'gallery-test-params-collapsed';

	function injectStylesheet() {
		if (document.getElementById('gallery-test-collapse-css')) {
			return;
		}
		var scriptEl = document.getElementById('gallery-test-collapse-js');
		var href = scriptEl && scriptEl.getAttribute('data-css-href');
		if (!href && scriptEl && scriptEl.src) {
			href = scriptEl.src.replace(/\.js(\?.*)?$/, '.css$1');
		}
		if (!href) {
			return;
		}
		var link = document.createElement('link');
		link.id = 'gallery-test-collapse-css';
		link.rel = 'stylesheet';
		link.href = href;
		document.head.appendChild(link);
	}

	function readCollapsed(key) {
		try {
			return sessionStorage.getItem(key) !== '0';
		} catch (err) {
			return true;
		}
	}

	function writeCollapsed(key, collapsed) {
		try {
			if (collapsed) {
				sessionStorage.setItem(key, '1');
			} else {
				sessionStorage.setItem(key, '0');
			}
		} catch (err) {
			// ignore
		}
	}

	function createToggle() {
		var button = document.createElement('button');
		button.type = 'button';
		button.className = 'gallery-test-collapse-toggle';
		button.innerHTML =
			'<span class="gallery-test-collapse-icon" aria-hidden="true">▼</span>' +
			'<span class="gallery-test-collapse-label"></span>';
		button.setAttribute('aria-expanded', 'false');
		return button;
	}

	function syncToggle(button, expanded, labelShow, labelHide) {
		var label = labelShow;
		if (expanded) {
			label = labelHide;
			button.setAttribute('aria-expanded', 'true');
		} else {
			button.setAttribute('aria-expanded', 'false');
		}
		button.querySelector('.gallery-test-collapse-label').textContent = label;
	}

	function bindCollapse(options) {
		var collapsed = readCollapsed(options.storageKey);
		var toggle = createToggle();
		toggle.setAttribute('aria-controls', options.controlsId);

		var header = document.createElement('div');
		header.className = options.headerClass;
		header.appendChild(toggle);
		options.insertHeader(header);

		function apply() {
			options.apply(collapsed);
			syncToggle(toggle, !collapsed, options.labelShow, options.labelHide);
			if (options.dispatchResize) {
				requestAnimationFrame(function () {
					window.dispatchEvent(new Event('resize'));
				});
			}
		}

		toggle.addEventListener('click', function () {
			collapsed = !collapsed;
			writeCollapsed(options.storageKey, collapsed);
			apply();
		});
		apply();
	}

	function enhanceEnvBar() {
		var bar = document.getElementById('config-bar');
		if (!bar || bar.getAttribute('data-gallery-collapse') === '1') {
			return;
		}
		bar.setAttribute('data-gallery-collapse', '1');

		var body = document.createElement('div');
		body.className = 'gallery-test-collapse-body';
		body.id = 'config-collapse-body';
		while (bar.firstChild) {
			body.appendChild(bar.firstChild);
		}

		bindCollapse({
			storageKey: STORAGE_ENV,
			controlsId: body.id,
			headerClass: 'gallery-test-collapse-header',
			labelShow: 'Mostrar entorno / versión',
			labelHide: 'Ocultar entorno / versión',
			insertHeader: function (header) {
				bar.appendChild(header);
				bar.appendChild(body);
			},
			apply: function (collapsed) {
				body.hidden = collapsed;
			},
		});
	}

	function enhanceParamsForm() {
		var frames = document.querySelectorAll('.m-api-idee-test-form-frame');
		Array.prototype.forEach.call(frames, function (frame, index) {
			if (frame.getAttribute('data-gallery-collapse') === '1') {
				return;
			}
			frame.setAttribute('data-gallery-collapse', '1');
			if (!frame.id) {
				frame.id = 'gallery-plugin-params-collapse-body-' + index;
			}
			bindCollapse({
				storageKey: STORAGE_PARAMS,
				controlsId: frame.id,
				headerClass: 'gallery-test-collapse-header gallery-test-params-header',
				labelShow: 'Mostrar parámetros',
				labelHide: 'Ocultar parámetros',
				dispatchResize: true,
				insertHeader: function (header) {
					if (frame.parentNode) {
						frame.parentNode.insertBefore(header, frame);
					}
				},
				apply: function (collapsed) {
					frame.hidden = collapsed;
				},
			});
		});
	}

	function isParamsPanel(el) {
		if (!el || el.nodeType !== 1) {
			return false;
		}
		if (el.id === 'mapjs' || el.id === 'mapajs') {
			return false;
		}
		if (el.tagName !== 'DIV' && el.tagName !== 'SECTION' && el.tagName !== 'FORM') {
			return false;
		}
		return Boolean(el.querySelector('input, select, textarea, label, button'));
	}

	function enhanceLegacyParamsPanel() {
		if (document.querySelector('.m-api-idee-test-form-frame')) {
			return;
		}
		if (document.querySelector('[data-gallery-collapse-v1="1"]')) {
			return;
		}
		var map = document.getElementById('mapjs');
		if (!map || !map.parentNode) {
			return;
		}
		var panel = map.previousElementSibling;
		while (panel && !isParamsPanel(panel)) {
			panel = panel.previousElementSibling;
		}
		if (!panel) {
			return;
		}

		panel.setAttribute('data-gallery-collapse-v1', '1');
		document.body.classList.add('gallery-test-v1-layout');
		if (!panel.id) {
			panel.id = 'gallery-plugin-params-collapse-body-v1';
		}

		bindCollapse({
			storageKey: STORAGE_PARAMS,
			controlsId: panel.id,
			headerClass: 'gallery-test-collapse-header gallery-test-params-header',
			labelShow: 'Mostrar parámetros',
			labelHide: 'Ocultar parámetros',
			dispatchResize: true,
			insertHeader: function (header) {
				panel.parentNode.insertBefore(header, panel);
			},
			apply: function (collapsed) {
				panel.hidden = collapsed;
			},
		});
	}

	function boot() {
		injectStylesheet();
		enhanceEnvBar();
		enhanceParamsForm();
		enhanceLegacyParamsPanel();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', boot);
	} else {
		boot();
	}
})();
