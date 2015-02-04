//TODO: 百度IP定位:http://api.map.baidu.com/location/ip?ak=A6dca593f328d7312b59d8cfe648315d
var $loading = $('.loading'),
    $addressInfo = $('.u-address-info'),
    $addressPopup = $('#address-popup'),
    $addressAllTitle = $('.address-all-title'),
    $provinceTitle = $('#addressAllTitle-province'),
    $cityTitle = $('#addressAllTitle-city'),
    $areaTitle = $('#addressAllTitle-area'),
    $addressAllConWrap = $('#addressAllConWrap'),
    $listItem = $('#addressAllConWrap .u-list-item')

// 用蒙板来监听空白区域点击时关闭浮层
function insertMask(){
    var $mask = $('<div style="width: 100%; left: 0px; top: 0px; height: 100%; position: fixed; -webkit-user-select: none; z-index: 100000003;" class="u-popup-mask u-overlay-mask u-popup-mask-hidden u-overlay-mask-hidden"></div>').prependTo($('body'))
    $mask.click(function(){
        $addressPopup.hide()
        $addressInfo.removeClass('u-info-active').find('s').removeClass("u-address-info-s-hover")
        $(this).addClass('u-popup-mask-hidden u-overlay-mask-hidden')
    })
}

function loading(){ $loading.show() }
function loaded(){ $loading.hide() }

function getIPAddress(){
    $.getJSON('http://api.map.baidu.com/location/ip?ak=A6dca593f328d7312b59d8cfe648315d&callback=?')
        .done(function(data){console.log(data)})
}

// 设置默认地址
function setAddress(address){
    var title = address.pn + address.cn + address.an
    $addressInfo.attr('title', title)
    $addressInfo.html(' ' + title + ' <s></s>')
    $addressInfo.data('id', address.pv + '-' + address.cv + '-' + address.av)
    $addressInfo.data('name', address.pn + '-' + address.cn + '-' + address.an)
}

/// ------- 这3个方法当以从后台请求地址数据的方式时调用 ------------
// 查询所有省
/*function getAllProvince() {
    var result = $.ajax({
        async: false,
        dataType: 'json',
        url: '${ctx}/admin/sys/area/search?level=province',
        beforeSend: function () {
            loading()
        },
        complete: function () {
            loaded()
        }
    })
    return JSON.parse(result.responseText)
}

// 根据父id查询之下的城/区
function getAddressByPid(pid) {
    var result
    if (pid) {
        var result = $.ajax({
            async: false,
            dataType: 'json',
            url: '${ctx}/admin/sys/area/search?pid=' + pid,
            beforeSend: function () {
                loading()
            },
            complete: function () {
                loaded()
            }
        });
    }
    return JSON.parse(result.responseText)
}

// 根据父id查询之下的城/区
function getAddressByPid(pid) {
    var result
    if (pid) {
        var result = $.ajax({
            async: false,
            dataType: 'json',
            url: '${ctx}/admin/sys/area/search?pid=' + pid,
            beforeSend: function () {
                loading()
            },
            complete: function () {
                loaded()
            }
        });
    }
    return JSON.parse(result.responseText);
}*/
/// ------------------------------------------

// 加载省或市或区的列表到面板上
function renderData(datas){
    var $list = $addressAllConWrap.find('ul.u-list-add-con')
    if($.isArray(datas)){
        $list.empty()
        $.each(datas, function(index, item){
            var $item = $('<li class="u-list-item" data-id="'+ item.id +'" data-title="'+ item.name +'" data-level="' + item.level + '">'+ item.name +'</li>')
            $item.click(listItemEvent)
            $list.append($item)
        })
    }
}

// 某个地址项的点击事件
function listItemEvent(){
    var title = $(this).data('title'),
        id = $(this).data('id'),
        level = $(this).data('level')

    console.log(title)

    // 省面板
    if($provinceTitle.hasClass('address-all-title-selected')){
        setTitle($provinceTitle, id, title)

        $cityTitle.siblings().removeClass("address-all-title-selected")
        $cityTitle.removeClass('address-all-title-hidden').addClass("address-all-title-selected").html('请选择<s></s>')

        $addressAllConWrap.find('ul').empty()
    }

    // 市面板
    if($cityTitle.hasClass('address-all-title-selected')){
        // 市列表
        //renderData(getAddressByPid(id))
        renderData(getCitysByPid(id))

        // 点击了一个市
        if(level == 2){
            setTitle($cityTitle, id, title)

            $areaTitle.siblings().removeClass("address-all-title-selected")
            $areaTitle.removeClass('address-all-title-hidden').addClass("address-all-title-selected").html('请选择<s></s>')

            $addressAllConWrap.find('ul').empty()

            // 区列表
            //renderData(getAddressByPid(id))
            renderData(getAreasByPid(id))
        }
    }

    // 区面板
    if($areaTitle.hasClass('address-all-title-selected')){

        // 点击了一个区
        if(level == 3){
            console.log('点击了一个区')
            setTitle($areaTitle, id, title)

            // 关闭浮层并最终显示到页面
            var names,
                _names,
                oriNames = $addressInfo.data('name')

            var address = {
                pn : $provinceTitle.data('name'),
                cn : $cityTitle.data('name'),
                an :  $areaTitle.data('name'),
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

                        setAddress(address)
                    }
                }else if(!address.pn && address.cn && address.an){ // 点击了城市/区域
                    if(oriNames.split('-').length == 3 ){
                        address.pn = oriNames.substr(0, oriNames.indexOf('-'))
                        setAddress(address)
                    }
                }
            }else{
                setAddress(address)
            }

            console.log('结束: ', address)
            closePopup()

            // TODO: 生成省市区的id的隐藏域供表单提交时使用
        }
    }
}

// 关闭浮层
function closePopup(){
    $addressPopup.hide()
    $('.u-popup-mask').addClass('u-popup-mask-hidden u-overlay-mask-hidden')
    $addressInfo.removeClass('u-info-active').find('s').removeClass("u-address-info-s-hover")
}

// 设置面板标题
function setTitle(target, id, title){
    target.html( title + '<s></s>')
    target.data('id', id)
    target.data('name', title)
}

function getTitleIds(){
    var pv = $provinceTitle.data('id'),
        cv = $cityTitle.data('id'),
        av = $areaTitle.data('id'),
        ids = ''

    if(pv && cv && av){
        ids = pv + '-' + cv +'-' + av
    }
    return ids
}

function getTitleNames(){
    var pn = $provinceTitle.data('name'),
        cn = $cityTitle.data('name'),
        an = $areaTitle.data('name'),
        names = ''

    if(pn && cn && an){
        names = pn + '-' + cn +'-' + an
    }
    return names
}

// 通过JSONP跨域请求数据
(function getAllLocalData(){
    var result
    $.ajax({
        async: false,
        dataType:'jsonp',
        jsonpCallback : 'getCityDatas',
        url : 'https://cdn.rawgit.com/huguangju/cascade-select/master/assets/city.js',
        beforeSend : function(){ loading() },
        complete : function(){ loaded()}
    })
})()

var parsedData
// 跨域回调函数
function getCityDatas(data){
    var provs = [],
        citys = [],
        areas = []

    $.each(data, function(index, item){
        if(item.level == 1){
            provs.push(item)
        }else if(item.level == 2){
            citys.push(item)
        }else if(item.level == 3){
            areas.push(item)
        }
    })

    parsedData = {
        provs : provs,
        citys : citys,
        areas : areas
    }
}

// 所有省
function getAllProvinceLocal(){
    console.log(parsedData.provs)
    return parsedData.provs
}

// 根据省id查其下所有市
function getCitysByPid(pid){
    var filteredCitys = []
    $.each(parsedData.citys, function(index, item){
        if(item.pid == pid){
            filteredCitys.push(item)
        }
    })
    return filteredCitys
}

// 根据市id查其下所有区
function getAreasByPid(pid){
    var filteredAreas = []
    $.each(parsedData.areas, function(index, item){
        if(item.pid == pid){
            filteredAreas.push(item)
        }
    })
    return filteredAreas
}

$(function(){

    // 模拟当前省市区
    var defaultCity = {
        pn : '四川省',
        cn : '成都市',
        an : '双流县',
        pv : 510000,
        cv : 510100,
        av : 510122
    }

    insertMask()

    //510000-510100-510122
    setAddress(defaultCity)

    // 点击地址详细信息
    $addressInfo.click(function(){
        $(this).addClass('u-info-active')
        $(this).find('s').addClass("u-address-info-s-hover")

        // 设置默认标题
        var ids = getTitleIds(),
            names = getTitleNames()

        //console.log(ids)
        if(!ids){
            setTitle($provinceTitle, defaultCity.pv, defaultCity.pn)
            setTitle($cityTitle, defaultCity.cv, defaultCity.cn)
            setTitle($areaTitle, defaultCity.av, defaultCity.an)

            //renderData(getAddressByPid(defaultCity.cv))
            renderData(getAreasByPid(defaultCity.cv))
        }else{
            ids = ids.split('-')
            names = names.split('-')

            console.log(names)
            if(names.length == 3){
                setTitle($provinceTitle, ids[0], names[0])
                setTitle($cityTitle, ids[1], names[1])
                setTitle($areaTitle, ids[2], names[2])
            }

            // TODO:如果区域id相同且区域列表不为空就不重新查询了
            // 根据市id来查询并展示区域列表
            //renderData(getAddressByPid(ids[1]))
            renderData(getAreasByPid(ids[1]))
        }

        $addressPopup.show()
        $('.u-popup-mask').removeClass('u-popup-mask-hidden u-overlay-mask-hidden')
    })

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

        //renderData(getAllProvince())
        console.log(getAllProvinceLocal())
        renderData(getAllProvinceLocal())
    })

    // 市标题
    $cityTitle.click(function(){
        console.log('点击了市标题 ')

        $(this).html('请选择<s></s>')
        $(this).next().addClass('address-all-title-hidden')

        var provinceid = $provinceTitle.data('id')
        //renderData(getAddressByPid(provinceid))
        renderData(getCitysByPid(provinceid))
    })

})