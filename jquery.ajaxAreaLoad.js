/**
 * jQuery Plugin - Ajax province,city and area load
 * @author https://github.com/huguangju
 * @beta 1.0.0
 * @example
 * // only show city and area:
 * $( selector ).ajaxAreaLoad({
 * 	    url: 'http://localhost:8080/crs/system/area/list',
 * 	    province : 'province1',
		city : 'city1',
		area : 'area1',
		defaultProvinceId: 510000,
		defaultCityId: 510100,
		hiddenProvince: true,
 * });
 */
;(function( $, window, document, undefined ) {
	'use strict';

	var AreaLoad = function( ele, opts ) {
		this.$ele = ele,

		this.defaults = {
			url: 'http://localhost:8080/crs/system/area/list',
			hiddenProvince: false,
			hiddenCity: false,
			hiddenArea: false
		},

		this.options = $.extend( {}, this.defaults, {
			provinceUrl: this.defaults.url + '?level=province',
			cityUrl: this.defaults.url + '?level=city&pid=',
			areaUrl: this.defaults.url + '?level=area&pid='
		}, opts );
	}

	AreaLoad.prototype = {
		init: function() {
			this.render();

			this.regProvinceEvent();
			this.regCityEvent();

			return this.$ele;
		},

		load: function( url, selectId, defaultSelected, isHidden ) {
			var that = this;

			$.ajax({
				url: url,
				success: function( result ) {

					if ( result ) {
						var $selected = $( '#' + selectId );

						if ( isHidden ) {
							$selected.attr( 'disabled', 'disabled' );
						} else {
							$selected.show();
						}

						if ( defaultSelected ) {
							for (var i = 0; i < result.length; i++ ) {
								if ( defaultSelected == result[i].id ) {
									// new Option([text], [value], [defaultSelected], [selected])
									$selected[0].options.add( new Option( result[i].name, result[i].id, true, true));
								} else {
									$selected[0].options.add( new Option( result[i].name, result[i].id ));
								}
							}
						} else {
							for (var i = 0; i < result.length; i++) {
								$selected[0].options.add( new Option( result[i].name, result[i].id) );
							}
						}
					}
				}
			});
		},

		render: function() {
			if ( this.options.province ) {
				var $_province = $( "<select name='" + this.options.province + "' id='" + this.options.province + "' style='display:none;'>" );
				$_province[0].options.add( new Option( "-请选择省份-", "0" ) );
				this.$ele.append( $_province );

				if ( this.options.city ) {
					var $_city = $( "<select name='" + this.options.city + "' id='" + this.options.city + "' style='display:none;'>");
					this.$ele.append( $_city );
				}

				if (this.options.area) {
					var $_area = $( "<select name='" + this.options.area + "' id='" + this.options.area + "' style='display:none;'>"); // TODO
					this.$ele.append( $_area );
				}

				if ( this.options.defaultProvinceId ) {
					this.load( this.options.provinceUrl, 
						this.options.province,
						this.options.defaultProvinceId,
						this.options.hiddenProvince );

					if ( this.options.city ) {
						if ( this.options.defaultCityId ) {
							this.load( this.options.cityUrl + this.options.defaultProvinceId,
								this.options.city,
								this.options.defaultCityId,
								this.options.hiddenCity );

							if ( this.options.area ) {
								this.load( this.options.areaUrl + this.options.defaultCityId,
									this.options.area,
									this.options.defaultAreaId,
									this.options.hiddenArea );
							}
						}else{
							this.load( this.options.cityUrl + this.options.defaultProvinceId,
								this.options.city );							
						}

					} else {
						this.load( this.options.cityUrl + this.options.defaultProvinceId,
							this.options.city );
					}
				} else {
					this.load( this.options.provinceUrl, this.options.province );
				}
			}
		},

		/**
		 * Register province change event
		 */
		regProvinceEvent: function() {

			if ( this.options.city ) {
				var that = this,
					$province = $( '#' + that.options.province ),
					$city = $( '#' + this.options.city ),
					$area = $( '#' + that.options.area );

				$province.change( function() {

					if ( $(this).val() != 0 ) {
						$city.empty();
						$city[0].options.add( new Option( "-请选择城市-", "0" ) );

						that.load( that.options.cityUrl + $(this).val(), that.options.city );

						if ( that.options.area ) {
							if ( $area.val() != 0 && $city.val() != 0 ) {
								$area.empty(); 
								$area[0].options.add( new Option( "-请选择区域-", "0" ) );

								that.load( that.options.areaurl + $city.val(), that.options.area);
							} else {
								$area.empty(); 
								$area[0].options.add( new Option( "-请选择区域-", "0" ) );
							}
						}
					}
				});
			}
		},

		/**
		 * Register city change event
		 */
		regCityEvent: function() {

			if ( this.options.area ) {
				var that = this,
					$city = $( '#' + this.options.city ),
					$area = $( '#' + this.options.area );

				$city.change( function() {

					if ( $(this).val() != 0 ) {
						$area.empty();
						$area[0].options.add( new Option( "-请选择区域-", "0" ) );

						that.load( that.options.areaUrl + $(this).val(), that.options.area );
					}
				});
			}
		}
	};

	$.fn.ajaxAreaLoad = function(options) {
		var ajaxAreaLoader = new AreaLoad(this, options);
		return ajaxAreaLoader.init();
	}

})(jQuery, window, document);