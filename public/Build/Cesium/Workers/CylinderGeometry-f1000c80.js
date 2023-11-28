define(["exports","./Transforms-827ad0a7","./Matrix2-7a8e9daf","./Matrix3-b2351961","./ComponentDatatype-ab629b88","./CylinderGeometryLibrary-4d7f606d","./defaultValue-f6d5e6da","./GeometryAttribute-00d7b8dc","./GeometryAttributes-1e4ddcd2","./GeometryOffsetAttribute-2579b8d2","./IndexDatatype-a9b1bc18","./Math-355606c6","./VertexFormat-fbdec922"],(function(t,e,n,a,o,r,i,s,u,m,l,c,p){"use strict";var y=Object.freeze({HORIZONTAL:0,VERTICAL:1});const f=new n.Cartesian2,d=new a.Cartesian3,b=new a.Cartesian3,A=new a.Cartesian3,x=new a.Cartesian3;function g(t){const e=(t=i.defaultValue(t,i.defaultValue.EMPTY_OBJECT)).length,n=t.topRadius,a=t.bottomRadius,o=i.defaultValue(t.vertexFormat,p.VertexFormat.DEFAULT),r=i.defaultValue(t.slices,128);this._length=e,this._topRadius=n,this._bottomRadius=a,this._vertexFormat=p.VertexFormat.clone(o),this._slices=r,this._offsetAttribute=t.offsetAttribute,this._workerName="createCylinderGeometry"}g.packedLength=p.VertexFormat.packedLength+5,g.pack=function(t,e,n){return n=i.defaultValue(n,0),p.VertexFormat.pack(t._vertexFormat,e,n),n+=p.VertexFormat.packedLength,e[n++]=t._length,e[n++]=t._topRadius,e[n++]=t._bottomRadius,e[n++]=t._slices,e[n]=i.defaultValue(t._offsetAttribute,-1),e};const _=new p.VertexFormat,h={vertexFormat:_,length:void 0,topRadius:void 0,bottomRadius:void 0,slices:void 0,offsetAttribute:void 0};let C;g.unpack=function(t,e,n){e=i.defaultValue(e,0);const a=p.VertexFormat.unpack(t,e,_);e+=p.VertexFormat.packedLength;const o=t[e++],r=t[e++],s=t[e++],u=t[e++],m=t[e];return i.defined(n)?(n._vertexFormat=p.VertexFormat.clone(a,n._vertexFormat),n._length=o,n._topRadius=r,n._bottomRadius=s,n._slices=u,n._offsetAttribute=-1===m?void 0:m,n):(h.length=o,h.topRadius=r,h.bottomRadius=s,h.slices=u,h.offsetAttribute=-1===m?void 0:m,new g(h))},g.createGeometry=function(t,p={}){let g=t._length;const _=t._topRadius,h=t._bottomRadius,C=t._vertexFormat,v=t._slices;var F=p.repeat||new n.Cartesian2(1,1),w=p.orientation||y.HORIZONTAL;if(g<=0||_<0||h<0||0===_&&0===h)return;const O=v+v,R=v+O,G=O+O,T=r.CylinderGeometryLibrary.computePositions(g,_,h,v,!0),V=C.st?new Float32Array(2*G):void 0,D=C.normal?new Float32Array(3*G):void 0,L=C.tangent?new Float32Array(3*G):void 0,M=C.bitangent?new Float32Array(3*G):void 0;let I;const N=C.normal||C.tangent||C.bitangent;if(N){const t=C.tangent||C.bitangent;let e=0,n=0,o=0;const r=Math.atan2(h-_,g),i=d;i.z=Math.sin(r);const s=Math.cos(r);let u=A,m=b;for(I=0;I<v;I++){const r=I/v*c.CesiumMath.TWO_PI,l=s*Math.cos(r),p=s*Math.sin(r);N&&(i.x=l,i.y=p,t&&(u=a.Cartesian3.normalize(a.Cartesian3.cross(a.Cartesian3.UNIT_Z,i,u),u)),C.normal&&(D[e++]=i.x,D[e++]=i.y,D[e++]=i.z,D[e++]=i.x,D[e++]=i.y,D[e++]=i.z),C.tangent&&(L[n++]=u.x,L[n++]=u.y,L[n++]=u.z,L[n++]=u.x,L[n++]=u.y,L[n++]=u.z),C.bitangent&&(m=a.Cartesian3.normalize(a.Cartesian3.cross(i,u,m),m),M[o++]=m.x,M[o++]=m.y,M[o++]=m.z,M[o++]=m.x,M[o++]=m.y,M[o++]=m.z))}for(I=0;I<v;I++)C.normal&&(D[e++]=0,D[e++]=0,D[e++]=-1),C.tangent&&(L[n++]=1,L[n++]=0,L[n++]=0),C.bitangent&&(M[o++]=0,M[o++]=-1,M[o++]=0);for(I=0;I<v;I++)C.normal&&(D[e++]=0,D[e++]=0,D[e++]=1),C.tangent&&(L[n++]=1,L[n++]=0,L[n++]=0),C.bitangent&&(M[o++]=0,M[o++]=1,M[o++]=0)}const P=12*v-12,z=l.IndexDatatype.createTypedArray(G,P);let E=0,k=0;for(I=0;I<v-1;I++)z[E++]=k,z[E++]=k+2,z[E++]=k+3,z[E++]=k,z[E++]=k+3,z[E++]=k+1,k+=2;for(z[E++]=O-2,z[E++]=0,z[E++]=1,z[E++]=O-2,z[E++]=1,z[E++]=O-1,I=1;I<v-1;I++)z[E++]=O+I+1,z[E++]=O+I,z[E++]=O;for(I=1;I<v-1;I++)z[E++]=R,z[E++]=R+I,z[E++]=R+I+1;let U=0;if(C.st){const t=Math.max(_,h);for(I=0;I<G;I++){const e=a.Cartesian3.fromArray(T,3*I,x);w==y.HORIZONTAL?(V[U++]=(e.x+t)/(2*t)*F.x,V[U++]=(e.y+t)/(2*t)*F.y):(V[U++]=Math.atan2(e.y,e.x)/c.CesiumMath.TWO_PI*F.x,V[U++]=(e.z+.5*g)/g*F.y)}}const S=new u.GeometryAttributes;C.position&&(S.position=new s.GeometryAttribute({componentDatatype:o.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:T})),C.normal&&(S.normal=new s.GeometryAttribute({componentDatatype:o.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:D})),C.tangent&&(S.tangent=new s.GeometryAttribute({componentDatatype:o.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:L})),C.bitangent&&(S.bitangent=new s.GeometryAttribute({componentDatatype:o.ComponentDatatype.FLOAT,componentsPerAttribute:3,values:M})),C.st&&(S.st=new s.GeometryAttribute({componentDatatype:o.ComponentDatatype.FLOAT,componentsPerAttribute:2,values:V})),f.x=.5*g,f.y=Math.max(h,_);const Z=new e.BoundingSphere(a.Cartesian3.ZERO,n.Cartesian2.magnitude(f));if(i.defined(t._offsetAttribute)){g=T.length;const e=t._offsetAttribute===m.GeometryOffsetAttribute.NONE?0:1,n=new Uint8Array(g/3).fill(e);S.applyOffset=new s.GeometryAttribute({componentDatatype:o.ComponentDatatype.UNSIGNED_BYTE,componentsPerAttribute:1,values:n})}return new s.Geometry({attributes:S,indices:z,primitiveType:s.PrimitiveType.TRIANGLES,boundingSphere:Z,offsetAttribute:t._offsetAttribute})},g.getUnitCylinder=function(){return i.defined(C)||(C=g.createGeometry(new g({topRadius:1,bottomRadius:1,length:1,vertexFormat:p.VertexFormat.POSITION_ONLY}))),C},t.CylinderGeometry=g}));