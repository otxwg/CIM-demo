/*
 *  
 * @Description: 淹没分析
 */

let projectionHelper = agcim.maths.coordinate
let math = agcim.maths.math
let Draw = agcim.interactive.draw;

class FloodSimulate {
  constructor(option) {
    this.viewer = option.viewer
    this.time = 0//记录时间
    this.interval = 100 //默认隔1秒监听一次
    this.waterOptions = {}
    this.saveWaterHeight = 0  //水位的高度
    this.normalWaterPrimitive = null //未超出警戒的primitive
    this.alertLinePrimitive = null
    this.recordTimerInterval = null //记录时间定时器
    this.renderPrimitiveInterval = null //渲染primitive定时器
    this.lastTime = 1
    this.heightInfo = {}
    this.floodedArea = 0 //淹没面积
    this.totalArea = 0 //区域总面积
    this.areaForSecond = 0 //每秒上涨的面积
    this.drawTool = undefined;
  }


  /**
   *  
   * @description: 绘制区域
   * @param {Object} options 区域样式
   * @return {Object}
   *  positions 绘制区域的笛卡尔坐标数组
   *  maxHeight 地形区域高程最大值
   *  minHeight 地形区域高程最小值
   */
  async draw(options = {}) {
    this.clearWater()
    this.drawTool = new Draw(this.viewer);
    let newOptions = Object.assign({
      outline: true,
      outlineWidth: 1.0,
      fill: true,
      outlineColor: Cesium.Color.fromCssColorString("#FF0000"),
      material: new Cesium.Color(0.2, 0.3, 1, 0.2),
    }, options)
    let drawResult = await this.drawTool.drawPolygon(newOptions,false);
    let positions = drawResult.positions;
    this.heightInfo = await this._comMinAndMax(positions);
    this.points = positions
    this.totalArea = this._getDrawingArea(positions)
    return {
      positions: positions,
      totalArea: this.totalArea,
      ...this.heightInfo
    }
  }

  /**
   *  
   * @description: 获取绘制区域的面积
   * @param {*} cartesian3Array
   * @param {*} unit
   * @param {*} keepDecimal
   * @return {*}
   */
  _getDrawingArea(cartesian3Array, unit = "meter", keepDecimal = 4) {
    return math.keepDecimal(math.getArea2(cartesian3Array, unit), keepDecimal)
  }

  /**
   *  
   * @description: 开始淹没模拟
   * @param {*} options.speed 水位步进
   * @param {*} options.endHeight 结束淹没高度
   * @param {*} options.startHeight 初始淹没高度
   * @param {*} options.alertHeight 警戒水位高度
   * @param {*} options.waterColor 水位primitive颜色
   * @param {*} options.waterColorAlpha 水位primitive颜色透明度
   * @param {*} options.alertColor 警戒线颜色
   * @param {Function} callback 淹没模拟中的回调函数
   * @param {Function} simulationCallback 淹没模拟结束的回调函数
   * @return {*}
   */
  start(options, callback, simulationCallback) {
    debugger
    this.waterOptions = Object.prototype.toString.call(options) === '[object Object]' ? options : {}
    this.saveWaterHeight = this.saveWaterHeight > 0 ? this.saveWaterHeight : options.startHeight
    //获取每秒上涨的面积
    this.areaForSecond = this._getFloodedArea(false)
    //开启渲染primitive的定时器
    this._renderPrimitiveTimer(false)
    //开始时间监听器
    this._recordTimer(callback, simulationCallback, false)
    //开始下雨动画
    if (options.off) {//控制下雨动画,开启之后不能重复开启
      let stage = this._getStage(CIM.viewer, "SubmergingAnalysisRain");
      if (!stage) {
        this._addPostProcessStage(CIM.viewer, "SubmergingAnalysisRain", this.waterOptions.speed)
      }
    }
  }

  /**
   *  
   * @description: 暂停淹没模拟
   */
  pause() {
    this.renderPrimitiveInterval && clearInterval(this.renderPrimitiveInterval)
    this.recordTimerInterval && clearInterval(this.recordTimerInterval)
    this._removePostProcessStage(CIM.viewer, "SubmergingAnalysisRain")
  }

  /**
   *  
   * @description: 获取每秒上涨或者下降的面积
   * @param {Boolean} flag false 淹没 true 退水
   * @returns {*}
   */
  _getFloodedArea(flag) {
    //计算总面积
    let area = !flag ?
      this.totalArea * (this.waterOptions.endHeight / this.heightInfo.maxHeight) - this.floodedArea :
      this.floodedArea
    //每一秒上涨或者下降的高度
    let proportion = !flag ?
      (this.waterOptions.endHeight - this.saveWaterHeight) / this.waterOptions.speed :
      (this.saveWaterHeight - this.waterOptions.startHeight) / this.waterOptions.returnSpeed
    //每一秒上涨或者下降的面积
    return area / proportion
  }

  /**
   *  
   * @description: 模拟时间定时器
   * @param {Function} callback 淹没模拟或退水模拟中的回调函数
   * @param {Function} simulationCallback 淹没模拟或退水模拟结束的回调函数
   * @param {Boolean} flag false 淹没 true 退水
   */
  _recordTimer(callback, simulationCallback, flag) {
    this.recordTimerInterval && clearInterval(this.recordTimerInterval)
    this.recordTimerInterval = setInterval(() => {
      //已经上涨的面积
      let area = 0
      if ((this.saveWaterHeight >= this.waterOptions.endHeight && !flag) || (this.saveWaterHeight <= this.waterOptions.startHeight && flag)) {
        clearInterval(this.recordTimerInterval)
        this.time += this.lastTime
        this._removePostProcessStage(CIM.viewer, "SubmergingAnalysisRain")
        simulationCallback && simulationCallback(true)
        area = !flag ? this.totalArea * (this.waterOptions.endHeight / this.heightInfo.maxHeight) : 0
        setTimeout(() => {
          this.normalWaterPrimitive && this.normalWaterPrimitive.setEditAble(false)
        }, this.interval)
      } else {
        this.time += this.interval / 1000
        area = !flag ? this.areaForSecond + this.floodedArea : this.floodedArea - this.areaForSecond
      }
      this.floodedArea = area
      callback && callback(this.time, this.saveWaterHeight, this.floodedArea)
    }, this.interval)
  }

  /**
   *  
   * @description: 淹没和退水渲染primitive定时器
   * @param {Boolean} flag false 淹没 true 退水
   */
  _renderPrimitiveTimer(flag) {
    let normalMaterial = this._getMaterial(this.waterOptions.waterColor, this.waterOptions.waterColorAlpha,)
    this.renderPrimitiveInterval && clearInterval(this.renderPrimitiveInterval)
    this.normalWaterPrimitive && this.normalWaterPrimitive.setEditAble(true)
    this.renderPrimitiveInterval = setInterval(() => {
      !flag ? this._waterRising(normalMaterial) : this._waterFalling()
    }, this.interval)
  }

  /**
   *  
   * @description: 创建primitive
   * @param {Number} height 图元顶部离地面的距离
   * @param {Number} extrudedHeight 图元底部离地面的距离
   * @param {Number} position 笛卡尔坐标数组
   * @param {Material} material
   * @returns {Primitive} 图元
   */
  _createPrimitive(height, extrudedHeight, position, material, geometryType) {
    let primitive = new CustomWaterPrimitive({ height, extrudedHeight, position, material, geometryType })
    this.viewer.scene.primitives.add(primitive)
    primitive.setEditAble(true)
    return primitive
  }

  /**
   *  
   * @description: 创建警戒线primitive
   * @param {Number} height 图元顶部离地面的距离
   * @param {Number} positions 笛卡尔坐标数组
   * @param {Cesium.Color} color 颜色
   * @returns {Primitive} 图元
   */
  _createAlertLinePrimitive(height, positions, color) {
    let geometry = new Cesium.PolygonOutlineGeometry({
      polygonHierarchy: new Cesium.PolygonHierarchy(positions),
      height, //顶部离地面的距离
      extrudedHeight: height - 0.1
    });
    let primitive = new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: geometry,
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            Cesium.Color.fromCssColorString(color || '#FF0000').withAlpha(1)
          ),
        }
      }),
      appearance: new Cesium.PerInstanceColorAppearance({
        flat: true,
        renderState: {
          lineWidth: Math.min(2.0, this.viewer.scene.maximumAliasedLineWidth),
        },
      }),
    })
    this.viewer.scene.primitives.add(primitive)
    return primitive
  }

  /**
   *  
   * @description: 淹没模拟
   * @param {*} normalMaterial 正常水位primitive图元的样式
   * @param {*} alertMaterial 超出警戒水位primitive图元的样式
   * @return {*}
   */
  async _waterRising(normalMaterial) {
    this.saveWaterHeight += Number(this.waterOptions.speed)
    this.saveWaterHeight >= this.waterOptions.endHeight && (
      this.lastTime = (this.waterOptions.endHeight - this.saveWaterHeight) / Number(this.waterOptions.speed) + 1,
      this.saveWaterHeight = this.waterOptions.endHeight
    )
    //创建正常水位的primitive
    !this.normalWaterPrimitive && (this.normalWaterPrimitive = this._createPrimitive(this.waterOptions.startHeight, this.waterOptions.startHeight, this.points, normalMaterial))

    //如果水位大于警戒线 创建警戒线
    this.saveWaterHeight > this.waterOptions.alertHeight && !this.alertLinePrimitive && (
      this.alertLinePrimitive = this._createAlertLinePrimitive(this.waterOptions.alertHeight, this.points, this.waterOptions.alertColor))

    this.normalWaterPrimitive.setHeight(this.saveWaterHeight)
    this.saveWaterHeight === this.waterOptions.endHeight && (
      clearInterval(this.renderPrimitiveInterval)
      // ,this.clear()
    )
  }

  /**
   *  
   * @description: 退水模拟
   * @return {*}
   */
  _waterFalling() {
    this.saveWaterHeight -= Number(this.waterOptions.returnSpeed)
    this.saveWaterHeight < this.waterOptions.startHeight && (
      this.lastTime = (this.saveWaterHeight - this.waterOptions.startHeight) / Number(this.waterOptions.returnSpeed) + 1,
      this.saveWaterHeight = this.waterOptions.startHeight
    )
    if (this.saveWaterHeight == this.waterOptions.startHeight) {
      this._clearPrimitive()
      // this.clear()
      // this.points = null
      clearInterval(this.renderPrimitiveInterval)
      return
    }
    //如果水位等于或者低于警戒水位
    this.saveWaterHeight <= this.waterOptions.alertHeight && this.alertLinePrimitive && (
      this.viewer.scene.primitives.remove(this.alertLinePrimitive),
      this.alertLinePrimitive = null
    )
    this.normalWaterPrimitive.setHeight(this.saveWaterHeight)
  }

  /**
   *  
   * @description: 开始退水模拟
   * @param {Number} returnSpeed 退水速度
   * @param {Function} callback 退水模拟中的回调函数
   * @param {Function} simulationCallback 退水模拟结束的回调函数
   * @return {*}
   */
  waterFalling(returnSpeed, callback, simulationCallback) {
    this.waterOptions.returnSpeed = returnSpeed
    this.saveWaterHeight = this.saveWaterHeight ? this.saveWaterHeight : this.waterOptions.endHeight
    //获取每秒上涨的面积
    this.areaForSecond = this._getFloodedArea(true)
    this._renderPrimitiveTimer(true)
    this._recordTimer(callback, simulationCallback, true)
    this._removePostProcessStage(CIM.viewer, "SubmergingAnalysisRain")
  }

  /**
   *  
   * @description: 删除primitive
   * @return {*}
   */
  _clearPrimitive() {
    this.normalWaterPrimitive && this.viewer.scene.primitives.remove(this.normalWaterPrimitive)
    this.alertLinePrimitive && this.viewer.scene.primitives.remove(this.alertLinePrimitive)
    this.normalWaterPrimitive = null
    this.alertLinePrimitive = null
  }

  /**
   * @author:  
   * @description: 方法描述 获取水的材质
   * @param {*} color 水的颜色
   * @return {*}
   */
  _getMaterial(colorString, alpha) {
    var material = new Cesium.Material({
      fabric: {
        type: 'Water',
        uniforms: {
          baseWaterColor: Cesium.Color.fromCssColorString(colorString || '#409DFD').withAlpha(alpha || 0.5),
          normalMap: 'Assets/Textures/waterNormals.jpg',
          frequency: 100.0,
          animationSpeed: 0.01,
          amplitude: 10.0
        }
      },
      translucent: true
    });
    return material
  }

  /**
   *  
   * @description: 获取模拟时间
   * @return {Number} 模拟时间
   */
  getTime() {
    return this.time
  }

  /**
   *  
   * @description: 获取当前水位高度
   * @return {Number} 当前水位高度
   */
  getWaterHeight() {
    return this.saveWaterHeight
  }

  /**
   *  
   * @description: 获取超出警戒水位高度
   * @return {Number} 超出警戒水位高度
   */
  getExceedHeight() {
    return this.saveWaterHeight > this.waterOptions.alertHeight ? this.saveWaterHeight - this.waterOptions.alertHeight : 0
  }

  /**
   * @author:  
   * @description: 获取淹没范围的坐标
   * @return {Cartesians} 笛卡尔坐标数组
   */
  getPoints() {
    return this.points
  }

  /**
   * @author:  
   * @description: 设置淹没范围的坐标
   * @return {*}
   */
  setPoints(points) {
    this.points = points
  }

  /**
   * @author:  
   * @description: 方法描述 加入雨水
   * @param {*} viewer 当前viewer
   * @param {*} name "SubmergingAnalysisRain"
   * @param {*} rainSpeed 淹没水位步进
   * @return {*}
   */
  _addPostProcessStage(viewer, name, rainSpeed) {
    let stage = this._getStage(viewer, name)
    let fs = null
    fs = this._fsRain(rainSpeed);
    stage = new Cesium.PostProcessStage({
      name: name,
      fragmentShader: fs
    })
    //添加天气着色器特效
    viewer.scene.postProcessStages.add(stage)
  }

  /**
   * @author:  
   * @description: 方法描述 移除雨水效果
   * @param {*} viewer 当前viewer
   * @param {*} name "SubmergingAnalysisRain"
   * @return {*}
   */
  _removePostProcessStage(viewer, name) {
    let stage = this._getStage(viewer, name)
    if (stage) {
      viewer.scene.postProcessStages.remove(stage)
      this.stages._stages.pop()
    }
  }

  /**
   * @author:  
   * @description: 雨水效果 后期处理
   * @param {*} viewer 当前viewer
   * @param {*} name "SubmergingAnalysisRain"
   * @return {*}
   */
  _getStage(viewer, name) {
    let stage = null
    this.stages = viewer.scene.postProcessStages
    for (let i = 0; i < this.stages._stages.length; i++) {
      let tmp = this.stages.get(i)
      if (tmp.name == name) {
        stage = tmp;
        break
      }
    }
    return stage
  }

  /**
   * @author:  
   * @description: 方法描述 获取雨水效果的参数
   * @param {*} rainSpeed 当前水位步进值
   * @return {*}
   */
  _fsRain(rainSpeed) {
    if (rainSpeed >= 1) {
      var rain = 40;
    } else if (rainSpeed >= 0.1) {
      rain = 20
    } else if (rainSpeed >= 0.01) {
      rain = 10
    } else {
      rain = 5
    }
    return 'uniform sampler2D colorTexture;\n'
      + 'in vec2 v_textureCoordinates;\n'
      + '	float hash(float x){\n'
      + '	     return fract(sin(x*133.3)*13.13);\n'
      + '	 }\n'
      + '	void main(void){\n'
      + '	     float time = czm_frameNumber / 60.0;\n'//速度
      + '	     vec2 resolution = czm_viewport.zw; \n'
      + '	     vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n'
      + '	     vec3 c=vec3(.6,.7,.8); \n'
      + '	     float a=-.4;\n'
      + '	     float si=sin(a),co=cos(a);\n'
      + '	     uv*=mat2(co,-si,si,co);\n'
      + '	     uv*=length(uv+vec2(0,4.9))*.3+1.;\n'
      + '	     float v=1.-sin(hash(floor(uv.x*100.))*2.);\n'
      + '	     float b=clamp(abs(sin(20.*time*v+uv.y*(5./(2.+v))))-.95,0.,1.)*' + rain + '.;\n'//20粗细 5长短及快慢
      + '	     c*=v*b; \n'
      + '	     out_FragColor = mix(texture(colorTexture, v_textureCoordinates), vec4(c,0.6), 0.4); \n'  //0.5雨水的粗细
      + '	}'
  }

  /**
   *  
   * @description: 方法描述 清除淹没模拟
   * @param {*}
   */
  clearWater() {
    this.time = 0
    this.points = null
    this.saveWaterHeight = 0
    this.floodedArea = 0
    this.totalArea = 0
    this.areaForSecond = 0
    clearInterval(this.renderPrimitiveInterval)
    clearInterval(this.recordTimerInterval)
    this._removePostProcessStage(CIM.viewer, "SubmergingAnalysisRain")
    this._clearPrimitive()
    this.clear()
  }
  //清除entity
  clear() {
    if(this.drawTool){
      this.drawTool.dispose();
    }
  }

  /**
   *  
   * @description: 计算最小矩形范围内的最高最低点
   * @param {Array} positions 笛卡尔坐标数组
   * @return {Object} 返回区域高程的最大最小值
   */
  async _comMinAndMax(positions) {
    let cartographics = [];
    for (let i = 0; i < positions.length; i++) {
      let cartographic = projectionHelper.cartesian3ToCartographic(
        positions[i]
      );
      cartographics.push(cartographic)
    }
    let rectangle = Cesium.Rectangle.fromCartographicArray(cartographics),
      east = projectionHelper.toDegrees(rectangle.east),
      west = projectionHelper.toDegrees(rectangle.west),
      south = projectionHelper.toDegrees(rectangle.south),
      north = projectionHelper.toDegrees(rectangle.north),
      points = this._getPointsInRectangle(east, west, south, north),
      heightInfo = await this._getPointsHeightInRectangle(points),
      minHeight = 0, maxHeight = 0
    if (heightInfo && heightInfo.length > 0) {
      let min = heightInfo[0].value;
      let max = 0;
      for (let i = 0; i < heightInfo.length; i++) {
        if (heightInfo[i].value > max) {
          max = heightInfo[i].value;
        }
        if (heightInfo[i].value < min) {
          min = heightInfo[i].value;
        }
      }
      minHeight = math.keepDecimal(min, 2)
      maxHeight = math.keepDecimal(max, 2)
    }
    return { minHeight, maxHeight }

  }

  /**
   *  
   * @description: 根据矩形范围得到行列数点坐标和高程信息
   * @param {Number} xmin 最东经度
   * @param {Number} xmax 最西经度
   * @param {Number} ymin 最南纬度
   * @param {Number} ymax 最北纬度
   * @return {Cartesians} 笛卡尔坐标数组
   */
  _getPointsInRectangle(xmin, xmax, ymin, ymax) {
    const x_count = 10
    const y_count = 10
    let cartesians = new Array(x_count * y_count)
    const x_d = (xmax - xmin) / x_count;
    for (var i = 0; i < x_count; ++i) {
      const start_pt = { x: xmin + i * x_d, y: ymax }
      const end_pt = { x: xmin + i * x_d, y: ymin }
      for (let j = 0; j < y_count; j++) {
        const offset = j / (y_count - 1)
        const x = Cesium.Math.lerp(start_pt.x, end_pt.x, offset)
        const y = Cesium.Math.lerp(start_pt.y, end_pt.y, offset)
        cartesians[j + i * y_count] = Cesium.Cartographic.fromDegrees(x, y)
      }
    }
    return cartesians
  }

  /**
   *  
   * @description: 获取区域地形的经纬度和高程组成的对象数组
   * @param {Array} cartesians 笛卡尔坐标数组
   * @return {Array} 经纬度和高程组成的对象数组
   */
  _getPointsHeightInRectangle(cartesians) {
    var terrainProvider;
    if (Boolean(this.viewer.terrainProvider._layers)) {
      terrainProvider = this.viewer.terrainProvider;
    } else {
      terrainProvider = new Cesium.createWorldTerrain({
        requestVertexNormals: true,
      });
    }
    // 根据地形计算某经纬度点的高度
    var promise = Cesium.sampleTerrainMostDetailed(
      terrainProvider,
      cartesians
    );
    return  Promise.resolve(promise).then(function (updatedPositions) {
      let positions = updatedPositions.filter((d) => {
        const cartographic = d
        if (cartographic) {
          const h_d = cartographic.height
          return h_d > 0
        }
      })
      positions = positions.map((d) => {
        const cartographic = d;
        let h = cartographic.height;
        return {
          x: Cesium.Math.toDegrees(cartographic.longitude),
          y: Cesium.Math.toDegrees(cartographic.latitude),
          value: h,
        };
      })
      return positions
    })
  }

  updateWaterColor(waterOptions) {
    let normalMaterial = this._getMaterial(waterOptions.waterColor, waterOptions.waterColorAlpha,);
    this.normalWaterPrimitive.material = normalMaterial;
  }
  sliderEncentTigger(params) {
    this.start(params, null, null);
    //如果水位等于或者低于警戒水位
    this.saveWaterHeight <= this.waterOptions.alertHeight && this.alertLinePrimitive && (
      this.viewer.scene.primitives.remove(this.alertLinePrimitive),
      this.alertLinePrimitive = null
    )
  }


}

export default FloodSimulate

/**
 *  
 * @description: 自定义Primitive类
 */
class CustomWaterPrimitive {
  constructor({ height, extrudedHeight, position, material, geometryType = 'polygon' }) {
    //图元顶部离地面的距离
    this.height = height
    //图元底部离地面的距离
    this.extrudedHeight = extrudedHeight
    //位置坐标数组
    this.position = position
    this.material = material
    this.created = false
    this.editAble = false
    this._primitive = null
    this.geometryType = geometryType //polygon 为多边形 polygonOutline 为多边形边框
  }

  /**
   *  
   * @description: 多边形
   * @return {PolygonGeometry} 多边形
   */
  getPolygonGeometry() {
    return new Cesium.PolygonGeometry({
      polygonHierarchy: new Cesium.PolygonHierarchy(this.position),
      extrudedHeight: -this.extrudedHeight,//底部离地面的距离
      height: this.height //顶部离地面的距离
    });
  }

  /**
   *  
   * @description: 多边形边框
   * @return {PolygonOutlineGeometry} 多边形边框
   */
  getPolygonOutlineGeometry() {
    return new Cesium.PolygonOutlineGeometry({
      polygonHierarchy: new Cesium.PolygonHierarchy(this.position),
      extrudedHeight: this.extrudedHeight,//底部离地面的距离
      height: this.height, //顶部离地面的距离
    });
  }

  /**
   *  
   * @description: 设置primitive是否可编辑
   * @param {Boolean} flag
   */
  setEditAble(flag) {
    this.editAble = flag
  }

  /**
   *  
   * @description: 设置primitive 顶部离地面的距离
   * @param {Number} 顶部离地面的距离
   */
  setHeight(height) {
    this.height = height
  }

  /**
   *  
   * @description: 生成Primitive
   * @return {Primitive}
   */
  generateInstance() {
    return new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: this.geometryType == 'polygon' ? this.getPolygonGeometry() : this.getPolygonOutlineGeometry(),
      }),
      releaseGeometryInstances: false,
      appearance: new Cesium.EllipsoidSurfaceAppearance({
        aboveGround: true,
        material: this.material,
      }),
      asynchronous: false,
      show: true
    })
  }

  /**
   *  
   * @description: 渲染Primitive
   * @param {*}
   */
  update(context, frameState, commandList) {
    if (!this.created || this.editAble) {
      this._primitive = this.generateInstance();
      this.created = true
    }
    this._primitive.update(context, frameState, commandList);
  }

  /**
   *  
   * @description: 销毁Primitive
   */
  destroy() {
    this._primitive = null
  }
}