
;(function($)
{
  var docElem = document.documentElement,
    origShow = $.fn.show,origHide = $.fn.hide,origToggle = $.fn.toggle

  function anim(el,speed,opacity,scale,callback)
  {
    if(typeof speed == 'function' && !callback) callback = speed, speed = undefined
    var props = {opacity:opacity}
    if(scale)
    {
      props.scale = scale
      el.css($.fx.cssPrefix + 'transform-origin','0 0')
    }
    return el.animate(props,speed,null,callback)
  }

  $.fn.show = function(speed,callback)
  {
    origShow.call(this)
    if(speed === undefined) speed = 0
    else this.css('opacity',0)
    return anim(this,speed,1,'1,1',callback)
  }

  $.fn.hide = function(speed,callback)
  {
    if(speed === undefined) return origHide.call(this)
    else  return anim(el,speed,0,scale,function()
    {
      origHide.call($(this))
      callback && callback.call(this)
    })
  }

  $.fn.toggle = function(speed,callback)
  {
    if(speed === undefined || typeof speed == 'boolean')
      return origToggle.call(this,speed)
    else return this.each(function()
    {
      var el = $(this)
      el[el.css('display') == 'none' ? 'show' : 'hide'](speed,callback)
    })
  }

  $.fn.fadeTo = function(speed,opacity,callback)
  {
    return anim(this,speed,opacity,null,callback)
  }

  $.fn.fadeIn = function(speed,callback)
  {
    var target = this.css('opacity')
    if(target > 0) this.css('opacity',0)
    else target = 1
    return origShow.call(this).fadeTo(speed,target,callback)
  }

  $.fn.fadeOut = function(speed,callback)
  {
    return anim(this,speed,0,null,function()
    {
      origHide.call($(this))
      callback && callback.call(this)
    })
  }

  $.fn.fadeToggle = function(speed,callback)
  {
    return this.each(function()
    {
      var el = $(this)
      el[
        (el.css('opacity') == 0 || el.css('display') == 'none') ? 'fadeIn' : 'fadeOut'
        ](speed,callback)
    })
  }

})(Mini)
