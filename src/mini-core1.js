/*mini.js */
var Mini = (function()
{
  var $,
    emptyArray = [],
    slice = emptyArray.slice,
    filter = emptyArray.filter,
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    readyRE = /complete|loaded|interactive/,

    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr':document.createElement('tbody'),
      'tbody':table,'thead':table,'tfoot':table,
      'td':tableRow,'th':tableRow,
      '*':document.createElement('div')
    },

    class2type = {},
    toString = class2type.toString,
    isArray = Array.isArray || function(object){ return object instanceof Array },
  /*mini----------------------------------------------------------------------------------*/
    mini = {
      Z:function(dom,selector)
      {
        dom = dom || []
        dom.__proto__ = $.fn
        dom.selector = selector || ''
        return dom
      },
      isZ:function(object){ return object instanceof mini.Z },
      init:function(selector)
      {
        var dom
        if(!selector) return mini.Z()
        else if(typeof selector == 'string')
        {
          selector = selector.trim()
          // Note: In both Chrome 21 and Firefox 15, DOM error 12 is thrown if the fragment doesn't begin with <
          if(selector[0] == '<' && fragmentRE.test(selector)) dom = mini.fragment(selector,RegExp.$1), selector = null
          else dom = document.querySelectorAll(selector)
        }
        else if(isFunction(selector)) return $(document).ready(selector)
        else if(mini.isZ(selector)) return selector
        else
        {
          if(isArray(selector)) dom = compact(selector)
          else if(isObject(selector)) dom = [selector], selector = null
        }
        return mini.Z(dom,selector)
      },
      fragment:function(html,name)
      {
        var dom,container
        if(singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

        if(!dom)
        {
          if(html.replace) html = html.replace(tagExpanderRE,"<$1></$2>")
          if(name === undefined) name = fragmentRE.test(html) && RegExp.$1
          if(!(name in containers)) name = '*'

          container = containers[name]
          container.innerHTML = '' + html
          dom = $.each(slice.call(container.childNodes),function(){container.removeChild(this)})
        }

        return dom
      }
    }

  /*$----------------------------------------------------------------------------------*/
  $ = function(selector){ return mini.init(selector) }
  $.type = type
  $.isFunction = isFunction
  $.isWindow = isWindow
  $.isArray = isArray
  $.isPlainObject = isPlainObject
  $.each = function(elements,callback)
  {
    var i,key
    if(likeArray(elements))
    {
      for(i = 0; i < elements.length; i++)
        if(callback.call(elements[i],i,elements[i]) === false) return elements
    }else
    {
      for(key in elements)
        if(callback.call(elements[key],key,elements[key]) === false) return elements
    }

    return elements
  }

  function type(obj){ return obj == null ? String(obj) : class2type[toString.call(obj)] || "object" }

  function isFunction(value){ return type(value) == "function" }

  function isWindow(obj){ return obj != null && obj == obj.window }

  function isDocument(obj){ return obj != null && obj.nodeType == obj.DOCUMENT_NODE }

  function isObject(obj){ return type(obj) == "object" }

  function isPlainObject(obj){ return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype }

  function likeArray(obj){ return typeof obj.length == 'number' }

  function compact(array){ return filter.call(array,function(item){ return item != null }) }

  $.fn = {
    // Because a collection acts like an array, copy over these useful array functions.
    indexOf:emptyArray.indexOf,
    concat:emptyArray.concat,
    push:emptyArray.push,
    sort:emptyArray.sort,
    forEach:emptyArray.forEach,
    reduce:emptyArray.reduce,
    ready:function(callback)
    {
      //check if document.body exists for IE that reports document ready when it hasn't yet created the body element
      if(readyRE.test(document.readyState) && document.body) callback($)
      else document.addEventListener('DOMContentLoaded',function(){ callback($) },false)
      return this
    }
  }

  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(i,name)
  {
    class2type["[object " + name + "]"] = name.toLowerCase()
  })
  mini.Z.prototype = $.fn
  $.mini = mini
  return $
})()

window.Mini = Mini
window.$ === undefined && (window.$ = Mini)




