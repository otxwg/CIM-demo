/**
 * @lastUpdateBy : 张瀚
 * @description: 异步线程计算车辆位置，用于功能行车模拟
 */
/*global Car TrafficLight*/
importScripts("Entity.js");
//路径上每一个刻度当前的内容,只存放一个id，不允许重叠
let pathScaleList = [];
//帧数设定
let fps = 40;
//等待加入的车辆列表
let carTempList = [];
//预渲染多少帧
let preDraw = 10;
//红绿灯id对应对象
let idToTrafficLight = {};
//车辆id对应车辆信息
let idToCar = {};
//缓存的数据列表，定时发送过去主线程
let carIdToIndexList = [];
addEventListener(
  "message",
  function (e) {
    //主线程如果有更新，会发过来,是列表来的
    e.data.forEach((item) => {
      let data = item.data;
      switch (item.code) {
        case "setPathPointLen":
          //设置队列长度
          pathScaleList.length = parseInt(data);
          break;
        case "addCar": {
          //添加一个车辆，不一定立刻加入队列中，要等待是否有位置
          let { id, speed, size, index } = data;
          let car = new Car(id, size, speed, index, fps);
          idToCar[data.id] = car;
          carTempList.push(car);
          break;
        }
        case "removeCar":
          //data是一个carId数组
          //移除车辆的映射，这样渲染的时候找不到就会移除
          if (data && data.forEach) {
            data.forEach((carId) => {
              delete idToCar[carId];
            });
          }
          break;
        case "addTrafficLight": {
          //添加红绿灯
          let { id, index, passable } = data;
          let light = new TrafficLight(id, index, passable);
          pathScaleList[index] = id;
          idToTrafficLight[id] = light;
          break;
        }
        case "removeTrafficLight":
          //传过来的是一个红绿灯id数组
          if (data && data.forEach) {
            data.forEach((id) => {
              delete idToTrafficLight[id];
            });
          }
          break;
        case "passableChange": {
          //修改指定id的红绿灯通行状态
          let light = idToTrafficLight[data.id];
          if (light) {
            light.setPassable(data.passable);
          }
          break;
        }
      }
    });
  },
  false
);
/**
 * @lastUpdateBy : 张瀚
 * @description: 发送消息到主线程
 * @param {*} code
 * @param {*} data
 */
function postToMain(code, data) {
  //初始化或者更改了
  postMessage({
    code,
    data,
  });
}

/**
 * @lastUpdateBy : 张瀚
 * @description: 检查是否有新的车需要加入队列中
 */
function _addNewCar() {
  if (carTempList.length > 0) {
    //添加点有空位才能上,现在不允许重叠
    carTempList = carTempList.filter((car) => {
      if (pathScaleList[car.index] == undefined) {
        //这里可以添加车
        pathScaleList[car.index] = car.id;
        //告知主线程要渲染这个车
        postToMain("loadCar", car.id);
        return false;
      }
      return true;
    });
  }
}
/**
 * @lastUpdateBy : 张瀚
 * @description: 根据车辆下标和速度来更新新的位置
 * @return {*}carIdToIndex 新一帧的位置信息
 */
function _getNewCarIndexMap() {
  //从后往前，队列后面的车先走
  //上一辆车的对象
  let lastCar = undefined;
  //上一个红绿灯对象
  let lastLight = undefined;
  //新一帧的位置信息（有变化的才需要记录）
  let carIdToIndex = {};
  for (let index = pathScaleList.length - 1; index >= 0; index--) {
    if (pathScaleList[index] == undefined) {
      //空的跳过
      continue;
    }
    let id = pathScaleList[index];
    //看看是什么的id，红绿灯优先级比较高
    let light = idToTrafficLight[id];
    if (light) {
      //是红绿灯
      lastLight = light;
      continue;
    }
    let car = idToCar[id];
    if (car) {
      //是车,往前走
      let newIndex = car.moveInFps(lastCar, lastLight);
      //更新id，但是要确保没覆盖别人，如果有移除被覆盖的对象
      if (pathScaleList[newIndex] != undefined) {
        //复位
        car.index = index;
      } else {
        //判断是否已经出界了
        if (newIndex >= pathScaleList.length) {
          //出界了
          postToMain("removeCar", id);
          delete pathScaleList[index];
          delete idToCar[id];
          lastCar = undefined;
          continue;
        }
        //有效的移动，移动到新位置
        pathScaleList[newIndex] = id;
        delete pathScaleList[index];
        carIdToIndex[id] = newIndex;
      }
      lastCar = car;
      continue;
    }
    //都不是的就是已经被移除的，要删掉
    delete pathScaleList[index];
  }
  return carIdToIndex;
}

//不断更新一次车辆位置信息，从后往前
function refresh() {
  //先检查是否有车辆需要添加到起点，一帧加一辆
  _addNewCar();
  if (carIdToIndexList.length > preDraw) {
    //只预渲染指定帧数,稍等一下再计算
    setTimeout(() => {
      refresh();
    }, 100);
    return;
  }
  //更新车辆位置
  carIdToIndexList.push(_getNewCarIndexMap());
  //执行完就准备进行下一次执行
  setTimeout(() => {
    refresh();
  }, 1);
}

//开始执行
refresh();

//根据帧数定时发送最新的位置信息到主线程
setInterval(() => {
  if (carIdToIndexList.length > 0) {
    postToMain("updateIndex", carIdToIndexList.shift());
  }
}, 1000 / fps);
