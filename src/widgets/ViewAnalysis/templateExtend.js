import Vue from 'vue'

/**
 * 渲染vue组件
 * @param template
 * @param options
 * @returns { VueComponent }
 */
function extendTemplate(template, options) {
  let ModelTemplate = Vue.extend(template)
  let VNModal = new ModelTemplate({
    el: document.createElement('div'),
    propsData: options
  })
  VNModal.options = options
  return VNModal
}

/**
 * 渲染DOM元素
 * @param tag { DocumentType } html标签
 * @param id
 * @param className
 * @param text { String }
 * @param title { String }
 * @param childNodes { Array } 子元素集合
 * @param clickEvent { Event }
 * @param attribute
 * @returns { DOM }
 */
function renderDom(tag, id, className, text, title, childNodes, clickEvent, attribute) {
  let dom = document.createElement(tag)
  dom.id = id
  dom.className = className
  dom.title = title || ''
  if (text) {
    dom.innerText = text
  }
  if (attribute) {
    dom.attribute = attribute
  }
  if (childNodes) {
    for (let i = 0; i < childNodes.length; i++) {
      dom.appendChild(childNodes[i])
    }
  }
  if (clickEvent && typeof clickEvent === 'function') {
    dom.addEventListener('click', clickEvent, false)
    dom.addEventListener('dblclick', clickEvent, false)
  }
  return dom
}

export {
  extendTemplate,
  renderDom
}
