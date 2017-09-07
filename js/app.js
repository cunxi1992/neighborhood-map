var model = [
  {
    name: "世界之窗",
		lat: 22.5345938179 ,
		lng: 113.9745049325,
		show: true,
		selected: false,
		venueid: "5204feb1498ed42a61bafb61"
  },
  {
    name: "欢乐谷",
		lat: 22.5398882610,
		lng: 113.9810360202,
		show: true,
		selected: false,
		venueid: "4c0ba827009a0f47975cebbf"
  },
  {
    name: "红树林海滨生态公园",
		lat: 22.5223999064,
		lng: 114.0003144099,
		show: true,
		selected: false,
		venueid: "4b6fe660f964a5206dff2ce3"
  },
  {
    name: "世纪假日广场瑞思中心",
		lat: 22.5380983025,
		lng: 113.9730486125,
		show: true,
		selected: false,
		venueid: "4f531694e4b07e4c63681170"
  },
  {
    name: "中国民俗文化村-这是我的家",
		lat: 22.5313309544,
		lng: 113.9884073820,
		show: true,
		selected: false,
		venueid: "50f2dd31e4b0ff7d3253b877"
  },
  {
    name: "欢乐海岸",
		lat: 22.5237798104,
		lng: 113.9873786138,
		show: true,
		selected: false,
		venueid: "5114cd90e4b06bb0ed15a97f"
  },
  {
    name: "华侨城地铁站",
		lat: 22.539709,
		lng: 113.991722,
		show: true,
		selected: false,
		venueid: "4e746a9a62e1263515eed5d9"
  },
  {
    name: "天虹商场",
		lat: 22.536881,
		lng: 113.975105,
		show: true,
		selected: false,
		venueid: "4e97f82261af7d268f13d826"
  },
  {
    name: "香港大学深圳医院",
		lat: 22.531831,
		lng: 114.002473,
		show: true,
		selected: false,
		venueid: "4d81ab1abede5481126003d1"
  },
  {
    name: "相思谷",
		lat: 22.543097,
		lng: 113.995381,
		show: true,
		selected: false,
		venueid: "4e746a9a62e1263515eed5d9"
  }
];

/*
 * 初始化地图，设置地图的中心点坐标、缩放比例
 */
var map, infoWindow;
    function initMap() {
      map = new google.maps.Map(
          document.getElementById('map'),
          {
            center: {lat: 22.5360609, lng: 113.9750767},
            zoom: 13,
            mapTypeControl: false
          }
        );
      infowindow = new google.maps.InfoWindow();
      //激活knockout绑定
      ko.applyBindings(new viewModel());
    }


var viewModel = function() {
  var self = this;
  self.errorDisplay = ko.observable('');
  self.mapList = [];
  model.forEach(function(marker){
    self.mapList.push(new google.maps.Marker({
      position: {lat: marker.lat, lng: marker.lng},
      map: map,
      name: marker.name,
      show: ko.observable(marker.show),
      selected: ko.observable(marker.selected),
      venueid: marker.venueid,
      animation: google.maps.Animation.DROP
    }));
  });

  self.mapListLength = self.mapList.length;
  self.currentMapItem = self.mapList[0];
  self.makeBounce = function(marker){
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){ marker.setAnimation(null);}, 500);
  };
  self.addApiInfo = function(passedMapMarker){
      $.ajax({
        url: "https://api.foursquare.com/v2/venues/" + passedMapMarker.venueid + '?client_id=CGOJQ1C3N5GARA4Q53TWRBUWARWXRPEXEG1KM1CCVFDWO2VA&client_secret=OQXLE0UEJOKJLGOM0AT5NA5JE10AXSFNS3GT1PKJGCQ3JJM2&v=20160614',
        dataType: "json",
        success: function(data){
          var result = data.response.venue;
          passedMapMarker.likes = result.hasOwnProperty('likes') ? result.likes.summary: "";
          passedMapMarker.rating = result.hasOwnProperty('rating') ? result.rating: "";
        },
        error: function(e) {
          self.errorDisplay("哎呀，好像哪里出错了，等一会再试试吧...");
        }
      });
  };

  // 遍历maplist，添加事件监听器
  for (var i=0; i < self.mapListLength; i++){
    (function abc(passedMapMarker){
    	self.addApiInfo(passedMapMarker);
		passedMapMarker.addListener('click', function(){
		self.setSelected(passedMapMarker);
			});
	})
    (self.mapList[i]);
  }

self.filterText = ko.observable('');
self.applyFilter = function() {
    var currentFilter = self.filterText();
    infowindow.close();
    if (currentFilter.length === 0) {
			self.setAllShow(true);
		} else {
			for (var i = 0; i < self.mapListLength; i++) {
				if (self.mapList[i].name.toLowerCase().indexOf(currentFilter.toLowerCase()) > -1) {
					self.mapList[i].show(true);
					self.mapList[i].setVisible(true);
				} else {
					self.mapList[i].show(false);
					self.mapList[i].setVisible(false);
				}
			}
    }
    infowindow.close();
  };

  self.setAllShow = function(showVar) {
    for (var i = 0; i < self.mapListLength; i++) {
      self.mapList[i].show(showVar);
      self.mapList[i].setVisible(showVar);
    }
  };

  self.setAllUnselected = function() {
		for (var i = 0; i < self.mapListLength; i++) {
			self.mapList[i].selected(false);
		}
	};

  self.setSelected = function(location) {
		self.setAllUnselected();
        location.selected(true);

        self.currentMapItem = location;

        formattedLikes = function() {
        	if (self.currentMapItem.likes === "" || self.currentMapItem.likes === undefined) {
        		return "没有人来过这里";
        	} else {
        		return "这个地方有 " + self.currentMapItem.likes;
        	}
        };

        formattedRating = function() {
        	if (self.currentMapItem.rating === "" || self.currentMapItem.rating === undefined) {
        		return "这个地方还没有评分";
        	} else {
        		return "这个地方的评分是 " + self.currentMapItem.rating + "分";
        	}
        };

        var formattedInfoWindow = "<h5>" + self.currentMapItem.name + "</h5>" + "<div>" + formattedLikes() + "</div>" + "<div>" + formattedRating() + "</div>";

		infowindow.setContent(formattedInfoWindow);
        infowindow.open(map, location);
        self.makeBounce(location);
	};
};
