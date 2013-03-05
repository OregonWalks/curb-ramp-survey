// initialize  area map when page ready

jQuery(document).ready(function() {
	window.location.replace(window.location.href.split("#")[0] + "#mappage");
    jQuery(window).bind("orientationchange resize pageshow", fixContentHeight);
    document.body.onload = fixContentHeight;

    jQuery("#plus").click(function(){map.zoomIn();});
    jQuery("#minus").click(function(){map.zoomOut();});
    jQuery("#locate").click(function(){
        var control = map.getControlsBy("id", "locate-control")[0];
        if (control.active) {control.getCurrentLocation();} else {control.activate();}
    });

	jQuery('#intersectionpage').live('pageshow',function(event, ui) {if (null == i_map) {initDetailMap()};});

	jQuery("#yes").click(function() {
		rampAttrs.features[currentRamp].attributes.state = "yes"; rampAttrs.drawFeature(rampAttrs.features[currentRamp]);
		moveCW();
	});
	jQuery("#sortOf").click(function() {
		rampAttrs.features[currentRamp].attributes.state = "sort_of"; rampAttrs.drawFeature(rampAttrs.features[currentRamp]);
		moveCW();
	});
	jQuery("#no").click(function() {
		rampAttrs.features[currentRamp].attributes.state = "no"; rampAttrs.drawFeature(rampAttrs.features[currentRamp]);
		moveCW();
	});
	jQuery("#skip").click(function() {moveCW();});
	jQuery("#same").click(function() {
		var aFeature
		var features = rampAttrs.features
		var newState = features[(currentRamp == 0)?features.length-1:currentRamp-1].attributes.state;
		for (f in features) {
			aFeature = features[f];
			aFeature.attributes.state = newState; rampAttrs.drawFeature(aFeature);
		};
	});
	jQuery("#clear").click(function() {
		var aFeature
		for (f in rampAttrs.features) {
			aFeature = rampAttrs.features[f];
			aFeature.attributes.state = "none"; rampAttrs.drawFeature(aFeature);
		};
	});
	jQuery("#save").click(function(){
		var attr;
		var allNone = "n";
		var query;
		for (f in rampAttrs.features) {
			attr = rampAttrs.features[f].attributes;
			query = "q=UPDATE ramps SET state = '"+attr.state+"' where nodeid = "+intersectionID+" AND bearing = "+attr.bearing+" AND down_ramp = '"+attr.down_ramp+"' &api_key=612cfbb8eb5240dc9e3ef988a61c5b0c9b733765";
			jQuery.post("http://scottparker.cartodb.com/api/v2/sql", query);
			if (attr.state != "none") {allNone = "y"};
		};
		query = "q=UPDATE intersections SET evaluated = '"+allNone+"' where node_id = "+intersectionID+"&api_key=612cfbb8eb5240dc9e3ef988a61c5b0c9b733765";
	    jQuery.post("http://scottparker.cartodb.com/api/v2/sql", query, function(data) {areaMapStrategy.refresh({force:true});});
	});
});




   
  /*  jQuery('#popup').live('pageshow',function(event, ui){
        var cur_intID = '';
        for (var attr in selectedFeature.attributes){
            if (attr == "node_id") {
                cur_intID = selectedFeature.attributes[attr];
                document.getElementById("intersectionID").innerHTML = cur_intID;
            }
        }

        //put the query together to get info from the corners table in CartoDB
		var stNmQuery = "q=SELECT cw_street, ccw_street from corners where nodeid = "+cur_intID+" limit 1";
		var url = "http://scottparker.cartodb.com/api/v2/sql?"+stNmQuery;

        //request & parse the json
        jQuery.getJSON(url, function (data) {
            jQuery.each(data.rows[0], function(key, val) {
				if (key == 'cw_street') {document.getElementById("streetR2").innerHTML = val;}
				if (key == 'ccw_street') {document.getElementById("streetL2").innerHTML = val;}
            });
        });
    });  */


/* function initLayerList() {
    jQuery('#layerspage').page();
    jQuery('<li>', {
            "data-role": "list-divider",
            text: "Base Layers"
        })
        .appendTo('#layerslist');
    var baseLayers = map.getLayersBy("isBaseLayer", true);
    jQuery.each(baseLayers, function() {
        addLayerToList(this);
    });

    jQuery('<li>', {
            "data-role": "list-divider",
            text: "Overlay Layers"
        })
        .appendTo('#layerslist');
    var overlayLayers = map.getLayersBy("isBaseLayer", false);
    jQuery.each(overlayLayers, function() {
        addLayerToList(this);
    });
    jQuery('#layerslist').listview('refresh');
    
    map.events.register("addlayer", this, function(e) {
        addLayerToList(e.layer);
    });
}

function addLayerToList(layer) {
    var item = jQuery('<li>', {
            "data-icon": "check",
            "class": layer.visibility ? "checked" : ""
        })
        .append(jQuery('<a />', {
            text: layer.name
        })
            .click(function() {
                jQuery.mobile.changePage('#mappage');
                if (layer.isBaseLayer) {
                    layer.map.setBaseLayer(layer);
                } else {
                    layer.setVisibility(!layer.getVisibility());
                }
            })
        )
        .appendTo('#layerslist');
    layer.events.on({
        'visibilitychanged': function() {
            jQuery(item).toggleClass('checked');
        }
    });
} */