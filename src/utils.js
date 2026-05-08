export const toDou = n => {
  return n < 10 ? '0'+n : ''+n;
}

export const getDate = timestamp => {
  let newDate = new Date(timestamp*1000);
  return {
    year: newDate.getFullYear(),
    month: newDate.getMonth() + 1,
    date: newDate.getDate(),
    hours: newDate.getHours(),
    minutes: newDate.getMinutes(),
    seconds: newDate.getSeconds(),
    day: newDate.getDay()
  }
}

/**
 * wheel 事件兼容写法；返回卸载函数供 destroy 移除监听。
 * @returns {() => void}
 */
export const addWheelListener = (elem, callback, _addEventListener, prefix, useCapture) => {
  const removeFns = [];
  const cap = useCapture || false;
  const add = elem[_addEventListener].bind(elem);
  const removeMethod = _addEventListener === 'addEventListener' ? 'removeEventListener' : 'detachEvent';
  const remove = elem[removeMethod].bind(elem);
  const pre = prefix || '';

  let support = "onwheel" in document.createElement("div") ? "wheel" :
                document.onmousewheel !== undefined ? "mousewheel" :
                "DOMMouseScroll";

  function normalizedHandler(originalEvent) {
    !originalEvent && (originalEvent = window.event);

    var event = {
      originalEvent: originalEvent,
      target: originalEvent.target || originalEvent.srcElement,
      ctrlKey: originalEvent.ctrlKey || false,
      type: "wheel",
      deltaMode: originalEvent.type == "MozMousePixelScroll" ? 0 : 1,
      deltaX: 0,
      deltaZ: 0,
      preventDefault: function() {
        originalEvent.preventDefault ?
          originalEvent.preventDefault() :
          originalEvent.returnValue = false;
      }
    };

    if ( support == "mousewheel" ) {
      event.deltaY = - 1/40 * originalEvent.wheelDelta;
      originalEvent.wheelDeltaX && ( event.deltaX = - 1/40 * originalEvent.wheelDeltaX );
    } else {
      event.deltaY = originalEvent.detail;
    }

    return callback( event );
  }

  const listener = support === "wheel" ? callback : normalizedHandler;
  add(pre + support, listener, cap);
  removeFns.push(() => remove(pre + support, listener, cap));

  if( support == "DOMMouseScroll" ) {
    add(pre + "MozMousePixelScroll", normalizedHandler, cap);
    removeFns.push(() => remove(pre + "MozMousePixelScroll", normalizedHandler, cap));
  }

  return () => {
    for (let i = removeFns.length - 1; i >= 0; i--) {
      try {
        removeFns[i]();
      } catch (_) {
        void 0;
      }
    }
  };
}
