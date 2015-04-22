/* Minijs v1.0.6 (http://liyudao.com)*//*mini.js */
var Zepto = (function()
{
  var $,
    trim = String.prototype.trim,
    slice = Array.prototype.slice,
    filter = Array.prototype.filter,
    capitalRE = /([A-Z])/g,
    rootNodeRE = /^(?:body|html)$/i,
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
    tempParent = document.createElement('div'),
    adjacencyOperators= ['after','prepend','before','append'],
    class2type = {},
    toString = class2type.toString,
    isArray = Array.isArray || function(object){ return object instanceof Array },

    cssNumber = {'column-count':1,'columns':1,'font-weight':1,'line-height':1,'opacity':1,'z-index':1,'zoom':1},
    elementDisplay = {},
    classCache = {},
  /*zepto----------------------------------------------------------------------------------*/
    zepto = {
      Z:function(dom,selector)
      {
        dom = dom || []
        dom.__proto__ = $.fn
        dom.selector = selector || ''
        return dom
      },
      isZ:function(object){ return object instanceof zepto.Z },
      init:function(selector)
      {
        var dom
        if(!selector) return zepto.Z()
        else if(typeof selector == 'string')
        {
          selector = selector.trim()
          // Note: In both Chrome 21 and Firefox 15, DOM error 12 is thrown if the fragment doesn't begin with <
          if(selector[0] == '<' && fragmentRE.test(selector)) dom = zepto.fragment(selector,RegExp.$1), selector = null
          else dom = slice.call(document.querySelectorAll(selector))
        }
        else if(isFunction(selector)) return $(document).ready(selector)
        else if(zepto.isZ(selector)) return selector
        else
        {
          if(isArray(selector)) dom = compact(selector)
          else if(isObject(selector)) dom = [selector], selector = null
        }
        return zepto.Z(dom,selector)
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
      },
      matches:function(element,selector)
      {
        if(!selector || !element || element.nodeType !== 1) return false
        var match,parent = element.parentNode,temp = !parent
        if(temp) (parent = tempParent).appendChild(element)
        match = ~slice.call(parent.querySelectorAll(selector)).indexOf(element)
        temp && tempParent.removeChild(element)
        return match
      }
    }

  /*$----------------------------------------------------------------------------------*/
  $ = function(selector){ return zepto.init(selector) }
  $.type = type
  $.isWindow = isWindow
  $.isArray = isArray
  $.isFunction = isFunction
  $.isObject = isObject
  $.isPlainObject = isPlainObject
  $.isEmptyObject = isEmptyObject
  $.parseJSON = JSON.parse
  $.trim = function(str){ return str == null ? "" : trim.call(str) }
  $.indexOf = function(elem,array,i){ return $.fn.indexOf.call(array,elem,i)}
  $.filter = function(elements,callback){ return filter.call(elements,callback) }

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

  $.map = function(elements,callback)
  {
    var value,values = [],i,key
    if(likeArray(elements))
      for(i = 0; i < elements.length; i++)
      {
        value = callback(elements[i],i)
        if(value != null) values.push(value)
      }
    else
      for(key in elements)
      {
        value = callback(elements[key],key)
        if(value != null) values.push(value)
      }
    return flatten(values)
  }

  $.contains = document.documentElement.contains ?
    function(parent,node)
    {
      return parent !== node && parent.contains(node)
    } :
    function(parent,node)
    {
      while(node && (node = node.parentNode))
        if(node === parent) return true
      return false
    }

  // Copy all but undefined properties from one or more objects to the `target` object.
  $.extend = function(target)
  {
    var deep,args = slice.call(arguments,1)
    if(typeof target == 'boolean')
    {
      deep = target
      target = args.shift()
    }
    args.forEach(function(arg){ extend(target,arg,deep) })
    return target
  }

  function extend(target,source,deep)
  {
    for(key in source)
    {
      if(deep && (isPlainObject(source[key]) || isArray(source[key])))
      {
        if(isPlainObject(source[key]) && !isPlainObject(target[key]))
          target[key] = {}
        if(isArray(source[key]) && !isArray(target[key]))
          target[key] = []
        extend(target[key],source[key],deep)
      }
      else if(source[key] !== undefined) target[key] = source[key]
    }
  }

  function type(obj){ return obj == null ? String(obj) : class2type[toString.call(obj)] || "object" }

  function isFunction(value){ return type(value) == "function" }

  function isWindow(obj){ return obj != null && obj == obj.window }

  function isDocument(obj){ return obj != null && obj.nodeType == obj.DOCUMENT_NODE }

  function isObject(obj){ return type(obj) == "object" }

  function isPlainObject(obj){ return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype }

  function isEmptyObject(obj)
  {
    var name
    for(name in obj) return false
    return true
  }

  function likeArray(obj){ return typeof obj.length == 'number' }

  function compact(array){ return filter.call(array,function(item){ return item != null }) }

  function flatten(array){ return array.length > 0 ? $.fn.concat.apply([],array) : array }

  function funcArg(context,arg,idx,payload){ return isFunction(arg) ? arg.call(context,idx,payload) : arg }

  function uniq(array){ return filter.call(array,function(item,idx){ return array.indexOf(item) == idx }) }

  function filtered(nodes,selector){ return selector == null ? $(nodes) : $(nodes).filter(selector) }

  function children(element)
  {
    return 'children' in element ?
      slice.call(element.children) :
      $.map(element.childNodes,function(node){ if(node.nodeType == 1) return node })
  }

  function traverseNode(node,fun)
  {
    fun(node)
    for(var i = 0,len = node.childNodes.length; i < len; i++)
      traverseNode(node.childNodes[i],fun)
  }

  function setAttribute(node,name,value){ value == null ? node.removeAttribute(name) : node.setAttribute(name,value) }

  function camelize(str){ return str.replace(/-+(.)?/g,function(match,chr){ return chr ? chr.toUpperCase() : '' }) }

  function dasherize(str){ return str.replace(/::/g,'/').replace(/([A-Z]+)([A-Z][a-z])/g,'$1_$2').replace(/([a-z\d])([A-Z])/g,'$1_$2').replace(/_/g,'-').toLowerCase() }

  function maybeAddPx(name,value){ return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value }

  function classRE(name){ return name in classCache ? classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)')) }

  function className(node,value)  // access className property while respecting SVGAnimatedString
  {
    var klass = node.className || '',
      svg = klass && klass.baseVal !== undefined
    if(value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
  }

  function defaultDisplay(nodeName)
  {
    var element,display
    if(!elementDisplay[nodeName])
    {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element,'').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  // "true"  => true
  // "false" => false
  // "null"  => null
  // "42"    => 42
  // "42.5"  => 42.5
  // "08"    => "08"
  // JSON    => parse if valid
  // String  => self
  function deserializeValue(value)
  {
    try
    {
      return value ?
      value == "true" ||
      ( value == "false" ? false :
        value == "null" ? null :
          +value + "" == value ? +value :
            /^[\[\{]/.test(value) ? JSON.parse(value) :
              value )
        : value
    }
    catch(e){ return value }
  }

  $.fn = {
    // Because a collection acts like an array, copy over these useful array functions.
    indexOf:Array.prototype.indexOf,
    lastIndexOf:Array.prototype.lastIndexOf,
    slice:function(){ return $(slice.apply(this,arguments)) },
    concat:Array.prototype.concat,
    push:Array.prototype.push,
    sort:Array.prototype.sort,
    map:function(fn){ return $($.map(this,function(el,i){ return fn.call(el,i,el) })) },
    forEach:Array.prototype.forEach,
    every:Array.prototype.every,
    some:Array.prototype.some,
    reduce:Array.prototype.reduce,
    reduceRight:Array.prototype.reduceRight,
    filter:function(selector)
    {
      if(isFunction(selector)) return this.not(this.not(selector))
      return $(filter.call(this,function(element){ return zepto.matches(element,selector) }))
    },
    ready:function(callback)
    {
      //check if document.body exists for IE that reports document ready when it hasn't yet created the body element
      if(readyRE.test(document.readyState) && document.body) callback($)
      else document.addEventListener('DOMContentLoaded',function(){ callback($) },false)
      return this
    },
    /*index-----------------------------------------------------------*/
    eq:function(idx){ return idx === -1 ? this.slice(idx) : this.slice(idx,+idx + 1) },
    index:function(element)
    {
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    first:function()
    {
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last:function()
    {
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    /*node-----------------------------------------------------------*/
    is:function(selector){ return this.length > 0 && zepto.matches(this[0],selector) },
    not:function(selector)
    {
      var nodes = []
      if(isFunction(selector) && selector.call !== undefined)
        this.forEach(function(val,idx){ if(!selector.call(val,idx)) nodes.push(val) })
      else
      {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){ if(excludes.indexOf(el) < 0) nodes.push(el) })
      }
      return $(nodes)
    },
    pluck:function(property){ return $.map(this,function(el){ return el[property] }) },
    find:function(selector)
    {
      var result,$this = this
      if(!selector) result = $()
      else if(typeof selector == 'object')
        result = $(selector).filter(function()
        {
          var node = this
          return $this.some(function(parent){ return $.contains(parent,node) })
        })
      else if(this.length == 1) result = $(slice.call(this[0].querySelectorAll(selector)))
      else result = this.map(function(){ return slice.call(this.querySelectorAll(selector)) })
      return result
    },
    html:function(html)
    {
      return 0 in arguments ?
        this.each(function(idx)
        {
          var originHtml = this.innerHTML
          $(this).empty().append(funcArg(this,html,idx,originHtml))
        }) :
        (0 in this ? this[0].innerHTML : null)
    },
    text:function(text)
    {
      return 0 in arguments ?
        this.each(function(idx)
        {
          var newText = funcArg(this,text,idx,this.textContent)
          this.textContent = newText == null ? '' : '' + newText
        }) :
        (0 in this ? this[0].textContent : null)
    },
    empty:function(){ return this.each(function(){ this.innerHTML = '' }) },
    remove:function()
    {
      return this.each(function(){ if(this.parentNode != null) this.parentNode.removeChild(this) })
    },
    parent:function(selector){ return filtered(uniq(this.pluck('parentNode')),selector) },
    parents:function(selector)
    {
      var ancestors = [],nodes = this
      while(nodes.length > 0)
        nodes = $.map(nodes,function(node)
        {
          if((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0)
          {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors,selector)
    },
    siblings:function(selector)
    {
      return filtered(this.map(function(i,el)
      {
        return filter.call(children(el.parentNode),function(child){ return child !== el })
      }),selector)
    },
    prev:function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
    next:function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },
    children:function(selector){ return filtered(this.map(function(){ return children(this) }),selector) }, //only elements
    contents:function(){ return this.map(function(){ return slice.call(this.childNodes) }) },//contents, include element,text,comment...
    replaceWith:function(newContent){ return this.before(newContent).remove() },
    wrapAll:function(structure)
    {
      if(this[0])
      {
        $(this[0]).before(structure = $(structure))
        var children
        while((children = structure.children()).length) structure = children.first()// drill down to the inmost element
        $(structure).append(this)
      }
      return this
    },
    wrap:function(structure)
    {
      var func = isFunction(structure)
      if(this[0] && !func)
        var dom = $(structure).get(0),
          clone = dom.parentNode || this.length > 1

      return this.each(function(index)
      {
        $(this).wrapAll(
          func ? structure.call(this,index) :
            clone ? dom.cloneNode(true) : dom
        )
      })
    },
    wrapInner:function(structure)
    {
      var func = isFunction(structure)
      return this.each(function(index)
      {
        var self = $(this),contents = self.contents(),
          dom = func ? structure.call(this,index) : structure
        contents.length ? contents.wrapAll(dom) : self.append(dom)
      })
    },
    unwrap:function()
    {
      this.parent().each(function(){ $(this).replaceWith($(this).children()) })
      return this
    },
    add:function(selector){ return $(uniq(this.concat($(selector)))) },
    closest:function(selector,context)
    {
      var node = this[0],collection = false
      if(typeof selector == 'object') collection = $(selector)
      while(node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node,selector)))
        node = node !== context && !isDocument(node) && node.parentNode
      return $(node)
    },
    /*element-----------------------------------------------------------*/
    size:function(){ return this.length },
    get:function(idx){ return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length] },
    each:function(callback)
    {
      this.every(function(el,idx){return callback.call(el,idx,el) !== false })//el is this in callback
      return this
    },
    /*attribute-----------------------------------------------------------*/
    attr:function(name,value)
    {
      var result
      return (typeof name == 'string' && !(1 in arguments)) ?
        (!this.length || this[0].nodeType !== 1 ? undefined :
          (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
        ) :
        this.each(function(idx)
        {
          if(this.nodeType !== 1) return
          if(isObject(name)) for(key in name) setAttribute(this,key,name[key])
          else setAttribute(this,name,funcArg(this,value,idx,this.getAttribute(name)))
        })
    },
    removeAttr:function(name)
    {
      return this.each(function()
      {
        this.nodeType === 1 && name.split(' ').forEach(function(attribute){ setAttribute(this,attribute) },this)
      })
    },
    data:function(name,value)
    {
      var attrName = 'data-' + name.replace(capitalRE,'-$1').toLowerCase()
      var data = (1 in arguments) ? this.attr(attrName,value) : this.attr(attrName)

      return data !== null ? deserializeValue(data) : undefined
    },
    val:function(value)
    {
      return 0 in arguments ?
        this.each(function(idx)
        {
          this.value = funcArg(this,value,idx,this.value)
        }) :
        (this[0] && (this[0].multiple ?
          $(this[0]).find('option').filter(function(){ return this.selected }).pluck('value') :
          this[0].value)
        )
    },
    /*CSS-----------------------------------------------------------*/
    css:function(property,value)
    {
      if(arguments.length < 2)
      {
        var computedStyle,element = this[0]
        if(!element) return
        computedStyle = getComputedStyle(element,'')
        if(typeof property == 'string')
          return element.style[camelize(property)] || computedStyle.getPropertyValue(property)
        else if(isArray(property))
        {
          var props = {}
          $.each(property,function(_,prop){ props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop)) })
          return props
        }
      }

      var css = ''
      if(type(property) == 'string')
      {
        if(!value && value !== 0)
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property,value)
      }else
      {
        for(key in property)
          if(!property[key] && property[key] !== 0)
            this.each(function(){ this.style.removeProperty(dasherize(key)) })
          else
            css += dasherize(key) + ':' + maybeAddPx(key,property[key]) + ';'
      }

      return this.each(function(){ this.style.cssText += ';' + css })
    },
    hasClass:function(name)
    {
      if(!name) return false
      return this.some(function(el){ return this.test(className(el)) },classRE(name))
    },
    addClass:function(name)
    {
      if(!name) return this
      return this.each(function(idx)
      {
        if(!('className' in this)) return
        classList = []
        var cls = className(this),newName = funcArg(this,name,idx,cls)
        newName.split(/\s+/g).forEach(function(klass)
        {
          if(!$(this).hasClass(klass)) classList.push(klass)
        },this)
        classList.length && className(this,cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass:function(name)
    {
      return this.each(function(idx)
      {
        if(!('className' in this)) return
        if(name === undefined) return className(this,'')
        classList = className(this)
        funcArg(this,name,idx,classList).split(/\s+/g).forEach(function(klass)
        {
          classList = classList.replace(classRE(klass)," ")
        })
        className(this,classList.trim())
      })
    },
    toggleClass:function(name,when)
    {
      if(!name) return this
      return this.each(function(idx)
      {
        var $this = $(this),names = funcArg(this,name,idx,className(this))
        names.split(/\s+/g).forEach(function(klass)
        {
          (when === undefined ? !$this.hasClass(klass) : when) ? $this.addClass(klass) : $this.removeClass(klass)
        })
      })
    },
    offsetParent:function()
    {
      return this.map(function()
      {
        var parent = this.offsetParent || document.body
        while(parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
          parent = parent.offsetParent
        return parent
      })
    },
    offset:function(coordinates)
    {
      if(coordinates) return this.each(function(index)
      {
        var $this = $(this),
          coords = funcArg(this,coordinates,index,$this.offset()),
          parentOffset = $this.offsetParent().offset(),
          props = {
            top:coords.top - parentOffset.top,
            left:coords.left - parentOffset.left
          }

        if($this.css('position') == 'static') props['position'] = 'relative'
        $this.css(props)
      })
      if(!this.length) return null
      var obj = this[0].getBoundingClientRect()
      return {
        left:obj.left + window.pageXOffset,
        top:obj.top + window.pageYOffset,
        width:Math.round(obj.width),
        height:Math.round(obj.height)
      }
    },
    position:function()
    {
      if(!this.length) return

      var elem = this[0],
        offsetParent = this.offsetParent(),
        offset = this.offset(),
        parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? {top:0,left:0} : offsetParent.offset()

      // note: when an element has margin: auto the offsetLeft and marginLeft are the same in Safari causing offset.left to incorrectly be 0
      offset.top -= parseFloat($(elem).css('margin-top')) || 0
      offset.left -= parseFloat($(elem).css('margin-left')) || 0

      parentOffset.top += parseFloat($(offsetParent[0]).css('border-top-width')) || 0
      parentOffset.left += parseFloat($(offsetParent[0]).css('border-left-width')) || 0

      return {
        top:offset.top - parentOffset.top,
        left:offset.left - parentOffset.left
      }
    },
    scrollLeft:function(value)
    {
      if(!this.length) return
      var hasScrollLeft = 'scrollLeft' in this[0]
      if(value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
      return this.each(hasScrollLeft ?
        function(){ this.scrollLeft = value } :
        function(){ this.scrollTo(value,this.scrollY) })
    },
    scrollTop:function(value)
    {
      if(!this.length) return
      var hasScrollTop = 'scrollTop' in this[0]
      if(value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
      return this.each(hasScrollTop ?
        function(){ this.scrollTop = value } :
        function(){ this.scrollTo(this.scrollX,value) })
    },
    show:function()
    {
      return this.each(function()
      {
        this.style.display == "none" && (this.style.display = '')
        if(getComputedStyle(this,'').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    hide:function(){ return this.css("display","none") },
    toggle:function(setting)
    {
      return this.each(function()
      {
        var el = $(this)
        ;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
      })
    }
  }
  /*initialize-----------------------------------------------------------*/
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(i,name)
  {
    class2type["[object " + name + "]"] = name.toLowerCase()
  })

  adjacencyOperators.forEach(function(operator,operatorIndex)
    {
      var inside = operatorIndex % 2 //=> prepend, append

      $.fn[operator] = function()
      {
        // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
        var argType,nodes = $.map(arguments,function(arg)
          {
            argType = type(arg)
            return argType == "object" || argType == "array" || arg == null ? arg : zepto.fragment(arg)
          }),
          parent,copyByClone = this.length > 1
        if(nodes.length < 1) return this

        return this.each(function(_,target)
        {
          parent = inside ? target : target.parentNode

          // convert all methods to a "before" operation
          target = operatorIndex == 0 ? target.nextSibling :
            operatorIndex == 1 ? target.firstChild :
              operatorIndex == 2 ? target : null

          var parentInDocument = $.contains(document.documentElement,parent)

          nodes.forEach(function(node)
          {
            if(copyByClone) node = node.cloneNode(true)
            else if(!parent) return $(node).remove()

            parent.insertBefore(node,target)
            if(parentInDocument) traverseNode(node,function(el)
            {
              if(el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' && (!el.type || el.type === 'text/javascript') && !el.src)
                window['eval'].call(window,el.innerHTML)
            })
          })
        })
      }

      // after    => insertAfter, prepend  => prependTo, before   => insertBefore, append   => appendTo
      $.fn[inside ? operator + 'To' : 'insert' + (operatorIndex ? 'Before' : 'After')] = function(html)
      {
        $(html)[operator](this)
        return this
      }
    })
  zepto.Z.prototype = $.fn
  $.zepto = zepto
  return $
})()

window.Zepto = Zepto
window.$ === undefined && (window.$ = Zepto)





//     Zepto.js
//     (c) 2010-2014 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($){
  var _zid = 1,
    slice = Array.prototype.slice,
    isFunction = $.isFunction,
    isString = function(obj){ return typeof obj == 'string' },
    handlers = {},
    specialEvents={},
    focusinSupported = 'onfocusin' in window,
    focus = { focus: 'focusin', blur: 'focusout' },
    hover = { mouseenter: 'mouseover', mouseleave: 'mouseout'},
    returnTrue = function(){return true},
    returnFalse = function(){return false},
    ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
    eventMethods = {
      preventDefault:'isDefaultPrevented',
      stopImmediatePropagation:'isImmediatePropagationStopped',
      stopPropagation:'isPropagationStopped'
    }

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  $.Event = function(type,props)
  {
    if(!isString(type)) props = type, type = props.type
    var event = document.createEvent(specialEvents[type] || 'Events'),bubbles = true
    if(props)
      for(var name in props)
        (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type,bubbles,true)
    return compatible(event)
  }

  $.event = {add:add,remove:remove}

  $.proxy = function(fn,context)
  {
    var args = (2 in arguments) && slice.call(arguments,2)
    if(isFunction(fn))
    {
      var proxyFn = function(){ return fn.apply(context,args ? args.concat(slice.call(arguments)) : arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    }else if(isString(context))
    {
      if(args)
      {
        args.unshift(fn[context],fn)
        return $.proxy.apply(null,args)
      }else
      {
        return $.proxy(fn[context],fn)
      }
    }else
    {
      throw new TypeError("expected function")
    }
  }

  function compatible(event,source)
  {
    if(source || !event.isDefaultPrevented)
    {
      source || (source = event)

      $.each(eventMethods,function(name,predicate)
      {
        var sourceMethod = source[name]
        event[name] = function()
        {
          this[predicate] = returnTrue
          return sourceMethod && sourceMethod.apply(source,arguments)
        }
        event[predicate] = returnFalse
      })

      if(source.defaultPrevented !== undefined ? source.defaultPrevented :
          'returnValue' in source ? source.returnValue === false :
          source.getPreventDefault && source.getPreventDefault())
        event.isDefaultPrevented = returnTrue
    }
    return event
  }

  function zid(element)
  {
    return element._zid || (element._zid = _zid++)
  }

  function createProxy(event)
  {
    var key,proxy = {originalEvent:event}
    for(key in event)
      if(!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

    return compatible(proxy,event)
  }

  function parse(event)
  {
    var parts = ('' + event).split('.')
    return {e:parts[0],ns:parts.slice(1).sort().join(' ')}
  }

  function matcherFor(ns)
  {
    return new RegExp('(?:^| )' + ns.replace(' ',' .* ?') + '(?: |$)')
  }

  function findHandlers(element,event,fn,selector)
  {
    event = parse(event)
    if(event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler)
    {
      return handler
        && (!event.e || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }

  function eventCapture(handler,captureSetting)
  {
    return handler.del &&
      (!focusinSupported && (handler.e in focus)) || !!captureSetting
  }

  function realEvent(type)
  {
    return hover[type] || (focusinSupported && focus[type]) || type
  }

  function add(element,events,fn,data,selector,delegator,capture)
  {
    var id = zid(element),set = (handlers[id] || (handlers[id] = []))
    events.split(/\s/).forEach(function(event)
    {
      if(event == 'ready') return $(document).ready(fn)
      var handler = parse(event)
      handler.fn = fn
      handler.sel = selector
      // emulate mouseenter, mouseleave
      if(handler.e in hover) fn = function(e)
      {
        var related = e.relatedTarget
        if(!related || (related !== this && !$.contains(this,related)))
          return handler.fn.apply(this,arguments)
      }
      handler.del = delegator
      var callback = delegator || fn
      handler.proxy = function(e)
      {
        e = compatible(e)
        if(e.isImmediatePropagationStopped()) return
        e.data = data
        var result = callback.apply(element,e._args == undefined ? [e] : [e].concat(e._args))
        if(result === false) e.preventDefault(), e.stopPropagation()
        return result
      }
      handler.i = set.length
      set.push(handler)
      if('addEventListener' in element)
        element.addEventListener(realEvent(handler.e),handler.proxy,eventCapture(handler,capture))
    })
  }

  function remove(element,events,fn,selector,capture)
  {
    var id = zid(element)

    ;(events || '').split(/\s/).forEach(function(event)
    {
      findHandlers(element,event,fn,selector).forEach(function(handler)
      {
        delete handlers[id][handler.i]
        if('removeEventListener' in element)
          element.removeEventListener(realEvent(handler.e),handler.proxy,eventCapture(handler,capture))
      })
    })
  }

  $.fn.on = function(event,selector,data,callback,one)
  {
    var autoRemove,delegator,$this = this
    if(event && !isString(event))
    {
      $.each(event,function(type,fn){ $this.on(type,selector,data,fn,one) })
      return $this
    }

    if(!isString(selector) && !isFunction(callback) && callback !== false)
      callback = data, data = selector, selector = undefined
    if(isFunction(data) || data === false)
      callback = data, data = undefined

    if(callback === false) callback = returnFalse

    return $this.each(function(_,element)
    {
      if(one) autoRemove = function(e)
      {
        remove(element,e.type,callback)
        return callback.apply(this,arguments)
      }

      if(selector) delegator = function(e)
      {
        var evt,match = $(e.target).closest(selector,element).get(0)
        if(match && match !== element)
        {
          evt = $.extend(createProxy(e),{currentTarget:match,liveFired:element})
          return (autoRemove || callback).apply(match,[evt].concat(slice.call(arguments,1)))
        }
      }

      add(element,event,callback,data,selector,delegator || autoRemove)
    })
  }
  $.fn.off = function(event,selector,callback)
  {
    var $this = this
    if(event && !isString(event))
    {
      $.each(event,function(type,fn){ $this.off(type,selector,fn) })
      return $this
    }

    if(!isString(selector) && !isFunction(callback) && callback !== false)
      callback = selector, selector = undefined

    if(callback === false) callback = returnFalse

    return $this.each(function(){ remove(this,event,callback,selector) })
  }

  $.fn.trigger = function(event,args)
  {
    event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
    event._args = args
    return this.each(function()
    {
      // handle focus(), blur() by calling them directly
      if(event.type in focus && typeof this[event.type] == "function") this[event.type]()
      // items in the collection might not be DOM elements
      else if('dispatchEvent' in this) this.dispatchEvent(event)
      else $(this).triggerHandler(event,args)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event,args)
  {
    var e,result
    this.each(function(i,element)
    {
      e = createProxy(isString(event) ? $.Event(event) : event)
      e._args = args
      e.target = element
      $.each(findHandlers(element,event.type || event),function(i,handler)
      {
        result = handler.proxy(e)
        if(e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

    // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout focus blur load resize scroll unload click dblclick ' +
  'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' +
  'change select keydown keypress keyup error').split(' ').forEach(function(event)
    {
      $.fn[event] = function(callback)
      {
        return (0 in arguments) ? this.bind(event,callback) : this.trigger(event)
      }
    })


})(Zepto)

//     Zepto.js
//     (c) 2010-2014 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;
(function($)
{
  var prefix = '',
    eventPrefix,
    vendors = {Webkit:'webkit',Moz:'',O:'o'},
    testEl = document.createElement('div'),
    supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
    transform,transitionProperty,transitionDuration,transitionTiming,transitionDelay,
    animationName,animationDuration,animationTiming,animationDelay,
    cssReset = {}

  function dasherize(str){ return str.replace(/([a-z])([A-Z])/,'$1-$2').toLowerCase() }

  function normalizeEvent(name){ return eventPrefix ? eventPrefix + name : name.toLowerCase() }

  $.each(vendors,function(vendor,event)
  {
    if(testEl.style[vendor + 'TransitionProperty'] !== undefined)
    {
      prefix = '-' + vendor.toLowerCase() + '-'
      eventPrefix = event
      return false
    }
  })

  transform = prefix + 'transform'
  cssReset[transitionProperty = prefix + 'transition-property'] =
    cssReset[transitionDuration = prefix + 'transition-duration'] =
      cssReset[transitionDelay    = prefix + 'transition-delay'] =
        cssReset[transitionTiming   = prefix + 'transition-timing-function'] =
          cssReset[animationName      = prefix + 'animation-name'] =
            cssReset[animationDuration  = prefix + 'animation-duration'] =
              cssReset[animationDelay     = prefix + 'animation-delay'] =
                cssReset[animationTiming    = prefix + 'animation-timing-function'] = ''


  $.fx = {
    off:(eventPrefix === undefined && testEl.style.transitionProperty === undefined),
    speeds:{_default:400,fast:200,slow:600},
    cssPrefix:prefix,
    transitionEnd:normalizeEvent('TransitionEnd'),
    animationEnd:normalizeEvent('AnimationEnd')
  }

  $.fn.animate = function(properties,duration,ease,callback,delay)
  {
    if($.isFunction(duration))
      callback = duration, ease = undefined, duration = undefined
    if($.isFunction(ease))
      callback = ease, ease = undefined
    if($.isPlainObject(duration))
      duration = duration.duration, ease = duration.easing, callback = duration.complete, delay = duration.delay
    if(duration) duration = (typeof duration == 'number' ? duration :
      ($.fx.speeds[duration] || $.fx.speeds._default)) / 1000
    if(delay) delay = parseFloat(delay) / 1000
    return this.anim(properties,duration,ease,callback,delay)
  }

  $.fn.anim = function(properties,duration,ease,callback,delay)
  {
    var key,cssValues = {},cssProperties,wrappedCallback,
      transforms = '',that = this,endEvent = $.fx.transitionEnd,fired = false

    if(duration === undefined) duration = $.fx.speeds._default / 1000
    if(delay === undefined) delay = 0
    if($.fx.off) duration = 0

    if(typeof properties == 'string')
    {
      // keyframe animation
      cssValues[animationName] = properties
      cssValues[animationDuration] = duration + 's'
      cssValues[animationDelay] = delay + 's'
      cssValues[animationTiming] = (ease || 'linear')
      endEvent = $.fx.animationEnd
    }else
    {
      cssProperties = []
      // CSS transitions
      for(key in properties)
        if(supportedTransforms.test(key)) transforms += key + '(' + properties[key] + ') '
        else cssValues[key] = properties[key], cssProperties.push(dasherize(key))

      if(transforms) cssValues[transform] = transforms, cssProperties.push(transform)
      if(duration > 0 && typeof properties === 'object')
      {
        cssValues[transitionProperty] = cssProperties.join(', ')
        cssValues[transitionDuration] = duration + 's'
        cssValues[transitionDelay] = delay + 's'
        cssValues[transitionTiming] = (ease || 'linear')
      }
    }

    wrappedCallback = function(event)
    {
      if(typeof event !== 'undefined')
      {
        if(event.target !== event.currentTarget) return // makes sure the event didn't bubble from "below"
        $(event.target).off(endEvent,wrappedCallback)
      }else
        $(this).off(endEvent,wrappedCallback) // triggered by setTimeout

      fired = true
      $(this).css(cssReset)
      callback && callback.call(this)
    }
    if(duration > 0)
    {
      this.on(endEvent,wrappedCallback)
      // transitionEnd is not always firing on older Android phones, so make sure it gets fired
      setTimeout(function()
      {
        if(fired) return
        wrappedCallback.call(that)
      },((duration + delay) * 1000) + 25)
    }

    // trigger page reflow so new elements can animate
    this.size() && this.get(0).clientLeft

    this.css(cssValues)

    if(duration <= 0) setTimeout(function()
    {
      that.each(function(){ wrappedCallback.call(this) })
    },0)

    return this
  }

  testEl = null
})(Zepto)


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

})(Zepto)


;(function($)
{
  var jsonpID = 0,
    key,
    name,
    rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    scriptTypeRE = /^(?:text|application)\/javascript/i,
    xmlTypeRE = /^(?:text|application)\/xml/i,
    jsonType = 'application/json',
    htmlType = 'text/html',
    blankRE = /^\s*$/,
    originAnchor = document.createElement('a'),
    escape = encodeURIComponent

  originAnchor.href = window.location.href
  $.active = 0          // Number of active Ajax requests

  $.ajaxSettings = {
    type:'GET',         // Default type of request
    beforeSend:empty,   // Callback that is executed before request
    success:empty,      // Callback that is executed if the request succeeds
    error:empty,        // Callback that is executed the the server drops error
    complete:empty,     // Callback that is executed on request complete (both: error and success)
    context:null,       // The context for the callbacks
    global:true,        // Whether to trigger "global" Ajax events
    // Transport
    xhr:function(){ return new window.XMLHttpRequest() },
    // MIME types mapping, IIS returns Javascript as "application/x-javascript"
    accepts:{
      script:'text/javascript, application/javascript, application/x-javascript',
      json:jsonType,
      xml:'application/xml, text/xml',
      html:htmlType,
      text:'text/plain'
    },
    crossDomain:false,  // Whether the request is to another domain
    timeout:0,          // Default timeout
    processData:true,   // Whether data should be serialized to string
    cache:true          // Whether the browser should be allowed to cache GET responses
  }

  $.ajax = function(options)
  {
    var settings = $.extend({},options || {}),
      deferred = $.Deferred && $.Deferred(),
      urlAnchor,hashIndex
    for(key in $.ajaxSettings) if(settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    ajaxStart(settings)

    if(!settings.crossDomain)
    {
      urlAnchor = document.createElement('a')
      urlAnchor.href = settings.url
      urlAnchor.href = urlAnchor.href

      settings.crossDomain = (originAnchor.protocol + '//' + originAnchor.host) !== (urlAnchor.protocol + '//' + urlAnchor.host)
    }

    if(!settings.url) settings.url = window.location.toString()
    if((hashIndex = settings.url.indexOf('#')) > -1) settings.url = settings.url.slice(0,hashIndex)
    serializeData(settings)

    var dataType = settings.dataType,hasPlaceholder = /\?.+=\?/.test(settings.url)
    if(hasPlaceholder) dataType = 'jsonp'

    if('jsonp' == dataType)
    {
      if(!hasPlaceholder)
        settings.url = appendQuery(settings.url,
          settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
      return $.ajaxJSONP(settings,deferred)
    }

    if(settings.cache === false || (
      (!options || options.cache !== true) &&
      ('script' == dataType || 'jsonp' == dataType)
      ))
      settings.url = appendQuery(settings.url,'_=' + Date.now())

    var mime = settings.accepts[dataType],
      headers = {},
      setHeader = function(name,value){ headers[name.toLowerCase()] = [name,value] },
      protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
      xhr = settings.xhr(),
      nativeSetHeader = xhr.setRequestHeader,
      abortTimeout

    if(deferred) deferred.promise(xhr)

    if(!settings.crossDomain) setHeader('X-Requested-With','XMLHttpRequest')
    setHeader('Accept',mime || '*/*')
    if(mime = settings.mimeType || mime)
    {
      if(mime.indexOf(',') > -1) mime = mime.split(',',2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if(settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
      setHeader('Content-Type',settings.contentType || 'application/x-www-form-urlencoded')

    if(settings.headers) for(name in settings.headers) setHeader(name,settings.headers[name])
    xhr.setRequestHeader = setHeader

    xhr.onreadystatechange = function()
    {
      if(xhr.readyState == 4)
      {
        xhr.onreadystatechange = empty
        clearTimeout(abortTimeout)
        var result,error = false
        if((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:'))
        {
          dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
          result = xhr.responseText

          try
          {
            // http://perfectionkills.com/global-eval-what-are-the-options/
            if(dataType == 'script')    (1, eval)(result)
            else if(dataType == 'xml')  result = xhr.responseXML
            else if(dataType == 'json') result = blankRE.test(result) ? null : JSON.parse(result)
          }
          catch(e)
          { error = e }

          if(error) ajaxError(error,'parsererror',xhr,settings,deferred)
          else ajaxSuccess(result,xhr,settings,deferred)
        }else
        {
          ajaxError(xhr.statusText || null,xhr.status ? 'error' : 'abort',xhr,settings,deferred)
        }
      }
    }

    if(ajaxBeforeSend(xhr,settings) === false)
    {
      xhr.abort()
      ajaxError(null,'abort',xhr,settings,deferred)
      return xhr
    }

    if(settings.xhrFields) for(name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type,settings.url,async,settings.username,settings.password)

    for(name in headers) nativeSetHeader.apply(xhr,headers[name])

    if(settings.timeout > 0) abortTimeout = setTimeout(function()
    {
      xhr.onreadystatechange = empty
      xhr.abort()
      ajaxError(null,'timeout',xhr,settings,deferred)
    },settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }


  $.ajaxJSONP = function(options,deferred)
  {
    if(!('type' in options)) return $.ajax(options)

    var _callbackName = options.jsonpCallback,
      callbackName = ($.isFunction(_callbackName) ?
          _callbackName() : _callbackName) || ('jsonp' + (++jsonpID)),
      script = document.createElement('script'),
      originalCallback = window[callbackName],
      responseData,
      abort = function(errorType)
      {
        $(script).triggerHandler('error',errorType || 'abort')
      },
      xhr = {abort:abort},abortTimeout

    if(deferred) deferred.promise(xhr)

    $(script).on('load error',function(e,errorType)
    {
      clearTimeout(abortTimeout)
      $(script).off().remove()

      if(e.type == 'error' || !responseData)
      {
        ajaxError(null,errorType || 'error',xhr,options,deferred)
      }else
      {
        ajaxSuccess(responseData[0],xhr,options,deferred)
      }

      window[callbackName] = originalCallback
      if(responseData && $.isFunction(originalCallback))
        originalCallback(responseData[0])

      originalCallback = responseData = undefined
    })

    if(ajaxBeforeSend(xhr,options) === false)
    {
      abort('abort')
      return xhr
    }

    window[callbackName] = function()
    {
      responseData = arguments
    }

    script.src = options.url.replace(/\?(.+)=\?/,'?$1=' + callbackName)
    document.head.appendChild(script)

    if(options.timeout > 0) abortTimeout = setTimeout(function()
    {
      abort('timeout')
    },options.timeout)

    return xhr
  }

  $.get = function(/* url, data, success, dataType */)
  {
    return $.ajax(parseArguments.apply(null,arguments))
  }

  $.post = function(/* url, data, success, dataType */)
  {
    var options = parseArguments.apply(null,arguments)
    options.type = 'POST'
    return $.ajax(options)
  }

  $.getJSON = function(/* url, data, success */)
  {
    var options = parseArguments.apply(null,arguments)
    options.dataType = 'json'
    return $.ajax(options)
  }

  $.param = function(obj,traditional)
  {
    var params = []
    params.add = function(key,value)
    {
      if($.isFunction(value)) value = value()
      if(value == null) value = ""
      this.push(escape(key) + '=' + escape(value))
    }
    serialize(params,obj,traditional)
    return params.join('&').replace(/%20/g,'+')
  }

  // Empty function, used as default callback
  function empty(){}

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context,eventName,data)
  {
    var event = $.Event(eventName)
    $(context).trigger(event,data)
    return !event.isDefaultPrevented()
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings,context,eventName,data)
  {
    if(settings.global) return triggerAndReturn(context || document,eventName,data)
  }

  function ajaxStart(settings)
  {
    if(settings.global && $.active++ === 0) triggerGlobal(settings,null,'ajaxStart')
  }

  function ajaxStop(settings)
  {
    if(settings.global && !(--$.active)) triggerGlobal(settings,null,'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr,settings)
  {
    var context = settings.context
    if(settings.beforeSend.call(context,xhr,settings) === false ||
      triggerGlobal(settings,context,'ajaxBeforeSend',[xhr,settings]) === false)
      return false

    triggerGlobal(settings,context,'ajaxSend',[xhr,settings])
  }

  function ajaxSuccess(data,xhr,settings,deferred)
  {
    var context = settings.context,status = 'success'
    settings.success.call(context,data,status,xhr)
    if(deferred) deferred.resolveWith(context,[data,status,xhr])
    triggerGlobal(settings,context,'ajaxSuccess',[xhr,settings,data])
    ajaxComplete(status,xhr,settings)
  }

  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error,type,xhr,settings,deferred)
  {
    var context = settings.context
    settings.error.call(context,xhr,type,error)
    if(deferred) deferred.rejectWith(context,[xhr,type,error])
    triggerGlobal(settings,context,'ajaxError',[xhr,settings,error || type])
    ajaxComplete(type,xhr,settings)
  }

  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status,xhr,settings)
  {
    var context = settings.context
    settings.complete.call(context,xhr,status)
    triggerGlobal(settings,context,'ajaxComplete',[xhr,settings])
    ajaxStop(settings)
  }

  function mimeToDataType(mime)
  {
    if(mime) mime = mime.split(';',2)[0]
    return mime && ( mime == htmlType ? 'html' :
        mime == jsonType ? 'json' :
          scriptTypeRE.test(mime) ? 'script' :
          xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

  function appendQuery(url,query)
  {
    if(query == '') return url
    return (url + '&' + query).replace(/[&?]{1,2}/,'?')
  }

  // serialize payload and append it to the URL for GET requests
  function serializeData(options)
  {
    if(options.processData && options.data && $.type(options.data) != "string")
      options.data = $.param(options.data,options.traditional)
    if(options.data && (!options.type || options.type.toUpperCase() == 'GET'))
      options.url = appendQuery(options.url,options.data), options.data = undefined
  }

  function serialize(params,obj,traditional,scope)
  {
    var type,array = $.isArray(obj),hash = $.isPlainObject(obj)
    $.each(obj,function(key,value)
    {
      type = $.type(value)
      if(scope) key = traditional ? scope :
      scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
      // handle data in serializeArray() format
      if(!scope && array) params.add(value.name,value.value)
      // recurse into nested objects
      else if(type == "array" || (!traditional && type == "object"))
        serialize(params,value,traditional,key)
      else params.add(key,value)
    })
  }

  // handle optional data/success arguments
  function parseArguments(url,data,success,dataType)
  {
    if($.isFunction(data)) dataType = success, success = data, data = undefined
    if(!$.isFunction(success)) dataType = success, success = undefined
    return {
      url:url
      ,data:data
      ,success:success
      ,dataType:dataType
    }
  }

  $.fn.load = function(url,data,success)
  {
    if(!this.length) return this
    var self = this,parts = url.split(/\s/),selector,
      options = parseArguments(url,data,success),
      callback = options.success
    if(parts.length > 1) options.url = parts[0], selector = parts[1]
    options.success = function(response)
    {
      self.html(selector ?
        $('<div>').html(response.replace(rscript,"")).find(selector)
        : response)
      callback && callback.apply(self,arguments)
    }
    $.ajax(options)
    return this
  }

})(Zepto)

//     Zepto.js
//     (c) 2010-2014 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

// The following code is heavily inspired by jQuery's $.fn.data()

;
(function($)
{
  var data = {},dataAttr = $.fn.data,camelize = $.camelCase,
    exp = $.expando = 'Zepto' + (+new Date()),emptyArray = []

  // Get value from node:
  // 1. first try key as given,
  // 2. then try camelized key,
  // 3. fall back to reading "data-*" attribute.
  function getData(node,name)
  {
    var id = node[exp],store = id && data[id]
    if(name === undefined) return store || setData(node)
    else
    {
      if(store)
      {
        if(name in store) return store[name]
        var camelName = camelize(name)
        if(camelName in store) return store[camelName]
      }
      return dataAttr.call($(node),name)
    }
  }

  // Store value under camelized key on node
  function setData(node,name,value)
  {
    var id = node[exp] || (node[exp] = ++$.uuid),
      store = data[id] || (data[id] = attributeData(node))
    if(name !== undefined) store[camelize(name)] = value
    return store
  }

  // Read all "data-*" attributes from a node
  function attributeData(node)
  {
    var store = {}
    $.each(node.attributes || emptyArray,function(i,attr)
    {
      if(attr.name.indexOf('data-') == 0)
        store[camelize(attr.name.replace('data-',''))] =
          $.zepto.deserializeValue(attr.value)
    })
    return store
  }

  $.fn.data = function(name,value)
  {
    return value === undefined ?
      // set multiple values via object
      $.isPlainObject(name) ?
        this.each(function(i,node)
        {
          $.each(name,function(key,value){ setData(node,key,value) })
        }) :
        // get value from first element
        (0 in this ? getData(this[0],name) : undefined) :
      // set value on all elements
      this.each(function(){ setData(this,name,value) })
  }

  $.fn.removeData = function(names)
  {
    if(typeof names == 'string') names = names.split(/\s+/)
    return this.each(function()
    {
      var id = this[exp],store = id && data[id]
      if(store) $.each(names || store,function(key)
      {
        delete store[names ? camelize(this) : key]
      })
    })
  }

    // Generate extended `remove` and `empty` functions
  ;
  ['remove','empty'].forEach(function(methodName)
  {
    var origFn = $.fn[methodName]
    $.fn[methodName] = function()
    {
      var elements = this.find('*')
      if(methodName === 'remove') elements = elements.add(this)
      elements.removeData()
      return origFn.call(this)
    }
  })
})(Zepto)

//     Zepto.js
//     (c) 2010-2014 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;
(function($)
{
  function detect(ua,platform)
  {
    var os = this.os = {},browser = this.browser = {},
      webkit = ua.match(/Web[kK]it[\/]{0,1}([\d.]+)/),
      android = ua.match(/(Android);?[\s\/]+([\d.]+)?/),
      osx = !!ua.match(/\(Macintosh\; Intel /),
      ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
      ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/),
      iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
      webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
      win = /Win\d{2}|Windows/.test(platform),
      wp = ua.match(/Windows Phone ([\d.]+)/),
      touchpad = webos && ua.match(/TouchPad/),
      kindle = ua.match(/Kindle\/([\d.]+)/),
      silk = ua.match(/Silk\/([\d._]+)/),
      blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/),
      bb10 = ua.match(/(BB10).*Version\/([\d.]+)/),
      rimtabletos = ua.match(/(RIM\sTablet\sOS)\s([\d.]+)/),
      playbook = ua.match(/PlayBook/),
      chrome = ua.match(/Chrome\/([\d.]+)/) || ua.match(/CriOS\/([\d.]+)/),
      firefox = ua.match(/Firefox\/([\d.]+)/),
      ie = ua.match(/MSIE\s([\d.]+)/) || ua.match(/Trident\/[\d](?=[^\?]+).*rv:([0-9.].)/),
      webview = !chrome && ua.match(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/),
      safari = webview || ua.match(/Version\/([\d.]+)([^S](Safari)|[^M]*(Mobile)[^S]*(Safari))/)

    // Todo: clean this up with a better OS/browser seperation:
    // - discern (more) between multiple browsers on android
    // - decide if kindle fire in silk mode is android or not
    // - Firefox on Android doesn't specify the Android version
    // - possibly devide in os, device and browser hashes

    if(browser.webkit = !!webkit) browser.version = webkit[1]

    if(android) os.android = true, os.version = android[2]
    if(iphone && !ipod) os.ios = os.iphone = true, os.version = iphone[2].replace(/_/g,'.')
    if(ipad) os.ios = os.ipad = true, os.version = ipad[2].replace(/_/g,'.')
    if(ipod) os.ios = os.ipod = true, os.version = ipod[3] ? ipod[3].replace(/_/g,'.') : null
    if(wp) os.wp = true, os.version = wp[1]
    if(webos) os.webos = true, os.version = webos[2]
    if(touchpad) os.touchpad = true
    if(blackberry) os.blackberry = true, os.version = blackberry[2]
    if(bb10) os.bb10 = true, os.version = bb10[2]
    if(rimtabletos) os.rimtabletos = true, os.version = rimtabletos[2]
    if(playbook) browser.playbook = true
    if(kindle) os.kindle = true, os.version = kindle[1]
    if(silk) browser.silk = true, browser.version = silk[1]
    if(!silk && os.android && ua.match(/Kindle Fire/)) browser.silk = true
    if(chrome) browser.chrome = true, browser.version = chrome[1]
    if(firefox) browser.firefox = true, browser.version = firefox[1]
    if(ie) browser.ie = true, browser.version = ie[1]
    if(safari && (osx || os.ios || win))
    {
      browser.safari = true
      if(!os.ios) browser.version = safari[1]
    }
    if(webview) browser.webview = true

    os.tablet = !!(ipad || playbook || (android && !ua.match(/Mobile/)) ||
    (firefox && ua.match(/Tablet/)) || (ie && !ua.match(/Phone/) && ua.match(/Touch/)))
    os.phone = !!(!os.tablet && !os.ipod && (android || iphone || webos || blackberry || bb10 ||
    (chrome && ua.match(/Android/)) || (chrome && ua.match(/CriOS\/([\d.]+)/)) ||
    (firefox && ua.match(/Mobile/)) || (ie && ua.match(/Touch/))))
  }

  detect.call($,navigator.userAgent,navigator.platform)
  // make available to unit tests
  $.__detect = detect

})(Zepto)


;(function($)
{
  var touch = {},
    touchTimeout,tapTimeout,swipeTimeout,longTapTimeout,
    longTapDelay = 750,
    gesture

  function longTap()
  {
    longTapTimeout = null
    if(touch.last)
    {
      touch.el.trigger('longTap')
      touch = {}
    }
  }

  function cancelLongTap()
  {
    if(longTapTimeout) clearTimeout(longTapTimeout)
    longTapTimeout = null
  }

  function swipeDirection(x1,x2,y1,y2)
  {
    return Math.abs(x1 - x2) >=
    Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
  }

  function cancelAll()
  {
    if(touchTimeout) clearTimeout(touchTimeout)
    if(tapTimeout) clearTimeout(tapTimeout)
    if(swipeTimeout) clearTimeout(swipeTimeout)
    if(longTapTimeout) clearTimeout(longTapTimeout)
    touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null
    touch = {}
  }

  function isPrimaryTouch(event)
  {
    return (event.pointerType == 'touch' ||
      event.pointerType == event.MSPOINTER_TYPE_TOUCH)
      && event.isPrimary
  }

  function isPointerEventType(e,type)
  {
    return (e.type == 'pointer' + type ||
    e.type.toLowerCase() == 'mspointer' + type)
  }

  $(document).ready(function()
  {
    var now,delta,deltaX = 0,deltaY = 0,firstTouch,_isPointerType

    if('MSGesture' in window)
    {
      gesture = new MSGesture()
      gesture.target = document.body
    }

    $(document)
      .on('MSGestureEnd',function(e)
      {
        var swipeDirectionFromVelocity =
          e.velocityX > 1 ? 'Right' : e.velocityX < -1 ? 'Left' : e.velocityY > 1 ? 'Down' : e.velocityY < -1 ? 'Up' : null;
        if(swipeDirectionFromVelocity)
        {
          touch.el.trigger('swipe')
          touch.el.trigger('swipe' + swipeDirectionFromVelocity)
        }
      })
      .on('touchstart MSPointerDown pointerdown',function(e)
      {
        if((_isPointerType = isPointerEventType(e,'down')) && !isPrimaryTouch(e)) return
        firstTouch = _isPointerType ? e : e.touches[0]
        if(e.touches && e.touches.length === 1 && touch.x2)
        {
          // Clear out touch movement data if we have it sticking around
          // This can occur if touchcancel doesn't fire due to preventDefault, etc.
          touch.x2 = undefined
          touch.y2 = undefined
        }
        now = Date.now()
        delta = now - (touch.last || now)
        touch.last = now
        if(delta > 0 && delta <= 250) touch.isDoubleTap = true
        touch.el = $('tagName' in firstTouch.target ?
          firstTouch.target : firstTouch.target.parentNode)
        touchTimeout && clearTimeout(touchTimeout)
        touch.x1 = firstTouch.pageX
        touch.y1 = firstTouch.pageY
        longTapTimeout = setTimeout(longTap,longTapDelay)
        // adds the current touch contact for IE gesture recognition
        if(gesture && _isPointerType) gesture.addPointer(e.pointerId);
      })
      .on('touchmove MSPointerMove pointermove',function(e)
      {
        if((_isPointerType = isPointerEventType(e,'move')) && !isPrimaryTouch(e)) return
        firstTouch = _isPointerType ? e : e.touches[0]
        cancelLongTap()
        touch.x2 = firstTouch.pageX
        touch.y2 = firstTouch.pageY

        deltaX += Math.abs(touch.x1 - touch.x2)
        deltaY += Math.abs(touch.y1 - touch.y2)
      })
      .on('touchend MSPointerUp pointerup',function(e)
      {
        if((_isPointerType = isPointerEventType(e,'up')) && !isPrimaryTouch(e)) return
        cancelLongTap()

        // swipe
        if((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) || (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30))
          swipeTimeout = setTimeout(function()
          {
            touch.el.trigger('swipe')
            touch.el.trigger('swipe' + (swipeDirection(touch.x1,touch.x2,touch.y1,touch.y2)))
            touch = {}
          },0)

        // normal tap
        else if('last' in touch)
        // don't fire tap when delta position changed by more than 30 pixels,
        // for instance when moving to a point and back to origin
          if(deltaX < 30 && deltaY < 30)
          {
            // delay by one tick so we can cancel the 'tap' event if 'scroll' fires
            // ('tap' fires before 'scroll')
            tapTimeout = setTimeout(function()
            {
              // trigger universal 'tap' with the option to cancelTouch()
              // (cancelTouch cancels processing of single vs double taps for faster 'tap' response)
              var event = $.Event('tap')
              event.cancelTouch = cancelAll
              touch.el.trigger(event)

              if(touch.isDoubleTap) // trigger double tap immediately
              {
                if(touch.el) touch.el.trigger('doubleTap')
                touch = {}
              }else                // trigger single tap after 250ms of inactivity
              {
                touchTimeout = setTimeout(function()
                {
                  touchTimeout = null
                  if(touch.el) touch.el.trigger('singleTap')
                  touch = {}
                },250)
              }
            },0)
          }else
          {
            touch = {}
          }
        deltaX = deltaY = 0
      })
      // when the browser window loses focus,
      // for example when a modal dialog is shown,
      // cancel all ongoing events
      .on('touchcancel MSPointerCancel pointercancel',cancelAll)

    // scrolling the window indicates intention of the user
    // to scroll, not tap or swipe, so cancel all ongoing events
    $(window).on('scroll',cancelAll)
  })

  ;['swipe','swipeLeft','swipeRight','swipeUp','swipeDown',
    'doubleTap','tap','singleTap','longTap'].forEach(function(eventName)
    {
      $.fn[eventName] = function(callback){ return this.on(eventName,callback) }
    })
})(Zepto)
