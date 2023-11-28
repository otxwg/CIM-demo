// import * as Cesium from 'cesium'
import {
  MouseManager
} from './mouseManager.js'
import {
  renderDom
} from './templateExtend.js'
import MouseTip from './mouseTip'

/**
 * @class
 * @classdesc 可视域分析
 */
class ViewShed {
  /**
   * @constructor
   * @param {Cesium.Viewer} viewer Cesium三维视窗。
   * @param {Object} options 选项。
   * @param {Cesium.Cartesian3} options.viewPosition 观测点位置。
   * @param {Cesium.Cartesian3} options.viewPositionEnd 最远观测点位置（如果设置了观测距离，这个属性可以不设置）。
   * @param {Number} options.viewDistance 观测距离（单位`米`，默认值100）。
   * @param {Number} options.viewHeading 航向角（单位`度`，默认值0）。
   * @param {Number} options.viewPitch 俯仰角（单位`度`，默认值0）。
   * @param {Number} options.horizontalViewAngle 可视域水平夹角（单位`度`，默认值90）。
   * @param {Number} options.verticalViewAngle 可视域垂直夹角（单位`度`，默认值60）。
   * @param {Cesium.Color} options.visibleAreaColor 可视区域颜色（默认值`绿色`）。
   * @param {Cesium.Color} options.invisibleAreaColor 不可视区域颜色（默认值`红色`）。
   * @param {Boolean} options.enabled 阴影贴图是否可用。
   * @param {Boolean} options.softShadows 是否启用柔和阴影。
   * @param {Boolean} options.size 每个阴影贴图的大小。
   * @param {Cesium.Cartesian3} positions 绘制锥体点合集
   */
  constructor(viewer, options, panel) {
    this.viewer = viewer
    this.mouseTip = null // 鼠标提示
    this.options = options || {}
    this.positions = []
    this.sketch = null
    this.frustumOutline = null
    this.postStage = null
    this.colsePanel = panel
    /** 观测点位置 */
    this.viewPosition = this.options.viewPosition || null
    /** 最远观测点位置（如果设置了观测距离，这个属性可以不设置） */
    this.viewHeight = this.options.viewHeight || null
    /** 观测高度（单位`米`，默认值100） */
    this.viewPositionEnd = this.options.viewPositionEnd || null
    /** 观测距离（单位`米`，默认值100） */
    this.viewDistance = this.viewPositionEnd ? Cesium.Cartesian3.distance(this.viewPosition, this.viewPositionEnd) : (this.options.viewDistance || 1.0)
    /** 航向角（单位`度`，默认值0） */
    this.viewHeading = this.viewPositionEnd ? this.getHeading(this.viewPosition, this.viewPositionEnd) : (this.options.viewHeading || 0.0)
    /** 俯仰角（单位`度`，默认值0） */
    this.viewPitch = this.viewPositionEnd ? this.getPitch(this.viewPosition, this.viewPositionEnd) : (this.options.viewPitch || 0.0)
    /** 可视域水平夹角（单位`度`，默认值90） */
    this.horizontalViewAngle = this.options.horizontalViewAngle || 90.0
    /** 可视域垂直夹角（单位`度`，默认值60） */
    this.verticalViewAngle = this.options.verticalViewAngle || 60.0
    /** 可视区域颜色（默认值`绿色`） */
    this.visibleAreaColor = this.options.visibleAreaColor || Cesium.Color.GREEN
    /** 不可见区域颜色（默认值`红色`） */
    this.invisibleAreaColor = this.options.invisibleAreaColor || Cesium.Color.RED
    /** 阴影贴图是否可用 */
    this.enabled = (typeof this.options.enabled === 'boolean') ? this.options.enabled : true
    /** 是否启用柔和阴影 */
    this.softShadows = (typeof this.options.softShadows === 'boolean') ? this.options.softShadows : true
    /** 每个阴影贴图的大小 */
    this.size = this.options.size || 2048
    this.lightCamera = null
    this.mouseManager = new MouseManager(this.viewer)
    this.shadowMap = null
    this.viewsheParam = {
      viewHeight: this.viewHeight,
      viewDistance: this.viewDistance,
      horizontalViewAngle: this.horizontalViewAngle,
      verticalViewAngle: this.verticalViewAngle
    }
    this.widgetUI = null
    this.showWidgetUI = false
    this.init()
  }

  init() {
    let viewshedIcon = renderDom('i', 'view-shed-icon', 'view-shed-icon', '', '可视域分析')
    this.widgetUI = renderDom('div', 'view-shed', 'widget-icon', '', '可视域分析', [viewshedIcon], (e) => {
      e.stopPropagation()
      this.showWidgetUI = !this.showWidgetUI
      this.widgetUI.className = 'widget-icon'
      this.clear()
      if (this.showWidgetUI) {
        this.active()
        this.widgetUI.className += ' active'
      }
    })
  }

  /**
   * 开启可视域分析
   */
  active() {
    this.clear()
    if (!this.mouseTip) {
      this.mouseTip = new MouseTip(this.viewer)
    }
    this.mouseTip.setMouseTip('左键选择观察点')
    this.mouseTip.setVisible(true)
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas)
    const _self = this
    _self.handler.setInputAction(function (e) { // 第一次点击
      const cartesian = _self.mouseManager.piTerrainToModule(e.position)
      if (!cartesian) {
        return false
      }
      if (!_self.positions.length) { // 开始
        var cartograhphic = _self.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian.clone())
        var lat = Cesium.Math.toDegrees(cartograhphic.latitude)
        var lng = Cesium.Math.toDegrees(cartograhphic.longitude)
        var height = cartograhphic.height + 1.75
        _self.viewsheParam.viewHeight = height.toFixed(2)

        cartograhphic = Cesium.Cartographic.fromDegrees(lng, lat, height)
        var cartesian3 = _self.viewer.scene.globe.ellipsoid.cartographicToCartesian(cartograhphic)
        _self.positions.push(cartesian3)
        _self.mouseTip.setMouseTip('左键选择目标点结束分析')
      }
      if (_self.positions.length === 2) {
        _self.createShadowMap()
        _self.createPostStage()
        _self.handler.destroy()
        _self.handler = null
        _self.mouseTip.setVisible(false)
        _self.colsePanel()
      }
      _self.positions.push(cartesian.clone())
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    /**
     * 移动
     */
    _self.handler.setInputAction(function (e) {
      const cartesian = _self.mouseManager.screenToWorld(e.endPosition)
      if (!cartesian) {
        return false
      }
      if (_self.positions.length === 2) {
        _self.positions.pop()
        _self.positions.push(cartesian.clone())
        _self.viewPosition = _self.positions[0]
        _self.viewPositionEnd = _self.positions[1]
        _self.viewHeading = _self.getHeading(_self.positions[0], _self.positions[1])
        // _self.viewPitch = _self.getPitch(_self.positions[0], _self.positions[1])
        _self.viewDistance = Cesium.Cartesian3.distance(_self.positions[0], _self.positions[1])
        _self.viewsheParam.viewDistance = _self.viewDistance.toFixed(2)
        _self.clearDraw('primitive')
        setTimeout(() => {
          _self.add() // 绘制当前
          _self.createShadowMap()
          _self.createPostStage()
        }, 50)
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  }

  // 计算方向
  calculateDirection(p1, p2) {
    return Cesium.Cartesian3.normalize(
      Cesium.Cartesian3.subtract(p2, p1, new Cesium.Cartesian3()),
      new Cesium.Cartesian3()
    )
  }

  add() {
    this.createLightCamera()
    // this.drawFrustumOutine()
    this.drawSketch()
  }

  // 创建相机并设置相机状态
  createLightCamera() {
    this.lightCamera = new Cesium.Camera(this.viewer.scene)
    this.lightCamera.position = this.viewPosition
    if (this.viewPositionEnd) {
      const direction = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(this.positions[1], this.positions[0], new Cesium.Cartesian3()), new Cesium.Cartesian3())
      this.lightCamera.direction = direction // direction是相机面向的方向
    }
    this.lightCamera.frustum.near = 0.0001
    this.lightCamera.frustum.far = this.viewDistance
    const hr = Cesium.Math.toRadians(this.horizontalViewAngle)
    const vr = Cesium.Math.toRadians(this.verticalViewAngle)
    const aspectRatio =
      (this.viewDistance * Math.tan(hr / 2) * 2) /
      (this.viewDistance * Math.tan(vr / 2) * 2)

    this.lightCamera.frustum.aspectRatio = aspectRatio
    if (hr > vr) {
      this.lightCamera.frustum.fov = hr
    } else {
      this.lightCamera.frustum.fov = vr
    }
    this.lightCamera.setView({
      destination: this.viewPosition,
      orientation: {
        heading: Cesium.Math.toRadians(this.viewHeading || 0),
        pitch: Cesium.Math.toRadians(this.viewPitch || 0),
        roll: 0
      }
    })
  }

  // 创建阴影贴图
  createShadowMap() {
    this.shadowMap = new Cesium.ShadowMap({
      context: (this.viewer.scene).context,
      lightCamera: this.lightCamera,
      enabled: true,
      isPointLight: true,
      pointLightRadius: this.viewDistance,
      cascadesEnabled: true,
      size: this.size,
      softShadows: this.softShadows,
      normalOffset: true,
      fromLightSource: false
    })
    this.viewer.scene.shadowMap = this.shadowMap
  }

  // 阴影贴图着色
  createPostStage() {
    const fs = `
     #define USE_CUBE_MAP_SHADOW true
     uniform sampler2D colorTexture;
     uniform sampler2D depthTexture;
     in vec2 v_textureCoordinates;
     uniform mat4 camera_projection_matrix;
     uniform mat4 camera_view_matrix;
     uniform float far;
     uniform samplerCube shadowMap_textureCube;
     uniform mat4 shadowMap_matrix;
     uniform vec4 shadowMap_lightPositionEC;
     uniform vec4 shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness;
     uniform vec4 shadowMap_texelSizeDepthBiasAndNormalShadingSmooth;
     struct zx_shadowParameters
     {
         vec3 texCoords;
         float depthBias;
         float depth;
         float nDotL;
         vec2 texelStepSize;
         float normalShadingSmooth;
         float darkness;
     };
     float czm_shadowVisibility(samplerCube shadowMap, zx_shadowParameters shadowParameters)
     {
         float depthBias = shadowParameters.depthBias;
         float depth = shadowParameters.depth;
         float nDotL = shadowParameters.nDotL;
         float normalShadingSmooth = shadowParameters.normalShadingSmooth;
         float darkness = shadowParameters.darkness;
         vec3 uvw = shadowParameters.texCoords;
         depth -= depthBias;
         float visibility = czm_shadowDepthCompare(shadowMap, uvw, depth);
         return czm_private_shadowVisibility(visibility, nDotL, normalShadingSmooth, darkness);
     }
     vec4 getPositionEC(){
         return czm_windowToEyeCoordinates(gl_FragCoord);
     }
     vec3 getNormalEC(){
         return vec3(1.);
     }
     vec4 toEye(in vec2 uv,in float depth){
         vec2 xy=vec2((uv.x*2.-1.),(uv.y*2.-1.));
         vec4 posInCamera=czm_inverseProjection*vec4(xy,depth,1.);
         posInCamera=posInCamera/posInCamera.w;
         return posInCamera;
     }
     vec3 pointProjectOnPlane(in vec3 planeNormal,in vec3 planeOrigin,in vec3 point){
         vec3 v01=point-planeOrigin;
         float d=dot(planeNormal,v01);
         return(point-planeNormal*d);
     }
     float getDepth(in vec4 depth){
         float z_window=czm_unpackDepth(depth);
         z_window=czm_reverseLogDepth(z_window);
         float n_range=czm_depthRange.near;
         float f_range=czm_depthRange.far;
         return(2.*z_window-n_range-f_range)/(f_range-n_range);
     }
     float shadow( in vec4 positionEC ){
         vec3 normalEC=getNormalEC();
         zx_shadowParameters shadowParameters;
         shadowParameters.texelStepSize=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.xy;
         shadowParameters.depthBias=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.z;
         shadowParameters.normalShadingSmooth=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.w;
         shadowParameters.darkness=shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.w;
         vec3 directionEC=positionEC.xyz-shadowMap_lightPositionEC.xyz;
         float distance=length(directionEC);
         directionEC=normalize(directionEC);
         float radius=shadowMap_lightPositionEC.w;
         if(distance>radius)
         {
             return 2.0;
         }
         vec3 directionWC=czm_inverseViewRotation*directionEC;
         shadowParameters.depth=distance/radius-0.0003;
         shadowParameters.nDotL=clamp(dot(normalEC,-directionEC),0.,1.);
         shadowParameters.texCoords=directionWC;
         float visibility=czm_shadowVisibility(shadowMap_textureCube,shadowParameters);
         return visibility;
     }
     bool visible(in vec4 result)
     {
         result.x/=result.w;
         result.y/=result.w;
         result.z/=result.w;
         return result.x>=-1.&&result.x<=1.
         &&result.y>=-1.&&result.y<=1.
         &&result.z>=-1.&&result.z<=1.;
     }
     void main(){
         // 得到釉色=结构二维(彩色纹理,纹理坐标)
         out_FragColor=texture(colorTexture,v_textureCoordinates);
         // 深度=(釉色=结构二维(深度纹理,纹理坐标))
         float depth=getDepth(texture(depthTexture,v_textureCoordinates));
         // 视角=(纹理坐标,深度)
         vec4 viewPos=toEye(v_textureCoordinates,depth);
         // 世界坐标
         vec4 wordPos=czm_inverseView*viewPos;
         // 虚拟相机中坐标
         vec4 vcPos=camera_view_matrix*wordPos;
         float near=.001*far;
         float dis=length(vcPos.xyz);
         if(dis>near&&dis<far){
             // 透视投影
             vec4 posInEye=camera_projection_matrix*vcPos;
             // 可视区颜色
             vec4 v_color=vec4(0.,1.,0.,1.);
             // 不可视区颜色
             vec4 inv_color=vec4(1.,0.,0.,.5);
             if(visible(posInEye)){
                 float vis=shadow(viewPos);
                 if(vis>0.01){
                     out_FragColor=mix(out_FragColor,v_color,.5);
                 } else{
                     out_FragColor=mix(out_FragColor,inv_color,.5);
                 }
             }
         }
     }`
    this.postStage = new Cesium.PostProcessStage({
      fragmentShader: fs,
      // name: 'ProcessStage',
      // clearColor: Cesium.Color.RED,
      uniforms: {
        camera_projection_matrix: this.lightCamera.frustum.projectionMatrix,
        camera_view_matrix: this.lightCamera.viewMatrix,
        far: () => {
          return this.viewDistance
        },
        shadowMap_textureCube: () => {
          this.shadowMap.update(Reflect.get(this.viewer.scene, '_frameState'))
          return Reflect.get(this.shadowMap, '_shadowMapTexture')
        },
        shadowMap_matrix: () => {
          this.shadowMap.update(Reflect.get(this.viewer.scene, '_frameState'))
          return Reflect.get(this.shadowMap, '_shadowMapMatrix')
        },
        shadowMap_lightPositionEC: () => {
          this.shadowMap.update(Reflect.get(this.viewer.scene, '_frameState'))
          return Reflect.get(this.shadowMap, '_lightPositionEC')
        },
        shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness: () => {
          this.shadowMap.update(Reflect.get(this.viewer.scene, '_frameState'))
          const bias = this.shadowMap._pointBias
          return Cesium.Cartesian4.fromElements(
            bias.normalOffsetScale,
            this.shadowMap._distance,
            this.shadowMap.maximumDistance,
            0.0,
            new Cesium.Cartesian4()
          )
        },
        shadowMap_texelSizeDepthBiasAndNormalShadingSmooth: () => {
          this.shadowMap.update(Reflect.get(this.viewer.scene, '_frameState'))
          const bias = this.shadowMap._pointBias
          const scratchTexelStepSize = new Cesium.Cartesian2()
          const texelStepSize = scratchTexelStepSize
          texelStepSize.x = 1.0 / this.shadowMap._textureSize.x
          texelStepSize.y = 1.0 / this.shadowMap._textureSize.y

          return Cesium.Cartesian4.fromElements(
            texelStepSize.x,
            texelStepSize.y,
            bias.depthBias,
            bias.normalShadingSmooth,
            new Cesium.Cartesian4()
          )
        }
      }
    })
    this.viewer.scene.postProcessStages.add(this.postStage)
  }

  // 创建锥体
  drawFrustumOutine() {
    const scratchRight = new Cesium.Cartesian3()
    const scratchRotation = new Cesium.Matrix3()
    const scratchOrientation = new Cesium.Quaternion()
    // const position = this.lightCamera.positionWC
    const direction = this.lightCamera.directionWC
    const up = this.lightCamera.upWC
    let right = this.lightCamera.rightWC
    right = Cesium.Cartesian3.negate(right, scratchRight)
    const rotation = scratchRotation
    Cesium.Matrix3.setColumn(rotation, 0, right, rotation)
    Cesium.Matrix3.setColumn(rotation, 1, up, rotation)
    Cesium.Matrix3.setColumn(rotation, 2, direction, rotation)
    const orientation = Cesium.Quaternion.fromRotationMatrix(rotation, scratchOrientation)

    const instance = new Cesium.GeometryInstance({
      releaseGeometryInstances: false,
      geometry: new Cesium.FrustumOutlineGeometry({
        frustum: this.lightCamera.frustum,
        origin: this.viewPosition,
        orientation: orientation
      }),
      id: 'FrustumOutline',
      attributes: {
        color: new Cesium.GeometryInstanceAttribute({
          componentDatatype: Cesium.ComponentDatatype.UNSIGNED_BYTE,
          componentsPerAttribute: 4,
          normalize: true,
          value: [41, 234, 255, 255]
        }),
        show: new Cesium.ShowGeometryInstanceAttribute(true)
      }
    })
    this.frustumOutline = new Cesium.Primitive({
      geometryInstances: [instance],
      appearance: new Cesium.PerInstanceColorAppearance({
        flat: true,
        translucent: false
      })
    })
    this.viewer.scene.primitives.add(
      this.frustumOutline
    )
    // 计算视锥轮廓线的几何表示，包括其顶点，索引和边界球
    const geometry = Cesium.FrustumOutlineGeometry.createGeometry(instance.geometry)
    this.positions[1] = geometry.boundingSphere.center
    this.viewPositionEnd = geometry.boundingSphere.center
    this.viewHeading = this.getHeading(this.positions[0], this.positions[1])
  }

  // 创建椭球
  drawSketch() {
    if (!this.sketch) {
      this.sketch = this.viewer.entities.add({
        name: 'sketch',
        position: this.viewPosition,
        orientation: Cesium.Transforms.headingPitchRollQuaternion(
          this.viewPosition,
          Cesium.HeadingPitchRoll.fromDegrees(this.viewHeading - 90, this.viewPitch, 0.0)
        ),
        ellipsoid: {
          radii: new Cesium.Cartesian3(
            this.viewDistance,
            this.viewDistance,
            this.viewDistance
          ),
          // innerRadii: new Cesium.Cartesian3(2.0, 2.0, 2.0),
          minimumClock: Cesium.Math.toRadians(-this.horizontalViewAngle / 2),
          maximumClock: Cesium.Math.toRadians(this.horizontalViewAngle / 2),
          minimumCone: Cesium.Math.toRadians(this.verticalViewAngle),
          maximumCone: Cesium.Math.toRadians(180 - this.verticalViewAngle),
          fill: false,
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString('#62DDFF'), // new Cesium.Color(41 / 255, 234 / 255, 255 / 255, 1.0),
          subdivisions: 256,
          stackPartitions: 16,
          slicePartitions: 16
        },
        billboard: {
          image: require('./local.png')
        }
      })
    } else {
      this.sketch.position = this.viewPosition
      this.sketch.orientation = Cesium.Transforms.headingPitchRollQuaternion(
        this.viewPosition,
        Cesium.HeadingPitchRoll.fromDegrees(this.viewHeading - 90, this.viewPitch, 0.0)
      )
      this.sketch.ellipsoid = {
        radii: new Cesium.Cartesian3(
          this.viewDistance,
          this.viewDistance,
          this.viewDistance
        ),
        // innerRadii: new Cesium.Cartesian3(2.0, 2.0, 2.0),
        minimumClock: Cesium.Math.toRadians(-this.horizontalViewAngle / 2),
        maximumClock: Cesium.Math.toRadians(this.horizontalViewAngle / 2),
        minimumCone: Cesium.Math.toRadians(this.verticalViewAngle),
        maximumCone: Cesium.Math.toRadians(180 - this.verticalViewAngle),
        fill: false,
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString('#62DDFF'), // new Cesium.Color(41 / 255, 234 / 255, 255 / 255, 1.0),
        subdivisions: 256,
        stackPartitions: 16,
        slicePartitions: 16
      }
    }
  }

  getHeading(fromPosition, toPosition) {
    const finalPosition = new Cesium.Cartesian3()
    const matrix4 = Cesium.Transforms.eastNorthUpToFixedFrame(fromPosition)
    Cesium.Matrix4.inverse(matrix4, matrix4)
    Cesium.Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition)
    Cesium.Cartesian3.normalize(finalPosition, finalPosition)
    return Cesium.Math.toDegrees(Math.atan2(finalPosition.x, finalPosition.y))
  }

  getPitch(fromPosition, toPosition) {
    const finalPosition = new Cesium.Cartesian3()
    const matrix4 = Cesium.Transforms.eastNorthUpToFixedFrame(fromPosition)
    Cesium.Matrix4.inverse(matrix4, matrix4)
    Cesium.Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition)
    Cesium.Cartesian3.normalize(finalPosition, finalPosition)
    return Cesium.Math.toDegrees(Math.asin(finalPosition.z))
  }

  // 更新
  update(options) {
    this.viewPosition = this.cartesianToLatlng(this.viewPosition, options.viewHeight)
    this.viewDistance = options.viewDistance
    this.horizontalViewAngle = options.horizontalViewAngle
    this.verticalViewAngle = options.verticalViewAngle === 0 ? 89 : 90 - options.verticalViewAngle
    this.clearDraw('primitive') // 清除上一次的
    setTimeout(() => {
      this.add() // 绘制当前
      this.createShadowMap()
      this.createPostStage()
    }, 300)
  }

  // 转经纬度
  cartesianToLatlng(cartesian, height) {
    var latlng = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian)
    var lng = Cesium.Math.toDegrees(latlng.longitude)
    var lat = Cesium.Math.toDegrees(latlng.latitude)
    return Cesium.Cartesian3.fromDegrees(lng, lat, height)
  }

  //  清除指定类型实体
  clearDraw(type) {
    if (!type) {
      // 清除之前的实体
      const entitys = this.viewer.entities._entities._array
      const lengthE = entitys.length
      // 倒叙遍历防止实体减少之后entitys[f]不存在
      for (let f = lengthE - 1; f >= 0; f--) {
        if (entitys[f]._name && entitys[f]._name === 'sketch') {
          this.viewer.entities.remove(entitys[f])
        } else {
          continue
        }
      }
    }
    if (type === 'primitive' || !type) {
      const primitives = this.viewer.scene.primitives._primitives
      const lengthP = primitives.length
      // 倒叙遍历防止实体减少之后entitys[f]不存在
      for (let j = lengthP - 1; j >= 0; j--) {
        if (primitives[j]._instanceIds && primitives[j]._instanceIds[0] === 'FrustumOutline') {
          this.viewer.scene.primitives.remove(primitives[j])
        } else {
          continue
        }
      }
    }
    this.viewer.scene.postProcessStages.removeAll()
  }

  /**
   * 清除可视域
   */
  clear() {
    this.handler = this.handler && this.handler.destroy()
    this.handler = null
    this.positions = []
    this.lightCamera = null
    this.shadowMap = null
    this.viewPosition = null
    this.viewPositionEnd = null
    this.viewHeading = 0
    this.viewPitch = 0
    this.viewDistance = 1.0
    this.clearDraw()
    this.sketch = null
    this.frustumOutline = null
    this.postStage = null
    this.mouseTip && this.mouseTip.removeTip()
    this.mouseTip = null
  }
}

export default ViewShed
