// initialize  area map when page ready

jQuery(document).ready(function() {
	window.location.replace(window.location.href.split("#")[0] + "#mappage");
    jQuery(window).bind("orientationchange resize", setSize);
    document.body.onload = initAreaMap;

	jQuery("#mappage").on("pageshow", function(event, ui) {if (window.map && window.map instanceof OpenLayers.Map) {map.updateSize();};});

    jQuery("#plus").click(function(){map.zoomIn();});
    jQuery("#minus").click(function(){map.zoomOut();});
    jQuery("#locate").click(function(){
        var control = map.getControlsBy("id", "locate-control")[0];
        if (control.active) {control.getCurrentLocation();} else {control.activate();};
    });

	jQuery("#intersectionpage").on("pageshow", function(event, ui) {
		setSize();
		if (null == i_map) {
			initDetailMap();}
		else if(!fromRampNotes) {
			ramps.protocol.params.q = "select * from ramps where nodeid = "+intersectionID+ " order by bearing asc, down_ramp asc";
			detailMapStrategy.refresh({force: true});
			updateNotes();
		};
		fromRampNotes = false;
	});

	jQuery("#yes").click(function() {
		rampAttrs.features[currentRamp].attributes.state = "yes"; rampAttrs.drawFeature(rampAttrs.features[currentRamp]);
		moveCW();
	});
	jQuery("#sortOf").click(function() {
		rampAttrs.features[currentRamp].attributes.state = "sort_of"; rampAttrs.drawFeature(rampAttrs.features[currentRamp]);
		var attr = rampAttrs.features[currentRamp].attributes
		rampID = (intersectionID*10000)+(10*attr.bearing)+((attr.down_ramp == "cw")?0:1);
		moveCW();
		fromRampNotes = true;
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
			query = "q=UPDATE ramps SET state = '"+attr.state+"' WHERE nodeid = "+intersectionID+" AND bearing = "+attr.bearing+" AND down_ramp = '"+attr.down_ramp+"' &api_key="+cartoDBkey;
			jQuery.post("http://scottparker.cartodb.com/api/v2/sql", query);
			if (attr.state != "none") {allNone = "y"};
		};
		query = "q=UPDATE intersections SET evaluated = '"+allNone+"' WHERE node_id = "+intersectionID+"&api_key="+cartoDBkey;
	    jQuery.post("http://scottparker.cartodb.com/api/v2/sql", query, function(data) {areaMapStrategy.refresh({force:true});});

		var selected;
		jQuery("#intersectionNoteChoices option").each(function(j){
			selected = jQuery(this).prop("selected");
			if (selected && !intersectionNotes[j]) {
				query = "q=INSERT INTO comments (association, associd, text) VALUES ('I', "+intersectionID+", '"+jQuery(this).val()+"') &api_key="+cartoDBkey;
				jQuery.post("http://scottparker.cartodb.com/api/v2/sql", query);
			};
			if (!selected && intersectionNotes[j]) {
				query = "q=DELETE FROM comments WHERE association = 'I' AND associd = "+intersectionID+" AND text = '"+jQuery(this).val()+"' &api_key="+cartoDBkey;
				jQuery.post("http://scottparker.cartodb.com/api/v2/sql", query);
			};
		});
		jQuery("#rampNoteChoices option").each(function(j){
			selected = jQuery(this).prop("selected");
			if (selected && !rampNotes[j]) {
				query = "q=INSERT INTO comments (association, associd, text) VALUES ('R', "+rampID+", '"+jQuery(this).val()+"') &api_key="+cartoDBkey;
				jQuery.post("http://scottparker.cartodb.com/api/v2/sql", query);
			};
			if (!selected && rampNotes[j]) {
				query = "q=DELETE FROM comments WHERE association = 'R' AND associd = "+rampID+" AND text = '"+jQuery(this).val()+"' &api_key="+cartoDBkey;
				jQuery.post("http://scottparker.cartodb.com/api/v2/sql", query);
			};
		});
	});

	jQuery("#rampNotes").on("pageshow", function(event, ui) {updateRampNotes();});
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