/*mini.js */
var Mini = (function()
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
          else dom = slice.call(document.querySelectorAll(selector))
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
  $ = function(selector){ return mini.init(selector) }
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
      return $(filter.call(this,function(element){ return mini.matches(element,selector) }))
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
    is:function(selector){ return this.length > 0 && mini.matches(this[0],selector) },
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
      while(node && !(collection ? collection.indexOf(node) >= 0 : mini.matches(node,selector)))
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
        // arguments can be nodes, arrays of nodes, Mini objects and HTML strings
        var argType,nodes = $.map(arguments,function(arg)
          {
            argType = type(arg)
            return argType == "object" || argType == "array" || arg == null ? arg : mini.fragment(arg)
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
  mini.Z.prototype = $.fn
  $.mini = mini
  return $
})()

window.Mini = Mini
window.$ === undefined && (window.$ = Mini)




