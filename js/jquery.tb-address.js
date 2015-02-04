;(function($){

  "use strict";

  var $loading = $('.loading'),
      $addressInfo = $('.u-address-info'),
      $addressPopup = $('#address-popup'),
      $addressAllTitle = $('.address-all-title'),
      $provinceTitle = $('#addressAllTitle-province'),
      $cityTitle = $('#addressAllTitle-city'),
      $areaTitle = $('#addressAllTitle-area'),
      $addressAllConWrap = $('#addressAllConWrap'),
      $listItem = $('#addressAllConWrap .u-list-item');

  function loading(){ $('.loading').show() }

  function loaded(){ $('.loading').hide() }

  // 省市区数据归类
  function parseData(data){
    var provs = [],
        citys = [],
        areas = [];

    $.each(data, function(index, item){
      if(item.level == $.fn.address.defaults.level.province){
        provs.push(item)
      }else if(item.level == $.fn.address.defaults.level.city){
        citys.push(item)
      }else if(item.level == $.fn.address.defaults.level.area){
        areas.push(item)
      }
    });

    return {
      provs : provs,
      citys : citys,
      areas : areas
    }
  }

  // 构造函数
  var Address = function (element, options) {
    var base = this,
        $element = $(element);

    base.init = function (data) {

      base.setOptions(options);

      base.insertMask();

      base.setAddress(options.initial)

      var parsedDatas = parseData(data);
      $(document).data('parsedDatas', parsedDatas);

      // 点击地址详细信息
      $addressInfo.click(function(){
        $(this).addClass('u-info-active')
        $(this).find('s').addClass("u-address-info-s-hover")

        // 设置默认标题
        var ids = base.getTitleIds(),
            names = base.getTitleNames()

        if(!ids){
          base.setTitle($provinceTitle, options.initial.pv, options.initial.pn)
          base.setTitle($cityTitle, options.initial.cv, options.initial.cn)
          base.setTitle($areaTitle, options.initial.av, options.initial.an)

          base.renderData(base.getAreasByPid(parsedDatas.areas, options.initial.cv))
        }else{
          ids = ids.split('-')
          names = names.split('-')

          console.log(names)
          if(names.length == 3){
            base.setTitle($provinceTitle, ids[0], names[0])
            base.setTitle($cityTitle, ids[1], names[1])
            base.setTitle($areaTitle, ids[2], names[2])
          }

          // TODO:如果区域id相同且区域列表不为空就不重新查询了
          // 根据市id来查询并展示区域列表
          base.renderData(base.getAreasByPid(parsedDatas.areas, ids[1]))
        }

        $addressPopup.show()
        $('.u-popup-mask').removeClass('u-popup-mask-hidden u-overlay-mask-hidden')
      });

      $addressAllTitle.click(function(){
        $addressAllTitle.removeClass("address-all-title-selected")
        $(this).addClass("address-all-title-selected")
      })

      // 点击关闭按钮关闭浮层
      $('.address-all-close').click(function(){
        closePopup()
      })

      // 标题栏点击事件
      // 省标题
      $provinceTitle.click(function(){
        $(this).html('请选择<s></s>')
        $(this).siblings().addClass('address-all-title-hidden')

        base.renderData(base.getAllProvince(parsedDatas))
      })

      // 市标题
      $cityTitle.click(function(){
        $(this).html('请选择<s></s>')
        $(this).next().addClass('address-all-title-hidden')

        renderData(base.getCitysByPid(parsedDatas, $provinceTitle.data('id')))
      })

    }

    base.setOptions = function (options) {
      base.options = options;
    };

    base.insertMask = function(){
      var $mask = $('<div style="width: 100%; left: 0px; top: 0px; height: 100%; position: fixed; -webkit-user-select: none; z-index: 100000003;" class="u-popup-mask u-overlay-mask u-popup-mask-hidden u-overlay-mask-hidden"></div>').prependTo($('body'))
      $mask.click(function(){
        $addressPopup.hide();
        $addressInfo.removeClass('u-info-active').find('s').removeClass("u-address-info-s-hover");
        $(this).addClass('u-popup-mask-hidden u-overlay-mask-hidden')
      })
    }

    base.setAddress = function(address){
      var title = address.pn + address.cn + address.an;
      $addressInfo.attr('title', title);
      $addressInfo.html(' ' + title + ' <s></s>');
      $addressInfo.data('id', address.pv + '-' + address.cv + '-' + address.av);
      $addressInfo.data('name', address.pn + '-' + address.cn + '-' + address.an);
    }

    // 加载省或市或区的列表到面板上
    base.renderData = function(datas){
      var $list = $addressAllConWrap.find('ul.u-list-add-con')
      if($.isArray(datas)){
        $list.empty()
        $.each(datas, function(index, item){
          var $item = $('<li class="u-list-item" data-id="'+ item.id +'" data-title="'+ item.name +'" data-level="' + item.level + '">'+ item.name +'</li>')
          $item.click(base.listItemEvent)
          $list.append($item)
        })
      }
    }

    // 某个地址项的点击事件
    base.listItemEvent = function(){
      var title = $(this).data('title'),
          id = $(this).data('id'),
          level = $(this).data('level'),
          parsedDatas = $(document).data('parsedDatas')

      console.log(title, parsedDatas)

      // 省面板
      if($provinceTitle.hasClass('address-all-title-selected')){
        base.setTitle($provinceTitle, id, title)

        $cityTitle.siblings().removeClass("address-all-title-selected")
        $cityTitle.removeClass('address-all-title-hidden').addClass("address-all-title-selected").html('请选择<s></s>')

        $addressAllConWrap.find('ul').empty()
      }

      // 市面板
      if($cityTitle.hasClass('address-all-title-selected')){
        // 市列表
        //renderData(getAddressByPid(id))
        base.renderData(base.getCitysByPid(parsedDatas.citys, id))

        // 点击了一个市
        if(level == base.options.level.city){
          base.setTitle($cityTitle, id, title)

          $areaTitle.siblings().removeClass("address-all-title-selected")
          $areaTitle.removeClass('address-all-title-hidden').addClass("address-all-title-selected").html('请选择<s></s>')

          $addressAllConWrap.find('ul').empty()

          // 区列表
          base.renderData(base.getAreasByPid(parsedDatas.areas, id))
        }
      }

      // 区面板
      if($areaTitle.hasClass('address-all-title-selected')){

        // 点击了一个区
        if(level == base.options.level.area){
          base.setTitle($areaTitle, id, title)

          // 关闭浮层并最终显示到页面
          var names,
            _names,
            oriNames = $addressInfo.data('name')

          var address = {
            pn : $provinceTitle.data('name'),
            cn : $cityTitle.data('name'),
            an : $areaTitle.data('name'),
            pv : $provinceTitle.data('id'),
            cv : $cityTitle.data('id'),
            av : $areaTitle.data('id')
          }

          if(!address.pn || !address.cn || !address.an){
            if(!address.pn && !address.cn && address.an){ // 只点击区域
              if(oriNames.split('-').length == 3 ){
                names = oriNames.substr(0, oriNames.lastIndexOf('-'))
                _names = names.split('-')

                address.pn = _names[0]
                address.cn = _names[1]
                address.an = title

                base.setAddress(address)
              }
            }else if(!address.pn && address.cn && address.an){ // 点击了城市/区域
              if(oriNames.split('-').length == 3 ){
                address.pn = oriNames.substr(0, oriNames.indexOf('-'))
                base.setAddress(address)
              }
            }
          }else{
            base.setAddress(address)
          }

          console.log('结束: ', address)
          base.closePopup()

          // TODO: 生成省市区的id的隐藏域供表单提交时使用
        }
      }
    }

    // 关闭浮层
    base.closePopup = function(){
      $addressPopup.hide()
      $('.u-popup-mask').addClass('u-popup-mask-hidden u-overlay-mask-hidden')
      $addressInfo.removeClass('u-info-active').find('s').removeClass("u-address-info-s-hover")
    }

    // 设置面板标题
    base.setTitle = function(target, id, title){
      target.html( title + '<s></s>')
      target.data('id', id)
      target.data('name', title)
    }

    base.getTitleIds = function(){
      var pv = $provinceTitle.data('id'),
        cv = $cityTitle.data('id'),
        av = $areaTitle.data('id'),
        ids = ''

      if(pv && cv && av){
        ids = pv + '-' + cv +'-' + av
      }
      return ids
    }

    base.getTitleNames = function(){
      var pn = $provinceTitle.data('name'),
        cn = $cityTitle.data('name'),
        an = $areaTitle.data('name'),
        names = ''

      if(pn && cn && an){
        names = pn + '-' + cn +'-' + an
      }
      return names
    }

    base.getAllProvince = function(parsedData){
      return parsedData.provs
    }

    // 根据省id查其下所有市
    base.getCitysByPid = function(citys, pid){
      var filteredCitys = []
      $.each(citys, function(index, item){
        if(item.pid == pid){
          filteredCitys.push(item)
        }
      })
      return filteredCitys
    };

    // 根据市id查其下所有区
    base.getAreasByPid = function(areas, pid){
      var filteredAreas = [];
      $.each(areas, function(index, item){
        if(item.pid == pid){
          filteredAreas.push(item)
        }
      });
      return filteredAreas;
    }


    // 通过JSONP跨域请求数据
    $.ajax({
      async: false,
      dataType:'jsonp',
      jsonpCallback : 'getCityDatas',
      url : options.url,
      beforeSend : function(){ loading() },
      complete : function(){ loaded()},
      success : function(data){ base.init(data); }
    })

  } // Address


  $.fn.address = function(settings, args){
    return this.each(function(){
      var $this = $(this),
          data = $this.data('address'),
          options = $.extend(true, {}, $.fn.address.defaults, typeof settings == 'object' && settings)

      if(!data){ // 缓存实例
        $this.data('address', (data = new Address(this, options)))
      }else if(typeof settings == 'string'){ // 调用方法
        data[settings].apply(data, [].concat(args));
      }else{ // 如果已缓存实例，更新参数
        data.setOptions.call(data, options);
      }
    })
  };

  $.fn.address.defaults = {
    url: 'https://cdn.rawgit.com/huguangju/cascade-select/master/assets/city.js',
    initial: {
      pn : '四川省',
      cn : '成都市',
      an : '双流县',
      pv : 510000,
      cv : 510100,
      av : 510122
    },
    level: {
      province: 1,
      city: 2,
      area: 3
    }
  };

}(jQuery));
