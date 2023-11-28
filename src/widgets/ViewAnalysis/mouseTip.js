// import * as Cesium from 'cesium'

/**
 * @class
 * @classdesc 鼠标提示类
 */
class MouseTip {
  /**
   * @constructor
   * @param { Viewer } viewer
   */
  constructor(viewer) {
    this.viewer = viewer
    this.msg = ''
    this.tipContainer = null
    this.tipDiv = null
    this.$tip = null
    this.visiblity = false
    this.handler = null
    this.init()
  }

  // 初始化mouseTip
  init() {
    let parentDiv = (this.viewer && this.viewer.container) || document.body
    let div = document.createElement('div')
    div.className = 'cesium-mouse-tip'
    let arrow = document.createElement('div')
    arrow.className = 'cesium-mouse-arrow'
    div.appendChild(arrow)
    let title = document.createElement('div')
    title.className = 'cesium-mouse-inner'
    div.appendChild(title)
    this.tipContainer = div
    this.tipDiv = title
    this.$tip = document.getElementsByClassName('cesium-mouse-tip')[0]
    parentDiv.appendChild(div)
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas)
  }

  /**
   * 设置为可见或钉住
   * @param { Boolean } visible
   * @param { Boolean } fixed
   */
  setVisible(visible, fixed) {
    let _this = this
    _this.visiblity = visible
    _this.tipContainer.style.display = visible ? 'block' : 'none'
    if (visible && !fixed) {
      _this.handler.setInputAction(function(e) {
        _this.visiblity && _this.showAt(e.endPosition)
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    } else {
      _this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    }
  }


  // @name 设置mouseTip的显示位置
  // @param { Object } position - { x, y }
  showAt(position) {
    if (position) {
      let x = position.x - (this.tipContainer.clientWidth / 4)
      let y = position.y - this.tipContainer.clientHeight - 10
      this.tipContainer.style.left = x + 'px'
      this.tipContainer.style.top = y + 'px'
    }
  }

  /**
   * 设置mouseTip的显示内容
   * @param { String } message - 鼠标提示文字
   * @param { Boolean } fixed - 是否固定
   */
  setMouseTip(message, fixed) {
    this.msg = message
    this.setVisible(true, fixed)
    this.tipDiv.innerHTML = message
  }

  mouseTipMove(e) {
    this.visiblity && this.showAt(e.endPosition)
  }

  /**
   * 移除鼠标提示
   */
  removeTip() {
    this.handler && this.handler.destroy()
    this.tipContainer.remove()
    this.handler = null
  }
}

export default MouseTip
