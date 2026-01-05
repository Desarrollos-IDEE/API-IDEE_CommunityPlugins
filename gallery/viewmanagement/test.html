<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <meta http-equiv="X-UA-ComyPluginatible" content="IE=edge" />
    <meta name="idee" content="yes">
    <title>ViewManagement</title>
    <script type="text/javascript" src="../../configuration/config.js"></script>
    <script type="text/javascript">
        document.write(`<link href="${IDEE_DOMAIN}/assets/css/apiidee.ol.min.css" rel="stylesheet" />`);
    </script>
    <link href="../../plugins/viewmanagement/dist/viewmanagement.ol.min.css" rel="stylesheet" />
    <style rel="stylesheet">
        html,
        body {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: auto;
        }
    </style>
</head>


<body>
    <div>
        <label for="selectPosicion">Selector de posición del plugin</label>
        <select name="position" id="selectPosicion">
            <option value="TL" selected="selected">Arriba Izquierda (TL)</option>
            <option value="TR">Arriba Derecha (TR)</option>
            <option value="BR">Abajo Derecha (BR)</option>
            <option value="BL">Abajo Izquierda (BL)</option>
        </select>
        <label for="selectCollapsed">Selector de collapsed</label>
        <select name="collapsed" id="selectCollapsed">
            <option value=""></option>
            <option value="true" selected="selected">true</option>
            <option value="false">false</option>
        </select>
        <label for="selectCollapsible">Selector de collapsible</label>
        <select name="collapsible" id="selectCollapsible">
            <option value=""></option>
            <option value="true" selected="selected">true</option>
            <option value="false">false</option>
        </select>
        <label for="tooltipInput">Tooltip</label>
        <input type="text" value="Gestión de la vista" id="tooltipInput"/>
        <label for="selectIsdraggable">Parámetro isDraggable</label>
        <select name="isdraggable" id="selectIsdraggable">
            <option value=""></option>
            <option value="true">true</option>
            <option value="false" selected="selected">false</option>
        </select>
        <label for="selectPredefinedZoom">Parámetro predefinedZoom</label>
        <select name="predefinedZoom" id="selectPredefinedZoom">
            <option value=""></option>
            <option value="true" selected="selected">true</option>
            <option value="false">false</option>
        </select>
        <label for="selectZoomExtent">Parámetro zoomExtent</label>
        <select name="zoomExtent" id="selectZoomExtent">
            <option value=""></option>
            <option value="true" selected="selected">true</option>
            <option value="false">false</option>
        </select>
        <label for="selectViewHistory">Parámetro viewhistory</label>
        <select name="viewhistory" id="selectViewHistory">
            <option value=""></option>
            <option value="true" selected="selected">true</option>
            <option value="false">false</option>
        </select>
        <label for="selectZoomPanel">Parámetro zoompanel</label>
        <select name="zoompanel" id="selectZoomPanel">
            <option value=""></option>
            <option value="true" selected="selected">true</option>
            <option value="false">false</option>
        </select>
        <input type="button" value="Eliminar Plugin" name="eliminar" id="botonEliminar"/>
    </div>
    <div id="mapjs" class="container"></div>
    <script type="text/javascript">
        document.write(`<script src="${IDEE_DOMAIN}/vendor/browser-polyfill.js"><\/script>`);
        document.write(`<script src="${IDEE_DOMAIN}/js/apiidee.ol.min.js"><\/script>`);
        document.write(`<script src="${IDEE_DOMAIN}/js/configuration.js"><\/script>`);
    </script>
    <script type="text/javascript" src="../../plugins/viewmanagement/dist/viewmanagement.ol.min.js"></script>
    <script type="text/javascript">
        const urlParams = new URLSearchParams(window.location.search);
        IDEE.language.setLang(urlParams.get('language') || 'es');

        const map = IDEE.map({
            container: 'mapjs',
        });
        let mp,collapsed,collapsible,isdraggable,zoomextent,viewhistory,zoompanel,predefinedzoom;
        crearPlugin({});
        const selectPosicion = document.getElementById("selectPosicion");
        const selectCollapsed = document.getElementById("selectCollapsed");
        const selectCollapsible = document.getElementById("selectCollapsible");
        const tooltipInput = document.getElementById("tooltipInput");
        const selectIsdraggable = document.getElementById("selectIsdraggable");
        const selectPredefinedZoom = document.getElementById("selectPredefinedZoom");
        const selectZoomExtent = document.getElementById("selectZoomExtent");
        const selectViewHistory = document.getElementById("selectViewHistory");
        const selectZoomPanel = document.getElementById("selectZoomPanel");
        selectPosicion.addEventListener('change',cambiarTest);
        selectCollapsed.addEventListener('change',cambiarTest);
        selectCollapsible.addEventListener('change',cambiarTest);
        tooltipInput.addEventListener('change',cambiarTest);
        selectIsdraggable.addEventListener('change',cambiarTest);
        selectPredefinedZoom.addEventListener('change',cambiarTest);
        selectZoomExtent.addEventListener('change',cambiarTest);
        selectViewHistory.addEventListener('change',cambiarTest);
        selectZoomPanel.addEventListener('change',cambiarTest);

        function cambiarTest(){
            let objeto = { }
            objeto.position = selectPosicion.options[selectPosicion.selectedIndex].value;
            let collapsedValor = selectCollapsed.options[selectCollapsed.selectedIndex].value;
            collapsed = collapsedValor != "" ? objeto.collapsed = (collapsedValor == "true" || collapsedValor == true) : "true";
            let collapsibleValor = selectCollapsible.options[selectCollapsible.selectedIndex].value;
            collapsible = collapsibleValor != "" ? objeto.collapsible = (collapsibleValor == "true" || collapsibleValor == true) : "true";
            objeto.tooltip = tooltipInput.value;
            let isDraggableValor = selectIsdraggable.options[selectIsdraggable.selectedIndex].value;
            isdraggable = isDraggableValor != "" ? objeto.isDraggable = (isDraggableValor == "true" || isDraggableValor == true) : "true";
            let zoomExtentValor = selectZoomExtent.options[selectZoomExtent.selectedIndex].value;
            zoomextent = zoomExtentValor != "" ? objeto.zoomExtent = (zoomExtentValor == "true" || zoomExtentValor == true) : "true";
            let viewHistoryValor = selectViewHistory.options[selectViewHistory.selectedIndex].value;
            viewhistory = viewHistoryValor != "" ? objeto.viewhistory = (viewHistoryValor == "true" || viewHistoryValor == true) : "true";
            let zoomPanelValor = selectZoomPanel.options[selectZoomPanel.selectedIndex].value;
            zoompanel = zoomPanelValor != "" ? objeto.zoompanel = (zoomPanelValor == "true" || zoomPanelValor == true) : "true";
            let predefinedZoomValor = selectPredefinedZoom.options[selectPredefinedZoom.selectedIndex].value;
            predefinedzoom = predefinedZoomValor != "" ? objeto.predefinedZoom = (predefinedZoomValor == "true" || predefinedZoomValor == true) : "true";
            map.removePlugins(mp);
            crearPlugin(objeto);
        }

        function crearPlugin(propiedades){
            mp = new IDEE.plugin.ViewManagement(propiedades);
            map.addPlugin(mp);
        }
        const botonEliminar = document.getElementById("botonEliminar");
        botonEliminar.addEventListener("click", function() {
            map.removePlugins(mp);
        });
    </script>
</body>
<!-- Global site tag (gtag.js) - Google Analytics -->
<script type="text/javascript">
	document.write(`<script async src="https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}"><\/script>`);
</script>

<script type="text/javascript"
	src="../../configuration/google_analytics_content.js"></script>

</html>
