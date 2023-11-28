define(["./Matrix3-b2351961","./defaultValue-f6d5e6da","./EllipseGeometry-ef57011d","./VertexFormat-fbdec922","./Math-355606c6","./Transforms-827ad0a7","./Matrix2-7a8e9daf","./RuntimeError-9b4ce3fb","./combine-0c102d93","./ComponentDatatype-ab629b88","./WebGLConstants-7f557f93","./EllipseGeometryLibrary-facda3f2","./GeometryAttribute-00d7b8dc","./GeometryAttributes-1e4ddcd2","./GeometryInstance-c4920693","./GeometryOffsetAttribute-2579b8d2","./GeometryPipeline-e41ebecc","./AttributeCompression-0b8f7b7d","./EncodedCartesian3-abad5e8c","./IndexDatatype-a9b1bc18","./IntersectionTests-ccb1bd0f","./Plane-5931b53e"],(function(e,t,i,r,o,n,s,l,a,m,d,u,p,c,y,_,x,G,h,g,f,E){"use strict";function w(e){const r=(e=t.defaultValue(e,t.defaultValue.EMPTY_OBJECT)).radius,o={center:e.center,semiMajorAxis:r,semiMinorAxis:r,ellipsoid:e.ellipsoid,height:e.height,extrudedHeight:e.extrudedHeight,granularity:e.granularity,vertexFormat:e.vertexFormat,stRotation:e.stRotation,shadowVolume:e.shadowVolume};this._ellipseGeometry=new i.EllipseGeometry(o),this._workerName="createCircleGeometry"}w.packedLength=i.EllipseGeometry.packedLength,w.pack=function(e,t,r){return i.EllipseGeometry.pack(e._ellipseGeometry,t,r)};const A=new i.EllipseGeometry({center:new e.Cartesian3,semiMajorAxis:1,semiMinorAxis:1}),M={center:new e.Cartesian3,radius:void 0,ellipsoid:e.Ellipsoid.clone(e.Ellipsoid.UNIT_SPHERE),height:void 0,extrudedHeight:void 0,granularity:void 0,vertexFormat:new r.VertexFormat,stRotation:void 0,semiMajorAxis:void 0,semiMinorAxis:void 0,shadowVolume:void 0};return w.unpack=function(o,n,s){const l=i.EllipseGeometry.unpack(o,n,A);return M.center=e.Cartesian3.clone(l._center,M.center),M.ellipsoid=e.Ellipsoid.clone(l._ellipsoid,M.ellipsoid),M.height=l._height,M.extrudedHeight=l._extrudedHeight,M.granularity=l._granularity,M.vertexFormat=r.VertexFormat.clone(l._vertexFormat,M.vertexFormat),M.stRotation=l._stRotation,M.shadowVolume=l._shadowVolume,t.defined(s)?(M.semiMajorAxis=l._semiMajorAxis,M.semiMinorAxis=l._semiMinorAxis,s._ellipseGeometry=new i.EllipseGeometry(M),s):(M.radius=l._semiMajorAxis,new w(M))},w.createGeometry=function(e){return i.EllipseGeometry.createGeometry(e._ellipseGeometry)},w.createShadowVolume=function(e,t,i){const o=e._ellipseGeometry._granularity,n=e._ellipseGeometry._ellipsoid,s=t(o,n),l=i(o,n);return new w({center:e._ellipseGeometry._center,radius:e._ellipseGeometry._semiMajorAxis,ellipsoid:n,stRotation:e._ellipseGeometry._stRotation,granularity:o,extrudedHeight:s,height:l,vertexFormat:r.VertexFormat.POSITION_ONLY,shadowVolume:!0})},Object.defineProperties(w.prototype,{rectangle:{get:function(){return this._ellipseGeometry.rectangle}},textureCoordinateRotationPoints:{get:function(){return this._ellipseGeometry.textureCoordinateRotationPoints}}}),function(i,r){return t.defined(r)&&(i=w.unpack(i,r)),i._ellipseGeometry._center=e.Cartesian3.clone(i._ellipseGeometry._center),i._ellipseGeometry._ellipsoid=e.Ellipsoid.clone(i._ellipseGeometry._ellipsoid),w.createGeometry(i)}}));
