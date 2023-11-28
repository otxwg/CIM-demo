// import * as Cesium from 'cesium'

let xPi = 3.14159265358979324 * 3000.0 / 180.0
let PI = 3.1415926535897932384626
let a = 6378245.0
let ee = 0.00669342162296594323

/**
 * @class
 * @classdesc 坐标转换
 */
class MouseManager {
  /**
   * @constructor
   * @param { Viewer } viewer
   */
  constructor(viewer) {
    this.c = viewer.camera
    this.s = viewer.scene
    this.ellipsoid = this.s.globe.ellipsoid
  }

  /**
   * 二维坐标，获取椭球体表面的经纬度坐标
   * @param { Object }
   */
  pickEllipsoid(e) {
    const cartesian = this.c.pickEllipsoid(e.position, this.s.globe.ellipsoid)
    if (!cartesian) {
      return false
    }
    const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
    const lng = Cesium.Math.toDegrees(cartographic.longitude) // 经度值
    const lat = Cesium.Math.toDegrees(cartographic.latitude) // 纬度值
    return {
      x: lng,
      y: lat,
      z: cartographic.height
    } // cartographic.height的值始终为零。
  }

  /**
   * 三维坐标，获取地形表面的经纬度高程坐标：
   * @param { Object } position - 屏幕坐标
   */
  pickRay(position) {
    const cartesian = this.screenToWorld(position)
    const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
    const lng = Cesium.Math.toDegrees(cartographic.longitude) // 经度值
    const lat = Cesium.Math.toDegrees(cartographic.latitude) // 纬度值
    // height结果与cartographic.height相差无几，注意：cartographic.height可以为0，也就是说，可以根据经纬度计算出高程。
    const height = this.s.globe.getHeight(cartographic)
    return {
      x: lng,
      y: lat,
      z: height.height
    } // height的值为地形高度。
  }

  /**
   * 三维坐标，获取模型表面的经纬度高程坐标（此方法借鉴于官方示例）：
   * @param { Object } position - 屏幕坐标
   */
  pick(position) {
    if (this.s.mode !== Cesium.SceneMode.MORPHING) {
      let pickedObject = this.s.pick(position)
      if (this.s.pickPositionSupported && Cesium.defined(pickedObject) && pickedObject.node) {
        let cartesian = viewer.scene.pickPosition(position)
        if (Cesium.defined(cartesian)) {
          let cartographic = Cesium.Cartographic.fromCartesian(cartesian)
          let lng = Cesium.Math.toDegrees(cartographic.longitude)
          let lat = Cesium.Math.toDegrees(cartographic.latitude)
          let height = cartographic.height // 模型高度
          return {
            x: lng,
            y: lat,
            z: height
          }
        }
      }
    }
  }

  /**
   * 拾取对象
   */
  piObj(position) {
    return this.s.pick(position)
  }

  /**
   * 拾取屏幕坐标
   */
  piScreen(position) {
    return this.c.pickEllipsoid(position, this.ellipsoid)
  }

  piEllipsoid(positions) {
    return this.ellipsoid.cartesianToCartographic(positions)
  }

  /**
   * 判断坐标
   * 判断地形和模型
   * 并返回相应坐标
   * @param { Object } position - 屏幕坐标
   */
  piTerrainToModule(position, type) { // 点击的屏幕坐标
    try {
      if (!position) {
        return false
      }
      const world = this.screenToWorld(position)
      if (!world) {
        return false
      }
      let lon, lat, height
      const feature = this.piObj(position)
      if (!feature) {
        const WGS84P = Cesium.Ellipsoid.WGS84.cartesianToCartographic(world)
        if (!WGS84P) return false
        lon = Cesium.Math.toDegrees(WGS84P.longitude)
        lat = Cesium.Math.toDegrees(WGS84P.latitude)
        height = WGS84P.height
      }
      if (feature) {
        if (feature instanceof Cesium.Cesium3DTileFeature || feature.primitive.isCesium3DTileset) { // 3dtiles
          const cartesian = this.s.pickPosition(position)
          if (!cartesian) return false
          if (Cesium.defined(cartesian)) {
            let cartographic = Cesium.Cartographic.fromCartesian(cartesian)
            if (cartographic.height < 0) return false
            lon = Cesium.Math.toDegrees(cartographic.longitude)
            lat = Cesium.Math.toDegrees(cartographic.latitude)
            height = cartographic.height // 模型高度
          }
        }
        if (feature.id) {
          const cartesian = this.s.pickPosition(position)
          if (!cartesian) return false
          if (Cesium.defined(cartesian)) {
            let cartographic = Cesium.Cartographic.fromCartesian(cartesian)
            if (cartographic.height < 0) return false
            lon = Cesium.Math.toDegrees(cartographic.longitude)
            lat = Cesium.Math.toDegrees(cartographic.latitude)
            height = cartographic.height // 模型高度
          }
        }
      }
      // 判断是否有值
      if (!lon) return false
      let result = null
      if (type === '1') {
        result = {
          lon: lon,
          lat: lat,
          height: height
        }
      } else {
        result = Cesium.Cartesian3.fromDegrees(lon, lat, height)
      }
      return result
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 屏幕高程坐标转经纬度坐标
   * @param { Object } position - 屏幕坐标
   */
  screenToLonlat(position) {
    const cartesian = this.screenToWorld(position) // 屏幕坐标转世界坐标
    if (!cartesian) return
    const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
    const lng = Cesium.Math.toDegrees(cartographic.longitude) // 经度值
    const lat = Cesium.Math.toDegrees(cartographic.latitude) // 纬度值
    const height = this.s.globe.getHeight(cartographic)
    return {
      lon: lng,
      lat: lat,
      height: height
    }
  }

  /**
     * 计算及经纬度之间的距离
     */
  catchDistancefromCartographic2D(longitude1, latitude1, longitude2, latitude2) {
    const p1 = Cesium.Cartesian3.fromDegrees(longitude1, latitude1, 0)
    const p2 = Cesium.Cartesian3.fromDegrees(longitude2, latitude2, 0)
    const res = Cesium.Cartesian3.distance(p1, p2)
    return res
  }

  /**
   * 经纬度转换为世界坐标
   */
  lonlatToWorld(cartesian) {
    return Cesium.Cartesian3.fromDegrees(cartesian.longitude, cartesian.latitude, cartesian.height, this.ellipsoid)
  }

  /**
   * 世界坐标转换为经纬度
   */
  worldToLonlat(cartesian) {
    if (!cartesian) return false
    const cartographic = this.ellipsoid.cartesianToCartographic(cartesian)
    const lat = Cesium.Math.toDegrees(cartographic.latitude)
    const lng = Cesium.Math.toDegrees(cartographic.longitude)
    const alt = cartographic.height
    return {
      latitude: lat,
      longitude: lng,
      height: alt
    }
  }

  /**
   * 屏幕坐标转世界坐标
   */
  screenToWorld(position) {
    return this.s.globe.pick(this.c.getPickRay(position), this.s)
  }

  /**
   * 世界坐标转屏幕坐标
   */
  worldToScreen(cartesian) {
    return Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.s, cartesian)
  }

  /**
   * 世界坐标转地理坐标(经纬度)
   */
  worldToGeom(world) {
    const cartesian = this.ellipsoid.cartesianToCartographic(world)
    return [Cesium.Math.toDegrees(cartesian.longitude), Cesium.Math.toDegrees(cartesian.latitude)]
  }

  /** *
   * 地理坐标(经纬度)转世界坐标
   */
  geomToWorld(geom) {
    return Cesium.Cartesian3.fromDegrees(geom[0], geom[1])
  }

  /**
   * 百度坐标系 (BD-09) 与 火星坐标系 (GCJ-02)的转换
   * 即 百度 转 谷歌、高德
   * @param { Number } bdLon - 经度
   * @param { Number } bdLat - 纬度
   * @returns { Number[] }
   */
  bd09togcj02(bdLon, bdLat) {
    let xPi = 3.14159265358979324 * 3000.0 / 180.0
    let x = bdLon - 0.0065
    let y = bdLat - 0.006
    let z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * xPi)
    let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * xPi)
    let ggLng = z * Math.cos(theta)
    let ggLlat = z * Math.sin(theta)
    return [ggLng, ggLlat]
  }

  /**
   * 火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换
   * 即谷歌、高德 转 百度
   * @param { Number } lng - 经度
   * @param { Number } lat - 纬度
   * @returns { Number[] }
   */
  gcj02tobd09(lng, lat) {
    let z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * xPi)
    let theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * xPi)
    let bdLng = z * Math.cos(theta) + 0.0065
    let bdLat = z * Math.sin(theta) + 0.006
    return [bdLng, bdLat]
  }

  /**
   * WGS84转GCj02
   * @param { Number } lng - 经度
   * @param { Number } lat - 纬度
   * @returns { Number[] }
   */
  wgs84togcj02(lng, lat) {
    if (this.outOfChina(lng, lat)) {
      return [lng, lat]
    } else {
      let dlat = this.transformlat(lng - 105.0, lat - 35.0)
      let dlng = this.transformlng(lng - 105.0, lat - 35.0)
      let radlat = lat / 180.0 * PI
      let magic = Math.sin(radlat)
      magic = 1 - ee * magic * magic
      let sqrtmagic = Math.sqrt(magic)
      dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI)
      dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI)
      let mglat = lat + dlat
      let mglng = lng + dlng
      return [mglng, mglat]
    }
  }

  /**
   * GCJ02 转换为 WGS84
   * @param { Number } lng - 经度
   * @param { Number } lat - 纬度
   * @returns { Number[] }
   */
  gcj02towgs84(lng, lat) {
    if (this.outOfChina(lng, lat)) {
      return [lng, lat]
    } else {
      let dlat = this.transformlat(lng - 105.0, lat - 35.0)
      let dlng = this.transformlng(lng - 105.0, lat - 35.0)
      let radlat = lat / 180.0 * PI
      let magic = Math.sin(radlat)
      magic = 1 - ee * magic * magic
      let sqrtmagic = Math.sqrt(magic)
      dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI)
      dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI)
      let mglat = lat + dlat
      let mglng = lng + dlng
      return [lng * 2 - mglng, lat * 2 - mglat]
    }
  }

  transformlat(lng, lat) {
    let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng))
    ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0
    ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0
    ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0
    return ret
  }

  transformlng(lng, lat) {
    let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng))
    ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0
    ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0
    ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0
    return ret
  }

  /**
   * 判断是否在国内，不在国内则不做偏移
   * @param { Number } lng - 经度
   * @param { Number } lat - 纬度
   * @returns { Boolean }
   */
  outOfChina(lng, lat) {
    return (lng < 72.004 || lng > 137.8347) || ((lat < 0.8293 || lat > 55.8271) || false)
  }
}
export { MouseManager }
