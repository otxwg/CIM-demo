/*
 * @author:
 * @description:
 */
import configData from "../../data/index";
var MapInit = {
  creatMap(domDiv, data, userInfo, mapVM) {
    agcim.scene.mapInit.createMap(domDiv, data, {
      requestRenderMode: false,
      lightConfig: configData.lightConfig,
      fxaa: true,
      skyBox: new Cesium.SkyBox({
        sources: {
          positiveX: "static/scene/SkyBoxCloudy/cloudy_design5_Right.png",
          negativeX: "static/scene/SkyBoxCloudy/cloudy_design5_Left.png",
          positiveY: "static/scene/SkyBoxCloudy/cloudy_design5_Front.png",
          negativeY: "static/scene/SkyBoxCloudy/cloudy_design5_Back.png",
          positiveZ: "static/scene/SkyBoxCloudy/cloudy_design5_Up.png",
          negativeZ: "static/scene/SkyBoxCloudy/cloudy_design5_Down.png",
        },
      }),
      infoBox: false,
    });
    CIM.viewer.clock.currentTime.secondsOfDay = 50400;
    CIM.viewer.scene.skyAtmosphere.show = false;
  },
};
export { MapInit };
