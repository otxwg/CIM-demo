class BeiDou2DTo3DGrid {
    constructor(viewer, beiDouGrid, meshConfig) {
        this.viewer = viewer;
        this.handler = null;
        this.beiDouGrid = beiDouGrid;
        // 显示多个柱体
        this.continueShow = false;
        this.meshConfig = meshConfig;
        this.highlightEntity = null;
    }
    handlerLeftClick(callBack) {
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        this.handler.setInputAction( event => {
            let position = event.position;
            let pick = CIM.viewer.scene.pick(position);
            if (pick && pick.id && pick.id.polygon) {
                let entity = pick.id;
                let polygonPositions = entity.polygon.hierarchy.getValue().positions;
                let level = entity.level;
                if (!this.continueShow) {
                    this.beiDouGrid.beidouHeightTable.removeAll(CIM.viewer);
                }
                this.beiDouGrid.beidouHeightTable.addColumn(
                    polygonPositions,
                    level,
                    this.meshConfig,
                    CIM.viewer
                );
            } else if(pick && pick.id){
                let entity = pick.id;
                if (this.highlightEntity) {
                    this.highlightEntity.rectangle.material.color = Cesium.Color.AQUAMARINE.withAlpha(0.4);
                }
                this.highlightGrid(entity);
                callBack(entity)
            }
            
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    highlightGrid(entity) {
        if (entity) {
            entity.rectangle.material.color = Cesium.Color.HOTPINK.withAlpha(0.4);
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
  export default BeiDou2DTo3DGrid;
  