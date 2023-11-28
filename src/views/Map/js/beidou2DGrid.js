class BeiDou2DGrid {
    constructor(viewer) {
        this.viewer = viewer;
        this.handler = null;
        this.highlightEntity = null;
    }
    handlerLeftClick(callBack) {
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        this.handler.setInputAction( event => {
            let position = event.position;
            let pick = CIM.viewer.scene.pick(position);
            if (this.highlightEntity) {
                this.highlightEntity.polygon.material.color = Cesium.Color.WHITE.withAlpha(0.1);
            }
            if (pick && pick.id && pick.id.polygon) {
                let entity = pick.id;
                this.highlightGrid(entity);
                callBack(entity)
            }
            
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
    highlightGrid(entity) {
        if (entity) {
            entity.polygon.material.color = Cesium.Color.AQUAMARINE.withAlpha(0.4);
            this.highlightEntity = entity;
        }
    }
    /**
     * 卸载点击事件
     */
    disposeLeftClick() {
        if (this.handler) {
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
    }
  }
  export default BeiDou2DGrid;
  