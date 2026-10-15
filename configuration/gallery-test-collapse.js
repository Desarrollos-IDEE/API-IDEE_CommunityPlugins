/**
 * Galería de tests:
 * - barra entorno/versión: colapsable (selects al inicio + botón, misma fila)
 * - parámetros v1/v2: colapsables, cerrados por defecto, sin título
 */
(function () {
	var STORAGE_ENV = 'gallery-test-env-bar-collapsed';
	var STORAGE_PARAMS = 'gallery-test-params-collapsed';

	function injectStylesheet() {
		if (document.getElementById('gallery-test-collapse-css')) {
			return;
		}
		var scriptEl = document.getElementById('gallery-test-collapse-js');
		var href = '';
		if (scriptEl && scriptEl.getAttribute('data-css-href')) {
			href = scriptEl.getAttribute('data-css-href');
		} else if (scriptEl && scriptEl.src) {
			href = scriptEl.src.replace(/\.js(\?.*)?$/, '.css$1');
		} else {
			href = '../../configuration/gallery-test-collapse.css';
		}
		var link = document.createElement('link');
		link.id = 'gallery-test-collapse-css';
		link.rel = 'stylesheet';
		link.href = href;
		document.head.appendChild(link);
	}

	function readCollapsed(key) {
		try {
			var value = sessionStorage.getItem(key);
			if (value === null || value === undefined) {
				return true;
			}
			return value === '1';
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
			// sessionStorage no disponible
		}
	}

	function createToggleButton(label, expanded) {
		var button = document.createElement('button');
		button.type = 'button';
		button.className = 'gallery-test-collapse-toggle';
		if (expanded) {
			button.setAttribute('aria-expanded', 'true');
		} else {
			button.setAttribute('aria-expanded', 'false');
		}
		button.innerHTML =
			'<span class="gallery-test-collapse-icon" aria-hidden="true">▼</span>' +
			'<span class="gallery-test-collapse-label"></span>';
		button.querySelector('.gallery-test-collapse-label').textContent = label;
		return button;
	}

	function setExpanded(button, expanded, collapseLabel, expandLabel) {
		if (expanded) {
			button.setAttribute('aria-expanded', 'true');
		} else {
			button.setAttribute('aria-expanded', 'false');
		}
		var labelEl = button.querySelector('.gallery-test-collapse-label');
		if (expanded) {
			labelEl.textContent = collapseLabel;
		} else {
			labelEl.textContent = expandLabel;
		}
	}

	function notifyMapResize() {
		window.dispatchEvent(new Event('resize'));
	}

	function enhanceEnvBar() {
		var bar = document.getElementById('gallery-plugin-line-bar');
		if (!bar || bar.getAttribute('data-gallery-collapse') === '1') {
			return;
		}
		bar.setAttribute('data-gallery-collapse', '1');

		var children = Array.prototype.slice.call(bar.childNodes);
		var body = document.createElement('div');
		body.className = 'gallery-test-collapse-body';
		body.id = 'gallery-plugin-line-collapse-body';
		children.forEach(function (node) {
			body.appendChild(node);
		});

		var header = document.createElement('div');
		header.className = 'gallery-test-collapse-header';

		var collapsed = readCollapsed(STORAGE_ENV);
		var toggle = createToggleButton(
			collapsed ? 'Mostrar entorno / versión' : 'Ocultar entorno / versión',
			!collapsed,
		);
		toggle.setAttribute('aria-controls', 'gallery-plugin-line-collapse-body');
		header.appendChild(toggle);

		// Botón arriba, selects debajo (como antes)
		bar.appendChild(header);
		bar.appendChild(body);

		function applyState() {
			if (collapsed) {
				bar.classList.add('gallery-test-collapsed');
			} else {
				bar.classList.remove('gallery-test-collapsed');
			}
			body.hidden = collapsed;
			setExpanded(
				toggle,
				!collapsed,
				'Ocultar entorno / versión',
				'Mostrar entorno / versión',
			);
		}

		toggle.addEventListener('click', function () {
			collapsed = !collapsed;
			writeCollapsed(STORAGE_ENV, collapsed);
			applyState();
		});

		applyState();
	}

	function enhanceParamsForm() {
		var frames = document.querySelectorAll('.m-api-idee-test-form-frame');
		if (!frames.length) {
			return;
		}

		Array.prototype.forEach.call(frames, function (frame, index) {
			if (frame.getAttribute('data-gallery-collapse') === '1') {
				return;
			}
			frame.setAttribute('data-gallery-collapse', '1');

			var header = document.createElement('div');
			header.className =
				'gallery-test-collapse-header gallery-test-params-header';

			var controlsId = 'gallery-plugin-params-collapse-body-' + index;
			if (!frame.id) {
				frame.id = controlsId;
			} else {
				controlsId = frame.id;
			}

			var collapsed = readCollapsed(STORAGE_PARAMS);
			var toggle = createToggleButton(
				collapsed ? 'Mostrar parámetros' : 'Ocultar parámetros',
				!collapsed,
			);
			toggle.setAttribute('aria-controls', controlsId);

			header.appendChild(toggle);
			if (frame.parentNode) {
				frame.parentNode.insertBefore(header, frame);
			}

			function applyState() {
				if (collapsed) {
					header.classList.add('gallery-test-collapsed');
					frame.classList.add('gallery-test-collapsed');
				} else {
					header.classList.remove('gallery-test-collapsed');
					frame.classList.remove('gallery-test-collapsed');
				}
				frame.hidden = collapsed;
				setExpanded(
					toggle,
					!collapsed,
					'Ocultar parámetros',
					'Mostrar parámetros',
				);
				requestAnimationFrame(notifyMapResize);
			}

			toggle.addEventListener('click', function () {
				collapsed = !collapsed;
				writeCollapsed(STORAGE_PARAMS, collapsed);
				applyState();
			});

			applyState();
		});
	}

	function looksLikeParamsPanel(el) {
		if (!el || el.nodeType !== 1) {
			return false;
		}
		if (el.classList.contains('gallery-test-collapse-header')) {
			return false;
		}
		if (el.id === 'mapjs' || el.id === 'mapajs') {
			return false;
		}
		if (el.id === 'tooltip_raton' || el.id === 'coord_raton') {
			return false;
		}
		var tag = el.tagName;
		if (tag !== 'DIV' && tag !== 'SECTION' && tag !== 'FORM') {
			return false;
		}
		return Boolean(
			el.querySelector(
				'input, select, textarea, label, button, #botonEliminar',
			),
		);
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
		while (panel && !looksLikeParamsPanel(panel)) {
			panel = panel.previousElementSibling;
		}
		if (!panel) {
			return;
		}

		panel.setAttribute('data-gallery-collapse-v1', '1');
		document.body.classList.add('gallery-test-v1-layout');

		var controlsId = 'gallery-plugin-params-collapse-body-v1';
		if (!panel.id) {
			panel.id = controlsId;
		} else {
			controlsId = panel.id;
		}

		var header = document.createElement('div');
		header.className =
			'gallery-test-collapse-header gallery-test-params-header';

		var collapsed = readCollapsed(STORAGE_PARAMS);
		var toggle = createToggleButton(
			collapsed ? 'Mostrar parámetros' : 'Ocultar parámetros',
			!collapsed,
		);
		toggle.setAttribute('aria-controls', controlsId);

		header.appendChild(toggle);
		panel.parentNode.insertBefore(header, panel);

		function applyState() {
			if (collapsed) {
				header.classList.add('gallery-test-collapsed');
				document.body.classList.add('gallery-test-v1-params-collapsed');
			} else {
				header.classList.remove('gallery-test-collapsed');
				document.body.classList.remove('gallery-test-v1-params-collapsed');
			}
			panel.hidden = collapsed;
			setExpanded(
				toggle,
				!collapsed,
				'Ocultar parámetros',
				'Mostrar parámetros',
			);
			requestAnimationFrame(notifyMapResize);
		}

		toggle.addEventListener('click', function () {
			collapsed = !collapsed;
			writeCollapsed(STORAGE_PARAMS, collapsed);
			applyState();
		});

		applyState();
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
