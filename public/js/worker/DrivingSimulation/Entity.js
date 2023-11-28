/*
 * @lastUpdateBy : 张瀚
 * @description: 车的对象
 */
class Car {
  constructor(id, size = 600, speed = 11 * 100, index = 0, fps = 40) {
    this.id = id;
    //车的大小，代表车中点位置
    this.size = size;
    //每秒前进的刻度数量，也就是多少厘米，要整数，1米每秒等于时速3.6
    this.speed = speed;
    //每帧移动的距离,要取整
    this.moveLen = parseInt(speed / fps);
    //车尾初始刻度，车辆加入的时候初始刻度就是车尾刻度，判断和前车距离时只要endIndex + size 小于前车的endIndex就可以继续前进
    this.index = index;
  }
  /**
   * @lastUpdateBy : 张瀚
   * @description: 移动一帧的距离
   * @param {Car} lastCar 前车对象
   * @param {TrafficLight} lastLight 最近的红绿灯对象
   * @return {*} 新的index下标
   */
  moveInFps(lastCar, lastLight) {
    //前车不存在或者有足够的空位可以前进就前进
    let newIndex = this.index + this.moveLen;
    let newHeadIndex = newIndex + this.size;
    //先看前车是否有足够的距离可以前进
    if (lastCar && newHeadIndex >= lastCar.index) {
      //距离太近了，不能前进
      return this.index;
    }
    //可以有空间前进，但是要看红绿灯
    if (
      lastLight &&
      lastLight.index > this.index &&
      lastLight.index < newHeadIndex &&
      !lastLight.passable
    ) {
      //当红绿灯处于当前车尾到移动后车头位置区间内，且红灯时，不能移动
      return this.index;
    }
    this.index = newIndex;
    return this.index;
  }
}

/*
 * @lastUpdateBy : 张瀚
 * @description: 红绿灯对象
 */
class TrafficLight {
  /**
   * @lastUpdateBy : 张瀚
   * @description: 方法描述
   * @param {*} id
   * @param {*} index 红绿灯处于轨迹中的下标，车到了这个位置就需要考虑红绿灯是否可以通行
   * @param {*} passable 是否允许通过，绿灯是true，红灯false，黄灯等同红灯
   * @return {*}
   */
  constructor(id, index, passable = true) {
    this.id = id;
    this.index = index;
    this.setPassable(passable);
  }
  setPassable(passable) {
    this.passable = Boolean(passable);
  }
}
