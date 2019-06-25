//서비스가능한 레이어리스트 가져온 후 지도 시작하기
function setServiceableLayerList(){
	var url ='/getCapabilities.do';
	var parser = new ol.format.WMSCapabilities();
	$.ajax({
		url:url,
		aync: false
	}).done(function (response) {
		var result = parser.read(response);
		var groups = result.Capability.Layer.Layer;
		for(var i=0; i < groups.length;i++){
			var group = groups[i].Name;
			if(group != undefined){
				tmpLayer = allLayerList.getWmsLayer(groups[i].Name);
				if(tmpLayer != null){
					tmpLayer.setServiceable();	//setServiceable 은 LayerObject.prototype.setServicealbe을 호출함
				}
			}
		}
		//viewingLayerList 에 담았음
		//getWmsLayerList() 함수 호출 시 viewingLayerList(MapLayer 전역변수) 사용
		allLayerList.loadInitLayers();
		start();

	});
}

function start(){
	var vwordUrl = 'http://api.vworld.kr/req/wmts/1.0.0/';
    var prevHistories = [];
    var nextHistories = [];

	//vworld wtms 레이어
	vworld_base_layer = new ol.layer.Tile({
		title: "vworld일반",
		source: new ol.source.XYZ({
			url: './proxy.do?url='+ vwordUrl + vworldApikey + '/Base/{z}/{y}/{x}.png'
		})
	});

	vworld_satellite_layer = new ol.layer.Tile({
		title: "vworld항공",
		source: new ol.source.XYZ({
			url: './proxy.do?url='+ vwordUrl + vworldApikey + '/Satellite/{z}/{y}/{x}.jpeg'
		})
	});

	vworld_hybrid_layer = new ol.layer.Tile({
	  	title: "vworld하이브리드",
	  	source: new ol.source.XYZ({
	  		url: './proxy.do?url='+ vwordUrl + vworldApikey + '/Hybrid/{z}/{y}/{x}.png'
	  	})
	});

	//기본 WMS방식
	vector_all_layer = new ol.layer.Image({
        title: "WMS레이어",
        source: new ol.source.ImageWMS({
           	url: '/getWms.do',
        	ratio:1,
           	params:
	           	{
           			'LAYERS': encodeURIComponent(getWmsLayerList()),
           			'STYLES': encodeURIComponent(getWmsLayerList()),
           			//'LAYERS': 'LP_PA_CBND_BONBUN,LP_PA_CBND_BUBUN,LT_C_UQ111',
           			//'STYLES': 'LP_PA_CBND_BONBUN,LP_PA_CBND_BUBUN,LT_C_UQ111',
	    			//개발용
           			'KEY': 'key',
	    			'DOMAIN': 'localhost:8080',
	    			//서버용
           			//'KEY': 'BEED5E69-107E-3582-955D-FB1C66418225',
	    			//'DOMAIN': 'burtis.or.kr:8081',
	    			'WIDTH': '256',
	    			'HEIGHT': '256',
	    			'FORMAT': 'image/png',
	    			'TRANSPARENT': true,
	    			'BGCOLOR': '0xFFFFFF',
	    			'EXCEPTIONS' : 'text/xml'
	           	}
        })
    });

    BILD_SPANUAT = new ol.layer.Tile({
        visible: false,
         title: "BILD_SPANUAT",
        source: new ol.source.TileWMS({
            url: '/getWms2.do',
            params: {
                'FORMAT': 'image/png',
                'VERSION': '1.1.1',
                tiled: true,
                LAYERS: 'bs:BILD_STTUS_VIEW',
                STYLES: 'BILD_SPANUAT',
            }
        })
    });
    BILD_STRCT = new ol.layer.Tile({
        visible: false,
        title: "BILD_STRCT",
        source: new ol.source.TileWMS({
            url: '/getWms2.do',
            params: {
                'FORMAT': 'image/png',
                'VERSION': '1.1.1',
                tiled: true,
                LAYERS: 'bs:BILD_STTUS_VIEW',
                STYLES: 'BILD_STRCT',
            }
        })
    });
    BILD_USEPRPS = new ol.layer.Tile({
        visible: false,
        title: "BILD_USEPRPS",
        source: new ol.source.TileWMS({
            url: '/getWms2.do',
            params: {
                'FORMAT': 'image/png',
                'VERSION': '1.1.1',
                tiled: true,
                LAYERS: 'bs:BILD_STTUS_VIEW',
                STYLES: 'BILD_USEPRPS',
            }
        })
    });






    //WFS결과 vector레이어
	vector_layer = new ol.layer.Vector({
		source: vectorSource,
		style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.5)'
            }),
            stroke: new ol.style.Stroke({
                color: 'rgba(0, 153, 255, 0.8)',
                width: 3
            }),
            image: new ol.style.Circle({
                radius: 5,
                stroke: new ol.style.Stroke({
                  color: 'rgba(0, 153, 255, 0.8)'
                }),
                fill: new ol.style.Fill({
                  color: 'rgba(255, 255, 255, 0.5)'
                })
            })
        })
	});

	measure_layer = new ol.layer.Vector({
        title: "측정",
		source: measureSource,
		style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255,165,165, 0.5)'
              }),
            stroke: new ol.style.Stroke({
                color: '#ff0000',
                width: 3
            }),
            image: new ol.style.Circle({
                radius: 3,
                stroke: new ol.style.Stroke({
                  color: '#AD0303'
                }),
                fill: new ol.style.Fill({
                  color: '#AD0303'
                })
            })
        })
	});

	//주제도 속성조회 사용
	focus_layer = new ol.layer.Vector({
		source: focusSource,
		style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.5)'
            }),
            stroke: new ol.style.Stroke({
                color: 'rgba(0, 153, 255, 0.8)',
                width: 3
            }),
            image: new ol.style.Circle({
                radius: 5,
                stroke: new ol.style.Stroke({
                  color: 'rgba(0, 153, 255, 0.8)'
                }),
                fill: new ol.style.Fill({
                  color: 'rgba(255, 255, 255, 0.5)'
                })
            })
        }),
        zIndex : 9999
	});


	//mainMap DIV 설정 시작
	scaleLineControl.setUnits('metric');//축척단위
	var olMapDiv = document.getElementById('mainMap');
	mainMap = new ol.Map({
		 target: olMapDiv,
		 loadTilesWhileAnimating:true,
		 loadTilesWhileInteracting: true,

	     view: new ol.View({
	    	 projection: projectionVworldSRS,
	    	 center: SrsVworldCenter,
	    	 //extent: SrsVworldExtent,
	    	 maxZoom:21,
	    	 minZoom:11,
	    	 zoom: 11
	     }),
	     interactions: ol.interaction.defaults({
             dragPan: false,
             mouseWheelZoom: false,
             doubleClickZoom :false
         }).extend([
             new ol.interaction.DragPan({kinetic: false}),
             new ol.interaction.MouseWheelZoom({duration: 0})
         ])
	});

    // //기본 WMS방식
    vector_all_layer2 = new ol.layer.Image({
        title: "WMS레이어2",
        source: new ol.source.ImageWMS({
            url: '/getWms.do',
            ratio:1,
            params:
                {
                 //   'LAYERS': encodeURIComponent(getWmsLayerList()),
                    //'STYLES': encodeURIComponent(getWmsLayerList()),
                   'LAYERS': 'LP_PA_CBND_BONBUN,LP_PA_CBND_BUBUN,LT_C_UQ111',
                    'STYLES': 'LP_PA_CBND_BONBUN,LP_PA_CBND_BUBUN,LT_C_UQ111',

	    			//개발용
           			'KEY': 'key',
	    					'DOMAIN': 'localhost:8080',
                    'WIDTH': '256',
                    'HEIGHT': '256',
                    'FORMAT': 'image/png',
                    'TRANSPARENT': true,
                    'BGCOLOR': '0xFFFFFF',
                    'EXCEPTIONS' : 'text/xml'
                }
        })
    });

	var initLayerListCount = getWmsLayerList().length;
	if(initLayerListCount < 1){
		vector_all_layer.setVisible(true);
	}
	vector_all_layer.setVisible(false);
    vector_all_layer2.setVisible(true);
	vworld_hybrid_layer.setVisible(false);
	vworld_satellite_layer.setVisible(false);
	vworld_base_layer.setVisible(true);
	mainMap.addLayer(vworld_base_layer);
	mainMap.addLayer(vworld_satellite_layer);
	mainMap.addLayer(vworld_hybrid_layer);
	mainMap.addLayer(vector_all_layer);
      //mainMap.addLayer(vector_all_layer2);
	mainMap.addLayer(vector_layer);
	mainMap.addLayer(measure_layer);
	mainMap.addLayer(focus_layer);
    mainMap.addLayer(BILD_SPANUAT);
    mainMap.addLayer(BILD_STRCT);
    mainMap.addLayer(BILD_USEPRPS);
	//mainMap.addControl(zoomControl);
	mainMap.addControl(scaleLineControl);


	mainMap.on("click", function(e){

		if(declineSource != null)
		{
			declineSource.forEachFeature(function(f)
			{
				if(f.get("lv") == null)
					return;

				if(f.getGeometry().intersectsExtent([e.coordinate[0],e.coordinate[1],e.coordinate[0],e.coordinate[1]]))
				{
					var lbl = f.get("nm") + "(" + f.get("cd") + ")";
					var val = f.get("zscore") == null ? 0 : f.get("zscore");

					if( f.get("ctg") == "쇠퇴종합"){
						val = f.get("idx");
					}

					layerSub2("지역별 현황", lbl, f.get("lv"), val);

					return;
				}
			});
		}
	});

    mainMap.on("moveend", function() {

        var that = this;
        var extent = [CrsLeftBottomX, CrsLeftBottomY, CrsRightTopX, CrsRightTopY];
        var center = this.getView().getCenter();
        if(!ol.extent.containsCoordinate(extent, center)) {
            var history = prevHistories[prevHistories.length-1];
            var view = mainMap.getView();
            that.flag = true;
            view.setCenter(history.center);
            view.setResolution(view.constrainResolution(history.resolution));
        }
        else {
            if(that.flag) {
                that.flag = false;
            }
            else {
                var history = {
                    center : center,
                    resolution : mainMap.getView().getResolution()
                };
                prevHistories.push(history);
                nextHistories = [];
            }
        }

    });
}
